import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle2 } from "lucide-react";

export const SupportForm = () => {
  const [form, setForm] = useState({
    full_name: '',
    work_email: '',
    company: '',
    subject: 'Technical Issue',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.full_name || !form.work_email || !form.message) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong');
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 md:p-12 rounded-3xl bg-white/5 backdrop-blur-sm border border-border/50 text-center space-y-6 py-20"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Message Sent!</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            We've received your message and sent a confirmation to <span className="text-foreground font-medium">{form.work_email}</span>. 
            We'll reply within 24 hours.
          </p>
        </div>
        <button
          onClick={() => setSubmitted(false)}
          className="text-sm font-medium text-primary hover:underline"
        >
          Send another message
        </button>
      </motion.div>
    );
  }

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

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-muted-foreground ml-1">Full Name</label>
            <input
              id="name"
              type="text"
              required
              placeholder="John Doe"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full h-12 px-4 bg-background/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-muted-foreground ml-1">Work Email</label>
            <input
              id="email"
              type="email"
              required
              placeholder="john@company.com"
              value={form.work_email}
              onChange={(e) => setForm({ ...form, work_email: e.target.value })}
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
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="w-full h-12 px-4 bg-background/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium text-muted-foreground ml-1">Subject</label>
            <select
              id="subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full h-12 px-4 bg-background/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-foreground/80 appearance-none"
            >
              <option value="Technical Issue">Technical Issue</option>
              <option value="Billing Question">Billing Question</option>
              <option value="Enterprise Inquiry">Enterprise Inquiry</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Bug Report">Bug Report</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium text-muted-foreground ml-1">Message</label>
          <textarea
            id="message"
            rows={5}
            required
            placeholder="How can we help you today?"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full p-4 bg-background/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40 resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 ml-1">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group relative w-full h-14 bg-primary text-primary-foreground font-semibold rounded-xl overflow-hidden shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? 'Sending...' : 'Send Message'}
            {!loading && <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
          </span>
        </button>
      </form>
    </motion.div>
  );
};

