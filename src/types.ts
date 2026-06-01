/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserSeeker {
  id: string;
  phone: string;
  name: string;
  location: string;
  informalExperience: string;
  structuredSkills: string[];
  preferredLanguage: string;
  enrolledCourses: string[];
  registrationSource: "web" | "ussd" | "sms";
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  employerName: string;
  description: string;
  keySkillsRequired: string[];
  location: string;
  salaryRange: string;
  status: "verified" | "active" | "suspect";
  fraudScore: number;
  fraudExplanation: string;
  durationText: string;
  source: string;
  createdAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  seekerId: string;
  seekerPhone: string;
  seekerName: string;
  status: "pending" | "shortlisted" | "reviewed" | "rejected";
  appliedAt: string;
  matchScore: number;
  matchExplanation: string;
  source: "web" | "sms" | "ussd";
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  duration: string;
  location: string;
  description: string;
  skillsTaught: string[];
}

export interface SmsLog {
  id: string;
  phoneNumber: string;
  text: string;
  direction: "inbound" | "outbound";
  timestamp: string;
  resolvedAction: string;
  agentTriggered: string;
}

export interface UssdSession {
  sessionId: string;
  phoneNumber: string;
  menuHistory: string[];
  currentMenu: string;
  tempInputs: {
    name?: string;
    location?: string;
    experience?: string;
  };
}

export interface SystemMetrics {
  totalSeekers: number;
  totalJobs: number;
  totalApplications: number;
  totalCourses: number;
  skillsExtracted: number;
  fraudScansPerformed: number;
  fraudPrevented: number;
  smsProcessed: number;
  ussdSessions: number;
}
