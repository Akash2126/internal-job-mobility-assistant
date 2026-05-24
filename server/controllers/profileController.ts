import { Response } from "express";
import * as pdfParseModule from "pdf-parse";
import mammoth from "mammoth";
import { Profile, Skill, Certification } from "../db";
import { extractSkillsAndCertsFromText } from "../services/aiService";

// Helper to handle ESM default export wrapper for pdf-parse safely
async function executePdfParse(buffer: Buffer): Promise<any> {
  const parseFn = (pdfParseModule as any).default || pdfParseModule;
  return parseFn(buffer);
}

/**
 * 1. Read corporate profile with direct Skill/Certification arrays
 */
export async function getProfile(req: any, res: Response): Promise<void> {
  try {
    const userId = req.user.id;

    const profile = await Profile.findOne({ where: { userId } });
    if (!profile) {
      res.status(404).json({ success: false, message: "Profile registry not found." });
      return;
    }

    // Load related skills & certifications
    const dbSkills = await Skill.findAll({ where: { profileId: profile.id } });
    const dbCerts = await Certification.findAll({ where: { profileId: profile.id } });

    res.json({
      ...profile.get({ plain: true }),
      skills: dbSkills.map((s) => s.name),
      certifications: dbCerts.map((c) => c.name),
      interests: JSON.parse((profile as any).interests || "[]"), 
    });
  } catch (err: any) {
    console.error("Failed to query user profile configuration: ", err);
    res.status(500).json({ success: false, message: "Internal server error fetching profile." });
  }
}

/**
 * 2. Update biography or work preferences
 */
export async function updateProfile(req: any, res: Response): Promise<void> {
  try {
    const userId = req.user.id;
    const { name, title, bio, workStyle, relocation, interests, priorityAreas, level, department, domain } = req.body;

    const profile = await Profile.findOne({ where: { userId } });
    if (!profile) {
      res.status(404).json({ success: false, message: "Profile registry not found." });
      return;
    }

    if (name !== undefined) profile.name = name;
    if (title !== undefined) profile.title = title;
    if (bio !== undefined) profile.bio = bio;
    if (workStyle !== undefined) profile.workStyle = workStyle;
    if (relocation !== undefined) profile.relocation = relocation;
    if (level !== undefined) profile.level = level;
    if (department !== undefined) profile.department = department;
    if (domain !== undefined) profile.domain = domain;

    if (interests !== undefined) {
      profile.set("interests", JSON.stringify(interests));
    }
    if (priorityAreas !== undefined) {
      profile.priorityAreas = JSON.stringify(priorityAreas);
    }

    await profile.save();

    // Reload related skills & certifications to return complete object
    const dbSkills = await Skill.findAll({ where: { profileId: profile.id } });
    const dbCerts = await Certification.findAll({ where: { profileId: profile.id } });

    res.json({
      success: true,
      profile: {
        ...profile.get({ plain: true }),
        skills: dbSkills.map((s) => s.name),
        certifications: dbCerts.map((c) => c.name),
        interests: JSON.parse((profile as any).interests || "[]"),
      },
    });
  } catch (err: any) {
    console.error("Failed corporate profile save updates:", err);
    res.status(500).json({ success: false, message: "Internal update failure of profile." });
  }
}

/**
 * 3. Handle Binary Resume Upload and Structured Extraction
 */
export async function extractResume(req: any, res: Response): Promise<void> {
  try {
    const userId = req.user.id;
    const file = req.file; // Uploaded binary file parsed by multer

    if (!file) {
      res.status(400).json({ success: false, message: "Please upload a valid resume file in the form." });
      return;
    }

    const fileName = file.originalname.toLowerCase();
    let extractedText = "";

    // A. Parse file format content
    if (fileName.endsWith(".pdf")) {
      try {
        const parsedPdf = await executePdfParse(file.buffer);
        extractedText = parsedPdf.text;
      } catch (pdfErr) {
        console.error("PDF-parse utility failed to read buffer, fallback to text dump:", pdfErr);
        extractedText = file.buffer.toString("utf-8");
      }
    } else if (fileName.endsWith(".docx")) {
      try {
        const docxResult = await mammoth.extractRawText({ buffer: file.buffer });
        extractedText = docxResult.value;
      } catch (docxErr) {
        console.error("Mammoth failed to read word buffer, fallback to text dump:", docxErr);
        extractedText = file.buffer.toString("utf-8");
      }
    } else {
      // Pure text parsing fallback
      extractedText = file.buffer.toString("utf-8");
    }

    if (!extractedText || extractedText.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: "No textual content could be successfully parsed from the binary upload.",
      });
      return;
    }

    // B. Run structural AI extractor
    const structuredResult = await extractSkillsAndCertsFromText(extractedText);

    // C. Get employee profile to update details in SQLite
    const profile = await Profile.findOne({ where: { userId } });
    if (!profile) {
      res.status(404).json({ success: false, message: "Profile context not initialized." });
      return;
    }

    if (structuredResult.bio) {
      profile.bio = structuredResult.bio;
      await profile.save();
    }

    // D. Persist skills and certifications to relational tables
    if (Array.isArray(structuredResult.skills) && structuredResult.skills.length > 0) {
      // Delete old skills and rebuild
      await Skill.destroy({ where: { profileId: profile.id } });
      for (const skillName of structuredResult.skills) {
        await Skill.create({
          profileId: profile.id,
          name: skillName,
        });
      }
    }

    if (Array.isArray(structuredResult.certifications) && structuredResult.certifications.length > 0) {
      // Delete old certs and rebuild
      await Certification.destroy({ where: { profileId: profile.id } });
      for (const certName of structuredResult.certifications) {
        await Certification.create({
          profileId: profile.id,
          name: certName,
        });
      }
    }

    // Retrieve updated lists
    const updatedSkills = await Skill.findAll({ where: { profileId: profile.id } });
    const updatedCerts = await Certification.findAll({ where: { profileId: profile.id } });

    res.json({
      success: true,
      message: "Resume successfully parsed and profile skills cataloged.",
      updatedProfile: {
        ...profile.get({ plain: true }),
        skills: updatedSkills.map((s) => s.name),
        certifications: updatedCerts.map((c) => c.name),
        interests: JSON.parse((profile as any).interests || "[]"),
      },
      extractedContent: {
        currentTitle: structuredResult.title || "Technology Associate",
        estimatedLevel: profile.level || "L5",
        newTechnicalSkills: updatedSkills.map((s) => s.name),
        softSkills: ["Systems Architecture", "Strategic Influence", "Team Coordination"],
        newCertifications: updatedCerts.map((c) => c.name),
        hiringRecommendations: [
          "Target active vacancy matches in current division focus.",
          "Complete recommended certifications to close high priority skill gaps.",
          "Coordinate with peer evaluator committees to accelerate career velocity."
        ]
      }
    });
  } catch (err: any) {
    console.error("Resume file extraction pipeline error:", err);
    res.status(500).json({ success: false, message: "Resume upload and extraction process experienced an internal crash." });
  }
}
