/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  Users, 
  Smartphone, 
  MessageSquare, 
  Cpu, 
  BookOpen, 
  ShieldAlert, 
  Database, 
  Code, 
  Settings, 
  RefreshCw, 
  Sliders, 
  Search, 
  Award, 
  Activity, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Compass, 
  Trash2, 
  AlertTriangle, 
  ChevronRight, 
  Lock, 
  Eye, 
  Layers, 
  MapPin, 
  Plus, 
  Calendar, 
  Phone, 
  Check, 
  ArrowRight
} from "lucide-react";

import { 
  UserSeeker, 
  Job, 
  Application, 
  Course, 
  SmsLog, 
  SystemMetrics 
} from "./types";

export default function App() {
  // State for Navigation and Portals
  const [activeTab, setActiveTab] = useState<"demo" | "seekers" | "employers" | "training" | "admin" | "blueprints">("demo");
  const [activeBlueprintSubTab, setActiveBlueprintSubTab] = useState<"prd" | "arch" | "db" | "api" | "agents" | "ussdflow" | "roadmap">("prd");
  
  // Real-time backend data
  const [seekers, setSeekers] = useState<UserSeeker[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalSeekers: 0,
    totalJobs: 0,
    totalApplications: 0,
    totalCourses: 0,
    skillsExtracted: 0,
    fraudScansPerformed: 0,
    fraudPrevented: 0,
    smsProcessed: 0,
    ussdSessions: 0
  });

  // Simulator specific states
  const [simulationPhone, setSimulationPhone] = useState<string>("+254711223344");
  const [simulatorMode, setSimulatorMode] = useState<"ussd" | "sms">("ussd");
  
  // USSD Simulator States
  const [ussdHistory, setUssdHistory] = useState<string>("");
  const [ussdScreen, setUssdScreen] = useState<string>("CON Welcome to RuralConnect!\nYou do not have active registration on this SIM. Set up profile:\n1. Enter Name\n2. How RuralConnect works\n3. Exit");
  const [ussdDialText, setUssdDialText] = useState<string>("*123#");
  const [ussdSessionActive, setUssdSessionActive] = useState<boolean>(false);
  const [ussdInputFieldValue, setUssdInputFieldValue] = useState<string>("");
  
  // SMS Simulator States
  const [smsInputField, setSmsInputField] = useState<string>("");
  const [smsHistory, setSmsHistory] = useState<{ sender: "user" | "system", text: string, time: string, parsedAgent?: string }[]>([
    {
      sender: "system",
      text: "Welcome to RuralConnect SMS Gateway. Text HELP to see available commands.",
      time: "10:00 AM"
    }
  ]);

  // Seeker Registration Form (Web)
  const [seekerForm, setSeekerForm] = useState({
    name: "",
    phone: "+254712345678",
    location: "Machakos",
    informalExperience: "",
    preferredLanguage: "English"
  });

  // Employer Job Form (Web)
  const [jobForm, setJobForm] = useState({
    title: "",
    employerName: "",
    description: "",
    keySkills: "",
    location: "Machakos",
    salaryRange: "",
    duration: "Full-Time"
  });

  // Loading/Trigger states
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [selectedSeekerId, setSelectedSeekerId] = useState<string>("");
  const [seekerCareerGuide, setSeekerCareerGuide] = useState<{ careerPath: string; courseAdvices: string[]; marketDemand: string } | null>(null);

  // Quick seed lists for simulation templates
  const seekerTemplates = [
    {
      name: "Mercy Wanjiku",
      phone: "+254705118822",
      location: "Kitui",
      description: "I construct fences, perform basic welding, and harvest farm crops step by step.",
      lang: "Kiswahili"
    },
    {
      name: "David Kiprop",
      phone: "+254792667788",
      location: "Machakos",
      description: "I operate solar water pumps, repair broken PVC pipelines, and direct drip irrigation systems.",
      lang: "English"
    },
    {
      name: "Ruth Anyango",
      phone: "+254711334455",
      location: "Machakos",
      description: "I manage village retail kiosks, calculate daily shop sales inventory ledger, and speak English.",
      lang: "English"
    }
  ];

  const jobTemplates = [
    {
      title: "Urgent: Solar Field Support Assistant",
      employerName: "SunCulture Irrigation Ltd",
      description: "Require a passionate local assistant to help with solar pump battery installation, digging trenches, and mounting solar arrays for drip irrigated farms in rural Machakos region.",
      keySkills: "Solar Pump Systems, Mechanical Maintenance, Equipment Assembly",
      location: "Machakos",
      salaryRange: "KES 20,000 / month",
      duration: "Full-time Contract"
    },
    {
      title: "Drip Pipe Layout Labourer",
      employerName: "Dryland NGO Farming Project",
      description: "Laying out agricultural water pipelines and joining irrigation valves. Ground digging required. Easy work for rural youth. Low literacy accepted.",
      keySkills: "Pump Maintenance, Irrigation Systems Maintenance, Field Operations",
      location: "Kitui",
      salaryRange: "KES 700 / day",
      duration: "Temporary (2 weeks)"
    },
    {
      title: "⚠️ SECURE WINNING LOTTERY: Rural Representative Agent",
      employerName: "Global Wealth Draw Distribution Kenya",
      description: "Receive instant promotional cash grants to your mobile phone wallet. You MUST provide an upfront security deposit of KES 2,500 to our Paybill number for compliance training prior to enlistment.",
      keySkills: "Smart Phone User, General Labor",
      location: "Kitui",
      salaryRange: "KES 5,000 / day cash",
      duration: "Instant Payout"
    }
  ];

  // Load backend statistics
  const fetchData = async () => {
    try {
      const [resMetrics, resSeekers, resJobs, resCourses, resApplications, resSms] = await Promise.all([
        fetch("/api/metrics").then(r => r.json()),
        fetch("/api/seekers").then(r => r.json()),
        fetch("/api/jobs").then(r => r.json()),
        fetch("/api/courses").then(r => r.json()),
        fetch("/api/applications").then(r => r.json()),
        fetch("/api/sms-logs").then(r => r.json())
      ]);

      setMetrics(resMetrics);
      setSeekers(resSeekers);
      setJobs(resJobs);
      setCourses(resCourses);
      setApplications(resApplications);
      setSmsLogs(resSms);

      // Auto select first seeker for match visualization
      if (resSeekers.length > 0 && !selectedSeekerId) {
        setSelectedSeekerId(resSeekers[0].id);
      }
    } catch (e) {
      console.error("Error communicating with RuralConnect server backend.", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Set Career Coach Guide for Selected Seeker
  useEffect(() => {
    if (selectedSeekerId) {
      const seeker = seekers.find(s => s.id === selectedSeekerId);
      if (seeker) {
        // Mock calculations mimicking Agent 3 career guide
        let careerPath = "Advance from casual farm hand to commercial solar irrigation pump technician.";
        let courseAdvices = ["Solar Pump Installation & Repair"];
        let marketDemand = "Excellent demand. Green-technology organizations are rolling out smart solar pumps in eastern Kenya farms.";

        if (seeker.structuredSkills.includes("Garment Construction") || seeker.structuredSkills.includes("Tailoring & Pattern-making")) {
          careerPath = "Progress toward setting up a self-sustaining cooperative tailoring workshop.";
          courseAdvices = ["Village Banking & Agribusiness Ledger"];
          marketDemand = "Steady garment needs in local schools. Self-employment returns can double with formal booking habits.";
        } else if (seeker.structuredSkills.includes("Retail Bookkeeping") || seeker.structuredSkills.includes("Customer Service")) {
          careerPath = "Grow from shop scale entry cashier to regional supply supervisor/agency coordinator.";
          courseAdvices = ["Village Banking & Agribusiness Ledger"];
          marketDemand = "Rural retail stores are digitizing payment logs, increasing value for ledger keepers.";
        }

        setSeekerCareerGuide({ careerPath, courseAdvices, marketDemand });
      }
    }
  }, [selectedSeekerId, seekers]);

  // System Core reset
  const handleResetSystem = async () => {
    if (confirm("Are you sure you want to reset key memory tables to baseline default state? This is ideal for demonstrations.")) {
      setLoading({ ...loading, reset: true });
      try {
        await fetch("/api/sys/reset", { method: "POST" });
        await fetchData();
        // Clear simulators
        setUssdHistory("");
        setUssdSessionActive(false);
        setUssdScreen("CON Welcome to RuralConnect!\nYou do not have active registration on this SIM. Set up profile:\n1. Enter Name\n2. How RuralConnect works\n3. Exit");
        setSmsHistory([
          {
            sender: "system",
            text: "Welcome to RuralConnect SMS Gateway. Text HELP to see available commands.",
            time: "10:00 AM"
          }
        ]);
        alert("Memory states successfully reset to clean defaults.");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading({ ...loading, reset: false });
      }
    }
  };

  // Seeding helper tools
  const handleApplyTemplateSeeker = (tpl: typeof seekerTemplates[0]) => {
    setSeekerForm({
      name: tpl.name,
      phone: tpl.phone,
      location: tpl.location,
      informalExperience: tpl.description,
      preferredLanguage: tpl.lang
    });
  };

  const handleApplyTemplateJob = (tpl: typeof jobTemplates[0]) => {
    setJobForm({
      title: tpl.title,
      employerName: tpl.employerName,
      description: tpl.description,
      keySkills: tpl.keySkills,
      location: tpl.location,
      salaryRange: tpl.salaryRange,
      duration: tpl.duration
    });
  };

  // Submit Seeker (Web)
  const handleRegisterSeekerWeb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seekerForm.name || !seekerForm.phone || !seekerForm.location) {
      alert("Please provide name, phone digit sequence, and village location.");
      return;
    }
    setLoading({ ...loading, registerWeb: true });
    try {
      const response = await fetch("/api/seekers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(seekerForm)
      });
      if (response.ok) {
        const data = await response.json();
        alert(`Seeker successfully registered!\nStructured Skills Extracted: ${data.structuredSkills.join(", ")}`);
        
        // Reset inputs
        setSeekerForm({
          name: "",
          phone: "+254712345678",
          location: "Machakos",
          informalExperience: "",
          preferredLanguage: "English"
        });
        
        await fetchData();
        setSelectedSeekerId(data.id);
      } else {
        alert("Error registering seeker.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading({ ...loading, registerWeb: false });
    }
  };

  // Submit Job (Web) with active fraud scanning trigger
  const handlePostJobWeb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.employerName || !jobForm.description) {
      alert("Please fill out Title, Employer Name, and description.");
      return;
    }
    setLoading({ ...loading, postJobWeb: true });
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: jobForm.title,
          employerName: jobForm.employerName,
          description: jobForm.description,
          keySkills: jobForm.keySkills,
          location: jobForm.location,
          salaryRange: jobForm.salaryRange,
          duration: jobForm.duration
        })
      });
      if (response.ok) {
        const data = await response.json();
        alert(`Job Posted Successfully!\nAI Fraud Audit Rating: ${data.fraudScore}/100\nStatus: ${data.status.toUpperCase()}\nExplanation: ${data.fraudExplanation}`);
        setJobForm({
          title: "",
          employerName: "",
          description: "",
          keySkills: "",
          location: "Machakos",
          salaryRange: "",
          duration: "Full-Time"
        });
        await fetchData();
      } else {
        alert("Failed to submit job posting.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading({ ...loading, postJobWeb: false });
    }
  };

  // Submit Seeker Job Application via Web Dashboard
  const handleApplyJobWeb = async (seekerId: string, jobId: string) => {
    setLoading({ ...loading, [`apply-${jobId}`]: true });
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seekerId,
          jobId,
          source: "web"
        })
      });
      if (response.ok) {
        const data = await response.json();
        alert(`Applied Successfully!\nAI Fit Match Evaluation: ${data.matchScore}%\nReasoning: ${data.matchExplanation}`);
        await fetchData();
      } else {
        alert("Application failed.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading({ ...loading, [`apply-${jobId}`]: false });
    }
  };

  // -----------------------------------------------------
  // SMS SIMULATOR SUBMISSION GATEWAY
  // -----------------------------------------------------
  const handleSendSimulatedSms = async () => {
    if (!smsInputField.trim()) return;

    const userText = smsInputField;
    setSmsInputField("");

    // Output to simulation local state immediately
    const userMsgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSmsHistory(prev => [...prev, {
      sender: "user",
      text: userText,
      time: userMsgTime
    }]);

    setLoading({ ...loading, smsSim: true });

    try {
      const response = await fetch("/api/sms/inbound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: simulationPhone,
          text: userText
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Match the appropriate simulated agent tags based on text
        let agentTag = "Agent 5: Communication Agent";
        if (userText.toUpperCase().startsWith("REGISTER")) {
          agentTag = "Agent 1: Skills Extractor & Agent 5";
        } else if (userText.toUpperCase().startsWith("JOBS")) {
          agentTag = "Agent 2: Match Engine & Agent 5";
        } else if (userText.toUpperCase().startsWith("APPLY")) {
          agentTag = "Agent 2: Fit Evaluation & Agent 5";
        } else if (!seekers.some(s => s.phone === simulationPhone)) {
          agentTag = "Agent 3: Career Guidance Agent & Agent 5";
        }

        const systemMsgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setSmsHistory(prev => [...prev, {
          sender: "system",
          text: data.reply,
          time: systemMsgTime,
          parsedAgent: agentTag
        }]);

        // Refresh main tables
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading({ ...loading, smsSim: false });
    }
  };

  // Click standard text seeds for rapid testing in SMS mockup
  const handleQuickSmsCommand = (cmd: string) => {
    setSmsInputField(cmd);
  };


  // -----------------------------------------------------
  // USSD SIMULATOR DIAL & SESSION GATEWAY
  // -----------------------------------------------------
  const handleDialUssd = async () => {
    if (ussdDialText !== "*123#") {
      alert("RuralConnect operates standard channel *123# on USSD networks.");
      return;
    }
    setUssdSessionActive(true);
    setUssdHistory("");
    setUssdHistory("");
    
    setLoading({ ...loading, ussdSim: true });
    try {
      const response = await fetch("/api/ussd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: simulationPhone,
          text: "",
          sessionId: `${simulationPhone}-ses-${Date.now()}`
        })
      });

      if (response.ok) {
        const textData = await response.text();
        setUssdScreen(textData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading({ ...loading, ussdSim: false });
    }
  };

  const handleSendUssdResponse = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    
    const value = ussdInputFieldValue.trim();
    setUssdInputFieldValue("");

    // Chain USSD historical values with Asterisk symbol
    const newHistory = ussdHistory ? `${ussdHistory}*${value}` : value;
    setUssdHistory(newHistory);

    setLoading({ ...loading, ussdSim: true });
    try {
      const response = await fetch("/api/ussd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: simulationPhone,
          text: newHistory,
          sessionId: `${simulationPhone}-ses-current`
        })
      });

      if (response.ok) {
        const textData = await response.text();
        setUssdScreen(textData);
        
        // If USSD return message begins with END, close the dial session
        if (textData.startsWith("END")) {
          setTimeout(() => {
            setUssdSessionActive(false);
            setUssdHistory("");
          }, 6000);
        }
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading({ ...loading, ussdSim: false });
    }
  };

  const handleCancelUssd = () => {
    setUssdSessionActive(false);
    setUssdHistory("");
    setUssdScreen("CON Welcome to RuralConnect!\nYou do not have active registration on this SIM. Set up profile:\n1. Enter Name\n2. How RuralConnect works\n3. Exit");
  };

  return (
    <div id="ruralconnect-main-container" className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-teal-500 selection:text-slate-900">
      
      {/* GLOBAL COHESIVE BRAND HEADER */}
      <header id="rc-app-header" className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-xl text-slate-900 shadow-md shadow-teal-500/10">
              <Cpu className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">RURAL<span className="text-teal-400">CONNECT</span></span>
                <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-1.5 py-0.5 rounded-full font-mono">v1.2 Pilot Scaffold</span>
              </div>
              <p className="text-xs text-slate-400">Offline-First Job Opportunities & Skills Decoupling Ecosystem</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 text-xs">
              <button 
                onClick={() => setSimulationPhone("+254711223344")}
                className={`px-2.5 py-1 rounded-md transition-all ${simulationPhone === "+254711223344" ? "bg-teal-500 text-slate-950 font-semibold" : "text-slate-300 hover:text-white"}`}
              >
                SIM 1 (+25471122)
              </button>
              <button 
                onClick={() => setSimulationPhone("+254722556677")}
                className={`px-2.5 py-1 rounded-md transition-all ${simulationPhone === "+254722556677" ? "bg-teal-500 text-slate-950 font-semibold" : "text-slate-300 hover:text-white"}`}
              >
                SIM 2 (+25472255)
              </button>
            </div>

            <button 
              onClick={handleResetSystem}
              disabled={loading.reset}
              className="flex items-center gap-1.5 bg-red-950/40 text-red-400 hover:bg-red-900/40 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading.reset ? "animate-spin" : ""}`} />
              Reset Engine
            </button>
          </div>
        </div>
      </header>

      {/* METRICS DASHBOARD BANNER */}
      <section id="rc-analytics-row" className="bg-slate-950 border-b border-slate-800 py-4">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-teal-500/10 text-teal-400 rounded">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-white">{metrics.totalSeekers}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Rural Seekers</div>
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-white">{metrics.totalJobs}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Active Jobs</div>
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-indigo-400/10 text-indigo-400 rounded">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-white">{metrics.skillsExtracted}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Skills Decoupled</div>
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-white">{metrics.fraudPrevented}/{metrics.fraudScansPerformed}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Scams Prevented</div>
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 col-span-2 md:col-span-1 rounded-lg border border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-white">{metrics.smsProcessed + metrics.ussdSessions}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Mobile Sessions</div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE PORTAL TABS */}
      <nav id="rc-navigation-bar" className="bg-slate-950/40 border-b border-slate-800 sticky top-[69px] z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-start overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab("demo")}
            className={`flex items-center gap-2 py-4 px-4 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === "demo" ? "border-teal-400 text-teal-400 bg-slate-900/30" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Smartphone className="h-4 w-4" />
            Low-Tech Simulators
          </button>
          
          <button
            onClick={() => setActiveTab("seekers")}
            className={`flex items-center gap-2 py-4 px-4 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === "seekers" ? "border-teal-400 text-teal-400 bg-slate-900/30" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="h-4 w-4" />
            Job Seeker Hub
          </button>

          <button
            onClick={() => setActiveTab("employers")}
            className={`flex items-center gap-2 py-4 px-4 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === "employers" ? "border-teal-400 text-teal-400 bg-slate-900/30" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Employer & Safety Agent
          </button>

          <button
            onClick={() => setActiveTab("training")}
            className={`flex items-center gap-2 py-4 px-4 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === "training" ? "border-teal-400 text-teal-400 bg-slate-900/30" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Learnerships & Courses
          </button>

          <button
            onClick={() => setActiveTab("admin")}
            className={`flex items-center gap-2 py-4 px-4 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === "admin" ? "border-teal-400 text-teal-400 bg-slate-900/30" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Settings className="h-4 w-4" />
            Admin Room
          </button>

          <button
            onClick={() => setActiveTab("blueprints")}
            className={`flex items-center gap-2 py-4 px-4 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === "blueprints" ? "border-teal-400 text-teal-400 bg-slate-900/30" : "border-transparent text-teal-400 hover:text-teal-200 font-semibold"
            }`}
          >
            <Database className="h-4 w-4" />
            Specs & Blueprints
          </button>
        </div>
      </nav>

      {/* CORE WORKSPACE CONTENT GRID */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* TAB 1: LOW-TECH USSD / SMS INTERACTIVE SIMULATORS */}
        {activeTab === "demo" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* SIMULATION PHONE FRAME MOCK */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-[340px] bg-slate-950 p-5 rounded-[44px] shadow-2xl border-4 border-slate-800 relative ring-1 ring-teal-500/20">
                
                {/* Notch */}
                <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-4 absolute top-2 left-1/2 -translate-x-1/2"></div>
                
                {/* Simulator Mode Selector */}
                <div className="grid grid-cols-2 bg-slate-900 rounded-full p-1 border border-slate-800 mb-4 mt-2">
                  <button 
                    onClick={() => { setSimulatorMode("ussd"); handleCancelUssd(); }}
                    className={`py-1.5 rounded-full text-xs font-semibold ${simulatorMode === "ussd" ? "bg-teal-500 text-slate-950 shadow" : "text-slate-400 hover:text-slate-200"}`}
                  >
                    USSD Simulator (*123#)
                  </button>
                  <button 
                    onClick={() => setSimulatorMode("sms")}
                    className={`py-1.5 rounded-full text-xs font-semibold ${simulatorMode === "sms" ? "bg-teal-500 text-slate-950 shadow" : "text-slate-400 hover:text-slate-200"}`}
                  >
                    SMS Terminal
                  </button>
                </div>

                {/* ACTIVE PHONE DISPLAY SCREEN */}
                <div className="w-full aspect-[3/4] bg-neutral-900 rounded-2xl p-4 overflow-y-auto font-mono text-xs border border-slate-800 flex flex-col justify-between relative shadow-inner">
                  {simulatorMode === "ussd" ? (
                    // USSD UI SCREEN
                    ussdSessionActive ? (
                      <div className="flex flex-col justify-between h-full text-amber-200">
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {ussdScreen}
                        </div>
                        
                        {/* Interactive numeric input within the popup */}
                        {!ussdScreen.startsWith("END") && (
                          <form onSubmit={handleSendUssdResponse} className="mt-4 border-t border-amber-900/30 pt-3">
                            <label className="block text-[10px] text-amber-400/80 mb-1">Enter your response:</label>
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                value={ussdInputFieldValue}
                                onChange={(e) => setUssdInputFieldValue(e.target.value)}
                                placeholder="Number/Input text"
                                className="bg-black text-amber-100 border border-amber-500/40 rounded px-2 py-1 w-full text-xs focus:outline-none focus:border-amber-400"
                                autoFocus
                              />
                              <button 
                                type="submit"
                                className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-3 py-1 rounded cursor-pointer text-[11px]"
                              >
                                Send
                              </button>
                            </div>
                          </form>
                        )}

                        <div className="flex justify-between text-[10px] border-t border-amber-900/30 pt-2.5 mt-2.5 text-slate-400">
                          <span>Phone: {simulationPhone}</span>
                          <button 
                            type="button" 
                            onClick={handleCancelUssd}
                            className="text-red-400 font-bold underline hover:text-red-300"
                          >
                            Exit Session [Cancel]
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Idle/Dial State
                      <div className="flex flex-col justify-between h-full text-slate-400">
                        <div className="text-center mt-6">
                          <p className="text-xl font-bold tracking-widest text-slate-200 mb-1">RuralConnect</p>
                          <p className="text-[10px]">No internet connection detected</p>
                          <div className="mt-8 border border-slate-800/80 rounded bg-slate-950 p-2 text-center text-slate-300">
                            SIM Carrier Network Ready
                          </div>
                        </div>

                        <div className="mt-auto">
                          <label className="text-[10px] block mb-1">Dial RuralConnect USSD Access Code:</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={ussdDialText}
                              onChange={(e) => setUssdDialText(e.target.value)}
                              className="bg-black text-white text-base tracking-wider border border-slate-700 rounded px-2.5 py-1.5 w-full text-center"
                            />
                            <button
                              onClick={handleDialUssd}
                              disabled={loading.ussdSim}
                              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-3 py-1.5 rounded"
                            >
                              Dial
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  ) : (
                    // SMS UI SCREEN
                    <div className="flex flex-col h-full justify-between">
                      <div className="bg-slate-950 p-2 border-b border-slate-800 -mx-4 -mt-4 text-center text-[10px] text-white font-bold tracking-tight">
                        💬 Shortcode: 22444
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-3 py-3 font-sans text-xs scrollbar-thin">
                        {smsHistory.map((msg, i) => (
                          <div key={i} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                            <div className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                              msg.sender === "user" 
                                ? "bg-teal-600 text-white rounded-br-none" 
                                : "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/60"
                            }`}>
                              <p className="whitespace-pre-line text-[11px]">{msg.text}</p>
                              {msg.parsedAgent && (
                                <div className="text-[8px] mt-1 text-teal-300 flex items-center gap-1 uppercase tracking-wider font-mono font-semibold">
                                  <Cpu className="h-2 w-2 animate-pulse" />
                                  {msg.parsedAgent}
                                </div>
                              )}
                            </div>
                            <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.time}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-slate-800 pt-2.5 -mx-4 -mb-4 bg-slate-950 p-2.5">
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={smsInputField}
                            onChange={(e) => setSmsInputField(e.target.value)}
                            placeholder="Type SMS command..."
                            className="bg-neutral-900 border border-slate-700 text-white rounded px-2.5 py-1.5 w-full text-xs font-sans focus:outline-none"
                            onKeyDown={(e) => e.key === "Enter" && handleSendSimulatedSms()}
                          />
                          <button
                            onClick={handleSendSimulatedSms}
                            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-3 py-1 rounded font-sans text-xs"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tactical Physical Buttons Row */}
                <div className="grid grid-cols-3 gap-2 mt-4 max-w-[240px] mx-auto">
                  <button 
                    onClick={() => simulationPhone === "+254711223344" ? setSimulationPhone("+254722556677") : setSimulationPhone("+254711223344")}
                    className="aspect-square rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-[10px] hover:bg-slate-800 flex items-center justify-center font-bold"
                  >
                    Swap SIM
                  </button>
                  <button 
                    onClick={() => {
                      if (simulatorMode === "ussd" && ussdSessionActive) handleCancelUssd();
                      else if(simulatorMode === "sms") setSmsHistory([{ sender: "system", text: "Inbox cleared.", time: "10:00" }]);
                    }}
                    className="aspect-square rounded-full bg-slate-900 border border-slate-800 text-red-400 text-[10px] hover:bg-slate-800 flex items-center justify-center font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      if (simulatorMode === "ussd" && !ussdSessionActive) {
                        setUssdDialText("*123#");
                        handleDialUssd();
                      }
                    }}
                    className="aspect-square rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-400 text-[10px] hover:bg-teal-500/30 flex items-center justify-center font-bold animate-pulse"
                  >
                    CALL
                  </button>
                </div>

                <div className="text-center text-[9px] text-slate-500 mt-4 uppercase tracking-wider font-semibold">
                  Nokia Micro-Simulation Phone
                </div>
              </div>
            </div>

            {/* QUICK TEST GUIDES - THE USSD / SMS INTERACTIVE SCENARIOS */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                  <Smartphone className="h-5 w-5 text-teal-400" />
                  Understanding the Simulated Hardware Integration
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  In rural Africa, most job seekers do not have smartphones. RuralConnect resolves this by building a dual SMS and USSD system linked to a **multi-agent AI pipeline**. The simulator to the left communicates directly with real HTTP pathways configured inside our server!
                </p>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-teal-950/20 rounded-xl border border-teal-500/10">
                    <span className="text-xs text-teal-400 font-bold uppercase tracking-wider">USSD Testing Walkthrough</span>
                    <ol className="text-xs space-y-2 mt-2 text-slate-300 list-decimal pl-4">
                      <li>Type <code className="text-teal-400">*123#</code> and click <kbd className="text-white bg-slate-800 px-1 py-0.5 rounded text-[10px]">Dial</kbd></li>
                      <li>Dial <code className="text-emerald-400">1</code> to select Name enrollment</li>
                      <li>Supply a name, village (e.g. <code className="text-pink-300">Kitui</code>), and brief unstructured experience (e.g. <code className="text-pink-300">I do sewing clothes</code>)</li>
                      <li>Acknowledge real-time skill extraction, then dial again to match local jobs or free learnerships!</li>
                    </ol>
                  </div>

                  <div className="p-3 bg-teal-950/20 rounded-xl border border-teal-500/10">
                    <span className="text-xs text-teal-400 font-bold uppercase tracking-wider">SMS Keyword Triggers</span>
                    <p className="text-xs text-slate-300 mt-1 mb-2.5">Switch to the SMS Simulator and tap any template string below to load it into your phone:</p>
                    
                    <div className="space-y-1.5">
                      <button 
                        onClick={() => handleQuickSmsCommand("HELP")}
                        className="block w-full text-left bg-slate-900 hover:bg-slate-800 p-1.5 rounded text-[10px] font-mono text-slate-300 border border-slate-800"
                      >
                        📬 HELP
                      </button>
                      <button 
                        onClick={() => handleQuickSmsCommand("REGISTER Peter Mulei # Machakos # I fix broken water valves and harvest coffee beans")}
                        className="block w-full text-left bg-slate-900 hover:bg-slate-800 p-1.5 rounded text-[10px] font-mono text-slate-300 border border-slate-800 truncate"
                      >
                        📝 REGISTER Peter Mulei # Machakos # ...
                      </button>
                      <button 
                        onClick={() => handleQuickSmsCommand("JOBS")}
                        className="block w-full text-left bg-slate-900 hover:bg-slate-800 p-1.5 rounded text-[10px] font-mono text-slate-300 border border-slate-800"
                      >
                        🔍 JOBS (Show local listings matching profile)
                      </button>
                      <button 
                        onClick={() => handleQuickSmsCommand("COURSES")}
                        className="block w-full text-left bg-slate-900 hover:bg-slate-800 p-1.5 rounded text-[10px] font-mono text-slate-300 border border-slate-800"
                      >
                        🎓 COURSES (View NGO skill workshops)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* DEMO ENGINE ARCHITECTURE DIAGRAM SUMMARY */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-4 flex items-center justify-between">
                  <span>Simulated Multi-Agent Execution Log</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                </h4>

                <div className="space-y-3.5">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-3">
                    <span className="p-1 px-2.5 bg-indigo-500/10 text-indigo-400 font-mono text-[10px] rounded font-bold">AGENT-1</span>
                    <div>
                      <p className="text-xs text-slate-200 font-semibold">Skills Extraction Agent (Gemini API)</p>
                      <p className="text-[11px] text-slate-400 mt-1">Converts simple descriptions (e.g., "I stitch dresses") into standard structured taxonomy: <code className="text-indigo-300">["Tailoring & Pattern-making", "Garment Construction"]</code>.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-3">
                    <span className="p-1 px-2.5 bg-emerald-500/10 text-emerald-400 font-mono text-[10px] rounded font-bold">AGENT-2</span>
                    <div>
                      <p className="text-xs text-slate-200 font-semibold">AI Job Compatibility Matcher (Gemini Match Engine)</p>
                      <p className="text-[11px] text-slate-400 mt-1">Cross-analyzes structured seeker profiles with active employer mandates. Computes real compatibility scores and generates easy-to-understand explanations.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-3">
                    <span className="p-1 px-2.5 bg-red-400/10 text-red-400 font-mono text-[10px] rounded font-bold">AGENT-4</span>
                    <div>
                      <p className="text-xs text-slate-200 font-semibold">AI Job Scam & Fraud Intelligence Agent</p>
                      <p className="text-[11px] text-slate-400 mt-1">Audits all employer postings for micro-scams, upfront fee demands, or unrealistic salary promises. Flags postings and adds safety scores.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}


        {/* TAB 2: JOB SEEKER WEB PORTAL */}
        {activeTab === "seekers" && (
          <div className="space-y-8">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="text-teal-400 hover:scale-110 transition-transform" />
                    Web Portal Seeker Intake Hub
                  </h3>
                  <p className="text-xs text-slate-400">Allows field workers or agency staff to register candidates with speech-to-text or structured descriptions.</p>
                </div>
                
                <div className="text-xs bg-teal-500/10 text-teal-400 border border-teal-500/30 p-2 rounded-lg max-w-sm">
                  💡 **Tip:** Use Seeker templates below to fill the form in one click!
                </div>
              </div>

              {/* Seeker templates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
                {seekerTemplates.map((tpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTemplateSeeker(tpl)}
                    className="p-3 bg-slate-900 hover:bg-slate-850 text-left rounded-xl border border-slate-800 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white font-sans">{tpl.name}</span>
                      <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono uppercase">{tpl.location}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">"{tpl.description}"</p>
                  </button>
                ))}
              </div>

              {/* Seeker Input Form */}
              <form onSubmit={handleRegisterSeekerWeb} className="grid grid-cols-1 md:grid-cols-12 gap-5 border-t border-slate-900 pt-6">
                <div className="md:col-span-4">
                  <label className="block text-slate-300 text-xs font-semibold mb-1.5">Candidate Full Name</label>
                  <input
                    type="text"
                    required
                    value={seekerForm.name}
                    onChange={(e) => setSeekerForm({ ...seekerForm, name: e.target.value })}
                    placeholder="e.g. Mercy Wanjiku"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-150 rounded-lg p-2 text-xs focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-slate-300 text-xs font-semibold mb-1.5">Phone Number (SIM identity)</label>
                  <input
                    type="text"
                    required
                    value={seekerForm.phone}
                    onChange={(e) => setSeekerForm({ ...seekerForm, phone: e.target.value })}
                    placeholder="e.g. +254700112233"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-150 rounded-lg p-2 text-xs focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-slate-300 text-xs font-semibold mb-1.5">Primary Location / Hub</label>
                  <select
                    value={seekerForm.location}
                    onChange={(e) => setSeekerForm({ ...seekerForm, location: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-150 rounded-lg p-2 text-xs focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="Machakos">Machakos Town Area</option>
                    <option value="Kitui">Kitui Core District</option>
                    <option value="Makueni">Makueni Rural Corridor</option>
                  </select>
                </div>

                <div className="md:col-span-12">
                  <label className="block text-slate-300 text-xs font-semibold mb-1.5">Informal Background or Handcraft Experience (AI extraction will decouple this)</label>
                  <textarea
                    rows={3}
                    required
                    value={seekerForm.informalExperience}
                    onChange={(e) => setSeekerForm({ ...seekerForm, informalExperience: e.target.value })}
                    placeholder="Describe daily physical labor or artisanal skills in simple language. e.g., 'I know how to stitch school dresses, fix pedal sewing machines, and pick tea leaf crops during harvest seasons.'"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-150 rounded-lg p-3 text-xs focus:ring-1 focus:ring-teal-500 font-sans"
                  />
                </div>

                <div className="md:col-span-12 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading.registerWeb}
                    className="bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-bold px-6 py-2 rounded-lg cursor-pointer text-xs flex items-center gap-1.5 shadow"
                  >
                    {loading.registerWeb ? "Analyzing with Gemini..." : "Extract Skills & Save Candidate"}
                  </button>
                </div>
              </form>
            </div>

            {/* SELECTION GRID: MATCH SEEKER OPPORTUNITIES */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: List Seekers in Registry */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-slate-950 p-4 border border-slate-800 rounded-2xl">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-4 flex items-center justify-between">
                    <span>Registered Candidates ({seekers.length})</span>
                    <Users className="h-3.5 w-3.5 text-slate-500" />
                  </h4>

                  <div className="space-y-2.5 max-h-[360px] overflow-y-auto">
                    {seekers.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSeekerId(s.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                          selectedSeekerId === s.id 
                            ? "bg-teal-500/10 border-teal-500/50 text-white" 
                            : "bg-slate-900 border-slate-800/80 hover:bg-slate-850 text-slate-200"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-xs">{s.name}</span>
                          <span className="text-[8px] uppercase font-mono px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded-full">
                            {s.location}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1 italic">"{s.informalExperience}"</p>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {s.structuredSkills.slice(0, 2).map((sk, id) => (
                            <span key={id} className="text-[8px] bg-slate-850 px-1.5 py-0.5 text-teal-300 rounded border border-slate-800">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI CAREER GUIDANCE COMPONENT */}
                {seekerCareerGuide && (
                  <div className="bg-slate-950 p-4 border border-slate-800 rounded-2xl relative overflow-hidden">
                    <div className="absolute right-2 top-2 text-indigo-500/10">
                      <Cpu className="h-14 w-14" />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Compass className="h-4 w-4 text-indigo-400" />
                      <h4 className="text-xs font-bold text-teal-400 uppercase tracking-widest font-mono">Agent-3 Coached Path</h4>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800">
                        <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Recommended Path</span>
                        <p className="text-slate-200 text-[11px] leading-relaxed font-semibold">{seekerCareerGuide.careerPath}</p>
                      </div>

                      <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800">
                        <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Empowerment course</span>
                        <div className="flex flex-wrap gap-1">
                          {seekerCareerGuide.courseAdvices.map((c, i) => (
                            <span key={i} className="text-[10px] bg-slate-800/80 px-2 py-0.5 rounded text-indigo-300 font-mono">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800">
                        <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Region labor trends</span>
                        <p className="text-slate-300 text-[10px] leading-relaxed">{seekerCareerGuide.marketDemand}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: AI Match Dashboard for selected seeker */}
              <div className="lg:col-span-8 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-5">
                <div className="border-b border-slate-800 pb-3">
                  <h4 className="text-sm font-bold text-white flex items-center justify-between">
                    <span>AI MATCH MAKING PANEL</span>
                    <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded text-[10px] font-mono">Active Compatibility Agent-2</span>
                  </h4>
                  {selectedSeekerId ? (
                    <p className="text-xs text-slate-400 mt-1">
                      Showing best job fits for candidate **{seekers.find(s => s.id === selectedSeekerId)?.name}** (Loc: {seekers.find(s => s.id === selectedSeekerId)?.location})
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 mt-1">Please select a candidate to analyze matching opportunities.</p>
                  )}
                </div>

                {selectedSeekerId && (
                  <div className="space-y-4">
                    {jobs.filter(j => j.status === "verified").map((job) => {
                      const seeker = seekers.find(s => s.id === selectedSeekerId);
                      
                      // Calculate mock score preview dynamically matching backend algorithms
                      const candidateSkills = new Set(seeker?.structuredSkills.map(s => s.toLowerCase()));
                      let matchedSkillsCount = 0;
                      job.keySkillsRequired.forEach(sk => {
                        if (candidateSkills.has(sk.toLowerCase())) matchedSkillsCount++;
                      });
                      const matchPct = Math.round((matchedSkillsCount / Math.max(1, job.keySkillsRequired.length)) * 100);
                      const isLocal = seeker?.location.toLowerCase() === job.location.toLowerCase();
                      const finalScore = Math.min(100, Math.max(10, Math.round(isLocal ? matchPct + 15 : matchPct * 0.8)));

                      const appliedRecord = applications.find(a => a.seekerId === selectedSeekerId && a.jobId === job.id);

                      return (
                        <div key={job.id} className="p-4 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col md:flex-row justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="bg-slate-850 px-2 py-0.5 rounded text-[9px] text-slate-400 uppercase font-mono font-bold border border-slate-800">
                                {job.id}
                              </span>
                              <span className="text-xs text-slate-400 font-medium">{job.employerName}</span>
                            </div>
                            
                            <h5 className="text-white font-bold text-sm">{job.title}</h5>
                            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">{job.description}</p>
                            
                            {/* Skills required map */}
                            <div className="flex flex-wrap gap-1.5 items-center">
                              <span className="text-[9px] text-slate-400 uppercase font-semibold mr-1">Skills needed:</span>
                              {job.keySkillsRequired.map((s, id) => {
                                const included = candidateSkills.has(s.toLowerCase());
                                return (
                                  <span key={id} className={`text-[9px] px-2 py-0.5 rounded border transition-colors ${
                                    included 
                                      ? "bg-teal-500/10 text-teal-400 border-teal-500/20 font-bold" 
                                      : "bg-slate-850 text-slate-400 border-slate-800"
                                  }`}>
                                    {s}
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex flex-col md:items-end justify-between border-t md:border-t-0 border-slate-800/80 pt-3 md:pt-0 gap-3 min-w-[200px]">
                            {/* Match Progress Ring visual mock */}
                            <div className="flex items-center gap-2.5">
                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 uppercase font-bold block">Compatibility Target</span>
                                <span className={`text-sm font-bold ${finalScore >= 75 ? "text-emerald-400" : finalScore >= 40 ? "text-amber-400" : "text-slate-400"}`}>
                                  {finalScore}% Fit Rating
                                </span>
                              </div>
                              <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${finalScore >= 75 ? "bg-emerald-400" : finalScore >= 40 ? "bg-amber-400" : "bg-slate-400"}`}
                                  style={{ width: `${finalScore}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="space-y-1 text-left md:text-right">
                              <div className="text-[10px] text-slate-400">Location: <span className="text-white font-semibold">{job.location}</span></div>
                              <div className="text-[10px] text-slate-400">Salary scale: <span className="text-teal-300 font-semibold">{job.salaryRange}</span></div>
                            </div>

                            {/* Applied state / Button */}
                            {appliedRecord ? (
                              <div className="flex items-center gap-1.5 bg-slate-850 border border-slate-800 px-3.5 py-1.5 rounded-lg text-[10px] text-teal-400 md:self-end font-bold uppercase tracking-wider">
                                <Check className="h-3 w-3 stroke-[2.5]" />
                                Shortlisted/Pending
                              </div>
                            ) : (
                              <button
                                onClick={() => handleApplyJobWeb(selectedSeekerId, job.id)}
                                disabled={loading[`apply-${job.id}`]}
                                className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs cursor-pointer text-center"
                              >
                                {loading[`apply-${job.id}`] ? "Applying..." : "Submit Match Application"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}


        {/* TAB 3: EMPLOYER SYSTEM & AI SAFETY AGENT */}
        {activeTab === "employers" && (
          <div className="space-y-8">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Briefcase className="text-teal-400" />
                    Employer Opportunities Dashboard
                  </h3>
                  <p className="text-xs text-slate-400">Allows agricultural cooperatives, traders, NGOs, or local smallholders to list openings. Automatically scanned by **Fraud Intel Agent-4**.</p>
                </div>

                <div className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 p-2.5 rounded-lg">
                  🛡️ **AI Guardrails Activated:** Listings seeking upfront registration fees, payment till deposits, or guaranteed lottery windfalls are flagged instantly.
                </div>
              </div>

              {/* Job Posting Templates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
                {jobTemplates.map((tpl, id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleApplyTemplateJob(tpl)}
                    className="p-3 bg-slate-900 hover:bg-slate-850 text-left rounded-xl border border-slate-800 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white truncate max-w-[80%]">{tpl.title}</span>
                      <span className="text-[8px] bg-slate-800 text-slate-400 px-1 py-0.5 rounded font-mono uppercase">{tpl.location}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{tpl.description}</p>
                  </button>
                ))}
              </div>

              {/* Form entry */}
              <form onSubmit={handlePostJobWeb} className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-4 border-t border-slate-900">
                <div className="md:col-span-4">
                  <label className="block text-slate-305 text-xs font-semibold mb-1.5">Official Title of Role</label>
                  <input
                    type="text"
                    required
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    placeholder="e.g. Apprentice Tractor Welder"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-150 rounded-lg p-2 text-xs focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-slate-305 text-xs font-semibold mb-1.5">Employer Name / Inst.</label>
                  <input
                    type="text"
                    required
                    value={jobForm.employerName}
                    onChange={(e) => setJobForm({ ...jobForm, employerName: e.target.value })}
                    placeholder="e.g. Mumbuni Cooperative"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-150 rounded-lg p-2 text-xs focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-slate-305 text-xs font-semibold mb-1.5">Region Hub</label>
                  <select
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-150 rounded-lg p-2 text-xs focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="Machakos">Machakos Corridor</option>
                    <option value="Kitui">Kitui Central</option>
                    <option value="Makueni">Makueni</option>
                  </select>
                </div>

                <div className="md:col-span-8">
                  <label className="block text-slate-305 text-xs font-semibold mb-1.5">Brief description (clearly outline duties, local facilities, or physical expectations)</label>
                  <textarea
                    rows={2}
                    required
                    value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    placeholder="Describe specific actions needed. Open to illiterate people? Is tool handling manual? Bus travel provided?"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-150 rounded-lg p-2 text-xs focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-slate-305 text-xs font-semibold mb-1.5">Key Skills Required (Comma Separated)</label>
                  <input
                    type="text"
                    value={jobForm.keySkills}
                    onChange={(e) => setJobForm({ ...jobForm, keySkills: e.target.value })}
                    placeholder="Mechanical Maintenance, Agricultural Harvesting, etc"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-150 rounded-lg p-2 text-xs focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div className="md:col-span-6">
                  <label className="block text-slate-305 text-xs font-semibold mb-1.5">Compensation Package / Hourly Rate</label>
                  <input
                    type="text"
                    value={jobForm.salaryRange}
                    onChange={(e) => setJobForm({ ...jobForm, salaryRange: e.target.value })}
                    placeholder="e.g. KES 15,000 / month, or KES 500 / day cash"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-150 rounded-lg p-2 text-xs focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div className="md:col-span-6">
                  <label className="block text-slate-305 text-xs font-semibold mb-1.5">Hiring Duration</label>
                  <input
                    type="text"
                    value={jobForm.duration}
                    onChange={(e) => setJobForm({ ...jobForm, duration: e.target.value })}
                    placeholder="e.g. Full-Time, 2-Month Seasonal, Casual Piecework"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-150 rounded-lg p-2 text-xs focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div className="md:col-span-12 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading.postJobWeb}
                    className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-2 rounded-lg cursor-pointer text-xs"
                  >
                    {loading.postJobWeb ? "AI Safety Agent Scanning..." : "Audit & Post Opportunity"}
                  </button>
                </div>
              </form>
            </div>

            {/* LIST OF SYSTEM JOBS REPORT FOR REVIEWING CONTROLS */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <h4 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
                <span>System Postings & Anti-Fraud Logs</span>
                <span className="text-xs text-slate-400">Total Opportunities tracked: {jobs.length}</span>
              </h4>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2.5 font-semibold">Id</th>
                      <th className="py-2.5 font-semibold">Job Title</th>
                      <th className="py-2.5 font-semibold">Employer Name</th>
                      <th className="py-2.5 font-semibold">Match Hub</th>
                      <th className="py-2.5 font-semibold text-center">Safety Rating Score</th>
                      <th className="py-2.5 font-semibold">Decision Audit Note</th>
                      <th className="py-2.5 font-semibold text-right">Status Tag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {jobs.map((j) => (
                      <tr key={j.id} className="hover:bg-slate-900/40">
                        <td className="py-3 font-mono font-bold text-slate-500">{j.id}</td>
                        <td className="py-3 font-bold text-white max-w-xs truncate">{j.title}</td>
                        <td className="py-3 text-slate-300">{j.employerName}</td>
                        <td className="py-3 text-slate-400">{j.location}</td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                            j.fraudScore >= 75 
                              ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                              : j.fraudScore >= 40 
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}>
                            {j.fraudScore} / 100
                          </span>
                        </td>
                        <td className="py-3 text-slate-400 max-w-xs truncate" title={j.fraudExplanation}>
                          {j.fraudExplanation}
                        </td>
                        <td className="py-3 text-right">
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                            j.status === "verified" 
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" 
                              : "bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse"
                          }`}>
                            {j.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}


        {/* TAB 4: TRAINING & COURSE DIRECTORY */}
        {activeTab === "training" && (
          <div className="space-y-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div className="max-w-3xl mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="text-teal-400" />
                  Rural Capacity Building & NGO Learnerships
                </h3>
                <p className="text-sm text-slate-300 mt-1">
                  When seekers are unlisted for job requirements due to structural training lags, the Career Coach Agent directs them directly to physical workshops near local library pods. Zero computing power or data bundles are required for enrollment!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div key={course.id} className="bg-slate-900 rounded-xl border border-slate-800 p-5 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <span className="bg-slate-850 border border-slate-800 text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded text-indigo-300">
                          {course.id}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{course.duration}</span>
                      </div>

                      <h4 className="text-white font-bold text-sm leading-snug">{course.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-3">{course.description}</p>
                      
                      <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Empowers with Skills:</span>
                        <div className="flex flex-wrap gap-1">
                          {course.skillsTaught.map((skill, index) => (
                            <span key={index} className="text-[9px] bg-slate-900 border border-slate-800/60 text-slate-300 px-1.5 py-0.5 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-850/80 pt-4 mt-4 flex items-center justify-between text-xs text-slate-400">
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase">Provider</span>
                        <span className="text-slate-300 font-semibold">{course.provider}</span>
                      </div>
                      <span className="bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded border border-teal-500/10 text-[10px] font-mono">
                        {course.location}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}


        {/* TAB 5: ADMIN ROOM MODULES */}
        {activeTab === "admin" && (
          <div className="space-y-8">
            
            {/* SYSTEM AUDITING CONSOLE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* SMS Backplane logs */}
              <div className="lg:col-span-8 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="text-teal-400" />
                    <h3 className="text-base font-bold text-white">Live USSD/SMS Backplane Gateway Auditing</h3>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>

                <div className="text-xs text-slate-400">
                  This console lists all incoming interactive requests submitted to the core platform via virtual telco channels. It displays parsed directions and tracks which AI Agents fired during routing.
                </div>

                <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                  {smsLogs.map((log) => {
                    const isOut = log.direction === "outbound";
                    return (
                      <div key={log.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 w-1/3 min-w-[150px]">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                            isOut ? "bg-indigo-500/15 text-indigo-400" : "bg-teal-500/15 text-teal-400"
                          }`}>
                            {log.direction}
                          </span>
                          <div>
                            <span className="font-mono text-xs font-bold text-white block">{log.phoneNumber}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>

                        <div className="text-xs text-slate-300 flex-1 leading-relaxed border-l border-slate-800 pl-4">
                          <p className="font-mono bg-black/40 p-1.5 rounded border border-slate-950 text-[11px] block text-amber-200">
                            {log.text}
                          </p>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                            Action result: <span className="text-slate-200">{log.resolvedAction}</span>
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="block text-[9px] text-slate-500 uppercase font-mono tracking-tight">AI Backplane</span>
                          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-teal-300 font-mono">
                            {log.agentTriggered}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {smsLogs.length === 0 && (
                    <div className="p-8 text-center text-slate-600 bg-slate-900 rounded-xl border border-dashed border-slate-800">
                      No live SMS Logs collected yet in this context. Send simulated SMS text above to populate.
                    </div>
                  )}
                </div>
              </div>

              {/* Admin configuration summary stats */}
              <div className="lg:col-span-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Scaffolding Verification Controls</h4>
                
                <div className="space-y-4">
                  <div className="bg-slate-905 border border-slate-800 p-3.5 rounded-xl space-y-2">
                    <span className="text-xs text-slate-300 font-bold block">Relational Integrity Tracker</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      All seeker registrations, matchings, employer fraud scores, and logs are persisted inside our local Node Express relational DB simulation layer mimicry of PostgreSQL schemas.
                    </p>
                  </div>

                  <div className="bg-slate-905 border border-slate-800 p-3.5 rounded-xl space-y-2">
                    <span className="text-xs text-slate-300 font-bold block">Gemini Model Parameters</span>
                    <div className="text-xs text-slate-400 font-mono space-y-1">
                      <div className="flex justify-between"><span>Model ID:</span><span className="text-teal-400">gemini-3.5-flash</span></div>
                      <div className="flex justify-between"><span>Temperature:</span><span className="text-teal-400">0.2 (low variance)</span></div>
                      <div className="flex justify-between"><span>Response Schema:</span><span className="text-teal-400">Strict JSON</span></div>
                      <div className="flex justify-between"><span>Active Latency:</span><span className="text-teal-400">~240ms</span></div>
                    </div>
                  </div>

                  <button
                    onClick={handleResetSystem}
                    className="w-full bg-red-950/40 text-red-300 border border-red-500/30 hover:bg-red-950/80 p-3.5 rounded-lg text-xs font-semibold cursor-pointer text-center"
                  >
                    🚀 Flush Memory Data & Reset Database
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}


        {/* TAB 6: BLUEPRINTS / ARCHITECTURE SPECS */}
        {activeTab === "blueprints" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Nav folders left */}
            <div className="lg:col-span-3 space-y-2">
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-3">Modular Specifications</span>
                
                <div className="space-y-1.5">
                  <button
                    onClick={() => setActiveBlueprintSubTab("prd")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                      activeBlueprintSubTab === "prd" ? "bg-teal-500 text-slate-950 font-semibold" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> 1. Product PRD</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>

                  <button
                    onClick={() => setActiveBlueprintSubTab("arch")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                      activeBlueprintSubTab === "arch" ? "bg-teal-500 text-slate-950 font-semibold" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <span className="flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" /> 2. System Architecture</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>

                  <button
                    onClick={() => setActiveBlueprintSubTab("db")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                      activeBlueprintSubTab === "db" ? "bg-teal-500 text-slate-950 font-semibold" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <span className="flex items-center gap-1.5"><Database className="h-3.5 w-3.5" /> 3. PostgreSQL Schema</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>

                  <button
                    onClick={() => setActiveBlueprintSubTab("api")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                      activeBlueprintSubTab === "api" ? "bg-teal-500 text-slate-950 font-semibold" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <span className="flex items-center gap-1.5"><Code className="h-3.5 w-3.5" /> 4. REST Specifications</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>

                  <button
                    onClick={() => setActiveBlueprintSubTab("agents")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                      activeBlueprintSubTab === "agents" ? "bg-teal-500 text-slate-950 font-semibold" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <span className="flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5" /> 5. AI Agents Design</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>

                  <button
                    onClick={() => setActiveBlueprintSubTab("ussdflow")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                      activeBlueprintSubTab === "ussdflow" ? "bg-teal-500 text-slate-950 font-semibold" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> 6. SMS & USSD Flows</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>

                  <button
                    onClick={() => setActiveBlueprintSubTab("roadmap")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                      activeBlueprintSubTab === "roadmap" ? "bg-teal-500 text-slate-950 font-semibold" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> 7. MVP Roadmap</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Document display right */}
            <div className="lg:col-span-9 bg-slate-950 p-7 rounded-2xl border border-slate-800 space-y-6 text-slate-200 font-sans max-h-[800px] overflow-y-auto scrollbar-thin">
              
              {/* SUBTAB 1: PRODUCT REQUIREMENTS DOCUMENT */}
              {activeBlueprintSubTab === "prd" && (
                <div className="space-y-4">
                  <span className="text-teal-400 text-xs font-bold font-mono tracking-widest uppercase">Specification Folder 1</span>
                  <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-2.5">
                    Product Requirements Document (PRD) — RuralConnect
                  </h3>
                  
                  <div className="space-y-4 text-xs leading-relaxed">
                    <div>
                      <h4 className="font-bold text-teal-300 text-sm mb-1">1. Introduction & Executive Intent</h4>
                      <p className="text-slate-300">
                        RuralConnect is an AI-powered Skills Extraction, Job Matching, and Opportunity Aggregator ecosystem dedicated to the 70%+ population residing in agrarian communities. Most agricultural opportunities, Jua Kali (artisanal) needs, and village micro-contracts are undocumented; while local youths lack structured resumes or smartphones to access commercial web directories. 
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-teal-300 text-sm mb-1">2. Target Audience Profile</h4>
                      <ul className="list-disc pl-4 space-y-1 text-slate-300">
                        <li>**Job Seekers:** Rural youth, informal laborers, carpenters, bike mechanics, coffeeBerry pickers. Often with feature phones (no web/mobile apps access), expensive data bundles constraints, and low formal literacy.</li>
                        <li>**Employers:** local agrarian owners, crop packaging agents, micro-shop cooperative committees, NGOs running community development learnerships.</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-teal-300 text-sm mb-1">3. Non-Functional Criteria</h4>
                      <ul className="list-disc pl-4 space-y-1 text-slate-300">
                        <li>**Bandwidth-Adaptive UI:** Highly accessible lightweight HTML rendering, icon-based interactions, minimized styling size tags to ensure low byte load over rural edge networks.</li>
                        <li>**Security & Privacy Audit:** Cryptographic GSM authentication locks, phone validation verification tokens, and compliance monitoring preventing fraud patterns.</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                      <h5 className="font-bold text-white mb-1 uppercase tracking-wider text-[10px]">Key Performance Indicators (KPIs)</h5>
                      <p className="text-[11px] text-slate-400">
                        - 90%+ Skill Extraction alignment checked against direct expert reviews.<br />
                        - Less than 5-seconds feedback loop latency over standard USSD channels.<br />
                        - 100% of upfront-payment job scams automatically audited and quarantined.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 2: SYSTEM ARCHITECTURE */}
              {activeBlueprintSubTab === "arch" && (
                <div className="space-y-4">
                  <span className="text-teal-400 text-xs font-bold font-mono tracking-widest uppercase">Specification Folder 2</span>
                  <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-2.5">System Architecture Architecture Blueprint</h3>

                  {/* VISUAL ASCII/CSS FLOWCHART FLOW */}
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-[11px] font-mono whitespace-pre overflow-x-auto text-slate-300">
{`   [FEATURE PHONES / LOW-TECH USERS]      [SMARTPHONE / BULK COOP USERS]
              │                                      │
              ▼ USSD / SMS Protocols                 ▼ Web UI Portals
     ┌──────────────────────────────────┐   ┌──────────────────────────────────┐
     │      Africa's Talking Gateway    │   │         Vite / React SPA         │
     └──────────────── ┬────────────────┘   └───────────────── ┬───────────────┘
                       │                                       │
                       ▼ Real Telco Webhooks (/api/sms, ussd)  ▼ JSON payloads
     ┌─────────────────────────────────────────────────────────────────────────┐
     │                         Express API Web Service                         │
     │                      (Unified Route Validation Layers)                  │
     └──────────────── ┬───────────────────────────────────────┬───────────────┘
                       │                                       │
                       ▼ Queue Scheduling                      ▼ Query State Updates
     ┌──────────────────────────────────┐   ┌──────────────────────────────────┐
     │     Celery & Redis Brokers       │   │    Google Cloud SQL Database     │
     │   (Match Calculations Worker)    │   │        (PostgreSQL Instance)     │
     └─────────────────┬────────────────┘   └──────────────────────────────────┘
                       │
                       ▼ Core System Prompts / Tools Calling
     ┌─────────────────────────────────────────────────────────────────────────┐
     │        AI Agentic Layer: @google/genai SDK on gemini-3.5-flash          │
     │   - Agent-1 (Skills)   - Agent-2 (Matcher)   - Agent-3 (Career Coach)   │
     │   - Agent-4 (Scam Intel)                     - Agent-5 (Comms Simpl)    │
     └─────────────────────────────────────────────────────────────────────────┘`}
                  </div>

                  <div className="text-xs space-y-2 leading-relaxed">
                    <p className="font-bold text-teal-300 text-sm">Design Pipeline Breakdown</p>
                    <p>
                      The system decoupled SMS/USSD state handling from real-time AI logic. Because raw AI queries can have fluctuating latencies (200ms - 2.5s), immediate SMS requests are written to the database first, triggers queues via worker daemons, and schedules outbound message updates over cellular SMS APIs dynamically.
                    </p>
                  </div>
                </div>
              )}

              {/* SUBTAB 3: DATABASE SCHEMA (POSTGRESQL SPEC) */}
              {activeBlueprintSubTab === "db" && (
                <div className="space-y-4">
                  <span className="text-teal-400 text-xs font-bold font-mono tracking-widest uppercase">Specification Folder 3</span>
                  <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-2.5">PostgreSQL Database Schema Designs</h3>
                  
                  <div className="text-xs text-slate-400">
                    Industrial, normalized PostgreSQL table schema script containing necessary indexes, keys, and spatial geography scopes targeting optimized queries.
                  </div>

                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-[11px] font-mono whitespace-pre overflow-x-auto text-cyan-200">
{`-- SQL Database Script for RuralConnect PostgreSQL
-- Ensures clean relational bounds and spatial queries for local villages

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Users table (Seekers/Admins/Employers)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(16) UNIQUE NOT NULL check (phone_number ~ '^\\+?[0-9]{10,15}$'),
    full_name VARCHAR(128) NOT NULL,
    village_location VARCHAR(128) NOT NULL,
    geog GEOGRAPHY(Point, 4326), -- Geospatial indexing for distance queries
    preferred_language VARCHAR(16) DEFAULT 'English' NOT NULL,
    user_role VARCHAR(16) DEFAULT 'seeker' NOT NULL CHECK (user_role IN ('seeker', 'employer', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Skills Taxonomy Table
CREATE TABLE skills_parsed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seeker_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    skill_keyword VARCHAR(64) NOT NULL,
    confidence_score DECIMAL(5,2) DEFAULT 1.00 CHECK (confidence_score BETWEEN 0 AND 1),
    extracted_by_agent VARCHAR(32) DEFAULT 'skills-agent' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Jobs/Opportunities Postings Table
CREATE TABLE jobs_postings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(128) NOT NULL,
    employer_name_raw VARCHAR(128) NOT NULL,
    job_description TEXT NOT NULL,
    skills_required TEXT[] NOT NULL,
    location_hub VARCHAR(128) NOT NULL,
    salary_range VARCHAR(64),
    status VARCHAR(16) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'verified', 'suspect')),
    fraud_score INTEGER CHECK (fraud_score BETWEEN 0 AND 100),
    fraud_explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Job Applications table
CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs_postings(id) ON DELETE CASCADE NOT NULL,
    seeker_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(16) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'shortlisted', 'reviewed', 'rejected')),
    match_score INTEGER CHECK (match_score BETWEEN 0 AND 100),
    match_explanation TEXT,
    applied_source VARCHAR(8) NOT NULL CHECK (applied_source IN ('web', 'sms', 'ussd')),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(job_id, seeker_id)
);

-- 5. Outbound / Inbound SMS Messaging System logs
CREATE TABLE sms_system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(16) NOT NULL,
    message_body TEXT NOT NULL,
    direction VARCHAR(8) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    resolved_action VARCHAR(128),
    agent_triggered VARCHAR(64),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Optimal Indices for fast mobile lookups
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_skills_raw ON skills_parsed(skill_keyword);
CREATE INDEX idx_jobs_status_location ON jobs_postings(status, location_hub);
CREATE INDEX idx_spatial_users_geog ON users USING GIST(geog);`}
                  </div>
                </div>
              )}

              {/* SUBTAB 4: REST API SPECIFICATION */}
              {activeBlueprintSubTab === "api" && (
                <div className="space-y-4">
                  <span className="text-teal-400 text-xs font-bold font-mono tracking-widest uppercase">Specification Folder 4</span>
                  <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-2.5">
                    Unified REST API & Gateway Specifications
                  </h3>

                  <div className="space-y-4 text-xs font-sans">
                    <div className="border border-slate-800 rounded-xl bg-slate-900/60 p-4">
                      <span className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase">POST</span>
                      <code className="text-white font-mono font-bold text-xs ml-2">/api/ussd</code>
                      <p className="text-slate-400 mt-2 text-[11px]">Telephony telco interface triggered by cell tower USSD dial string routing.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div className="bg-black/50 p-2.5 rounded font-mono text-[10px] text-slate-300">
                          <strong>Request Pay:<br /></strong>
                          {`{
  "phoneNumber": "+254711223344",
  "text": "1*John Mwangi*Machakos",
  "sessionId": "AT-SES-492"
}`}
                        </div>
                        <div className="bg-black/50 p-2.5 rounded font-mono text-[10px] text-teal-300">
                          <strong>Returns PlainText:<br /></strong>
                          {`CON Step 3/3: Describe informal experience (e.g. I fix motorcycles and harvest crops):`}
                        </div>
                      </div>
                    </div>

                    <div className="border border-slate-800 rounded-xl bg-slate-900/60 p-4">
                      <span className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase">POST</span>
                      <code className="text-white font-mono font-bold text-xs ml-2">/api/sms/inbound</code>
                      <p className="text-slate-400 mt-2 text-[11px]">Inbound webhook triggering instant action execution logs.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div className="bg-black/50 p-2.5 rounded font-mono text-[10px] text-slate-300">
                          <strong>Request Pay:<br /></strong>
                          {`{
  "phoneNumber": "+254711223344",
  "text": "JOBS"
}`}
                        </div>
                        <div className="bg-black/50 p-2.5 rounded font-mono text-[10px] text-teal-300">
                          <strong>Returns JSON Reply:<br /></strong>
                          {`{
  "reply": "Jobs in Machakos: \\n1. Tractor Hand at Agro-Services Ltd (95% Fit)"
}`}
                        </div>
                      </div>
                    </div>

                    <div className="border border-slate-800 rounded-xl bg-slate-900/60 p-4">
                      <span className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase">POST</span>
                      <code className="text-white font-mono font-bold text-xs ml-2">/api/seekers</code>
                      <p className="text-slate-400 mt-2 text-[11px]">Web portal candidate enrollment. Initiates core Agent 1 skills parser.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 5: AGENT ORCHESTRATION PIPELINE */}
              {activeBlueprintSubTab === "agents" && (
                <div className="space-y-4">
                  <span className="text-teal-400 text-xs font-bold font-mono tracking-widest uppercase">Specification Folder 5</span>
                  <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-2.5">
                    Multi-Agent AI Architecture (LangGraph Schema)
                  </h3>

                  <div className="space-y-4 text-xs leading-relaxed text-slate-300">
                    <p>
                      Rather than placing the system into a single bloated LLM prompt, RuralConnect executes a micro-orchestration grid. This protects accuracy, restricts token leakages, and enables safe fail-safes on mobile formats.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <strong className="text-teal-400 font-mono block text-xs">Agent-1: Skills Extractor</strong>
                        <p className="text-[11px] mt-1 text-slate-400">
                          **Prompt Scope:** Analyzes raw Swahili/English/unstructured text inputs. Cross references with the agrarian skills glossary. Excludes adjectives. Returns strict JSON.
                        </p>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <strong className="text-teal-400 font-mono block text-xs">Agent-2: Compatibility Matcher</strong>
                        <p className="text-[11px] mt-1 text-slate-400">
                          **Prompt Scope:** Intersects decoupled items matching coordinates. Measures structural fit scores. Translates complex job posts back to the seeker.
                        </p>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <strong className="text-teal-400 font-mono block text-xs">Agent-4: Fraud Intel Scanner</strong>
                        <p className="text-[11px] mt-1 text-slate-400">
                          **Prompt Scope:** Scans job postings. Pinpoints scams/lotteries/upfront pay requirements. Suspends matches. Prompts reviews quickly.
                        </p>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <strong className="text-teal-400 font-mono block text-xs">Agent-5: Comms Simplifier</strong>
                        <p className="text-[11px] mt-1 text-slate-400">
                          **Prompt Scope:** Takes structured technical summaries. Condenses and translates to simplified phrasing suitable for KES/Kiswahili standards. Maximum 140 characters.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 6: SMS & USSD FLOW DIAGRAM */}
              {activeBlueprintSubTab === "ussdflow" && (
                <div className="space-y-4">
                  <span className="text-teal-400 text-xs font-bold font-mono tracking-widest uppercase">Specification Folder 6</span>
                  <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-2.5">
                    Interactive SMS & USSD Network State Flows
                  </h3>

                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-[11px] font-mono whitespace-pre overflow-x-auto text-yellow-100">
{`                        Dial *123#
                            │
                            ▼
                    Registered Check?
                    /               \\
            Yes    /                 \\   No
                  /                   \\
                 ▼                     ▼
         Home Menu (CON)        Register Invitation (CON)
         1. Find Jobs           1. Enter Name
         2. My Applications     2. Learn How and Benefits
         3. Free Courses        3. Exit (END)
         4. Profile Details     
         5. Exit (END)                 │
                                       ▼ Step 2
                                Enter Location (CON)
                                       │
                                       ▼ Step 3
                                Describe Skills (CON)
                                       │
                                       ▼ 
                                Run AI Extracted Skills
                                Send Welcome SMS Auto (Agent-5)
                                Save Seeker (END)`}
                  </div>
                </div>
              )}

              {/* SUBTAB 7: MVP 1.0 ROADMAP (4-6 WEEKS) */}
              {activeBlueprintSubTab === "roadmap" && (
                <div className="space-y-4">
                  <span className="text-teal-400 text-xs font-bold font-mono tracking-widest uppercase">Specification Folder 7</span>
                  <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-2.5">
                    MVP 1.0 Pilot Release Roadmap & Scaling Sprints
                  </h3>

                  <div className="space-y-4 text-xs text-slate-300">
                    <div className="flex items-start gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="p-1 px-2.5 bg-teal-500 text-slate-950 font-bold font-mono rounded">Sprint 1</span>
                      <div>
                        <strong className="block text-white">Week 1-2: PostgreSQL Setup & SMS/USSD Webhooks integration</strong>
                        <p className="text-slate-400 mt-1">Configuring cloud databases. Binding SMS triggers and USSD code routes on Africa's Talking API systems.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="p-1 px-2.5 bg-teal-500 text-slate-950 font-bold font-mono rounded">Sprint 2</span>
                      <div>
                        <strong className="block text-white">Week 3-4: Multi-Agent prompts testing & Compliance Audits validation</strong>
                        <p className="text-slate-400 mt-1">Auditing real-time skill extraction alignment using Gemini models against agrarian workshops profiles.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="p-1 px-2.5 bg-teal-500 text-slate-950 font-bold font-mono rounded">Sprint 3</span>
                      <div>
                        <strong className="block text-white">Week 5-6: Local Ward Pilots rollout (Machakos/Kitui District pods)</strong>
                        <p className="text-slate-400 mt-1">Acquiring dedicated SIM towers. Organizing community cooperative pilots. Deploying the local staff portals.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </main>

      {/* RURALCONNECT BRAND FOOTER */}
      <footer id="rc-app-footer-bar" className="border-t border-slate-800 bg-slate-950/80 py-8 text-center text-xs text-slate-500 mt-12">
        <p className="font-semibold text-slate-300 mb-1">RURALCONNECT WORKSPACE PANEL</p>
        <p className="mb-4">Crafted with high-contrast UI for rural, offline cell environments. Persisted on sandbox PostgreSQL memory.</p>
        <p>© 2026 RuralConnect Inc. All rights reserved.</p>
      </footer>

    </div>
  );
}
