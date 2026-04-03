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
    <div className="max-w-6xl mx-auto space-y-12 py-8 animate-in fade-in duration-1000 pb-20">
      
      {/* Header section */}
      <div className="relative">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-2 bg-[#F5F5F7] border border-black/[0.03] rounded-full">
            <Sparkles className="h-3 w-3 text-secondary" />
            <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Strategy Lab</span>
          </div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Structured Interview Kits</h1>
          <p className="text-[#86868B] max-w-2xl text-lg font-medium">
            Generate high-precision, unbiased interview frameworks synchronized with role-specific requirements.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Form Section */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white border border-black/[0.05] p-10 rounded-[3rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] relative overflow-hidden transition-all duration-500 hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
            
            <div className="mb-10">
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Role Definitions</h2>
              <p className="text-sm font-medium text-[#86868B] mt-1">Prime the engine for localized expertise.</p>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.1em] ml-1">Target Designation</Label>
                <Input 
                  value={formData.role} 
                  onChange={(e) => setFormData({...formData, role: e.target.value})} 
                  placeholder="e.g. Lead Machine Learning Engineer"
                  className="bg-[#F5F5F7]/30 border-black/[0.05] focus:border-black/[0.1] focus:ring-4 focus:ring-black/5 h-14 rounded-2xl transition-all font-semibold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.1em] ml-1">Seniority Tier</Label>
                <Input 
                  value={formData.experience_level} 
                  onChange={(e) => setFormData({...formData, experience_level: e.target.value})} 
                  placeholder="e.g. Tier 4, 7-10 years" 
                  className="bg-[#F5F5F7]/30 border-black/[0.05] focus:border-black/[0.1] focus:ring-4 focus:ring-black/5 h-14 rounded-2xl transition-all font-semibold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.1em] ml-1">Organizational Archetype</Label>
                <Input 
                  value={formData.company_type} 
                  onChange={(e) => setFormData({...formData, company_type: e.target.value})} 
                  placeholder="e.g. Series B High-Growth" 
                  className="bg-[#F5F5F7]/30 border-black/[0.05] focus:border-black/[0.1] focus:ring-4 focus:ring-black/5 h-14 rounded-2xl transition-all font-semibold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.1em] ml-1">Strategic Constraints <span className="text-black/20 italic">(Optional)</span></Label>
                <Textarea 
                  value={formData.diversity_goals} 
                  onChange={(e) => setFormData({...formData, diversity_goals: e.target.value})} 
                  placeholder="e.g. Eliminate domain-specific linguistic barriers..."
                  className="resize-none bg-[#F5F5F7]/30 border-black/[0.05] focus:border-black/[0.1] focus:ring-4 focus:ring-black/5 min-h-[120px] rounded-2xl transition-all font-semibold p-4"
                />
              </div>
              
              <Button 
                className="w-full bg-black hover:bg-black/90 text-white font-heavy h-14 rounded-full shadow-xl transition-all mt-6 active:scale-95 group overflow-hidden" 
                onClick={handleGenerate}
                disabled={isLoading || !formData.role}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5 mr-3 group-hover:scale-125 transition-transform" />
                )}
                <span className="font-extrabold text-base tracking-tight">{isLoading ? "Synthesizing Framework..." : "Generate Master Kit"}</span>
              </Button>
              
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-danger/5 border border-danger/10 text-danger text-sm rounded-2xl flex items-start gap-3 mt-6 shadow-sm">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <p className="font-bold tracking-tight">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            {!kit && !isLoading && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[500px] bg-white border border-black/[0.05] flex flex-col items-center justify-center p-16 text-[#86868B] border-dashed rounded-[3.5rem] shadow-[inset_0_8px_32px_rgba(0,0,0,0.01)]"
              >
                <div className="h-24 w-24 bg-[#F5F5F7] rounded-full flex items-center justify-center border border-black/[0.03] mb-8 shadow-inner">
                  <FileText className="w-10 h-10 text-black/10" />
                </div>
                <h3 className="text-2xl font-extrabold text-foreground mb-3">System Idle</h3>
                <p className="max-w-xs text-center font-medium leading-relaxed">Configure the matrix parameters on the left to synthesize a comprehensive, multi-layer interview framework.</p>
              </motion.div>
            )}

            {isLoading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[500px] bg-white border border-black/[0.05] rounded-[3.5rem] flex flex-col items-center justify-center space-y-8 shadow-[0_4px_32px_rgba(0,0,0,0.02)]"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                  <Loader2 className="w-16 h-16 animate-spin text-primary relative z-10" />
                </div>
                <p className="text-xl font-extrabold text-foreground tracking-tight">Neutralizing Bias Patterns...</p>
              </motion.div>
            )}

            {kit && !isLoading && (
              <motion.div 
                key="results"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-8"
              >
                {/* Bias Validation Badge */}
                <motion.div variants={itemVariants} className="bg-success/[0.03] border border-success/10 p-8 rounded-[2.5rem] flex items-center justify-between shadow-sm relative overflow-hidden group">
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="bg-success text-white p-4 rounded-3xl shadow-lg shadow-success/20">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="font-extrabold text-2xl text-success tracking-tight">AI Compliance Protocol Verified</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.2em]">Risk Index:</span>
                        <span className="text-lg font-extrabold text-foreground tracking-tighter">{biasValidation?.overall_bias_score}%</span>
                        <span className="text-[10px] px-3 py-1 rounded-lg bg-success text-white font-black uppercase tracking-wider ml-4 border border-success/20">
                          {biasValidation?.risk_level || "LOW"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Recommended Questions */}
                <motion.div variants={itemVariants} className="bg-white border border-black/[0.05] rounded-[3rem] overflow-hidden shadow-[0_4px_32px_rgba(0,0,0,0.02)] transition-all duration-500 hover:shadow-[0_8px_48px_rgba(0,0,0,0.04)]">
                  <div className="p-10 border-b border-black/[0.03] bg-[#F5F5F7]/30 flex items-center justify-between">
                    <h2 className="text-2xl font-extrabold text-foreground flex items-center gap-3 tracking-tight">
                      <Sparkles className="h-6 w-6 text-secondary" />
                      Validated Question Matrix
                    </h2>
                    <div className="h-2 w-32 bg-black/5 rounded-full overflow-hidden">
                       <div className="h-full bg-black/20 w-3/4 rounded-full" />
                    </div>
                  </div>
                  <div className="p-0">
                    <ul className="divide-y divide-black/[0.03]">
                      {kit.questions?.map((q: string, idx: number) => (
                        <li key={idx} className="p-8 hover:bg-[#F5F5F7]/30 transition-all flex gap-10 group cursor-default">
                          <div className="flex flex-col items-center min-w-[60px]">
                            <span className="text-[9px] font-black text-secondary/30 uppercase tracking-[0.15em] mb-2">Q-Index</span>
                            <span className="text-4xl font-extrabold text-secondary tracking-tighter transition-transform group-hover:scale-110">{idx + 1}</span>
                          </div>
                          <p className="text-xl text-foreground font-semibold leading-relaxed tracking-tight pt-2">{q}</p>
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
