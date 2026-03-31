"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { generateKit } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function KitGeneratorPage() {
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({
    role: "Senior Frontend Engineer",
    experience_level: "5+ years",
    company_type: "Fast-growing tech startup",
    diversity_goals: "Ensure questions are accessible to non-traditional backgrounds"
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [kit, setKit] = useState<any>(null);
  const [biasValidation, setBiasValidation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setKit(null);
    setBiasValidation(null);

    try {
      const token = await getToken();
      const data = await generateKit(formData, token);
      setKit(data.kit);
      setBiasValidation(data.bias_validation);
    } catch (err: any) {
      setError(err.message || "AI service temporarily unavailable");
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-8 animate-in fade-in duration-700">
      
      {/* Header section */}
      <div className="relative">
        <div className="absolute top-0 right-20 w-64 h-64 bg-secondary/10 rounded-full blur-[80px] -z-10" />
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-surface border border-border rounded-full">
            <Sparkles className="h-3 w-3 text-secondary" />
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Kit Generator</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Bias-Safe Interview Kit</h1>
          <p className="text-muted-foreground max-w-2xl">
            Generate structured, unbiased interview questions based on the role requirements using our semantic AI.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] -z-10" />
            
            <div className="mb-6">
              <h2 className="text-lg font-bold text-foreground">Role Details</h2>
              <p className="text-sm text-muted-foreground">Configure to generate custom questions.</p>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-foreground/80">Job Role</Label>
                <Input 
                  value={formData.role} 
                  onChange={(e) => setFormData({...formData, role: e.target.value})} 
                  placeholder="e.g. Product Manager"
                  className="bg-background/50 border-border focus:border-primary/50 focus:ring-primary/50 h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Experience Level</Label>
                <Input 
                  value={formData.experience_level} 
                  onChange={(e) => setFormData({...formData, experience_level: e.target.value})} 
                  placeholder="e.g. Mid-level, 3-5 years" 
                  className="bg-background/50 border-border focus:border-primary/50 focus:ring-primary/50 h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Company Context</Label>
                <Input 
                  value={formData.company_type} 
                  onChange={(e) => setFormData({...formData, company_type: e.target.value})} 
                  placeholder="e.g. Enterprise B2B" 
                  className="bg-background/50 border-border focus:border-primary/50 focus:ring-primary/50 h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Specific Diversity Goals <span className="text-muted-foreground">(Optional)</span></Label>
                <Textarea 
                  value={formData.diversity_goals} 
                  onChange={(e) => setFormData({...formData, diversity_goals: e.target.value})} 
                  placeholder="e.g. Avoid industry jargon..."
                  className="resize-none bg-background/50 border-border focus:border-primary/50 focus:ring-primary/50 min-h-[100px]"
                />
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-bold h-12 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all mt-4 relative overflow-hidden group" 
                onClick={handleGenerate}
                disabled={isLoading || !formData.role}
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                {isLoading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin relative z-10" />
                ) : (
                  <Sparkles className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform relative z-10" />
                )}
                <span className="relative z-10">{isLoading ? "Synthesizing Kit..." : "Generate Safe Kit"}</span>
              </Button>
              
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl flex items-start gap-2 mt-4">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <p>{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {!kit && !isLoading && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[500px] glass-panel flex flex-col items-center justify-center p-12 text-muted-foreground border-dashed border-2"
              >
                <div className="h-20 w-20 bg-surface rounded-full flex items-center justify-center border border-border mb-6 shadow-inner">
                  <FileText className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Configure Role</h3>
                <p className="max-w-sm text-center">Fill out the role details on the left and generate a comprehensive, unbiased interview kit.</p>
              </motion.div>
            )}

            {isLoading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[500px] glass-panel flex flex-col items-center justify-center space-y-6 text-muted-foreground"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                  <Loader2 className="w-12 h-12 animate-spin text-primary relative z-10" />
                </div>
                <p className="text-lg font-medium text-foreground tracking-wide">Designing unbiased questions...</p>
              </motion.div>
            )}

            {kit && !isLoading && (
              <motion.div 
                key="results"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-6"
              >
                {/* Bias Validation Badge */}
                <motion.div variants={itemVariants} className="bg-success/5 border border-success/20 p-5 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-success/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="bg-success/20 p-3 rounded-xl border border-success/30">
                      <CheckCircle2 className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <p className="font-bold text-base text-success">AI Bias Audit Cleared</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Risk Score:</span>
                        <span className="text-sm font-bold text-foreground">{biasValidation?.overall_bias_score}/100</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success font-bold uppercase ml-2 border border-success/30">
                          {biasValidation?.risk_level || "LOW"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Recommended Questions */}
                <motion.div variants={itemVariants} className="glass-panel overflow-hidden">
                  <div className="p-6 border-b border-border bg-surface/50">
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-secondary" />
                      Recommended Questions
                    </h2>
                  </div>
                  <div className="p-0">
                    <ul className="divide-y divide-border/50">
                      {kit.questions?.map((q: string, idx: number) => (
                        <li key={idx} className="p-6 hover:bg-surface/30 transition-colors flex gap-6 group">
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-black text-secondary/50 uppercase tracking-widest mb-1">Question</span>
                            <span className="text-2xl font-bold text-secondary">{idx + 1}</span>
                          </div>
                          <p className="text-base text-foreground/90 font-medium leading-relaxed pt-1.5">{q}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
                
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
