"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What exactly does Rifair AI do?",
    answer: "Rifair AI is an advanced hiring intelligence platform designed to eliminate unconscious bias from the recruitment process. Our AI engine analyzes interview questions and job descriptions to detect subtle signals of bias—whether gender-based, cultural, or age-related—and provides actionable rewrites to ensure a fair and skills-first evaluation.",
  },
  {
    question: "How does the AI analysis engine work?",
    answer: "Our engine doesn't just block bad questions; it fundamentally rebuilds them. It identifies non-inclusive language and 'trick' questions, then suggests alternatives that focus purely on core competencies and behavioral skills, ensuring every candidate is judged on merit alone.",
  },
  {
    question: "What tools are included in the Rifair suite?",
    answer: "The Rifair suite includes a JD Analyser for building inclusive job descriptions, a Candidate Evaluation tool for skills-based assessment, and an Interview Question Analyzer. All tools are integrated into a centralized dashboard with history tracking and bias-trend analysis.",
  },
  {
    question: "How do the different subscription plans work?",
    answer: "We offer three main tiers: Free (for basic analysis), Starter (for growing teams), and Growth (for scaling hiring operations). Each plan increases the number of monthly analyses, kit generations, and provides more advanced features like custom branding and priority support.",
  },
  {
    question: "Is our interview and candidate data secure?",
    answer: "Security is built into our core. We use enterprise-grade encryption (AES-256) for all data at rest and in transit. We strictly adhere to global privacy standards and never sell candidate data to third parties.",
  },
  {
    question: "How can I get in touch with the support team?",
    answer: "You can submit a ticket directly through the support form on this page, or email us at support@rifairai.com. Our team typically responds within 24 hours to ensure your hiring process remains uninterrupted.",
  },
];

const AccordionItem = ({ question, answer, isOpen, onClick }: { question: string, answer: string, isOpen: boolean, onClick: () => void }) => {
  return (
    <div className="border-b border-border/50 overflow-hidden">
      <button
        onClick={onClick}
        className="w-full py-4 flex items-center justify-between text-left group transition-all"
      >
        <span className="text-base sm:text-lg font-medium group-hover:text-primary transition-colors">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as any }}
          className="text-muted-foreground group-hover:text-primary"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as any }}
          >
            <div className="pb-6 text-muted-foreground leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-24 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Quick answers to common questions about Rifair AI.
        </p>
      </div>

      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <AccordionItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === index}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </section>
  );
};
