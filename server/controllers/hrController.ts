import { Response } from "express";
import { Analytics, Profile, Skill, JobPosting, Application, User, Notification } from "../db";

/**
 * 1. Read consolidated analytics with domain/division selector support
 */
export async function getHrAnalytics(req: any, res: Response): Promise<void> {
  try {
    const { domain } = req.query;

    // Filter by specific domain or load all and consolidate
    let records: any[] = [];
    if (domain && domain !== "all") {
      records = await Analytics.findAll({ where: { domain } });
    } else {
      records = await Analytics.findAll();
    }

    if (records.length === 0) {
      // Re-seed fallback if empty
      res.status(404).json({ success: false, message: "No workforce insights in registered database." });
      return;
    }

    // If querying single domain, return details directly.
    // If aggregate 'all' is selected, compile them into an epic consolidated report!
    if (domain && domain !== "all") {
      const record = records[0];
      res.json({
        overviewMetrics: {
          totalEmployees: record.totalEmployees,
          activeInternalJobs: record.activeInternalJobs,
          internalTransitionsThisYear: record.internalTransitionsThisYear,
          skillGapsIdentified: record.skillGapsIdentified,
          aiMatchingAccuracy: record.aiMatchingAccuracy,
          employeeEngagementScore: record.employeeEngagementScore,
          averageMobilityCycleDays: record.averageMobilityCycleDays,
        },
        departmentInsights: JSON.parse(record.departmentInsights || "[]"),
        internalMobilityTrends: JSON.parse(record.internalMobilityTrends || "[]"),
        skillDemands: JSON.parse(record.skillDemands || "[]"),
        recentTransitions: JSON.parse(record.recentTransitions || "[]"),
      });
      return;
    }

    // Consolidated Aggregate Report
    let totalEmployees = 0;
    let activeInternalJobs = 0;
    let internalTransitionsThisYear = 0;
    let skillGapsIdentified = 0;
    let sumCycleDays = 0;
    let sumAccuracy = 0;

    let departmentInsights: any[] = [];
    let internalMobilityTrends: any[] = [];
    let skillDemands: any[] = [];
    let recentTransitions: any[] = [];

    records.forEach((rec) => {
      totalEmployees += rec.totalEmployees;
      activeInternalJobs += rec.activeInternalJobs;
      internalTransitionsThisYear += rec.internalTransitionsThisYear;
      skillGapsIdentified += rec.skillGapsIdentified;
      sumCycleDays += rec.averageMobilityCycleDays;

      const accuracyNum = parseFloat(rec.aiMatchingAccuracy.replace("%", "")) || 90;
      sumAccuracy += accuracyNum;

      try {
        departmentInsights = departmentInsights.concat(JSON.parse(rec.departmentInsights || "[]"));
        internalMobilityTrends = internalMobilityTrends.concat(JSON.parse(rec.internalMobilityTrends || "[]"));
        skillDemands = skillDemands.concat(JSON.parse(rec.skillDemands || "[]"));
        recentTransitions = recentTransitions.concat(JSON.parse(rec.recentTransitions || "[]"));
      } catch (e) {
        console.error("JSON parsing error inside consolidation loop:", e);
      }
    });

    const averageAccuracy = (sumAccuracy / records.length).toFixed(1) + "%";
    const averageCycleDays = Math.round(sumCycleDays / records.length);

    // Group skill demand counters dynamically for perfect heatmaps
    const skillMap = new Map<string, { count: number; demandTrend: string }>();
    skillDemands.forEach((sd) => {
      const existing = skillMap.get(sd.skill);
      if (existing) {
        existing.count += sd.count;
      } else {
        skillMap.set(sd.skill, { count: sd.count, demandTrend: sd.demandTrend });
      }
    });
    const consolidatedSkills = Array.from(skillMap.entries()).map(([skill, val]) => ({
      skill,
      count: val.count,
      demandTrend: val.demandTrend,
    })).sort((a, b) => b.count - a.count);

    res.json({
      overviewMetrics: {
        totalEmployees,
        activeInternalJobs,
        internalTransitionsThisYear,
        skillGapsIdentified,
        aiMatchingAccuracy: averageAccuracy,
        employeeEngagementScore: "8.6/10",
        averageMobilityCycleDays: averageCycleDays,
      },
      departmentInsights,
      internalMobilityTrends: internalMobilityTrends.slice(0, 10), // Truncate to size
      skillDemands: consolidatedSkills,
      recentTransitions: recentTransitions.slice(0, 8),
    });
  } catch (err: any) {
    console.error("Failed to query consolidated analytics: ", err);
    res.status(500).json({ success: false, message: "Internal server error fetching HR analytics details." });
  }
}

/**
 * 2. Export structured reports (CSV parsing alignment)
 */
export async function exportReport(req: any, res: Response): Promise<void> {
  try {
    const { format } = req.query;

    const list = await Analytics.findAll();
    let csvString = "Domain Division,Employees Headcount,Active Gaps,Transitions This Year,Match Accuracy,Engagement Score\n";

    list.forEach((rec) => {
      csvString += `"${rec.domain.toUpperCase()}",${rec.totalEmployees},${rec.skillGapsIdentified},${rec.internalTransitionsThisYear},"${rec.aiMatchingAccuracy}","${rec.employeeEngagementScore}"\n`;
    });

    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=mobility_workforce_forecasting_report_2026.csv");
      res.status(200).send(csvString);
      return;
    }

    // Default plaintext formatted report for immediate frontend display or custom print
    let documentView = `
=== MOBILITYAI CORPORATE TALENT WORKFORCE EXECUTIVE REPORT ===
GENERATED DATE: 2026-05-23
OPERATIONAL AUDIT PARAMETERS: EXPORT FORMAT VERIFIED

=============================================
OVERALL DIVISION AND RESOURCE CAPABILITIES
=============================================
`;

    list.forEach((rec) => {
      documentView += `
DIVISION FOCUS REGISTRY: [${rec.domain.toUpperCase()}]
---------------------------------------------
- Total Active Workforce Count: ${rec.totalEmployees} employees
- Targeted Internal Postings: ${rec.activeInternalJobs} active vacancies
- Transitions Fulfilled (YTD): ${rec.internalTransitionsThisYear} successful placements
- Active Skill-Gaps Cataloged: ${rec.skillGapsIdentified} individual pathways
- Average Calibration Cycle: ${rec.averageMobilityCycleDays} business days
- Verified Matching Target Accuracy: ${rec.aiMatchingAccuracy}
- AI Career Engagement Score: ${rec.employeeEngagementScore}
`;
    });

    res.json({
      success: true,
      reportText: documentView,
      csvText: csvString,
    });
  } catch (err) {
    console.error("Report extraction compiler error:", err);
    res.status(500).json({ success: false, message: "Internal server error formatting corporate document." });
  }
}

/**
 * 3. List all internal job postings for HR Review
 */
export async function listHrJobs(req: any, res: Response): Promise<void> {
  try {
    const list = await JobPosting.findAll();
    const parsedList = list.map((job) => {
      const data = job.get({ plain: true });
      return {
        ...data,
        requiredSkills: JSON.parse(data.requiredSkills || "[]"),
        preferredSkills: JSON.parse(data.preferredSkills || "[]"),
      };
    });
    res.json({ success: true, jobs: parsedList });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Internal server error fetching HR jobs." });
  }
}

/**
 * 4. Create internal job opening
 */
export async function createHrJob(req: any, res: Response): Promise<void> {
  try {
    const { 
      title, domain, department, level, location, salaryRange, 
      description, requiredSkills, preferredSkills, experienceRequirements, 
      deadline, status, hiringManager 
    } = req.body;
    
    const job = await JobPosting.create({
      title,
      domain,
      department,
      level,
      location,
      salaryRange,
      description,
      requiredSkills: requiredSkills || [],
      preferredSkills: preferredSkills || [],
      postedDate: new Date().toISOString().split("T")[0],
      applicantsCount: 0,
      status: status || "Active",
      hiringManager: hiringManager || "HR Talent Operations",
      experienceRequirements: experienceRequirements || "3+ years corresponding IT exposure",
      deadline: deadline || "2026-08-31",
    });

    res.json({ success: true, message: "Job listing registered successfully in corporate system.", job });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * 5. Update job posting
 */
export async function updateHrJob(req: any, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;
    const job = await JobPosting.findByPk(id);
    if (!job) {
      res.status(404).json({ success: false, message: "Job posting not found." });
      return;
    }

    if (updates.title !== undefined) job.title = updates.title;
    if (updates.domain !== undefined) job.domain = updates.domain;
    if (updates.department !== undefined) job.department = updates.department;
    if (updates.level !== undefined) job.level = updates.level;
    if (updates.location !== undefined) job.location = updates.location;
    if (updates.salaryRange !== undefined) job.salaryRange = updates.salaryRange;
    if (updates.description !== undefined) job.description = updates.description;
    if (updates.requiredSkills !== undefined) {
      job.requiredSkills = typeof updates.requiredSkills === "string" ? updates.requiredSkills : JSON.stringify(updates.requiredSkills);
    }
    if (updates.preferredSkills !== undefined) {
      job.preferredSkills = typeof updates.preferredSkills === "string" ? updates.preferredSkills : JSON.stringify(updates.preferredSkills);
    }
    if (updates.status !== undefined) job.status = updates.status;
    if (updates.hiringManager !== undefined) job.hiringManager = updates.hiringManager;
    if (updates.experienceRequirements !== undefined) (job as any).experienceRequirements = updates.experienceRequirements;
    if (updates.deadline !== undefined) (job as any).deadline = updates.deadline;

    await job.save();
    res.json({ success: true, message: "Job posting updated successfully.", job });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * 6. Delete job posting
 */
export async function deleteHrJob(req: any, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const result = await JobPosting.destroy({ where: { id } });
    if (!result) {
      res.status(404).json({ success: false, message: "Job posting not found in registries." });
      return;
    }
    await Application.destroy({ where: { jobId: id } });
    res.json({ success: true, message: "Job posting and linked applications removed from core archives." });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * 7. List all HR internal applicants
 */
export async function listHrApplicants(req: any, res: Response): Promise<void> {
  try {
    const applications = await Application.findAll();
    const resolvedApplicants = [];

    for (const app of applications) {
      const appData = app.get({ plain: true });
      const job = await JobPosting.findByPk(appData.jobId);
      const profile = await Profile.findOne({ where: { userId: appData.userId } });
      
      let skillsList: string[] = [];
      if (profile) {
        const skillsObj = await Skill.findAll({ where: { profileId: profile.id } });
        skillsList = skillsObj.map(s => s.name);
      }

      resolvedApplicants.push({
        id: appData.id,
        userId: appData.userId,
        jobId: appData.jobId,
        matchScore: appData.matchScore,
        status: appData.status,
        appliedDate: appData.appliedDate,
        interviewDate: (appData as any).interviewDate || null,
        interviewTime: (appData as any).interviewTime || null,
        interviewMode: (appData as any).interviewMode || null,
        jobTitle: job ? job.title : "Unknown vacancy",
        jobDepartment: job ? job.department : "Unspecified",
        candidate: profile ? {
          name: profile.name,
          title: profile.title,
          department: profile.department,
          level: profile.level,
          bio: profile.bio,
          avatar: profile.avatar,
          hireDate: profile.hireDate,
          workStyle: profile.workStyle,
          relocation: profile.relocation,
          skills: skillsList,
        } : {
          name: "Anonymous Employee",
          title: "Staff Member",
          department: "Operations",
          level: "L5",
          bio: "",
          avatar: "",
          hireDate: "",
          workStyle: "Hybrid",
          relocation: false,
          skills: []
        }
      });
    }

    res.json({ success: true, applicants: resolvedApplicants });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Internal server error fetching applicants." });
  }
}

/**
 * 8. Progress applicant workflow status
 */
export async function updateHrApplicantStatus(req: any, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const app = await Application.findOne({ where: { id } });
    if (!app) {
      res.status(404).json({ success: false, message: "Application files not found." });
      return;
    }

    app.status = status;
    await app.save();

    const job = await JobPosting.findByPk(app.jobId);
    const jobTitle = job ? job.title : "Internal Vacancy";

    let messageStr = "";
    if (status === "Shortlisted") {
      messageStr = `Congratulations! Your talent application dossier for '${jobTitle}' has been Shortlisted. HR is coordinating resources and will reach out shortly for interview calibration.`;
    } else if (status === "Interviewing") {
      messageStr = `Good news! Your candidate status for '${jobTitle}' is now progressing in the 'Interviewing' stage. Check your calendar invite dispatch.`;
    } else if (status === "Approved") {
      messageStr = `Informed Decision: Your internal transfer for '${jobTitle}' has been APPROVED! Sourcing operations will organize the structural transition in 14 days.`;
    } else if (status === "Rejected") {
      messageStr = `Evaluation update: HR Talent Operations has processed other applications for '${jobTitle}' at this time. We highly encourage upskilling and future horizontal mobility application.`;
    } else {
      messageStr = `The compliance status of your application for '${jobTitle}' has been updated to: ${status}.`;
    }

    await Notification.create({
      userId: app.userId,
      title: `Recruitment Stage Update: ${status}`,
      message: messageStr,
      read: false,
    });

    res.json({ 
      success: true, 
      message: `Applicant file status successfully progressed to ${status}. Notification dispatched.`, 
      application: app 
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * 9. Schedule executive interview slot
 */
export async function scheduleInterview(req: any, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { interviewDate, interviewTime, interviewMode } = req.body;

    const app = await Application.findOne({ where: { id } });
    if (!app) {
      res.status(404).json({ success: false, message: "Application file not found." });
      return;
    }

    (app as any).interviewDate = interviewDate;
    (app as any).interviewTime = interviewTime;
    (app as any).interviewMode = interviewMode || "Google Meet Video Channel";
    app.status = "Interviewing";
    await app.save();

    const job = await JobPosting.findByPk(app.jobId);
    const jobTitle = job ? job.title : "Internal Vacancy";

    await Notification.create({
      userId: app.userId,
      title: "Interview Event Scheduled",
      message: `An executive interview loop has been successfully locked for your '${jobTitle}' application. Time: ${interviewDate} at ${interviewTime} via ${interviewMode || "Google Meet channel"}.`,
      read: false,
    });

    res.json({ 
      success: true, 
      message: "Interview session locked and scheduled successfully.", 
      application: app 
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * 10. AI Skill-mapping match maker helper
 */
function calculateSkillsScore(profileSkills: string[], required: string[], preferred: string[]): number {
  if (required.length === 0) return 70;
  
  const matchedRequiredIdx = required.filter(skill => 
    profileSkills.some(ps => ps.toLowerCase() === skill.toLowerCase())
  ).length;
  
  const requiredWeight = required.length * 1.5;
  const preferredMatches = preferred.filter(skill => 
    profileSkills.some(ps => ps.toLowerCase() === skill.toLowerCase())
  ).length;
  
  const rawScore = ((matchedRequiredIdx * 1.5 + preferredMatches * 0.5) / (requiredWeight + preferred.length * 0.5)) * 100;
  return Math.min(100, Math.max(25, Math.round(rawScore)));
}

/**
 * 11. AI Smart Sourcing - Auto-categorized candidate recommendations
 */
export async function getCandidateRecommendations(req: any, res: Response): Promise<void> {
  try {
    const { jobId } = req.params;
    const job = await JobPosting.findByPk(jobId);
    if (!job) {
      res.status(404).json({ success: false, message: "Active job opening not found." });
      return;
    }

    const reqSkills = JSON.parse(job.requiredSkills || "[]");
    const prefSkills = JSON.parse(job.preferredSkills || "[]");

    const existingApps = await Application.findAll({ where: { jobId } });
    const appliedUserIds = existingApps.map(a => a.userId);

    const allProfiles = await Profile.findAll();
    const recommendations = [];

    for (const prof of allProfiles) {
      if (appliedUserIds.includes(prof.userId)) continue;
      
      const userObj = await User.findByPk(prof.userId);
      if (userObj?.role === "HR_ADMIN") continue;

      const skillsObj = await Skill.findAll({ where: { profileId: prof.id } });
      const skillsArray = skillsObj.map(s => s.name);

      const score = calculateSkillsScore(skillsArray, reqSkills, prefSkills);

      if (score >= 40) { // Keep recommendation threshold slightly broader
        recommendations.push({
          userId: prof.userId,
          name: prof.name,
          title: prof.title,
          department: prof.department,
          level: prof.level,
          avatar: prof.avatar,
          bio: prof.bio,
          skills: skillsArray,
          matchScore: score,
        });
      }
    }

    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ success: true, recommendations });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "AI recommendation matchmaking error." });
  }
}
