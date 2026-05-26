"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Activity, ShieldCheck, ClipboardList, FileText, ArrowUpRight, PlusCircle, Layers } from "lucide-react"
import Link from "next/link"

// --- Animation Components ---

function BiasAnalysisAnimation() {
  const words = ["Inclusion", "Equity", "Fairness", "Diversity"]
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-full overflow-hidden relative">
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
        className="font-mono text-3xl md:text-5xl font-black text-[#EF4444] tracking-tighter"
      >
        {words[index]}
      </motion.div>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div 
            className="w-40 h-40 border-[0.5px] border-[#EF4444]/20 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div 
            className="w-60 h-60 border-[0.5px] border-[#EF4444]/10 rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 7, repeat: Infinity, delay: 1 }}
        />
      </div>
      <motion.div 
        className="mt-8 flex gap-1.5"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {[...Array(12)].map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-[#EF4444]/40" />
        ))}
      </motion.div>
    </div>
  )
}

function InterviewKitAnimation() {
  return (
    <div className="h-full w-full flex items-center justify-center p-6 lg:p-12">
      {/* Smaller stacked cards for mobile, larger on desktop */}
      <div className="relative w-full max-w-[150px] lg:max-w-[200px] aspect-square flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute bg-white border border-emerald-100/50 shadow-[0_8px_20px_rgba(16,185,129,0.05)] lg:shadow-[0_10px_30px_rgba(16,185,129,0.05)] rounded-2xl p-3 lg:p-4 flex flex-col gap-1 lg:gap-2"
            style={{ width: '100%', height: '55%', top: `${i * 13}%`, left: `${i * 9}%`, zIndex: 10 - i }}
            animate={{
              y: [0, -8, 0],
              rotate: [i * 2, i * 2 - 2, i * 2],
              x: [0, 4, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
          >
            <div className="w-1/2 h-2 bg-emerald-500/20 rounded-full" />
            <div className="w-full h-1.5 bg-emerald-500/10 rounded-full" />
            <div className="w-3/4 h-1.5 bg-emerald-500/5 rounded-full" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function JDOptimizerAnimation() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 relative">
      <div className="relative w-32 h-32">
        <motion.div
          className="absolute inset-0 bg-[#EAB308]/5 rounded-3xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-4 border border-[#EAB308]/20 rounded-2xl flex items-center justify-center overflow-hidden">
          <motion.div
            className="w-full h-full bg-gradient-to-b from-[#EAB308]/10 to-transparent"
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <span className="text-4xl font-black text-[#EAB308] opacity-20">JD</span>
        </div>
      </div>
      <div className="space-y-2 w-32">
        <motion.div 
            className="h-1 bg-[#EAB308]/20 rounded-full overflow-hidden"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
        >
            <motion.div 
                className="h-full bg-[#EAB308]"
                animate={{ width: ["0%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
        </motion.div>
      </div>
    </div>
  )
}

function EvaluationAnimation() {
  return (
    <div className="flex items-center justify-center h-full relative">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#6366f1"
            strokeWidth="0.5"
            strokeDasharray="2 4"
            className="opacity-20"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#6366f1"
            strokeWidth="2"
            strokeDasharray="251.2"
            initial={{ strokeDashoffset: 251.2 }}
            animate={{ strokeDashoffset: [251.2, 50, 80, 20] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            className="text-4xl font-black text-[#1D1D1F] tracking-tighter"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            92%
          </motion.span>
          <span className="text-[10px] font-black uppercase text-[#6366f1] tracking-widest mt-1">Match Index</span>
        </div>
      </div>
      {/* Floating data dots */}
      {[...Array(4)].map((_, i) => (
        <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#6366f1] rounded-full"
            style={{ 
                top: `${20 + i * 20}%`, 
                right: `${10 + i * 5}%` 
            }}
            animate={{ 
                x: [0, 10, 0],
                opacity: [0, 1, 0]
            }}
            transition={{ 
                duration: 3, 
                repeat: Infinity, 
                delay: i * 0.7 
            }}
        />
      ))}
    </div>
  )
}


// --- Main Section ---

export function RifairCoreFeatures() {
  const features = [
    {
      id: "01",
      title: "Bias Analysis",
      description: "Scan your interview questions to find and fix hidden biases instantly. Ensure every candidate gets a fair shot from day one.",
      animation: <BiasAnalysisAnimation />,
      color: "text-[#EF4444]",
      bgColor: "bg-[#EF4444]",
      cta: "Analyze Questions",
      href: "/analyze"
    },
    {
      id: "02",
      title: "Interview Kits",
      description: "Create professional interview guides with high-quality questions. Save hours of prep and stay consistent across every interview.",
      animation: <InterviewKitAnimation />,
      color: "text-[#10B981]",
      bgColor: "bg-[#10B981]",
      cta: "Generate Kit",
      href: "/kit"
    },
    {
      id: "03",
      title: "JD Optimizer",
      description: "Write job descriptions that attract more diverse talent. Automatically remove biased language and attract the right fit faster.",
      animation: <JDOptimizerAnimation />,
      color: "text-[#EAB308]",
      bgColor: "bg-[#EAB308]",
      cta: "Optimize JD",
      href: "/jd-analyser"
    },
    {
      id: "04",
      title: "Evaluation Hub",
      description: "Score candidates fairly using objective data, not gut feelings. Make better hiring decisions with clear, shared evaluation reports.",
      animation: <EvaluationAnimation />,
      color: "text-[#6366f1]",
      bgColor: "bg-[#6366f1]",
      cta: "Evaluate Candidates",
      href: "/evaluations"
    }
  ]

  return (
    <section id="core-features" className="py-16 lg:py-40 relative bg-[#E5E7EB] overflow-hidden" style={{ paddingLeft: 'clamp(16px, 5vw, 80px)', paddingRight: 'clamp(16px, 5vw, 80px)' }}>
        {/* Background decorative elements - kept subtle for industrial look */}
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-white/40 rounded-full blur-[160px] -z-10" />
        
        <div className="max-w-7xl mx-auto space-y-24 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 md:gap-16">
                <div className="space-y-4">
                  <h2 className="font-black text-black tracking-tight text-3xl lg:text-5xl xl:text-6xl leading-[1]">
                    The Core <br /> <span className="text-black/30">Capabilities.</span>
                  </h2>
                  <p className="text-black/60 text-base lg:text-lg font-medium max-w-xl leading-relaxed">Enterprise-grade infrastructure for teams who refuse to compromise on hiring quality and fairness.</p>
                </div>
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="shrink-0"
                >
                    <Link href="/analyze" className="flex items-center gap-3 font-black text-sm uppercase tracking-widest text-white bg-black px-8 py-5 rounded-2xl hover:bg-black/80 transition-all duration-500 group">
                        Explore Full Audit
                        <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-12 xl:gap-16">
                {features.map((feature, idx) => (
                    <motion.div
                        key={idx}
                        className="group relative p-2 lg:p-1 rounded-[2rem] lg:rounded-[3rem] bg-white border-2 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] lg:shadow-[12px_12px_0px_rgba(0,0,0,1)] overflow-hidden transition-all duration-500"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: idx * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        whileHover={{ translate: "2px 2px", boxShadow: "8px 8px 0px rgba(0,0,0,1)" }}
                    >
                        {/* Mobile: stacked. Desktop: side-by-side */}
                        <div className="relative z-10 flex flex-col lg:grid lg:grid-cols-2 items-stretch min-h-[260px] lg:min-h-[420px]">
                            <div className="p-4 lg:p-10 xl:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-black">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className={`w-10 h-10 rounded-full ${feature.bgColor} flex items-center justify-center border border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]`}>
                                            <span className="text-[10px] font-black text-white">{feature.id}</span>
                                        </div>
                                        <div className="h-[2px] flex-1 bg-black" />
                                    </div>
                                    <h3
                                      className="text-xl lg:text-2xl xl:text-3xl font-black text-black mb-4 tracking-tight leading-tight"
                                    >
                                      {feature.title}
                                    </h3>
                                    <p
                                      className="text-sm lg:text-base text-black leading-relaxed font-medium"
                                    >
                                        {feature.description}
                                    </p>
                                </div>

                                <motion.div 
                                    className={`mt-10 flex items-center gap-2 text-xs font-black uppercase tracking-widest ${feature.color} cursor-pointer hover:brightness-75 transition-all duration-300`}
                                >
                                    <Link href={feature.href} className="flex items-center gap-3">
                                        {feature.cta} <ArrowUpRight className="h-4 w-4" />
                                    </Link>
                                </motion.div>
                            </div>

                            <div className="min-h-[180px] lg:min-h-[260px] xl:min-h-[300px] flex items-center justify-center bg-[#E5E7EB] overflow-hidden relative transition-all duration-500">
                                {feature.animation}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
  )
}
