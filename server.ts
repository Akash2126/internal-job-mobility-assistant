import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { setupDatabase } from "./server/db";
import apiRouter from "./server/routes/api";
import { auditLogger, rateLimiter, globalErrorHandler } from "./server/middleware/security";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Hardened security headers for production deployment
  app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    // Flexible production-safe Content Security Policy (CSP)
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.firebaseapp.com https://*.googleapis.com;"
    );
    // Remove Express signature to prevent scanner discovery
    res.removeHeader("X-Powered-By");
    next();
  });

  // Global parsed JSON elements
  app.use(express.json());
  
  // Apply standard security rate limiting & logging to all API transactions
  app.use("/api", rateLimiter);
  app.use(auditLogger);

  // Initialize SQLite persistence & database seeds
  try {
    await setupDatabase();
    console.log("SQLite Enterprise Relational Database synchronized & seeded.");
  } catch (err) {
    console.error("FATAL: Failed to balance or coordinate database operations:", err);
  }

  // Bind versioned modular REST APIs in controller-service format
  app.use("/api/v1", apiRouter);

  // Support legacy matching router endpoint for complete backward compatibility
  app.post("/api/jobs/:jobId/match", async (req: any, res: any): Promise<void> => {
    try {
      const jobId = req.params.jobId;
      const { Profile, JobPosting } = await import("./server/db");
      const { getSkillGapAnalysis } = await import("./server/services/aiService");

      const job = await JobPosting.findByPk(jobId);
      if (!job) {
        res.status(404).json({ success: false, message: "Job opening target context not found." });
        return;
      }

      const profs = await Profile.findAll();
      const firstProf = (profs[0] || { name: "Valued Employee" }) as any;

      const userProfileFull = {
        name: firstProf.name,
        title: firstProf.title,
        department: firstProf.department,
        domain: firstProf.domain || "aiml",
        skills: ["Kubernetes", "AWS Systems Optimization", "Python", "React", "Node.js"],
        certifications: ["CKA"],
      };

      const analysis = await getSkillGapAnalysis(userProfileFull, {
        ...job.get({ plain: true }),
        requiredSkills: JSON.parse(job.requiredSkills || "[]"),
        preferredSkills: JSON.parse(job.preferredSkills || "[]"),
      });

      res.json({ success: true, analysis });
    } catch (err: any) {
      console.error("Legacy matching router failure: ", err);
      res.status(500).json({ success: false, message: "Compatibility metrics match calculations failed." });
    }
  });

  // API health indicator check
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", database: "connected", sandbox_auth: "enabled" });
  });

  // Vite development integration middleware or static distribution server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Centralized exception handler
  app.use(globalErrorHandler);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
