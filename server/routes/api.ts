import { Router } from "express";
import * as authController from "../controllers/authController";
import * as profileController from "../controllers/profileController";
import * as jobsController from "../controllers/jobsController";
import * as hrController from "../controllers/hrController";
import * as coachController from "../controllers/coachController";
import * as aiController from "../controllers/aiController";
import { authenticateToken, requireRole } from "../middleware/auth";
import { upload, handleUploadErrors } from "../middleware/upload";

const router = Router();

// ==========================================
// 1. AUTHENTICATION & SESSIONS (/api/v1/auth)
// ==========================================
router.post("/auth/signup", authController.signup);
router.post("/auth/login", authController.login);
router.post("/auth/firebase-google", authController.firebaseGoogleAuth as any);
router.get("/auth/me", authenticateToken as any, authController.getCurrentUser as any);

// ==========================================
// 2. CORPORATE PROFILES (/api/v1/profile)
// ==========================================
router.get("/profile", authenticateToken as any, profileController.getProfile as any);
router.post("/profile/update", authenticateToken as any, profileController.updateProfile as any);

// ==========================================
// 3. RESUME UPLOAD AND EXTRACTION (/api/v1/resume)
// ==========================================
router.post(
  "/resume/extract",
  authenticateToken as any,
  upload.single("resume"),
  handleUploadErrors,
  profileController.extractResume as any
);

// ==========================================
// 4. CHANNELS AND JOBS (/api/v1/jobs)
// ==========================================
router.get("/jobs", authenticateToken as any, jobsController.listJobs as any);
router.post("/jobs/apply", authenticateToken as any, jobsController.applyJob as any);
router.get("/jobs/applications", authenticateToken as any, jobsController.getMyApplications as any);

// ==========================================
// 5. TALENT ANALYTICS & RBAC ADMIN (/api/v1/hr)
// ==========================================
router.get(
  "/hr/analytics",
  authenticateToken as any,
  requireRole(["HR_ADMIN"]) as any,
  hrController.getHrAnalytics as any
);
router.get(
  "/hr/export",
  authenticateToken as any,
  requireRole(["HR_ADMIN"]) as any,
  hrController.exportReport as any
);
router.get(
  "/hr/jobs",
  authenticateToken as any,
  requireRole(["HR_ADMIN"]) as any,
  hrController.listHrJobs as any
);
router.post(
  "/hr/jobs",
  authenticateToken as any,
  requireRole(["HR_ADMIN"]) as any,
  hrController.createHrJob as any
);
router.put(
  "/hr/jobs/:id",
  authenticateToken as any,
  requireRole(["HR_ADMIN"]) as any,
  hrController.updateHrJob as any
);
router.delete(
  "/hr/jobs/:id",
  authenticateToken as any,
  requireRole(["HR_ADMIN"]) as any,
  hrController.deleteHrJob as any
);
router.get(
  "/hr/applicants",
  authenticateToken as any,
  requireRole(["HR_ADMIN"]) as any,
  hrController.listHrApplicants as any
);
router.post(
  "/hr/applicants/:id/status",
  authenticateToken as any,
  requireRole(["HR_ADMIN"]) as any,
  hrController.updateHrApplicantStatus as any
);
router.post(
  "/hr/applicants/:id/schedule",
  authenticateToken as any,
  requireRole(["HR_ADMIN"]) as any,
  hrController.scheduleInterview as any
);
router.get(
  "/hr/recommendations/:jobId",
  authenticateToken as any,
  requireRole(["HR_ADMIN"]) as any,
  hrController.getCandidateRecommendations as any
);

// ==========================================
// 6. AI CAREER COACHING (/api/v1/coach)
// ==========================================
router.get("/coach/chat", authenticateToken as any, coachController.getHistory as any);
router.post("/coach/chat", authenticateToken as any, coachController.sendMessage as any);
router.post("/coach/reset", authenticateToken as any, coachController.resetHistory as any);

// ==========================================
// 7. REAL GEMINI PLATFORM SERVICES (/api/v1/ai)
// ==========================================
router.post("/ai/coach", authenticateToken as any, aiController.handleCoach as any);
router.post("/ai/match-analysis", authenticateToken as any, aiController.handleMatchAnalysis as any);
router.post("/ai/learning-roadmap", authenticateToken as any, aiController.handleLearningRoadmap as any);
router.post("/ai/resume-analysis", authenticateToken as any, aiController.handleResumeAnalysis as any);

export default router;
