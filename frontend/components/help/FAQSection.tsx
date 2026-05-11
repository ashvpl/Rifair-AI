"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How does AI interview evaluation work?",
    answer: "Our AI analyzes interview transcripts and audio to detect potential biases, evaluate candidate responses against job requirements, and provide objective scores based on predefined criteria.",
  },
  {
    question: "Can recruiters invite candidates?",
    answer: "Yes, recruiters can easily invite candidates via email or shareable links. Candidates can then complete their interviews on our platform at their convenience.",
  },
  {
    question: "How do subscriptions work?",
    answer: "We offer various tiers based on your needs—from individual recruiters to large enterprises. Each plan includes a specific number of analyses and seats.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Absolutely. You can cancel or change your subscription at any time from your billing dashboard. Your access will remain active until the end of your current billing cycle.",
  },
  {
    question: "Is interview data secure?",
    answer: "Security is our top priority. All data is encrypted both at rest and in transit. We are SOC2 compliant and follow strict GDPR guidelines to ensure candidate privacy.",
  },
  {
    question: "How quickly can I get support?",
    answer: "Our standard response time is within 24 hours. Enterprise customers have access to priority support with guaranteed response times under 4 hours.",
  },
];

const AccordionItem = ({ question, answer, isOpen, onClick }: { question: string, answer: string, isOpen: boolean, onClick: () => void }) => {
  return (
    <div className="border-b border-border/50 overflow-hidden">
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left group transition-all"
      >
        <span className="text-lg font-medium group-hover:text-primary transition-colors">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
    <section className="max-w-4xl mx-auto px-6 py-24 space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Frequently Asked Questions</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
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
