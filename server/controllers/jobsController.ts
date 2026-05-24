import { Response } from "express";
import { JobPosting, Application, Notification, Profile, Skill } from "../db";

/**
 * 1. Read open jobs
 */
export async function listJobs(req: any, res: Response): Promise<void> {
  try {
    const list = await JobPosting.findAll({
      where: { status: "Active" },
    });

    const parsedList = list.map((job) => {
      const data = job.get({ plain: true });
      return {
        ...data,
        requiredSkills: JSON.parse(data.requiredSkills || "[]"),
        preferredSkills: JSON.parse(data.preferredSkills || "[]"),
      };
    });

    res.json(parsedList);
  } catch (err: any) {
    console.error("Failed to query open job listings registry:", err);
    res.status(500).json({ success: false, message: "Internal server error fetching jobs." });
  }
}

/**
 * 2. Submit application & sync tracking metrics
 */
export async function applyJob(req: any, res: Response): Promise<void> {
  try {
    const userId = req.user.id;
    const { jobId, matchScore } = req.body;

    if (!jobId) {
      res.status(400).json({ success: false, message: "Missing target jobId for application processing." });
      return;
    }

    const job = await JobPosting.findByPk(jobId);
    if (!job) {
      res.status(404).json({ success: false, message: "Corporate job posting not found in records." });
      return;
    }

    // Verify if already applied to keep table unique
    const existing = await Application.findOne({ where: { userId, jobId } });
    if (existing) {
      res.status(400).json({ success: false, message: "You have already registered an active application file for this opening." });
      return;
    }

    // Create persistent application record
    const application = await Application.create({
      userId,
      jobId,
      status: "Applied",
      appliedDate: new Date().toISOString().split("T")[0],
      matchScore: matchScore || 75,
    });

    // Increment applicants counter on job posting
    job.applicantsCount += 1;
    await job.save();

    // Spawn proper persistent compliance/vetting Notification in SQLite
    const prof = await Profile.findOne({ where: { userId } });
    const applicantName = prof ? prof.name : "Employee";

    await Notification.create({
      userId,
      title: "Application Tracked",
      message: `Your internal transition application file for '${job.title}' has been successfully transmitted. Evaluation records have been routed to ${job.hiringManager}.`,
      read: false,
    });

    res.json({
      success: true,
      message: "Application registered successfully.",
      application,
    });
  } catch (err: any) {
    console.error("Application processing error: ", err);
    res.status(500).json({ success: false, message: "Internal application submission error." });
  }
}

/**
 * 3. Retrieve applicant submission records
 */
export async function getMyApplications(req: any, res: Response): Promise<void> {
  try {
    const userId = req.user.id;
    const records = await Application.findAll({ where: { userId } });
    res.json(records);
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load application registry." });
  }
}
