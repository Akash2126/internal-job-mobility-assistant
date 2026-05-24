export interface EmployeeProfile {
  name: string;
  title: string;
  department: string;
  level: string;
  hireDate: string;
  avatar: string;
  bio: string;
  skills: string[];
  certifications: string[];
  interests: string[];
  preferences: {
    workStyle: string;
    relocation: boolean;
    priorityAreas: string[];
  };
}

export interface InternalJob {
  id: string;
  title: string;
  domain: string;
  department: string;
  level: string;
  location: string;
  salaryRange: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  postedDate: string;
  applicantsCount: number;
  status: string;
  hiringManager: string;
}

export interface CareerMessage {
  id: string;
  sender: "Aura" | "User" | "System";
  text: string;
  timestamp: string;
}

export interface MatchAnalysis {
  matchScore: number;
  matchingSkills: string[];
  gaps: string[];
  personalizedRoadmap: {
    weekLabel: string;
    weeklyAction: string;
  }[];
  careerCoachAdvice: string;
}

export interface HRAnalytics {
  overviewMetrics: {
    totalEmployees: number;
    activeInternalJobs: number;
    internalTransitionsThisYear: number;
    skillGapsIdentified: number;
    aiMatchingAccuracy: string;
    employeeEngagementScore: string;
    averageMobilityCycleDays: number;
  };
  departmentInsights: {
    name: string;
    headcount: number;
    mobilityRate: string;
    targetRate: string;
    coreGaps: string[];
  }[];
  internalMobilityTrends: {
    month: string;
    engineering: number;
    product: number;
    operations: number;
    others: number;
  }[];
  skillDemands: {
    skill: string;
    count: number;
    demandTrend: string;
  }[];
  recentTransitions: {
    name: string;
    oldRole: string;
    newRole: string;
    date: string;
    status: string;
  }[];
}
