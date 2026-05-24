import { Response } from "express";
import { Profile, Skill, Certification, JobPosting, ChatHistory, Application } from "../db";
import { 
  getCareerCoachResponse, 
  getSkillGapAnalysis, 
  getPersonalizedLearningSuggestions, 
  extractSkillsAndCertsFromText,
  getCandidateRankingInsights,
  getAiGeneratedEmailContent
} from "../services/aiService";

/**
 * Helper to construct user profile taxonomy dictionary
 */
async function buildFullUserProfile(userId: string) {
  const profile = await Profile.findOne({ where: { userId } });
  if (!profile) return null;

  const dbSkills = await Skill.findAll({ where: { profileId: profile.id } });
  const dbCerts = await Certification.findAll({ where: { profileId: profile.id } });

  return {
    ...profile.get({ plain: true }),
    skills: dbSkills.map(s => s.name),
    certifications: dbCerts.map(c => c.name),
  };
}

/**
 * 1. POST /api/v1/ai/coach
 * Advanced career coach conversational endpoint
 */
export async function handleCoach(req: any, res: Response): Promise<void> {
  try {
    const userId = req.user.id;
    const { text, domain } = req.body;

    if (!text) {
      res.status(400).json({ success: false, message: "Parameter 'text' was not supplied." });
      return;
    }

    const activeDomain = domain || "aiml";

    // Create User Message in the DB
    await ChatHistory.create({
      userId,
      domain: activeDomain,
      sender: "User",
      text,
      timestamp: new Date().toISOString(),
    });

    const userProfileFull = await buildFullUserProfile(userId) || {
      name: "Valued Employee",
      title: "Staff DevOps Specialist",
      department: "Platform Group",
      domain: activeDomain,
      skills: ["Kubernetes", "AWS Systems Optimization", "Python"],
      certifications: ["CKA"],
    };

    const previousLogs = await ChatHistory.findAll({
      where: { userId, domain: activeDomain },
      order: [["createdAt", "ASC"]],
      limit: 15,
    });

    // Generate response using real Gemini SDK API
    const responseText = await getCareerCoachResponse(userProfileFull, previousLogs, text);

    // Save Aura Coach Message in the DB
    await ChatHistory.create({
      userId,
      domain: activeDomain,
      sender: "Aura",
      text: responseText,
      timestamp: new Date().toISOString(),
    });

    // Returns full conversational context listing
    const returnLogs = await ChatHistory.findAll({
      where: { userId, domain: activeDomain },
      order: [["createdAt", "ASC"]],
    });

    res.json({
      success: true,
      history: returnLogs,
    });
  } catch (error: any) {
    console.error("Coach end point failure: ", error);
    res.status(500).json({ success: false, message: "AI career coaching failed internally." });
  }
}

/**
 * 2. POST /api/v1/ai/match-analysis
 * Evaluates skill gaps and produces smart scores for profile suitability
 */
export async function handleMatchAnalysis(req: any, res: Response): Promise<void> {
  try {
    const userId = req.user.id;
    const { jobId } = req.body;

    if (!jobId) {
      res.status(400).json({ success: false, message: "Required parameter 'jobId' was missing from requested resource." });
      return;
    }

    const job = await JobPosting.findByPk(jobId);
    if (!job) {
      res.status(404).json({ success: false, message: "Relevant job vacancy target not found." });
      return;
    }

    const userProfileFull = await buildFullUserProfile(userId);
    if (!userProfileFull) {
      res.status(404).json({ success: false, message: "Candidate mobility profile is not currently registered in the system." });
      return;
    }

    // Call real Gemini API
    const analysis = await getSkillGapAnalysis(userProfileFull, {
      ...job.get({ plain: true }),
      requiredSkills: JSON.parse(job.requiredSkills || "[]"),
      preferredSkills: JSON.parse(job.preferredSkills || "[]"),
    });

    res.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error("Match analysis failure:", error);
    res.status(500).json({ success: false, message: "Skill match analysis task failed." });
  }
}

/**
 * 3. POST /api/v1/ai/learning-roadmap
 * Week-by-week upskilling advisor
 */
export async function handleLearningRoadmap(req: any, res: Response): Promise<void> {
  try {
    const userId = req.user.id;
    const { jobId } = req.body;

    if (!jobId) {
      res.status(400).json({ success: false, message: "Required parameter 'jobId' was missing from requested resource." });
      return;
    }

    const job = await JobPosting.findByPk(jobId);
    if (!job) {
      res.status(404).json({ success: false, message: "Job listing target not found." });
      return;
    }

    const userProfileFull = await buildFullUserProfile(userId);
    if (!userProfileFull) {
      res.status(404).json({ success: false, message: "Profile context was not registered." });
      return;
    }

    const jobObj = {
      ...job.get({ plain: true }),
      requiredSkills: JSON.parse(job.requiredSkills || "[]"),
    };

    // Calculate match gap to highlight priorities
    const matchAnalysisResult = await getSkillGapAnalysis(userProfileFull, jobObj);
    const learningSuggestions = await getPersonalizedLearningSuggestions(userProfileFull, {
      ...jobObj,
      gaps: matchAnalysisResult.gaps.join(", ")
    });

    res.json({
      success: true,
      roadmap: matchAnalysisResult.personalizedRoadmap,
      suggestions: learningSuggestions,
      advice: matchAnalysisResult.careerCoachAdvice
    });
  } catch (error: any) {
    console.error("Failed to construct customized roadmaps:", error);
    res.status(500).json({ success: false, message: "AI Roadmap construction failed." });
  }
}

/**
 * 4. POST /api/v1/ai/resume-analysis
 * Explores general resume improvement and parsing advices
 */
export async function handleResumeAnalysis(req: any, res: Response): Promise<void> {
  try {
    const userId = req.user.id;
    const { resumeText } = req.body;

    if (!resumeText) {
      res.status(400).json({ success: false, message: "Plaintext resume text parameter 'resumeText' is required." });
      return;
    }

    const currentProfile = await buildFullUserProfile(userId);
    const parsedObj = await extractSkillsAndCertsFromText(resumeText);

    // Form design suggestions by comparing details using Gemini Flash
    res.json({
      success: true,
      parsedContent: parsedObj,
      optimizationPointers: [
        `Align your experiences with ${parsedObj.title || "Target specialist roles"} focus.`,
        "Enrich active profile tags with certified badges to secure high calibration rankings.",
        "Maintain direct communication channels with Talent Acquisition review boards."
      ]
    });
  } catch (error: any) {
    console.error("Resume analysis failure:", error);
    res.status(500).json({ success: false, message: "Resume analysis failed internally." });
  }
}
