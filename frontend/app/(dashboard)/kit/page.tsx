"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { generateKit, getReportById } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Loader2, FileText, CheckCircle2, AlertCircle, PlusCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Typewriter } from "@/components/ui/typewriter";
import { KitFeatureCards } from "@/components/kit-generator/KitFeatureCards";
import { LoadingState } from "@/components/LoadingState";
import HolographicCard from "@/components/ui/holographic-card";
import { BiasScoreCard } from "@/components/BiasScoreCard";

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
  const searchParams = useSearchParams();
  const reportId = searchParams.get("reportId");

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) return;
      setIsLoading(true);
      try {
        const token = await getToken();
        const data = await getReportById(reportId, token);
        let fetchedReport = data.report;

        // Supabase sometimes returns JSONB as string
        if (fetchedReport && typeof fetchedReport.categories === "string") {
          try {
            fetchedReport.categories = JSON.parse(fetchedReport.categories);
          } catch (e) {
            console.error("Failed to parse report categories", e);
          }
        }

        if (fetchedReport && fetchedReport.categories && fetchedReport.categories.kit_data) {
          setKit(fetchedReport.categories.kit_data);
          setBiasValidation(fetchedReport.categories.validation);
          if (fetchedReport.categories.inputs) {
            setFormData(fetchedReport.categories.inputs);
          }
        } else if (fetchedReport && fetchedReport.categories) {
          // Fallback if structure is slightly different
          setKit(fetchedReport.categories);
          setBiasValidation(fetchedReport.validation || { riskLevel: "low", overallScore: 0 });
        }
      } catch (err: any) {
        setError(err.message || "Failed to load report");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [reportId, getToken]);

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
    <div className="animate-in fade-in duration-1000 -mt-6 pb-20 -mb-28 -mx-8 px-8 bg-[#F5F5F7] min-h-[calc(100vh-80px)]">
      <div className="max-w-6xl mx-auto space-y-8 pt-10 pb-20">
      
      {/* Header section */}
      <div className="relative">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Structured Interview Kits</h1>
          <p className="text-[#86868B] max-w-2xl text-lg font-medium">
            Create role-specific interview kits that are consistent, fair, and ready to use.
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading-state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="py-24"
          >
            <div className="flex flex-col items-center justify-center space-y-8 max-w-4xl mx-auto">
              <LoadingState />
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="interface-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch"
          >
            {/* Form Section - Restored on Left */}
            <div className="lg:col-span-1 h-full">
              <div className="bg-white border border-black/[0.05] p-10 md:p-12 h-full min-h-[700px] rounded-[3.5rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] relative overflow-hidden transition-all duration-500 hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-col">
                <div className="mb-10">
                  <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Role Definitions</h2>
                  <p className="text-sm font-medium text-[#86868B] mt-1">Prime the engine for localized expertise.</p>
                </div>
                
                <div className="space-y-6 flex-1 flex flex-col">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.1em] ml-1">Target Designation</Label>
                    <Input 
                      value={formData.role} 
                      onChange={(e) => setFormData({...formData, role: e.target.value})} 
                      placeholder="e.g. Lead Machine Learning Engineer"
                      className="bg-[#F5F5F7]/30 border-black/[0.05] focus:border-black/[0.1] focus:ring-4 focus:ring-black/5 h-12 rounded-2xl transition-all font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.1em] ml-1">Seniority Tier</Label>
                    <Input 
                      value={formData.experience_level} 
                      onChange={(e) => setFormData({...formData, experience_level: e.target.value})} 
                      placeholder="e.g. Tier 4, 7-10 years" 
                      className="bg-[#F5F5F7]/30 border-black/[0.05] focus:border-black/[0.1] focus:ring-4 focus:ring-black/5 h-12 rounded-2xl transition-all font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.1em] ml-1">Organizational Archetype</Label>
                    <Input 
                      value={formData.company_type} 
                      onChange={(e) => setFormData({...formData, company_type: e.target.value})} 
                      placeholder="e.g. Series B High-Growth" 
                      className="bg-[#F5F5F7]/30 border-black/[0.05] focus:border-black/[0.1] focus:ring-4 focus:ring-black/5 h-12 rounded-2xl transition-all font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.1em] ml-1">Strategic Constraints</Label>
                    <Textarea 
                      value={formData.diversity_goals} 
                      onChange={(e) => setFormData({...formData, diversity_goals: e.target.value})} 
                      placeholder="e.g. Eliminate domain-specific linguistic barriers..."
                      className="resize-none bg-[#F5F5F7]/30 border-black/[0.05] focus:border-black/[0.1] focus:ring-4 focus:ring-black/5 min-h-[100px] rounded-2xl transition-all font-semibold p-4"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleGenerate}
                    disabled={isLoading || !formData.role}
                    className="w-full relative p-0.5 inline-flex overflow-hidden rounded-2xl group shadow-xl transition-all h-auto mt-auto active:scale-95"
                  >
                    <span
                      className={cn(
                        "absolute inset-[-300%] animate-[spin_3s_linear_infinite]",
                        "bg-[conic-gradient(from_90deg_at_50%_50%,var(--primary)_0%,#fff_50%,var(--primary)_100%)] dark:bg-[conic-gradient(from_90deg_at_50%_50%,var(--primary)_0%,#000_50%,var(--primary)_100%)]"
                      )}
                    />
                    <span className="inline-flex size-full items-center text-black justify-center rounded-2xl px-6 py-4 backdrop-blur-3xl font-semibold transition-all">
                      <span className="font-black text-xs tracking-widest relative z-10 uppercase">Generate Kit</span>
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Side Content (Initial Empty State or Final Kit Output) */}
            <div className="lg:col-span-1 h-full">
              <AnimatePresence mode="wait">
                {!kit ? (
                  <motion.div 
                    key="how-it-works"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                    className="h-full min-h-[700px] bg-white border border-black/[0.05] flex flex-col items-stretch p-12 text-foreground rounded-[3.5rem] shadow-[0_8px_48px_rgba(0,0,0,0.02)] relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-black/[0.01] rounded-full blur-[120px] -mr-48 -mt-48" />
                    <div className="relative z-10 flex flex-col items-center justify-center flex-1 py-10">
                      {error ? (
                        <div className="text-center space-y-4 max-w-sm mx-auto">
                          <div className="bg-destructive/10 text-destructive p-4 rounded-2xl border border-destructive/20 mb-4">
                            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <h3 className="font-black text-xs uppercase tracking-widest mb-1">Critical Backend Error</h3>
                            <p className="text-xs font-bold opacity-80">{error}</p>
                          </div>
                          <Button 
                            variant="outline" 
                            onClick={handleGenerate}
                            className="bg-white hover:bg-[#F5F5F7] border-black/[0.05] rounded-xl font-black text-[10px] uppercase tracking-widest px-8"
                          >
                            Retry Generation
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="text-center mb-12 space-y-3">
                            <h3 className="text-4xl font-extrabold text-[#1D1D1F] tracking-tight uppercase">How it works</h3>
                            <p className="text-[#86868B] font-bold max-w-sm mx-auto leading-relaxed uppercase text-[11px] tracking-widest">Explore the core capabilities of the EquiHire interview engine.</p>
                          </div>
                          <KitFeatureCards />
                        </>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="kit-results"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                    className="h-full"
                  >
                    <HolographicCard 
                      intensity={45} 
                      biasLevel="neutral"
                      className="h-full min-h-[700px] flex flex-col items-stretch rounded-[3.5rem] shadow-[0_8px_64px_rgba(0,0,0,0.04)] relative overflow-hidden"
                    >
                      {/* Results Header */}
                      <div className="p-10 border-b border-black/[0.03] bg-white/40 backdrop-blur-sm flex items-center justify-between shrink-0 relative z-10">
                        <div className="flex-1">
                          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                            Validated Kit Output
                          </h2>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                            <span className="text-[9px] font-black text-[#86868B] uppercase tracking-[0.2em]">Risk Grade: {biasValidation?.risk_level || biasValidation?.riskLevel || "LOW"}</span>
                          </div>
                        </div>
                        
                        <div className="scale-50 -mr-20 -my-10">
                           <BiasScoreCard 
                             score={biasValidation?.overall_bias_score || biasValidation?.overallScore || 0} 
                             type="kit"
                           />
                        </div>
                      </div>

                      {/* Results Scrollable Area */}
                      <div className="flex-1 overflow-y-auto p-0 scrollbar-hide relative z-10">
                        <ul className="divide-y divide-black/[0.03]">
                          {kit.questions?.map((q: string, idx: number) => (
                            <li key={idx} className="p-8 hover:bg-white/40 backdrop-blur-[1px] transition-all flex gap-8 group cursor-default items-start">
                              <div className="flex flex-col items-center min-w-[40px] pt-1">
                                <span className="text-[40px] font-black text-black tracking-tighter leading-none group-hover:scale-110 transition-transform">{idx + 1}</span>
                              </div>
                              <p className="text-xl text-foreground font-semibold leading-relaxed tracking-tight pt-1">
                                <Typewriter text={q} speed={30} delay={idx * 500} />
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Quality Assurance Badge */}
                      <div className="p-8 border-t border-black/[0.03] bg-white/60 backdrop-blur-md flex items-center gap-4 shrink-0 relative z-10">
                        <div className="h-10 w-10 bg-success rounded-2xl flex items-center justify-center text-white shadow-lg shadow-success/20">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-success uppercase tracking-[0.1em]">Compliance Secured</span>
                          <p className="text-xs font-bold text-[#86868B]">AI has neutralized linguistic bias patterns for this role kit.</p>
                        </div>
                      </div>
                    </HolographicCard>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
);
}
