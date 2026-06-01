/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { 
  UserSeeker, 
  Job, 
  Application, 
  Course, 
  SmsLog, 
  UssdSession, 
  SystemMetrics 
} from "./src/types";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini Client
let ai: any = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("RuralConnect AI initialized successfully with active Gemini API key!");
  } else {
    console.log("No custom GEMINI_API_KEY set. Operating RuralConnect in Intelligent Simulation Mode.");
  }
} catch (error) {
  console.warn("Could not load GoogleGenAI SDK on startup. Falling back to active simulation mode.", error);
}

// Global In-Memory Relational Database (representing PostgreSQL design)
let seekers: UserSeeker[] = [
  {
    id: "SKR-01",
    phone: "+254711223344",
    name: "John Mwangi",
    location: "Machakos",
    informalExperience: "I fix motorbikes, patch tyres, and help farm coffee sometimes.",
    structuredSkills: ["Motorcycle Mechanic", "Tyre Puncture Repair", "Agricultural Harvesting", "Field Operations"],
    preferredLanguage: "Kiswahili",
    enrolledCourses: ["CRS-101"],
    registrationSource: "ussd",
    createdAt: new Date().toISOString()
  },
  {
    id: "SKR-02",
    phone: "+254722556677",
    name: "Halima Daud",
    location: "Kitui",
    informalExperience: "I design tailoring clothes, stitch dresses, and manage shop bookkeeping.",
    structuredSkills: ["Garment Construction", "Tailoring & Pattern-making", "Retail Bookkeeping", "Customer Service"],
    preferredLanguage: "English",
    enrolledCourses: [],
    registrationSource: "sms",
    createdAt: new Date().toISOString()
  }
];

let jobs: Job[] = [
  {
    id: "JOB-101",
    title: "Tractor & Pump Repair Hand",
    employerName: "Machakos Agro-Services Ltd",
    description: "Looking for an energetic repair assistant to work with tractor motors, irrigation water pumps, and local farming accessories. Will train in welding.",
    keySkillsRequired: ["Mechanical Maintenance", "Pump Maintenance", "Equipment Assembly"],
    location: "Machakos",
    salaryRange: "KES 18,000 - 24,000 / month",
    status: "verified",
    fraudScore: 8,
    fraudExplanation: "Legitimate local agribusiness employer with physical premises and consistent hiring history.",
    durationText: "Full-Time (Immediate start)",
    source: "Employer Portal",
    createdAt: new Date().toISOString()
  },
  {
    id: "JOB-102",
    title: "Coffee Berry Harvester",
    employerName: "Kambu Estate Farms",
    description: "Urgently hiring crop pluckers and berry sorters. Seasonal position during our high harvest cycle. Transport provided from local market centers.",
    keySkillsRequired: ["Agricultural Harvesting", "Crop Sorting", "Field Operations"],
    location: "Machakos",
    salaryRange: "KES 550 / day (Bonus on pick targets)",
    status: "verified",
    fraudScore: 12,
    fraudExplanation: "Standard local crop picker wage, verifiable seasonal agricultural employer in Kitui/Machakos corridor.",
    durationText: "Seasonal (3 months)",
    source: "Employer Portal",
    createdAt: new Date().toISOString()
  },
  {
    id: "JOB-103",
    title: "Apparel Stitcher & Tailor",
    employerName: "Mumbuni Cooperative Garments",
    description: "Requires operational knowledge of pedal and electronic sewing machines, seam finishing, and garment packaging. Low-literacy applicants welcome.",
    keySkillsRequired: ["Tailoring & Pattern-making", "Sewing Machine Operation", "Garment Construction"],
    location: "Kitui",
    salaryRange: "KES 15000 / month",
    status: "verified",
    fraudScore: 5,
    fraudExplanation: "Well-established local womens clothing cooperative. Community verified.",
    durationText: "Full-Time",
    source: "NGO Aggregator",
    createdAt: new Date().toISOString()
  },
  {
    id: "JOB-104",
    title: "[URGENT] M-Pesa Agent Coordinator - KES 4,500/day guaranteed!",
    employerName: "M-Pesa Express Wealth Admin",
    description: "Earn high commissions by managing remote payment networks. BEFORE starting, you MUST pay KES 1,800 processing and agent activation fee via till number. Direct hire.",
    keySkillsRequired: ["Smart Phone User"],
    location: "Machakos",
    salaryRange: "KES 4,500 / day",
    status: "suspect",
    fraudScore: 96,
    fraudExplanation: "Demands upfront payment for activation and registration fees. Guarantees unrealistic returns. Grammatical mistakes and suspicious publisher name.",
    durationText: "Instant Profit",
    source: "Open Aggregator",
    createdAt: new Date().toISOString()
  },
  {
    id: "JOB-105",
    title: "Retail Shop Keeper & Helper",
    employerName: "Kathiani Village Groceries",
    description: "Help count inventory, unpack stock, welcome rural shoppers, and manage daily cash logging. Basic write/read required.",
    keySkillsRequired: ["Customer Service", "Retail Bookkeeping", "Inventory Counting"],
    location: "Machakos",
    salaryRange: "KES 12,000 / month",
    status: "verified",
    fraudScore: 10,
    fraudExplanation: "Legitimate village grocery shop owned by local ward representative.",
    durationText: "Full-Time",
    source: "SMS Submission",
    createdAt: new Date().toISOString()
  }
];

let applications: Application[] = [
  {
    id: "APP-401",
    jobId: "JOB-102",
    jobTitle: "Coffee Berry Harvester",
    seekerId: "SKR-01",
    seekerPhone: "+254711223344",
    seekerName: "John Mwangi",
    status: "shortlisted",
    appliedAt: new Date().toISOString(),
    matchScore: 95,
    matchExplanation: "Highly qualified candidate with prior direct coffee farm experience and agricultural operations familiarity.",
    source: "ussd"
  }
];

let courses: Course[] = [
  {
    id: "CRS-101",
    title: "Solar Water Pump Installation & Repair",
    provider: "Practical Action Africa NGOs",
    duration: "4 weeks (Saturdays)",
    location: "Kitui Core Center",
    description: "Practical solar technology training for pump installation, circuit maintenance, and pipeline integration for rural farms.",
    skillsTaught: ["Solar Pump Systems", "Electrical Wiring", "Irrigation Systems Maintenance", "Mechanical Maintenance"]
  },
  {
    id: "CRS-102",
    title: "Village Banking & Smart Agribusiness Ledger",
    provider: "Equity Bank Foundation",
    duration: "2 days workshop",
    location: "Machakos Town Library",
    description: "Learn simplified bookkeeping record keeping, basic cost pricing, and mobile transactions logs to grow informal shops.",
    skillsTaught: ["Retail Bookkeeping", "Cash Management", "Agribusiness Marketing"]
  },
  {
    id: "CRS-103",
    title: "Basics of Welding and Gate Construction",
    provider: "Machakos Jua Kali Association",
    duration: "6 weeks (Apprenticeship)",
    location: "Machakos Industrial Artisans Shed",
    description: "Hands-on safety, standard arc-welding, pipe welding, and architectural gate layout design for workshops.",
    skillsTaught: ["Welding", "Metal Fabrication", "Workshop Safety", "Tyre Puncture Repair"]
  }
];

let smsLogs: SmsLog[] = [
  {
    id: "MSG501",
    phoneNumber: "+254711223344",
    text: "REGISTER John Mwangi # Machakos # Fix motorbikes and pick coffee",
    direction: "inbound",
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    resolvedAction: "Seeker registered",
    agentTriggered: "Agent-1 (Skills Extraction)"
  },
  {
    id: "MSG502",
    phoneNumber: "+254711223344",
    text: "RuralConnect: Successful registration! Skills identified: Motorbike mechanic, Agricultural harvesting. Text JOBS to search matches.",
    direction: "outbound",
    timestamp: new Date(Date.now() - 3600000 * 3 + 10000).toISOString(),
    resolvedAction: "SMS Confirmed",
    agentTriggered: "Agent-5 (Communication Agent)"
  }
];

// Active USSD Session Store
let ussdSessions: Record<string, UssdSession> = {};

// Helper for calling server-side Gemini Multi-Agent Flow
// Fallback returns intelligent generated data if Gemini is unavailable
const runAgentSkillsExtractor = async (rawInput: string): Promise<string[]> => {
  if (ai) {
    try {
      const prompt = `Analyze this informal description of a job seeker's raw workspace skills or informal experience: "${rawInput}".
Extract 2 to 5 standard, concise professional skills. Return standard, professional terms suitable for matchmaking.
Your response MUST be a valid JSON array of strings only. Examples: ["Pump Repair", "Coffee Harvesting", "Retail Bookkeeping"]. Do not include extra commentary.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Extracted skills as clean string keywords"
          }
        }
      });
      if (response && response.text) {
        const skills = JSON.parse(response.text);
        if (Array.isArray(skills)) return skills;
      }
    } catch (e) {
      console.error("Gemini Skills Extraction failed. Using backup parser.", e);
    }
  }

  // Purely deterministic offline keywords fallback
  const normalized = rawInput.toLowerCase();
  const found: string[] = [];
  if (normalized.includes("tractor") || normalized.includes("car") || normalized.includes("engine") || normalized.includes("fix")) {
    found.push("Mechanical Maintenance", "Equipment Assembly");
  }
  if (normalized.includes("farm") || normalized.includes("coffee") || normalized.includes("crop") || normalized.includes("pick") || normalized.includes("harv")) {
    found.push("Agricultural Harvesting", "Field Operations");
  }
  if (normalized.includes("stitch") || normalized.includes("tailor") || normalized.includes("cloth") || normalized.includes("sew")) {
    found.push("Tailoring & Pattern-making", "Sewing Machine Operation");
  }
  if (normalized.includes("shop") || normalized.includes("book") || normalized.includes("cash") || normalized.includes("count")) {
    found.push("Retail Bookkeeping", "Customer Service", "Inventory Counting");
  }
  if (normalized.includes("weld") || normalized.includes("metal") || normalized.includes("iron")) {
    found.push("Welding", "Metal Fabrication");
  }
  if (normalized.includes("pump") || normalized.includes("pipe") || normalized.includes("well") || normalized.includes("water")) {
    found.push("Pump Maintenance", "Irrigation Systems Maintenance");
  }
  if (found.length === 0) {
    found.push("General Labor", "Operational Support");
  }
  return found;
};

const runAgentJobMatcher = async (seeker: UserSeeker, job: Job): Promise<{ score: number; explanation: string }> => {
  if (ai) {
    try {
      const prompt = `Calculate the fit between:
Candidate name: ${seeker.name}
Candidate skills: ${seeker.structuredSkills.join(", ")}
Candidate informal background description: "${seeker.informalExperience}"

And post job opportunity:
Job Title: ${job.title}
Employer: ${job.employerName}
Required skills: ${job.keySkillsRequired.join(", ")}
Job description: "${job.description}"

Calculate a matching compatibility percentage score between 0 and 100. Write a 1-to-2 sentence encouraging, easy-to-understand explanation for why they fit, avoiding complex business jargon.
Return a JSON object conforming strictly to this format:
{
  "score": 85,
  "explanation": "Your motor bike mechanic details are a perfect match for Tractor Repair!"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER, description: "Match score between 0 and 100" },
              explanation: { type: Type.STRING, description: "Low-literacy and comforting match reasons" }
            },
            required: ["score", "explanation"]
          }
        }
      });
      if (response && response.text) {
        return JSON.parse(response.text);
      }
    } catch (e) {
      console.error("Gemini Seeker-Job Matcher failed. Using fallback matcher.", e);
    }
  }

  // Backup simple calculation rules
  const candidateSkillsMap = new Set(seeker.structuredSkills.map(s => s.toLowerCase()));
  const totalRequired = job.keySkillsRequired.length;
  let matchingCount = 0;
  job.keySkillsRequired.forEach(reqSkill => {
    if (candidateSkillsMap.has(reqSkill.toLowerCase())) {
      matchingCount++;
    }
  });

  const baseScore = totalRequired > 0 ? Math.round((matchingCount / totalRequired) * 100) : 50;
  const locationFactor = seeker.location.toLowerCase() === job.location.toLowerCase() ? 1.1 : 0.8;
  const score = Math.min(100, Math.max(10, Math.round(baseScore * locationFactor)));
  let explanation = `Match score of ${score}% calculated. Good local proximity in ${job.location}.`;
  if (score > 75) {
    explanation = `Outstanding! Your work experience matching closely with the required skills. We encourage you to apply immediately.`;
  } else if (score > 40) {
    explanation = `A good match based on your agricultural background in the rural region. Work is close to your location.`;
  }

  return { score, explanation };
};

const runAgentCareerCoach = async (seeker: UserSeeker): Promise<{ careerPath: string; courseAdvices: string[]; marketDemand: string }> => {
  if (ai) {
    try {
      const prompt = `Give a low-qualification career advice report for rural seeker:
Name: ${seeker.name}
Current informal skills: ${seeker.structuredSkills.join(", ")}
Location: ${seeker.location}

Identify:
1) A simplified progressive career growth path.
2) Useful training recommendations.
3) Local economic market trend insights.

Return a JSON object:
{
  "careerPath": "Grow from casual motorcycle repairs into general solar energy irrigation technician standard.",
  "courseAdvices": ["Solar Pump Technology Center Course", "High Voltage Safety basics"],
  "marketDemand": "High agricultural solar panel implementation trend in dry eastern regions."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              careerPath: { type: Type.STRING },
              courseAdvices: { type: Type.ARRAY, items: { type: Type.STRING } },
              marketDemand: { type: Type.STRING }
            },
            required: ["careerPath", "courseAdvices", "marketDemand"]
          }
        }
      });
      if (response && response.text) {
        return JSON.parse(response.text);
      }
    } catch (e) {
      console.error("Gemini Career Guidance Agent failed.", e);
    }
  }

  // Rules-based fallback advice
  const advices: string[] = [];
  let pathText = "Grow your informal service into commercial mobile contracting work.";
  let demand = "Strong local village hiring trend for micro-enterprise operations.";
  if (seeker.structuredSkills.includes("Motorcycle Mechanic") || seeker.structuredSkills.includes("Tyre Puncture Repair")) {
    advices.push("CRS-103: Basics of Welding", "CRS-101: Solar Water Pump Systems");
    pathText = "Advance from bicycle mechanic to solar water pump maintenance contractor.";
    demand = "Farms are shifting to automated drip lines and pumps requiring mechanical help.";
  } else {
    advices.push("CRS-102: Smart Agribusiness Ledger");
    pathText = "Develop skills toward retail shop supervisor or inventory lead assistant.";
  }
  return {
    careerPath: pathText,
    courseAdvices: advices,
    marketDemand: demand
  };
};

const runAgentFraudScanner = async (title: string, employer: string, desc: string, paySec: string): Promise<{ score: number; text: string; cleanStatus: "verified" | "suspect" }> => {
  if (ai) {
    try {
      const prompt = `Role: Fraud Analytics Auditor. Read this job post:
Title: "${title}"
EmployerName: "${employer}"
Description: "${desc}"
SalaryDetails: "${paySec}"

Analyze the posting for structural red-flags. For example, charging applicants fee money, promising guaranteed fast wealth for no skills, fishy employer names, duplicate postings or contact numbers looking funny.
Provide:
1) A scam liability score (0=Very Safe to 100=Obvious Scam/Fraud).
2) Clear explanations detailing points scanned.
3) Decision: mark 'verified' if score < 40, else mark it 'suspect' so admins can review it.

Return a JSON object conforming strictly to this format:
{
  "score": 95,
  "explanation": "Demands high upfront deposit via mobile pay. Unverified employer name.",
  "status": "suspect"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              status: { type: Type.STRING, enum: ["verified", "suspect"] }
            },
            required: ["score", "explanation", "status"]
          }
        }
      });
      if (response && response.text) {
        const payload = JSON.parse(response.text);
        return {
          score: payload.score,
          text: payload.explanation,
          cleanStatus: payload.status
        };
      }
    } catch (e) {
      console.error("Gemini Fraud Scanner failed. Running local fallback metrics.", e);
    }
  }

  // Backup simple checks
  const fulltext = `${title} ${employer} ${desc} ${paySec}`.toLowerCase();
  let score = 5;
  let text = "Valid local listing. Salary in line with standards. No upfront requests identified.";
  if (fulltext.includes("fee") || fulltext.includes("pay first") || fulltext.includes("deposit") || fulltext.includes("activation") || fulltext.includes("till number")) {
    score = 90;
    text = "FLAGGED: Post mentions upfront payments or fee deposits. Likely payment scam.";
  } else if (fulltext.includes("guarantee") && (fulltext.includes("rich") || fulltext.includes("get wealthy") || fulltext.includes("no experience"))) {
    score = 75;
    text = "WARNING: Contains hyper-inflated claims, wealth-traps or too-good-to-be-true guarantees.";
  }
  return {
    score,
    text,
    cleanStatus: score >= 40 ? "suspect" : "verified"
  };
};

const runAgentCommunicationSimplifier = async (message: string): Promise<string> => {
  if (ai) {
    try {
      const prompt = `Translate this notification message into extremely simple, encouraging, short, and low-literacy English/Kiswahili for an SMS (maximum 140 characters).
Keep it conversational, warm, and highly functional.
Message: "${message}"`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });
      if (response && response.text) {
        return response.text.trim();
      }
    } catch (e) {
      console.error("Communication simplifying agent failure.", e);
    }
  }
  // fallback simply truncates or returns standard short
  return message.length > 140 ? message.substring(0, 137) + "..." : message;
};


// -----------------------------------------------------
// REST API SYSTEM ROUTES
// -----------------------------------------------------

// System Metrics Analytics
app.get("/api/metrics", (req: Request, res: Response) => {
  const smsCount = smsLogs.length;
  const ussdCount = Object.keys(ussdSessions).length + 3; // simulated sessions
  const skillsExtractedSum = seekers.reduce((acc, current) => acc + current.structuredSkills.length, 0);
  const totalFraudPostings = jobs.filter(j => j.status === "suspect").length;

  const data: SystemMetrics = {
    totalSeekers: seekers.length,
    totalJobs: jobs.length,
    totalApplications: applications.length,
    totalCourses: courses.length,
    skillsExtracted: skillsExtractedSum,
    fraudScansPerformed: jobs.length,
    fraudPrevented: totalFraudPostings,
    smsProcessed: smsCount,
    ussdSessions: ussdCount
  };
  res.json(data);
});

// GET Seekers
app.get("/api/seekers", (req: Request, res: Response) => {
  res.json(seekers);
});

// SEED Seeker Registration via Web
app.post("/api/seekers", async (req: Request, res: Response) => {
  const { name, phone, location, informalExperience, preferredLanguage } = req.body;
  if (!name || !phone || !location) {
    return res.status(400).json({ error: "Missing required details: name, phone, location." });
  }

  // Run Agent 1: Skills Extraction
  const extracted = await runAgentSkillsExtractor(informalExperience || "");

  const newSeeker: UserSeeker = {
    id: `SKR-${Math.floor(100 + Math.random() * 900)}`,
    phone: phone.startsWith("+") ? phone : `+254${phone.replace(/^0/, '')}`,
    name,
    location,
    informalExperience: informalExperience || "General work seeker",
    structuredSkills: extracted,
    preferredLanguage: preferredLanguage || "English",
    enrolledCourses: [],
    registrationSource: "web",
    createdAt: new Date().toISOString()
  };

  seekers.push(newSeeker);

  // Send register SMS simulation
  const welcomeText = `RuralConnect: Karibu ${name}! Registered at ${location}. Parsed skills: ${extracted.join(", ")}. Text JOBS to search matches.`;
  const simplifiedSms = await runAgentCommunicationSimplifier(welcomeText);

  smsLogs.unshift({
    id: `MSG-${Math.floor(1000 + Math.random() * 90002)}`,
    phoneNumber: newSeeker.phone,
    text: simplifiedSms,
    direction: "outbound",
    timestamp: new Date().toISOString(),
    resolvedAction: "Web Seeker welcome sms sent",
    agentTriggered: "Agent-5 (Communication Agent)"
  });

  res.status(201).json(newSeeker);
});

// GET Jobs
app.get("/api/jobs", (req: Request, res: Response) => {
  res.json(jobs);
});

// CREATE Job & Audit Fraud via Agent 4
app.post("/api/jobs", async (req: Request, res: Response) => {
  const { title, employerName, description, keySkills, location, salaryRange, duration } = req.body;
  if (!title || !employerName || !description) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  // Split key skills parsed from comma separation
  const parsedSkills = Array.isArray(keySkills) 
    ? keySkills 
    : keySkills.split(",").map((s: string) => s.trim()).filter((s: string) => s.length > 0);

  // Run Agent 4: Fraud Detection
  const scamReview = await runAgentFraudScanner(title, employerName, description, salaryRange || "");

  const newJob: Job = {
    id: `JOB-${Math.floor(200 + Math.random() * 799)}`,
    title,
    employerName,
    description,
    keySkillsRequired: parsedSkills.length > 0 ? parsedSkills : ["Standard Labor"],
    location: location || "Rural Area",
    salaryRange: salaryRange || "Negotiable / Piecework",
    status: scamReview.cleanStatus,
    fraudScore: scamReview.score,
    fraudExplanation: scamReview.text,
    durationText: duration || "Contract/Fulltime",
    source: "Employer Portal",
    createdAt: new Date().toISOString()
  };

  jobs.unshift(newJob);
  res.status(201).json(newJob);
});

// GET Courses
app.get("/api/courses", (req: Request, res: Response) => {
  res.json(courses);
});

app.post("/api/courses", (req: Request, res: Response) => {
  const { title, provider, duration, location, description, skillsTaught } = req.body;
  const taught = Array.isArray(skillsTaught) ? skillsTaught : `${skillsTaught}`.split(",").map(t => t.trim());
  const newCourse: Course = {
    id: `CRS-${Math.floor(300 + Math.random() * 699)}`,
    title,
    provider,
    duration,
    location,
    description,
    skillsTaught: taught
  };
  courses.push(newCourse);
  res.status(201).json(newCourse);
});

// GET Applications
app.get("/api/applications", (req: Request, res: Response) => {
  res.json(applications);
});

// Submit Application
app.post("/api/applications", async (req: Request, res: Response) => {
  const { seekerId, jobId, source } = req.body;
  const seeker = seekers.find(s => s.id === seekerId);
  const job = jobs.find(j => j.id === jobId);

  if (!seeker || !job) {
    return res.status(404).json({ error: "Seeker or Job record not identified." });
  }

  // Run Agent 2: Job Match Calculation
  const matchingData = await runAgentJobMatcher(seeker, job);

  const newApp: Application = {
    id: `APP-${Math.floor(100 + Math.random() * 899)}`,
    jobId,
    jobTitle: job.title,
    seekerId,
    seekerPhone: seeker.phone,
    seekerName: seeker.name,
    status: "pending",
    appliedAt: new Date().toISOString(),
    matchScore: matchingData.score,
    matchExplanation: matchingData.explanation,
    source: source || "web"
  };

  applications.push(newApp);

  // Send Application Process confirm SMS simulation via Agent 5
  const alertStr = `Job applied! ${job.title} at ${job.employerName}. Match score: ${matchingData.score}%. Reason: ${matchingData.explanation}`;
  const miniAlert = await runAgentCommunicationSimplifier(alertStr);

  smsLogs.unshift({
    id: `MSG-${Math.floor(1000 + Math.random() * 9000)}`,
    phoneNumber: seeker.phone,
    text: miniAlert,
    direction: "outbound",
    timestamp: new Date().toISOString(),
    resolvedAction: "SMS receipt confirmation",
    agentTriggered: "Agent-5 (Communication Agent)"
  });

  res.status(201).json(newApp);
});

// GET SMS Logs
app.get("/api/sms-logs", (req: Request, res: Response) => {
  res.json(smsLogs);
});

// Clear Logs and Reset Database API
app.post("/api/sys/reset", (req: Request, res: Response) => {
  smsLogs = [];
  applications = [applications[0]];
  seekers = [seekers[0], seekers[1]];
  ussdSessions = {};
  res.json({ message: "Relational memory database reset to default pristine state." });
});


// -----------------------------------------------------
// INTUITIVE OFFLINE SMS/USSD SIMULATOR ENGINE
// -----------------------------------------------------

// POST /api/sms/inbound - Simulated SMS Gateway from hardware (e.g. Africa's Talking)
app.post("/api/sms/inbound", async (req: Request, res: Response) => {
  const { phoneNumber, text } = req.body;
  if (!phoneNumber || !text) {
    return res.status(400).json({ error: "Missing phone or core msg body." });
  }

  const phoneFormatted = phoneNumber.startsWith("+") ? phoneNumber : `+254${phoneNumber.replace(/^0/, '')}`;
  const cleanMsg = text.trim();
  const keyword = cleanMsg.split(/\s+/)[0].toUpperCase();

  // Log incoming
  smsLogs.unshift({
    id: `MSG-${Math.floor(1000 + Math.random() * 9000)}`,
    phoneNumber: phoneFormatted,
    text: cleanMsg,
    direction: "inbound",
    timestamp: new Date().toISOString(),
    resolvedAction: "Incoming SMS Received",
    agentTriggered: "None (Hardware Loop)"
  });

  let responseReply = "";
  let seeker = seekers.find(s => s.phone === phoneFormatted);

  if (keyword === "REGISTER") {
    // Expected format: REGISTER Full Name # Location # Experience
    const payload = cleanMsg.substring(8).trim();
    const parts = payload.split("#").map((p: string) => p.trim());
    if (parts.length < 2) {
      responseReply = "Error: Please write: REGISTER Name # Location # Experience description.";
    } else {
      const name = parts[0];
      const loc = parts[1];
      const desc = parts[2] || "farming helper";

      const extractedSkills = await runAgentSkillsExtractor(desc);
      const newS: UserSeeker = {
        id: `SKR-${Math.floor(100 + Math.random() * 900)}`,
        phone: phoneFormatted,
        name,
        location: loc,
        informalExperience: desc,
        structuredSkills: extractedSkills,
        preferredLanguage: "English",
        enrolledCourses: [],
        registrationSource: "sms",
        createdAt: new Date().toISOString()
      };
      seekers.push(newS);
      responseReply = `Registered! Location: ${loc}. Parsed skills: ${extractedSkills.join(", ")}. Text JOBS to search matches rural areas.`;
    }
  } 
  else if (keyword === "JOBS") {
    if (!seeker) {
      responseReply = "You are not registered on RuralConnect yet. SMS 'REGISTER Name # Location # Skills' e.g. 'REGISTER John # Machakos # Tractor mechanic'.";
    } else {
      const localJobs = jobs.filter(j => j.location.toLowerCase() === seeker!.location.toLowerCase() && j.status === "verified");
      if (localJobs.length === 0) {
        responseReply = `No direct jobs found in ${seeker.location} today. Text COURSES to upgrade your skills with free workshops!`;
      } else {
        const matchesTextArray = await Promise.all(
          localJobs.slice(0, 2).map(async (j) => {
            const m = await runAgentJobMatcher(seeker!, j);
            return `${j.title} at ${j.employerName} (${m.score}% Match, Reply APPLY ${j.id})`;
          })
        );
        responseReply = `Jobs in ${seeker.location}:\n` + matchesTextArray.join("\n");
      }
    }
  } 
  else if (keyword === "APPLY") {
    if (!seeker) {
      responseReply = "Please register first by SMSing 'REGISTER Name # Location # Skills'.";
    } else {
      const jobIdTarget = cleanMsg.substring(5).trim().toUpperCase();
      const jobObject = jobs.find(j => j.id === jobIdTarget);
      if (!jobObject) {
         responseReply = `Job ID ${jobIdTarget} not found in listing. Text JOBS to see open listings.`;
      } else {
         const matchData = await runAgentJobMatcher(seeker, jobObject);
         const applicationEntry: Application = {
           id: `APP-${Math.floor(100 + Math.random() * 899)}`,
           jobId: jobObject.id,
           jobTitle: jobObject.title,
           seekerId: seeker.id,
           seekerPhone: seeker.phone,
           seekerName: seeker.name,
           status: "pending",
           appliedAt: new Date().toISOString(),
           matchScore: matchData.score,
           matchExplanation: matchData.explanation,
           source: "sms"
         };
         applications.push(applicationEntry);
         responseReply = `Applied! Job Match Analysis: ${matchData.score}% match for ${jobObject.title}. Code: ${jobObject.id}`;
      }
    }
  } 
  else if (keyword === "COURSES") {
    const list = courses.slice(0, 2).map(c => `${c.title} by ${c.provider} (${c.location})`).join("\n---\n");
    responseReply = `Free Skills Courses:\n` + list;
  }
  else if (keyword === "PROFILE") {
    if (!seeker) {
      responseReply = "You are not registered. Reply REGISTER [Name] # [Loc] # [Exp] to sign up.";
    } else {
      responseReply = `RuralConnect profile: ${seeker.name}, Loc: ${seeker.location}, Skills: ${seeker.structuredSkills.join(", ")}`;
    }
  }
  else {
    // Normal query, run Agent 3 (Career Guidance Agent)
    if (seeker) {
      const coachAdvice = await runAgentCareerCoach(seeker);
      responseReply = `Coach: ${coachAdvice.careerPath} For free skills, text COURSES.`;
    } else {
      responseReply = `Welcome to RuralConnect. Offline skills & jobs marketplace. Keywords: REGISTER, JOBS, COURSES, PROFILE, APPLY [ID]. Try texting HELP.`;
    }
  }

  // Format through simplifier
  const finalReply = await runAgentCommunicationSimplifier(responseReply);

  // Send outbound log
  smsLogs.unshift({
    id: `MSG-${Math.floor(1000 + Math.random() * 9000)}`,
    phoneNumber: phoneFormatted,
    text: finalReply,
    direction: "outbound",
    timestamp: new Date().toISOString(),
    resolvedAction: "SMS outbound auto-reply matching keyword",
    agentTriggered: "Agent-5 (Communication Agent)"
  });

  res.json({ reply: finalReply });
});

// POST /api/ussd - Simulated USSD Interactive Portal (Telephony Integration gateway)
app.post("/api/ussd", async (req: Request, res: Response) => {
  const { phoneNumber, text, sessionId } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: "Missing telephone digits." });
  }

  const phone = phoneNumber.startsWith("+") ? phoneNumber : `+254${phoneNumber.replace(/^0/, '')}`;
  const sessionKey = sessionId || `${phone}-session`;

  // Raw USSD standard splits strings by '*'
  const inputs = text ? `${text}`.split("*") : [];
  const currentStepValue = inputs.length > 0 ? inputs[inputs.length - 1] : "";

  // Check if seeker is already database-tracked
  const seeker = seekers.find(s => s.phone === phone);

  let ussdResponse = "";

  // 1. SEEKER ALREADY REGISTERED USER FLOW
  if (seeker) {
    if (!text || text === "") {
      // Home menu for registered
      ussdResponse = `CON RuralConnect - Habari ${seeker.name}!
1. Find Match Jobs
2. View Applications
3. Free Skills Training
4. View My Profile
5. Exit`;
    } else {
      const mainChoice = inputs[0];

      if (mainChoice === "1") {
        // Find Match Jobs
        const localJobs = jobs.filter(j => j.location.toLowerCase() === seeker.location.toLowerCase() && j.status === "verified");
        if (inputs.length === 1) {
          if (localJobs.length === 0) {
            ussdResponse = `CON No active jobs near ${seeker.location} today.
1. View National Listings
0. Main Menu`;
          } else {
            let list = `CON Jobs near ${seeker.location}:\n`;
            localJobs.slice(0, 3).forEach((jb, index) => {
              list += `${index + 1}. ${jb.title}\n`;
            });
            list += `\nSelect number to apply. 0 to go back`;
            ussdResponse = list;
          }
        } else if (inputs.length === 2) {
          // view or apply to selected job
          const jobIdx = parseInt(inputs[1]) - 1;
          const targetJob = localJobs[jobIdx];
          if (!targetJob) {
            ussdResponse = `END Invalid Selection. Please try dialing USSD *123# again.`;
          } else {
            ussdResponse = `CON ${targetJob.title}
Emp: ${targetJob.employerName}
Pay: ${targetJob.salaryRange}
1. Instant Apply
0. Back`;
          }
        } else if (inputs.length === 3) {
          const action = inputs[2];
          const jobIdx = parseInt(inputs[1]) - 1;
          const targetJob = localJobs[jobIdx];

          if (action === "1" && targetJob) {
            // Apply Process
            const matchCalculated = await runAgentJobMatcher(seeker, targetJob);
            const appInsert: Application = {
              id: `APP-${Math.floor(100 + Math.random() * 899)}`,
              jobId: targetJob.id,
              jobTitle: targetJob.title,
              seekerId: seeker.id,
              seekerPhone: seeker.phone,
              seekerName: seeker.name,
              status: "pending",
              appliedAt: new Date().toISOString(),
              matchScore: matchCalculated.score,
              matchExplanation: matchCalculated.explanation,
              source: "ussd"
            };
            applications.push(appInsert);

            // Simulation callback SMS
            smsLogs.unshift({
              id: `MSG-${Math.floor(1000 + Math.random() * 9000)}`,
              phoneNumber: seeker.phone,
              text: `RuralConnect: Application for ${targetJob.title} processed at ${matchCalculated.score}% score match index.`,
              direction: "outbound",
              timestamp: new Date().toISOString(),
              resolvedAction: "Submitted USSD confirm",
              agentTriggered: "Agent-5 (Communication Agent)"
            });

            ussdResponse = `END Application submit successful! You matched at ${matchCalculated.score}%. An SMS check and review is being prepared.`;
          } else {
            ussdResponse = `CON RuralConnect - Habari ${seeker.name}!\n1. Find Match Jobs\n2. View Applications\n3. Free Skills Training\n4. View My Profile\n5. Exit`;
          }
        }
      } 
      else if (mainChoice === "2") {
        // View applications
        const myApps = applications.filter(a => a.seekerId === seeker.id);
        if (myApps.length === 0) {
          ussdResponse = `CON You have no active job applications.
1. Seeker jobs list
0. Back`;
        } else {
          let str = `CON Your applications:\n`;
          myApps.forEach((a, i) => {
            str += `${i+1}. ${a.jobTitle} - ${a.status.toUpperCase()}\n`;
          });
          str += `\n0. Main Menu`;
          ussdResponse = str;
        }
      } 
      else if (mainChoice === "3") {
        // Free Skills courses
        if (inputs.length === 1) {
          let str = `CON Free Workshops near you:\n`;
          courses.forEach((c, i) => {
            str += `${i+1}. ${c.title}\n`;
          });
          str += `\n0. Main Menu`;
          ussdResponse = str;
        } else {
          const idx = parseInt(inputs[1]) - 1;
          const course = courses[idx];
          if (course) {
            ussdResponse = `CON Course: ${course.title}
Prov: ${course.provider}
Loc: ${course.location}
1. Enroll now
0. Back`;
          } else {
            ussdResponse = `CON Invalid course. Dial 0 to return.`;
          }
        }
      }
      else if (mainChoice === "4") {
        // Seeker profile
        ussdResponse = `CON ${seeker.name}
Loc: ${seeker.location}
Skills Extracted: ${seeker.structuredSkills.slice(0, 3).join(", ")}
Source: ${seeker.registrationSource.toUpperCase()}
0. Back`;
      } 
      else {
        ussdResponse = `END Thank you for using RuralConnect. Keeping rural communities connected to job opportunities. Kua imara!`;
      }
    }
  } 
  
  // 2. UNREGISTERED USER REGISTRATION USSD FLOW
  else {
    const totalSteps = inputs.length;
    if (totalSteps === 0 || !text || text === "") {
      ussdResponse = `CON Welcome to RuralConnect!
You do not have active registration on this SIM. Set up profile:
1. Enter Name
2. How RuralConnect works
3. Exit`;
    } else {
      const route = inputs[0];

      if (route === "2") {
        ussdResponse = `CON RuralConnect extracts skills from informal experience and matches jobs via SMS and USSD. No smartphone required.
1. Proceed with Registration
0. Exit`;
      } else if (route === "1" || inputs[1] === "1") {
        // Registration core pipeline
        const offset = (route === "1") ? 0 : 1; 
        const regInputs = inputs.slice(offset);

        if (regInputs.length === 1) {
          ussdResponse = `CON Step 1/3: Enter Seeker Full Name:`;
        } else if (regInputs.length === 2) {
          ussdResponse = `CON Step 2/3: Enter Seeker Village/Location (e.g. Machakos, Kitui):`;
        } else if (regInputs.length === 3) {
          ussdResponse = `CON Step 3/3: Describe informal experience (e.g. I fix motorcycles and harvest coffee beans):`;
        } else if (regInputs.length === 4) {
          // Process final registration
          const name = regInputs[1];
          const rawLoc = regInputs[2];
          const rawExp = regInputs[3];

          // Extract skills via Agent 1 Skills Extraction
          const skillsList = await runAgentSkillsExtractor(rawExp);

          const newSkr: UserSeeker = {
            id: `SKR-${Math.floor(100 + Math.random() * 900)}`,
            phone,
            name,
            location: rawLoc,
            informalExperience: rawExp,
            structuredSkills: skillsList,
            preferredLanguage: "English",
            enrolledCourses: [],
            registrationSource: "ussd",
            createdAt: new Date().toISOString()
          };
          seekers.push(newSkr);

          // Simulate outbound welcome SMS
          const welcomeMsg = `RuralConnect: Registered successfully! Skills extracted: ${skillsList.join(", ")}. Dial USSD again to find jobs!`;
          const shortWelcome = await runAgentCommunicationSimplifier(welcomeMsg);
          smsLogs.unshift({
            id: `MSG-${Math.floor(1000 + Math.random() * 9000)}`,
            phoneNumber: phone,
            text: shortWelcome,
            direction: "outbound",
            timestamp: new Date().toISOString(),
            resolvedAction: "Stateful Registration Confirmed",
            agentTriggered: "Agent-5 (Communication Agent)"
          });

          ussdResponse = `END Congratulations ${name}! Registration complete list. Skills Extracted: ${skillsList.slice(0, 3).join(", ")}. We sent a welcome SMS confirmation. Try dialing *123# to search jobs!`;
        }
      } else {
        ussdResponse = `END Thank you for using RuralConnect.`;
      }
    }
  }

  res.send(ussdResponse);
});


// -----------------------------------------------------
// RUNTIME SERVER INITIALIZATION & VITE MIDDLEWARE
// -----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve client router fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RuralConnect production-ready platform online at http://localhost:${PORT}`);
  });
}

startServer();
