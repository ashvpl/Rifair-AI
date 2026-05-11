"use client";

import React from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

export const SupportForm = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="p-8 md:p-10 rounded-3xl bg-white/5 backdrop-blur-sm border border-border/50 space-y-8"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Send us a message</h2>
        <p className="text-muted-foreground">Our team typically responds within 24 hours.</p>
      </div>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-muted-foreground ml-1">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              className="w-full h-12 px-4 bg-background/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-muted-foreground ml-1">Work Email</label>
            <input
              id="email"
              type="email"
              placeholder="john@company.com"
              className="w-full h-12 px-4 bg-background/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="company" className="text-sm font-medium text-muted-foreground ml-1">Company (optional)</label>
            <input
              id="company"
              type="text"
              placeholder="Acme Corp"
              className="w-full h-12 px-4 bg-background/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium text-muted-foreground ml-1">Subject</label>
            <select
              id="subject"
              className="w-full h-12 px-4 bg-background/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-foreground/80 appearance-none"
            >
              <option value="technical">Technical Issue</option>
              <option value="billing">Billing Question</option>
              <option value="enterprise">Enterprise Inquiry</option>
              <option value="feature">Feature Request</option>
              <option value="bug">Bug Report</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium text-muted-foreground ml-1">Message</label>
          <textarea
            id="message"
            rows={5}
            placeholder="How can we help you today?"
            className="w-full p-4 bg-background/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40 resize-none"
          />
        </div>

        <button
          type="submit"
          className="group relative w-full h-14 bg-primary text-primary-foreground font-semibold rounded-xl overflow-hidden shadow-lg hover:shadow-primary/20 transition-all"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10 flex items-center justify-center gap-2">
            Send Message
            <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </span>
        </button>
      </form>
    </motion.div>
  );
};
