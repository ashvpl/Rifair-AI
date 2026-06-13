"use client";

import { WorkflowBuilderInput } from "@/lib/workflows/types";
import { Code, DollarSign, Megaphone, Users2, Headphones, Sparkles, Layers } from "lucide-react";
import { motion } from "framer-motion";

interface TemplateItem {
  id: string;
  name: string;
  icon: any;
  config: Partial<WorkflowBuilderInput>;
}

const TEMPLATES: TemplateItem[] = [
  {
    id: "frontend-dev",
    name: "Frontend Software Engineer",
    icon: Code,
    config: {
      roleTitle: "Frontend Software Engineer",
      seniorityLevel: "Senior",
      department: "Engineering",
      employmentType: "Full-time",
      mustHaveSkills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "State Management (Redux/Zustand)"],
      niceHaveSkills: ["GraphQL", "CI/CD pipelines", "Framer Motion", "Core Web Vitals optimization"],
      interviewTypes: ["Resume Screen", "Technical Phone Screen", "Coding Assessment", "System Design & Architecture", "Behavioral & Culture Fit"],
      evaluationFocus: ["Problem Solving", "Technical Execution", "Communication", "System Design", "Collaboration"],
    }
  },
  {
    id: "pm",
    name: "Product Manager",
    icon: Sparkles,
    config: {
      roleTitle: "Product Manager",
      seniorityLevel: "Mid-level",
      department: "Product",
      employmentType: "Full-time",
      mustHaveSkills: ["Roadmap Planning", "User Research", "Agile/Scrum", "Data Analytics (SQL/Mixpanel)", "PRD writing"],
      niceHaveSkills: ["Basic technical background", "A/B testing", "Product-led growth experience"],
      interviewTypes: ["Resume Screen", "Hiring Manager Screen", "Product Sense & Case Study", "Analytical & Execution Interview", "Behavioral & Culture Fit"],
      evaluationFocus: ["Strategic Thinking", "Communication", "Analytical Execution", "Stakeholder Alignment", "Leadership"],
    }
  },
  {
    id: "sdr",
    name: "Sales Development Rep",
    icon: DollarSign,
    config: {
      roleTitle: "Sales Development Representative (SDR)",
      seniorityLevel: "Junior",
      department: "Sales",
      employmentType: "Full-time",
      mustHaveSkills: ["Outbound Prospecting", "Cold Calling", "CRM (Hubspot/Salesforce)", "Email Outreach", "Active Listening"],
      niceHaveSkills: ["B2B SaaS Sales experience", "LinkedIn Sales Navigator", "Negotiation skills"],
      interviewTypes: ["Resume Screen", "Sales Roleplay / Pitch Assessment", "Cognitive & Adaptability Interview", "Behavioral & Culture Fit"],
      evaluationFocus: ["Communication", "Resilience & Grit", "Coachability", "Product Curiosity", "Goal Orientation"],
    }
  },
  {
    id: "marketing-mgr",
    name: "Growth Marketing Manager",
    icon: Megaphone,
    config: {
      roleTitle: "Growth Marketing Manager",
      seniorityLevel: "Mid-level",
      department: "Marketing",
      employmentType: "Full-time",
      mustHaveSkills: ["SEO / SEM", "Paid Acquisition (Meta/Google Ads)", "Copywriting", "Marketing Analytics", "Email Campaigns"],
      niceHaveSkills: ["Webflow/HTML basics", "Video production editing", "Community building"],
      interviewTypes: ["Resume Screen", "Marketing Case Study Interview", "Execution & Tooling Interview", "Behavioral & Culture fit"],
      evaluationFocus: ["Analytical Execution", "Creativity", "Communication", "Prioritization", "Collaboration"],
    }
  },
  {
    id: "customer-support",
    name: "Customer Support Executive",
    icon: Headphones,
    config: {
      roleTitle: "Customer Support Specialist",
      seniorityLevel: "Junior",
      department: "Customer Success",
      employmentType: "Full-time",
      mustHaveSkills: ["Helpdesk Tooling (Zendesk/Intercom)", "Written Communication", "Empathy & Patience", "Conflict Resolution", "Ticketing & Triage"],
      niceHaveSkills: ["Technical troubleshooting", "Multilingual support", "Knowledge Base writing"],
      interviewTypes: ["Resume Screen", "Email Ticket Roleplay Walkthrough", "Live Call Simulation Interview", "Behavioral & Culture Fit"],
      evaluationFocus: ["Empathy", "Communication", "Problem Solving", "Patience & Composure", "Customer-First Mindset"],
    }
  },
  {
    id: "hr-ops",
    name: "Talent Acquisition Specialist",
    icon: Users2,
    config: {
      roleTitle: "Talent Acquisition Specialist",
      seniorityLevel: "Mid-level",
      department: "Human Resources",
      employmentType: "Full-time",
      mustHaveSkills: ["Candidate Sourcing", "ATS Management", "Screening Interviews", "Employer Branding", "Offer Negotiation"],
      niceHaveSkills: ["Diversity & Inclusion recruiting", "Technical hiring background", "Data-driven HR metrics"],
      interviewTypes: ["Resume Screen", "Sourcing Assessment Case Study", "Structured Screening Interview Simulation", "Behavioral & Culture Fit"],
      evaluationFocus: ["Communication", "Stakeholder Alignment", "Empathy", "Negotiation", "Collaboration"],
    }
  }
];

interface TemplatePickerProps {
  onSelectTemplate: (config: Partial<WorkflowBuilderInput>) => void;
}

export function WorkflowTemplatePicker({ onSelectTemplate }: TemplatePickerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-[#86868B]" />
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#86868B]">
          Prefill with template
        </h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {TEMPLATES.map((tpl, i) => {
          const Icon = tpl.icon;
          return (
            <motion.button
              key={tpl.id}
              onClick={() => onSelectTemplate(tpl.config)}
              type="button"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-black/[0.08] bg-white hover:bg-[#F5F5F7]/30 hover:border-black/25 active:scale-95 transition-all text-center space-y-2.5 h-32 group"
            >
              <div className="w-10 h-10 rounded-full bg-slate-50 border border-black/[0.04] flex items-center justify-center group-hover:bg-primary/5 group-hover:border-primary/10 transition-colors">
                <Icon className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
              </div>
              <span className="text-[11px] font-black text-gray-800 leading-snug group-hover:text-black">
                {tpl.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
