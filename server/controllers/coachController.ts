import { Response } from "express";
import { ChatHistory, Profile, Skill, Certification } from "../db";
import { getCareerCoachResponse } from "../services/aiService";

/**
 * 1. Read message history logs for authenticated user
 */
export async function getHistory(req: any, res: Response): Promise<void> {
  try {
    const userId = req.user.id;
    const { domain } = req.query;

    const queryOptions: any = { userId };
    if (domain) {
      queryOptions.domain = domain;
    }

    const messages = await ChatHistory.findAll({
      where: queryOptions,
      order: [["createdAt", "ASC"]],
    });

    res.json(messages);
  } catch (err) {
    console.error("Failed to query persistent chat history records:", err);
    res.status(500).json({ success: false, message: "Internal server error fetching chat logs." });
  }
}

/**
 * 2. Send message and elicit context-rich AI response
 */
export async function sendMessage(req: any, res: Response): Promise<void> {
  try {
    const userId = req.user.id;
    const { text, domain } = req.body;

    if (!text) {
      res.status(400).json({ success: false, message: "Message text parameter cannot be empty." });
      return;
    }

    const activeDomain = domain || "aiml";

    // A. Persist User Message
    const userMessage = await ChatHistory.create({
      userId,
      domain: activeDomain,
      sender: "User",
      text,
      timestamp: new Date().toISOString(),
    });

    // B. Build contextual user profile parameters
    const profile = await Profile.findOne({ where: { userId } });
    let profilePlain: any = {};

    if (profile) {
      profilePlain = profile.get({ plain: true });
      // Fetch skills / certs related elements
      const dbSkills = await Skill.findAll({ where: { profileId: profile.id } });
      const dbCerts = await Certification.findAll({ where: { profileId: profile.id } });
      profilePlain.skills = dbSkills.map((s) => s.name);
      profilePlain.certifications = dbCerts.map((c) => c.name);
    } else {
      profilePlain = {
        name: "Valued Employee",
        title: "Staff Associate",
        department: "General Technology Operations",
        domain: activeDomain,
        skills: [],
        certifications: [],
      };
    }

    // C. Read historical background logs for conversational sequence preservation
    const previousLogs = await ChatHistory.findAll({
      where: { userId, domain: activeDomain },
      order: [["createdAt", "ASC"]],
      limit: 15,
    });

    // D. Fetch semantic AI advice response
    const coachAdvice = await getCareerCoachResponse(profilePlain, previousLogs, text);

    // E. Persist Coach Response
    const coachMessage = await ChatHistory.create({
      userId,
      domain: activeDomain,
      sender: "Aura",
      text: coachAdvice,
      timestamp: new Date().toISOString(),
    });

    // F. Return full synced array list for immediate matching
    const returnLogs = await ChatHistory.findAll({
      where: { userId, domain: activeDomain },
      order: [["createdAt", "ASC"]],
    });

    res.json({
      success: true,
      history: returnLogs,
    });
  } catch (err) {
    console.error("Exception during chat agent transaction:", err);
    res.status(500).json({ success: false, message: "AI Career Coach experienced an internal routing error." });
  }
}

/**
 * 3. Clear logs and seed warm welcoming card
 */
export async function resetHistory(req: any, res: Response): Promise<void> {
  try {
    const userId = req.user.id;
    const { domain } = req.body;
    const activeDomain = domain || "aiml";

    // Clear matching indexes
    await ChatHistory.destroy({
      where: { userId, domain: activeDomain },
    });

    const prof = await Profile.findOne({ where: { userId } });
    const name = prof ? prof.name : "Employee";
    const dept = prof ? prof.department : "Engineering Division";

    // Seed greeting
    const welcome = await ChatHistory.create({
      userId,
      domain: activeDomain,
      sender: "Aura",
      text: `Welcome focus refreshed, ${name}. I have loaded our persistent conversation history logs for ${dept}. What tactical goals can we optimize today?`,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      history: [welcome],
    });
  } catch (err) {
    console.error("Failed to reset history records in database:", err);
    res.status(500).json({ success: false, message: "Internal error resetting session context logs." });
  }
}
