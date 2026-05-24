import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

// Determine DB location: prefer custom DB_PATH, fallback to Render persistent /data mount, otherwise local cwd root
const getDatabaseFilePath = (): string => {
  let dbPath = process.env.DB_PATH || "";
  // Strip potential environment variable prefix (e.g. "DB_PATH=/data/...") if wrongly stored as the value
  if (dbPath.startsWith("DB_PATH=")) {
    dbPath = dbPath.substring("DB_PATH=".length);
  }
  // Clean up any double/single quotes around the path if defined wrongly in env files
  dbPath = dbPath.replace(/^['"]|['"]$/g, "").trim();

  if (dbPath) {
    return dbPath;
  }
  // Safe directory detection for cloud deployments like Render or AWS ECS
  try {
    if (fs.existsSync("/data") && fs.statSync("/data").isDirectory()) {
      return "/data/database_store.json";
    }
  } catch (e) {
    // Suppress folder permission or check errors in test runtimes
  }
  return path.join(process.cwd(), "database_store.json");
};

const DB_FILE = getDatabaseFilePath();

// Helper to generate UUIDs
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Global In-Memory and persistent store
let dbState: {
  users: any[];
  profiles: any[];
  skills: any[];
  certifications: any[];
  jobPostings: any[];
  applications: any[];
  chatHistory: any[];
  analytics: any[];
  notifications: any[];
} = {
  users: [],
  profiles: [],
  skills: [],
  certifications: [],
  jobPostings: [],
  applications: [],
  chatHistory: [],
  analytics: [],
  notifications: [],
};

// Thread-safe persistence helpers
export function loadDB() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(content);
      dbState.users = parsed.users || [];
      dbState.profiles = parsed.profiles || [];
      dbState.skills = parsed.skills || [];
      dbState.certifications = parsed.certifications || [];
      dbState.jobPostings = parsed.jobPostings || [];
      dbState.applications = parsed.applications || [];
      dbState.chatHistory = parsed.chatHistory || [];
      dbState.analytics = parsed.analytics || [];
      dbState.notifications = parsed.notifications || [];
    } catch (err) {
      console.error("Failed to parse database file, starting fresh:", err);
    }
  }
}

export function saveDB() {
  try {
    // Ensure parent directory created before writing to avoid ENOENT errors
    const parentDir = path.dirname(DB_FILE);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write database file:", err);
  }
}

// Load database immediately
loadDB();

// Simulated Sequelize dummy
export const sequelize = {
  sync: async (options?: any) => {},
  close: async () => {},
};

// Custom Models Shimming the Sequelize interface

// 1. User Model
export class User {
  public id!: string;
  public email!: string;
  public password!: string;
  public role!: "EMPLOYEE" | "HR_ADMIN";
  public createdAt!: string;
  public updatedAt!: string;

  constructor(data: any) {
    Object.assign(this, data);
  }

  public get(options?: { plain: boolean }) {
    return { ...this };
  }

  public changed(field: string): boolean {
    return true;
  }

  public set(field: string, val: any) {
    (this as any)[field] = val;
  }

  public async save(): Promise<User> {
    const idx = dbState.users.findIndex((u) => u.id === this.id);
    if (idx !== -1) {
      this.updatedAt = new Date().toISOString();
      dbState.users[idx] = { ...this };
      saveDB();
    }
    return this;
  }

  public static async count(): Promise<number> {
    return dbState.users.length;
  }

  public static async findOne(options?: { where?: any }): Promise<User | null> {
    const where = options?.where || {};
    const item = dbState.users.find((u) => {
      for (const [k, v] of Object.entries(where)) {
        if (u[k] !== v) return false;
      }
      return true;
    });
    return item ? new User(item) : null;
  }

  public static async findByPk(id: string): Promise<User | null> {
    const item = dbState.users.find((u) => u.id === id);
    return item ? new User(item) : null;
  }

  public static async create(data: any): Promise<User> {
    const copy = { ...data };
    if (!copy.id) {
      copy.id = generateUUID();
    }
    if (copy.password) {
      const salt = await bcrypt.genSalt(10);
      copy.password = await bcrypt.hash(copy.password, salt);
    }
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = new Date().toISOString();
    dbState.users.push(copy);
    saveDB();
    return new User(copy);
  }
}

// 2. Profile Model
export class Profile {
  public id!: string;
  public userId!: string;
  public name!: string;
  public title!: string;
  public department!: string;
  public level!: string;
  public hireDate!: string;
  public avatar!: string;
  public bio!: string;
  public domain!: "aiml" | "fullstack" | "data" | "salesforce" | "servicenow";
  public workStyle!: string;
  public relocation!: boolean;
  public priorityAreas!: string; // stringified JSON
  public interests!: string; // stringified JSON
  public createdAt!: string;
  public updatedAt!: string;

  constructor(data: any) {
    Object.assign(this, data);
  }

  public get(options?: { plain: boolean }) {
    return { ...this };
  }

  public set(field: string, val: any) {
    (this as any)[field] = val;
  }

  public async save(): Promise<Profile> {
    const idx = dbState.profiles.findIndex((p) => p.id === this.id);
    if (idx !== -1) {
      this.updatedAt = new Date().toISOString();
      dbState.profiles[idx] = { ...this };
      saveDB();
    }
    return this;
  }

  public static async findOne(options?: { where?: any }): Promise<Profile | null> {
    const where = options?.where || {};
    const item = dbState.profiles.find((p) => {
      for (const [k, v] of Object.entries(where)) {
        if (p[k] !== v) return false;
      }
      return true;
    });
    return item ? new Profile(item) : null;
  }

  public static async findAll(options?: { where?: any }): Promise<Profile[]> {
    const where = options?.where || {};
    const items = dbState.profiles.filter((p) => {
      for (const [k, v] of Object.entries(where)) {
        if (p[k] !== v) return false;
      }
      return true;
    });
    return items.map((item) => new Profile(item));
  }

  public static async create(data: any): Promise<Profile> {
    const copy = { ...data };
    if (!copy.id) {
      copy.id = generateUUID();
    }
    if (copy.interests !== undefined && typeof copy.interests !== "string") {
      copy.interests = JSON.stringify(copy.interests);
    }
    if (copy.priorityAreas !== undefined && typeof copy.priorityAreas !== "string") {
      copy.priorityAreas = JSON.stringify(copy.priorityAreas);
    }
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = new Date().toISOString();
    dbState.profiles.push(copy);
    saveDB();
    return new Profile(copy);
  }
}

// 3. Skill Model
export class Skill {
  public id!: string;
  public profileId!: string;
  public name!: string;

  constructor(data: any) {
    Object.assign(this, data);
  }

  public get(options?: { plain: boolean }) {
    return { ...this };
  }

  public static async findAll(options?: { where?: any }): Promise<Skill[]> {
    const where = options?.where || {};
    const list = dbState.skills.filter((s) => {
      for (const [k, v] of Object.entries(where)) {
        if (s[k] !== v) return false;
      }
      return true;
    });
    return list.map((s) => new Skill(s));
  }

  public static async create(data: any): Promise<Skill> {
    const copy = { ...data };
    if (!copy.id) copy.id = generateUUID();
    dbState.skills.push(copy);
    saveDB();
    return new Skill(copy);
  }

  public static async destroy(options?: { where?: any }): Promise<number> {
    const where = options?.where || {};
    const originalLength = dbState.skills.length;
    dbState.skills = dbState.skills.filter((s) => {
      for (const [k, v] of Object.entries(where)) {
        if (s[k] === v) return false;
      }
      return true;
    });
    saveDB();
    return originalLength - dbState.skills.length;
  }
}

// 4. Certification Model
export class Certification {
  public id!: string;
  public profileId!: string;
  public name!: string;

  constructor(data: any) {
    Object.assign(this, data);
  }

  public get(options?: { plain: boolean }) {
    return { ...this };
  }

  public static async findAll(options?: { where?: any }): Promise<Certification[]> {
    const where = options?.where || {};
    const list = dbState.certifications.filter((c) => {
      for (const [k, v] of Object.entries(where)) {
        if (c[k] !== v) return false;
      }
      return true;
    });
    return list.map((c) => new Certification(c));
  }

  public static async create(data: any): Promise<Certification> {
    const copy = { ...data };
    if (!copy.id) copy.id = generateUUID();
    dbState.certifications.push(copy);
    saveDB();
    return new Certification(copy);
  }

  public static async destroy(options?: { where?: any }): Promise<number> {
    const where = options?.where || {};
    const originalLength = dbState.certifications.length;
    dbState.certifications = dbState.certifications.filter((c) => {
      for (const [k, v] of Object.entries(where)) {
        if (c[k] === v) return false;
      }
      return true;
    });
    saveDB();
    return originalLength - dbState.certifications.length;
  }
}

// 5. JobPosting Model
export class JobPosting {
  public id!: string;
  public title!: string;
  public domain!: string;
  public department!: string;
  public level!: string;
  public location!: string;
  public salaryRange!: string;
  public description!: string;
  public requiredSkills!: string; // stringified JSON
  public preferredSkills!: string; // stringified JSON
  public postedDate!: string;
  public applicantsCount!: number;
  public status!: string;
  public hiringManager!: string;

  constructor(data: any) {
    Object.assign(this, data);
  }

  public get(options?: { plain: boolean }) {
    return { ...this };
  }

  public async save(): Promise<JobPosting> {
    const idx = dbState.jobPostings.findIndex((j) => j.id === this.id);
    if (idx !== -1) {
      dbState.jobPostings[idx] = { ...this };
      saveDB();
    }
    return this;
  }

  public static async findByPk(id: string): Promise<JobPosting | null> {
    const item = dbState.jobPostings.find((j) => j.id === id);
    return item ? new JobPosting(item) : null;
  }

  public static async findAll(options?: { where?: any }): Promise<JobPosting[]> {
    const where = options?.where || {};
    const list = dbState.jobPostings.filter((j) => {
      for (const [k, v] of Object.entries(where)) {
        if (j[k] !== v) return false;
      }
      return true;
    });
    return list.map((j) => new JobPosting(j));
  }

  public static async create(data: any): Promise<JobPosting> {
    const copy = { ...data };
    if (!copy.id) copy.id = generateUUID();
    if (copy.requiredSkills !== undefined && typeof copy.requiredSkills !== "string") {
      copy.requiredSkills = JSON.stringify(copy.requiredSkills);
    }
    if (copy.preferredSkills !== undefined && typeof copy.preferredSkills !== "string") {
      copy.preferredSkills = JSON.stringify(copy.preferredSkills);
    }
    dbState.jobPostings.push(copy);
    saveDB();
    return new JobPosting(copy);
  }

  public static async destroy(options?: { where?: any }): Promise<number> {
    const where = options?.where || {};
    const originalLength = dbState.jobPostings.length;
    dbState.jobPostings = dbState.jobPostings.filter((j) => {
      for (const [k, v] of Object.entries(where)) {
        if (j[k] === v) return false;
      }
      return true;
    });
    saveDB();
    return originalLength - dbState.jobPostings.length;
  }
}

// 6. Application Model
export class Application {
  public id!: string;
  public userId!: string;
  public jobId!: string;
  public status!: "Applied" | "Pending" | "Approved" | "Transitioning" | "Completed" | "Shortlisted" | "Interviewing" | "Rejected";
  public appliedDate!: string;
  public matchScore!: number;

  constructor(data: any) {
    Object.assign(this, data);
  }

  public get(options?: { plain: boolean }) {
    return { ...this };
  }

  public static async findOne(options?: { where?: any }): Promise<Application | null> {
    const where = options?.where || {};
    const item = dbState.applications.find((a) => {
      for (const [k, v] of Object.entries(where)) {
        if (a[k] !== v) return false;
      }
      return true;
    });
    return item ? new Application(item) : null;
  }

  public static async findAll(options?: { where?: any }): Promise<Application[]> {
    const where = options?.where || {};
    const list = dbState.applications.filter((a) => {
      for (const [k, v] of Object.entries(where)) {
        if (a[k] !== v) return false;
      }
      return true;
    });
    return list.map((a) => new Application(a));
  }

  public static async create(data: any): Promise<Application> {
    const copy = { ...data };
    if (!copy.id) copy.id = generateUUID();
    dbState.applications.push(copy);
    saveDB();
    return new Application(copy);
  }

  public async save(): Promise<Application> {
    const idx = dbState.applications.findIndex((a) => a.id === this.id);
    if (idx !== -1) {
      dbState.applications[idx] = { ...this };
      saveDB();
    }
    return this;
  }

  public static async destroy(options?: { where?: any }): Promise<number> {
    const where = options?.where || {};
    const originalLength = dbState.applications.length;
    dbState.applications = dbState.applications.filter((a) => {
      for (const [k, v] of Object.entries(where)) {
        if (a[k] === v) return false;
      }
      return true;
    });
    saveDB();
    return originalLength - dbState.applications.length;
  }
}

// 7. ChatHistory Model
export class ChatHistory {
  public id!: string;
  public userId!: string;
  public domain!: string;
  public sender!: "Aura" | "User" | "System";
  public text!: string;
  public timestamp!: string;
  public createdAt!: string;
  public updatedAt!: string;

  constructor(data: any) {
    Object.assign(this, data);
  }

  public get(options?: { plain: boolean }) {
    return { ...this };
  }

  public static async findAll(options?: { where?: any; order?: any[][]; limit?: number }): Promise<ChatHistory[]> {
    const where = options?.where || {};
    let list = dbState.chatHistory.filter((c) => {
      for (const [k, v] of Object.entries(where)) {
        if (c[k] !== v) return false;
      }
      return true;
    });

    if (options?.order) {
      options.order.forEach(([field, direction]) => {
        list.sort((a, b) => {
          const valA = a[field] || "";
          const valB = b[field] || "";
          if (valA < valB) return direction.toUpperCase() === "ASC" ? -1 : 1;
          if (valA > valB) return direction.toUpperCase() === "ASC" ? 1 : -1;
          return 0;
        });
      });
    }

    if (options?.limit && options.limit > 0) {
      list = list.slice(0, options.limit);
    }

    return list.map((c) => new ChatHistory(c));
  }

  public static async create(data: any): Promise<ChatHistory> {
    const copy = { ...data };
    if (!copy.id) copy.id = generateUUID();
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = new Date().toISOString();
    dbState.chatHistory.push(copy);
    saveDB();
    return new ChatHistory(copy);
  }

  public static async destroy(options?: { where?: any }): Promise<number> {
    const where = options?.where || {};
    const originalLength = dbState.chatHistory.length;
    dbState.chatHistory = dbState.chatHistory.filter((c) => {
      for (const [k, v] of Object.entries(where)) {
        if (c[k] === v) return false;
      }
      return true;
    });
    saveDB();
    return originalLength - dbState.chatHistory.length;
  }
}

// 8. Analytics Model
export class Analytics {
  public id!: string;
  public domain!: string;
  public totalEmployees!: number;
  public activeInternalJobs!: number;
  public internalTransitionsThisYear!: number;
  public skillGapsIdentified!: number;
  public aiMatchingAccuracy!: string;
  public employeeEngagementScore!: string;
  public averageMobilityCycleDays!: number;
  public departmentInsights!: string; // stringified JSON
  public internalMobilityTrends!: string; // stringified JSON
  public skillDemands!: string; // stringified JSON
  public recentTransitions!: string; // stringified JSON
  public createdAt!: string;
  public updatedAt!: string;

  constructor(data: any) {
    Object.assign(this, data);
  }

  public get(options?: { plain: boolean }) {
    return { ...this };
  }

  public static async findAll(options?: { where?: any }): Promise<Analytics[]> {
    const where = options?.where || {};
    const list = dbState.analytics.filter((a) => {
      for (const [k, v] of Object.entries(where)) {
        if (a[k] !== v) return false;
      }
      return true;
    });
    return list.map((a) => new Analytics(a));
  }

  public static async create(data: any): Promise<Analytics> {
    const copy = { ...data };
    if (!copy.id) copy.id = generateUUID();
    if (copy.departmentInsights !== undefined && typeof copy.departmentInsights !== "string") {
      copy.departmentInsights = JSON.stringify(copy.departmentInsights);
    }
    if (copy.internalMobilityTrends !== undefined && typeof copy.internalMobilityTrends !== "string") {
      copy.internalMobilityTrends = JSON.stringify(copy.internalMobilityTrends);
    }
    if (copy.skillDemands !== undefined && typeof copy.skillDemands !== "string") {
      copy.skillDemands = JSON.stringify(copy.skillDemands);
    }
    if (copy.recentTransitions !== undefined && typeof copy.recentTransitions !== "string") {
      copy.recentTransitions = JSON.stringify(copy.recentTransitions);
    }
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = new Date().toISOString();
    dbState.analytics.push(copy);
    saveDB();
    return new Analytics(copy);
  }
}

// 9. Notification Model
export class Notification {
  public id!: string;
  public userId!: string;
  public title!: string;
  public message!: string;
  public read!: boolean;
  public createdAt!: string;
  public updatedAt!: string;

  constructor(data: any) {
    Object.assign(this, data);
  }

  public get(options?: { plain: boolean }) {
    return { ...this };
  }

  public static async create(data: any): Promise<Notification> {
    const copy = { ...data };
    if (!copy.id) copy.id = generateUUID();
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = new Date().toISOString();
    dbState.notifications.push(copy);
    saveDB();
    return new Notification(copy);
  }
}

// Synchronization and Seeding Process
export async function setupDatabase() {
  loadDB();

  // If we already have users seeded, bypass seeding
  if (dbState.users.length > 0) {
    return;
  }

  console.log("JSON Database empty. Beginning seeding process...");

  // Seed default HR Admin Account
  const hrAdmin = await User.create({
    email: "hr_admin@mobility.corp",
    password: "password123",
    role: "HR_ADMIN",
  });

  const hrAdminProfile = await Profile.create({
    userId: hrAdmin.id,
    name: "Enterprise Admin",
    title: "Chief of Talent Mobility",
    department: "Talent Operations",
    level: "L7",
    hireDate: "January 2021",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    bio: "Chief officer of modern talent strategy and corporate mobility governance.",
    domain: "aiml",
    workStyle: "Hybrid",
    relocation: false,
    priorityAreas: ["Workforce Resilience", "Fostering Internal Skill-Gaps Closing", "Leadership Mobility Pipelines"],
  });

  // Default Employee Domain Mapping Seed Parameters
  const domainsData = [
    {
      domain: "aiml" as const,
      email: "alex@mobility.corp",
      name: "Alex Chen",
      title: "Senior AI/ML Research Specialist",
      department: "AIML Engineering",
      level: "L5",
      hireDate: "June 2023",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      bio: "Pragmatic ML & AI specialist passionate about Large Language Models, deep neural networks tuning, adversarial safety guardrails, and distributed model training latency optimization.",
      skills: ["Python", "TensorFlow", "NLP", "MLOps", "LLMs", "PyTorch", "HuggingFace", "Scikit-Learn"],
      certifications: [
        "DeepLearning.AI TensorFlow Developer Certificate",
        "AWS Certified Machine Learning - Specialty",
        "Certified Kubernetes Administrator (CKA)"
      ],
      preferences: {
        workStyle: "Hybrid",
        relocation: false,
        priorityAreas: ["Machine Learning & LLMs", "Large-Scale Architecture", "System Design & Scale"]
      }
    },
    {
      domain: "fullstack" as const,
      email: "sarah@mobility.corp",
      name: "Sarah Jenkins",
      title: "Lead Full Stack Software Developer",
      department: "Full Stack Development",
      level: "L5",
      hireDate: "March 2022",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      bio: "Experienced full-stack developer specializing in React, high-performance Node.js backends, secure FastAPI endpoints, and Docker containerization. Eager to master DevOps pipelines and platform architecture.",
      skills: ["React", "Node.js", "FastAPI", "MongoDB", "Docker", "TypeScript", "Next.js", "Tailwind CSS"],
      certifications: [
        "Meta Front-End Developer Professional Certificate",
        "AWS Certified Developer - Associate",
        "HashiCorp Certified - Terraform Associate"
      ],
      preferences: {
        workStyle: "Remote",
        relocation: true,
        priorityAreas: ["SaaS Architecture & Web App Design", "Decoupled Systems Design", "Edge Infrastructures"]
      }
    },
    {
      domain: "data" as const,
      email: "devon@mobility.corp",
      name: "Devon Reynolds",
      title: "Senior Enterprise Data Analyst",
      department: "Data Analytics",
      level: "L5",
      hireDate: "November 2022",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      bio: "Analytical professional focusing on complex SQL queries, advanced data pipeline engineering, and interactive dashboards in Power BI and Tableau. Aspires to build distributed training feature pipelines.",
      skills: ["SQL", "Power BI", "Tableau", "Excel", "Python", "Snowflake", "pandas", "d3.js"],
      certifications: [
        "Google Data Analytics Professional Certificate",
        "Microsoft Certified: Power BI Data Analyst Associate",
        "Tableau Desktop Certified Associate"
      ],
      preferences: {
        workStyle: "Hybrid",
        relocation: false,
        priorityAreas: ["Cloud Data Storage Analytics", "Data Warehousing Optimization", "Automated Pipelines"]
      }
    },
    {
      domain: "salesforce" as const,
      email: "clarissa@mobility.corp",
      name: "Clarissa Finch",
      title: "Senior Salesforce Developer",
      department: "Salesforce Development",
      level: "L5",
      hireDate: "January 2024",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
      bio: "CRM developer experienced in engineering Lightning Web Components (LWC), robust Apex triggers, SOQL queries, and Salesforce Flow automation. Eager to grow into a CRM Systems Architect.",
      skills: ["Apex", "Lightning", "CRM", "SOQL", "Salesforce Flow", "OmniStudio", "JavaScript", "REST APIs"],
      certifications: [
        "Salesforce Certified Platform Developer II",
        "Salesforce Certified Application Architect",
        "Salesforce Certified Administrator"
      ],
      preferences: {
        workStyle: "Hybrid",
        relocation: false,
        priorityAreas: ["Apex Triggers Architecture", "OmniStudio Custom Layouts", "Systems Integration"]
      }
    },
    {
      domain: "servicenow" as const,
      email: "marcus@mobility.corp",
      name: "Marcus Brodie",
      title: "Senior ServiceNow Workflow Engineer",
      department: "ServiceNow Engineering",
      level: "L5",
      hireDate: "October 2023",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
      bio: "Dedicated workflows specialist focused on ITSM modules, configuration management (CMDB), and complex enterprise workflow orchestration using ServiceNow IntegrationHub and Flow Designer.",
      skills: ["ITSM", "CMDB", "Workflow Automation", "Service Portal", "JavaScript", "ITOM", "Flow Designer", "REST integrations"],
      certifications: [
        "ServiceNow Certified System Administrator",
        "ServiceNow Certified Application Developer",
        "Certified Implementation Specialist - ITSM"
      ],
      preferences: {
        workStyle: "Hybrid",
        relocation: false,
        priorityAreas: ["CMDB Automated Discovery", "ESM Flow Orchestrations", "SecOps Automated Workflows"]
      }
    }
  ];

  for (const item of domainsData) {
    const user = await User.create({
      email: item.email,
      password: "password123",
      role: "EMPLOYEE",
    });

    const prof = await Profile.create({
      userId: user.id,
      name: item.name,
      title: item.title,
      department: item.department,
      level: item.level,
      hireDate: item.hireDate,
      avatar: item.avatar,
      bio: item.bio,
      domain: item.domain,
      workStyle: item.preferences.workStyle,
      relocation: item.preferences.relocation,
      priorityAreas: item.preferences.priorityAreas,
    });

    // Seed Skills
    for (const skillName of item.skills) {
      await Skill.create({
        profileId: prof.id,
        name: skillName,
      });
    }

    // Seed Certifications
    for (const certName of item.certifications) {
      await Certification.create({
        profileId: prof.id,
        name: certName,
      });
    }

    // Seed welcoming message from Aura Coach
    await ChatHistory.create({
      userId: user.id,
      domain: item.domain,
      sender: "Aura",
      text: `Welcome, ${item.name}. I am Aura, your AI Career Architect. I have analyzed your skills inside the ${item.department} division. I can see a high-compatibility fit for a transition inside our division. Let me know what you'd like to explore, or ask any career growth questions!`,
      timestamp: new Date().toISOString(),
    });
  }

  // Seed open corporate jobs in database
  const seedJobs = [
    {
      id: "job-aiml-1",
      domain: "aiml",
      title: "Staff AI Scientist - Multimodal Agents",
      department: "AI/ML Engineering",
      level: "L6",
      location: "Austin, TX (Remote)",
      salaryRange: "$210,000 - $265,000",
      description: "Design and implement robust model alignment parameters, high-throughput pipelines, and custom finetuning patterns for our enterprise Gemini-powered autonomous agents. Champion scale, optimization, and platform accuracy standards at massive scale.",
      requiredSkills: ["Python", "TensorFlow", "MLOps", "LLMs", "PyTorch", "Prompt-Alignment Tuning", "NLP"],
      preferredSkills: ["HuggingFace", "Vector DB Performance Provisioning", "AI Model Performance Auditing"],
      postedDate: "2026-05-20",
      applicantsCount: 2,
      status: "Active",
      hiringManager: "Dr. Evelyn Vance (Chief Technical Officer)",
    },
    {
      id: "job-aiml-2",
      domain: "aiml",
      title: "Lead MLOps Engineer - GPU Orchestration",
      department: "AI/ML Engineering",
      level: "L5",
      location: "San Francisco, CA (Hybrid)",
      salaryRange: "$180,000 - $220,000",
      description: "Own the software design lifecycle for our massive machine learning environments. Standardize resource management, cuda cores allocation pipelines, and train models securely on hybrid cloud infrastructure.",
      requiredSkills: ["Python", "TensorFlow", "MLOps", "Docker", "Kubernetes", "CUDA Core Allocation"],
      preferredSkills: ["PyTorch", "Prometheus Performance Metrics", "Triton Inference Server"],
      postedDate: "2026-05-15",
      applicantsCount: 9,
      status: "Active",
      hiringManager: "Marcus Brodie (VP Ecosystem Developer Relations)"
    },
    {
      id: "job-fs-1",
      domain: "fullstack",
      title: "Platform Engineering & Infrastructure Architect",
      department: "Full Stack Development",
      level: "L6",
      location: "San Francisco, CA (Hybrid)",
      salaryRange: "$195,000 - $245,000",
      description: "Lead the architectural definition, decoupling, and high-availability strategy for our globally distributed enterprise SaaS core systems. Work directly with business leaders, principal platform architects, and platform teams.",
      requiredSkills: ["React", "Node.js", "FastAPI", "MongoDB", "Docker", "AWS Infrastructure", "Terraform"],
      preferredSkills: ["TypeScript", "Next.js", "gRPC Systems orchestration"],
      postedDate: "2026-05-18",
      applicantsCount: 3,
      status: "Active",
      hiringManager: "Dr. Evelyn Vance (Chief Technical Officer)",
    },
    {
      id: "job-fs-2",
      domain: "fullstack",
      title: "Lead Full Stack Engineer - Integration Services",
      department: "Full Stack Development",
      level: "L5",
      location: "Chicago, IL (Hybrid)",
      salaryRange: "$145,000 - $175,000",
      description: "Own key service integrations and dashboard utilities supporting high-performance metrics engines. Oversee frontend performance optimization and decoupled REST/GraphQL API developments.",
      requiredSkills: ["React", "Node.js", "FastAPI", "TypeScript", "REST APIs", "Tailwind CSS", "MongoDB"],
      preferredSkills: ["d3.js", "Next.js", "SaaS Growth loops"],
      postedDate: "2026-05-21",
      applicantsCount: 5,
      status: "Active",
      hiringManager: "Clarissa Finch (Director of Growth Platforms)",
    },
    {
      id: "job-da-1",
      domain: "data",
      title: "Business Intelligence & Data Architect",
      department: "Data Analytics",
      level: "L6",
      location: "New York, NY (Hybrid)",
      salaryRange: "$175,000 - $215,000",
      description: "Architect secure enterprise data pipelines and deliver cross-department metrics models. Govern Snowflake warehousing patterns and translate raw metrics into strategic business insights.",
      requiredSkills: ["SQL", "Power BI", "Snowflake", "Python", "Tableau", "Data Lake Modeling"],
      preferredSkills: ["Excel", "d3.js", "Advanced BigQuery Tuning"],
      postedDate: "2026-05-19",
      applicantsCount: 4,
      status: "Active",
      hiringManager: "Marcus Brodie (VP Ecosystem Analytics)",
    },
    {
      id: "job-da-2",
      domain: "data",
      title: "Senior Data Analyst - Operations and Risk Planning",
      department: "Data Analytics",
      level: "L5",
      location: "Chicago, IL (Hybrid)",
      salaryRange: "$135,000 - $160,000",
      description: "Drive corporate decision-making with high-density data visualizations, cohort retention audits, and predictive risk profiling dashboards.",
      requiredSkills: ["SQL", "Tableau", "Excel", "Python", "pandas", "Business Reporting"],
      preferredSkills: ["Power BI", "Snowflake", "d3.js"],
      postedDate: "2026-05-22",
      applicantsCount: 6,
      status: "Active",
      hiringManager: "Clarissa Finch (Director of Growth Platforms)",
    },
    {
      id: "job-sf-1",
      domain: "salesforce",
      title: "Principal CRM Systems Architect - Global Cloud",
      department: "Salesforce Development",
      level: "L6",
      location: "San Francisco, CA (Hybrid)",
      salaryRange: "$200,000 - $250,000",
      description: "Sponsor and represent our next-generation API frameworks, CRM customizations, and multi-cloud integrations across global Salesforce organizations.",
      requiredSkills: ["Apex", "Lightning", "CRM", "SOQL", "Salesforce Flow", "Enterprise Decoupling Patterns"],
      preferredSkills: ["OmniStudio", "LWC Framework", "OAuth Platform configurations"],
      postedDate: "2026-05-22",
      applicantsCount: 2,
      status: "Active",
      hiringManager: "Marcus Brodie (VP Ecosystem Solutions)",
    },
    {
      id: "job-sf-2",
      domain: "salesforce",
      title: "Lead Salesforce Flow & Integration Engineer",
      department: "Salesforce Development",
      level: "L5",
      location: "Austin, TX (Remote)",
      salaryRange: "$150,000 - $185,000",
      description: "Design automated customer solutions, coordinate asynchronous Apex integrations, and configure complex custom Salesforce Flows.",
      requiredSkills: ["Salesforce Flow", "OmniStudio", "Apex", "Lightning", "REST APIs", "SOQL"],
      preferredSkills: ["CRM", "JavaScript", "SOQL Optimization"],
      postedDate: "2026-05-20",
      applicantsCount: 4,
      status: "Active",
      hiringManager: "Devon Reynolds (Director of Enterprise Ecosystems)",
    },
    {
      id: "job-sn-1",
      domain: "servicenow",
      title: "Enterprise Service Mapping & ESM Architect",
      department: "ServiceNow Engineering",
      level: "L6",
      location: "New York, NY (Hybrid)",
      salaryRange: "$190,000 - $240,000",
      description: "Architect globally unified service catalogs and structural CMDB integrations. Champion automation workflows for ITSM and ITOM core modules.",
      requiredSkills: ["ITSM", "CMDB", "Workflow Automation", "ITOM", "Flow Designer", "JavaScript"],
      preferredSkills: ["Service Portal", "OAuth", "Multi-region service catalog partitioning"],
      postedDate: "2026-05-18",
      applicantsCount: 3,
      status: "Active",
      hiringManager: "Dr. Evelyn Vance (Chief Technical Officer)",
    },
    {
      id: "job-sn-2",
      domain: "servicenow",
      title: "Lead ServiceNow ITOM Engineer - Discovery Automation",
      department: "ServiceNow Engineering",
      level: "L5",
      location: "Austin, TX (Remote)",
      salaryRange: "$155,000 - $185,000",
      description: "Deploy automated asset discovery systems and orchestrate ITSM workflows to keep cloud network topologies synchronized.",
      requiredSkills: ["ITSM", "Workflow Automation", "Service Portal", "CMDB", "JavaScript", "Discovery Agents"],
      preferredSkills: ["Flow Designer", "ITOM", "REST integrations"],
      postedDate: "2026-05-20",
      applicantsCount: 5,
      status: "Active",
      hiringManager: "Devon Reynolds (Director of Cloud Systems)"
    }
  ];

  for (const jobObj of seedJobs) {
    await JobPosting.create({
      id: jobObj.id,
      title: jobObj.title,
      domain: jobObj.domain,
      department: jobObj.department,
      level: jobObj.level,
      location: jobObj.location,
      salaryRange: jobObj.salaryRange,
      description: jobObj.description,
      requiredSkills: jobObj.requiredSkills,
      preferredSkills: jobObj.preferredSkills,
      postedDate: jobObj.postedDate,
      applicantsCount: jobObj.applicantsCount,
      status: jobObj.status,
      hiringManager: jobObj.hiringManager,
    });
  }

  // Seed domain workforce analytics to JSON database
  const analyticsDataMap = {
    aiml: {
      overviewMetrics: {
        totalEmployees: 450,
        activeInternalJobs: 12,
        internalTransitionsThisYear: 38,
        skillGapsIdentified: 142,
        aiMatchingAccuracy: "96.4%",
        employeeEngagementScore: "8.9/10",
        averageMobilityCycleDays: 35
      },
      departmentInsights: [
        { name: "Sourcing & Prep", headcount: 120, mobilityRate: "28.3%", targetRate: "30%", coreGaps: ["CUDA Core Allocation", "PyTorch Scaling"] },
        { name: "Model Tuning", headcount: 150, mobilityRate: "24.5%", targetRate: "25%", coreGaps: ["Prompt-Alignment Tuning", "Model Alignment Parameters"] },
        { name: "MLOps Deployments", headcount: 180, mobilityRate: "21.6%", targetRate: "22%", coreGaps: ["Kubernetes", "TensorFlow", "MLOps"] }
      ],
      internalMobilityTrends: [
        { month: "Jan", engineering: 8, product: 2, operations: 1, others: 3 },
        { month: "Feb", engineering: 11, product: 4, operations: 2, others: 2 },
        { month: "Mar", engineering: 14, product: 3, operations: 2, others: 4 },
        { month: "Apr", engineering: 19, product: 6, operations: 3, others: 5 },
        { month: "May", engineering: 24, product: 8, operations: 5, others: 7 }
      ],
      skillDemands: [
        { skill: "Prompt-Alignment Tuning", count: 48, demandTrend: "Critical" },
        { skill: "TensorFlow / PyTorch", count: 39, demandTrend: "Upward" },
        { skill: "CUDA Core Allocation", count: 32, demandTrend: "Critical" }
      ],
      recentTransitions: [
        { name: "Marcus Thorne", oldRole: "Data Analyst", newRole: "ML Engineer", date: "2026-05-14", status: "Completed" },
        { name: "Lina Patel", oldRole: "Full Stack Developer", newRole: "AI Engineer", date: "2026-05-18", status: "Transitioning" }
      ]
    },
    fullstack: {
      overviewMetrics: {
        totalEmployees: 940,
        activeInternalJobs: 15,
        internalTransitionsThisYear: 84,
        skillGapsIdentified: 312,
        aiMatchingAccuracy: "94.8%",
        employeeEngagementScore: "8.5/10",
        averageMobilityCycleDays: 45
      },
      departmentInsights: [
        { name: "UI Architecture", headcount: 310, mobilityRate: "18.2%", targetRate: "20%", coreGaps: ["React", "TypeScript", "Tailwind CSS"] },
        { name: "Microservices", headcount: 380, mobilityRate: "15.4%", targetRate: "18%", coreGaps: ["FastAPI", "MongoDB", "Node.js"] },
        { name: "Release/Docker Eng", headcount: 250, mobilityRate: "19.8%", targetRate: "20%", coreGaps: ["Docker", "Kubernetes", "AWS Infrastructure"] }
      ],
      internalMobilityTrends: [
        { month: "Jan", engineering: 15, product: 5, operations: 3, others: 4 },
        { month: "Feb", engineering: 18, product: 7, operations: 2, others: 6 },
        { month: "Mar", engineering: 22, product: 9, operations: 4, others: 8 },
        { month: "Apr", engineering: 26, product: 11, operations: 5, others: 9 },
        { month: "May", engineering: 32, product: 14, operations: 8, others: 12 }
      ],
      skillDemands: [
        { skill: "FastAPI / Node.JS API Scaling", count: 86, demandTrend: "Upward" },
        { skill: "AWS Infrastructure / Terraform", count: 74, demandTrend: "Critical" },
        { skill: "MongoDB & Scaled Datastores", count: 42, demandTrend: "Stable" }
      ],
      recentTransitions: [
        { name: "Kenji Sato", oldRole: "Backend Developer", newRole: "Platform Engineer", date: "2026-05-22", status: "Completed" },
        { name: "Rachel Diaz", oldRole: "Systems Analyst", newRole: "Full Stack Engineer", date: "2026-05-20", status: "Approved" }
      ]
    },
    data: {
      overviewMetrics: {
        totalEmployees: 410,
        activeInternalJobs: 8,
        internalTransitionsThisYear: 28,
        skillGapsIdentified: 110,
        aiMatchingAccuracy: "93.1%",
        employeeEngagementScore: "8.3/10",
        averageMobilityCycleDays: 40
      },
      departmentInsights: [
        { name: "Data Warehousing", headcount: 140, mobilityRate: "16.4%", targetRate: "18%", coreGaps: ["Snowflake", "Data Lake Modeling"] },
        { name: "BI Reporting", headcount: 150, mobilityRate: "12.8%", targetRate: "15%", coreGaps: ["Power BI", "Tableau", "Excel"] },
        { name: "Quantitative Analytics", headcount: 120, mobilityRate: "17.1%", targetRate: "18%", coreGaps: ["SQL", "Python", "pandas"] }
      ],
      internalMobilityTrends: [
        { month: "Jan", engineering: 5, product: 1, operations: 1, others: 2 },
        { month: "Feb", engineering: 8, product: 3, operations: 1, others: 3 },
        { month: "Mar", engineering: 10, product: 4, operations: 2, others: 2 },
        { month: "Apr", engineering: 14, product: 5, operations: 2, others: 4 },
        { month: "May", engineering: 18, product: 7, operations: 3, others: 6 }
      ],
      skillDemands: [
        { skill: "Snowflake Cloud Queries", count: 33, demandTrend: "Upward" },
        { skill: "Python Analytics (pandas)", count: 28, demandTrend: "Stable" },
        { skill: "Tableau Executive Layouts", count: 24, demandTrend: "Upward" }
      ],
      recentTransitions: [
        { name: "Alex Chen", oldRole: "Business Analyst", newRole: "Data Analyst", date: "2026-05-15", status: "Completed" }
      ]
    },
    salesforce: {
      overviewMetrics: {
        totalEmployees: 290,
        activeInternalJobs: 5,
        internalTransitionsThisYear: 16,
        skillGapsIdentified: 84,
        aiMatchingAccuracy: "92.4%",
        employeeEngagementScore: "8.1/10",
        averageMobilityCycleDays: 48
      },
      departmentInsights: [
        { name: "LWC UI Elements", headcount: 95, mobilityRate: "13.2%", targetRate: "15%", coreGaps: ["Lightning", "JavaScript"] },
        { name: "Apex Integrations", headcount: 110, mobilityRate: "11.6%", targetRate: "14%", coreGaps: ["Apex", "SOQL", "Enterprise Decoupling Patterns"] },
        { name: "Salesforce Admin/Flows", headcount: 85, mobilityRate: "14.1%", targetRate: "16%", coreGaps: ["Salesforce Flow", "OmniStudio", "CRM"] }
      ],
      internalMobilityTrends: [
        { month: "Jan", engineering: 3, product: 1, operations: 0, others: 1 },
        { month: "Feb", engineering: 4, product: 1, operations: 0, others: 2 },
        { month: "Mar", engineering: 6, product: 2, operations: 1, others: 1 },
        { month: "Apr", engineering: 8, product: 3, operations: 1, others: 3 },
        { month: "May", engineering: 11, product: 5, operations: 2, others: 4 }
      ],
      skillDemands: [
        { skill: "Lightning Web Components", count: 22, demandTrend: "Upward" },
        { skill: "Apex Web Integrations", count: 18, demandTrend: "Critical" },
        { skill: "Salesforce Flow automations", count: 15, demandTrend: "Critical" }
      ],
      recentTransitions: [
        { name: "Dave Simmons", oldRole: "Salesforce Developer", newRole: "CRM Architect", date: "2026-05-19", status: "Completed" }
      ]
    },
    servicenow: {
      overviewMetrics: {
        totalEmployees: 210,
        activeInternalJobs: 4,
        internalTransitionsThisYear: 12,
        skillGapsIdentified: 65,
        aiMatchingAccuracy: "91.8%",
        employeeEngagementScore: "8.2/10",
        averageMobilityCycleDays: 50
      },
      departmentInsights: [
        { name: "ITSM Service Portal", headcount: 75, mobilityRate: "11.4%", targetRate: "13%", coreGaps: ["ITSM", "Service Portal", "JavaScript"] },
        { name: "ITOM Configuration", headcount: 80, mobilityRate: "12.8%", targetRate: "15%", coreGaps: ["CMDB", "ITOM", "Discovery Agents"] },
        { name: "Workflow Cloud Devs", headcount: 55, mobilityRate: "10.6%", targetRate: "12%", coreGaps: ["Workflow Automation", "Flow Designer", "REST integrations"] }
      ],
      internalMobilityTrends: [
        { month: "Jan", engineering: 2, product: 0, operations: 0, others: 1 },
        { month: "Feb", engineering: 3, product: 1, operations: 0, others: 1 },
        { month: "Mar", engineering: 5, product: 1, operations: 1, others: 2 },
        { month: "Apr", engineering: 7, product: 3, operations: 1, others: 2 },
        { month: "May", engineering: 9, product: 4, operations: 2, others: 3 }
      ],
      skillDemands: [
        { skill: "CMDB Automated Discovery", count: 19, demandTrend: "Critical" },
        { skill: "ITSM Flow Designer Services", count: 16, demandTrend: "Upward" },
        { skill: "REST IntegrationHub Custom Spokes", count: 11, demandTrend: "Stable" }
      ],
      recentTransitions: [
        { name: "Julia Roberts", oldRole: "ServiceNow Admin", newRole: "Workflow Automation Engineer", date: "2026-05-18", status: "Completed" }
      ]
    }
  };

  for (const [dom, obj] of Object.entries(analyticsDataMap)) {
    await Analytics.create({
      domain: dom,
      totalEmployees: obj.overviewMetrics.totalEmployees,
      activeInternalJobs: obj.overviewMetrics.activeInternalJobs,
      internalTransitionsThisYear: obj.overviewMetrics.internalTransitionsThisYear,
      skillGapsIdentified: obj.overviewMetrics.skillGapsIdentified,
      aiMatchingAccuracy: obj.overviewMetrics.aiMatchingAccuracy,
      employeeEngagementScore: obj.overviewMetrics.employeeEngagementScore,
      averageMobilityCycleDays: obj.overviewMetrics.averageMobilityCycleDays,
      departmentInsights: obj.departmentInsights,
      internalMobilityTrends: obj.internalMobilityTrends,
      skillDemands: obj.skillDemands,
      recentTransitions: obj.recentTransitions,
    });
  }

  console.log("Database parameters seeding completed successfully.");
}
