"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Zap, Sparkles, Activity, Layers, ArrowUpRight } from "lucide-react"
import Link from "next/link"

// --- Animation Components ---

function BiasDetectorAnimation() {
  const [scale, setScale] = useState(1)
  const letters = "Equality".split("")

  useEffect(() => {
    const interval = setInterval(() => {
      setScale((prev) => (prev === 1 ? 1.1 : 1))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-center h-full overflow-hidden relative">
      <div className="flex gap-1">
        {letters.map((char, i) => (
          <motion.span
            key={i}
            className="font-mono text-4xl md:text-5xl font-black text-primary"
            animate={{ 
                opacity: [0.3, 1, 0.3],
                y: [0, -10, 0],
                color: i % 2 === 0 ? "#1D1D1F" : "#737373"
            }}
            transition={{ 
                duration: 2, 
                repeat: Infinity, 
                delay: i * 0.1,
                ease: "easeInOut" 
            }}
          >
            {char}
          </motion.span>
        ))}
      </div>
      {/* Scanning line effect */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-1 bg-primary/30 blur-sm"
        animate={{ top: ["10%", "90%", "10%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
    </div>
  )
}

function QuestionGenAnimation() {
  const [layout, setLayout] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setLayout((prev) => (prev + 1) % 3)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  const layouts = ["grid-cols-2 grid-rows-2", "grid-cols-3 grid-rows-1", "grid-cols-1 grid-rows-3"]

  return (
    <div className="h-full p-4 flex items-center justify-center">
      <motion.div className={`grid ${layouts[layout]} gap-3 w-full max-w-[160px]`} layout>
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="bg-primary/10 border border-primary/20 rounded-xl min-h-[40px] flex items-center justify-center"
            layout
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div 
                className="w-1/2 h-1 bg-primary/40 rounded-full"
                animate={{ width: ["20%", "70%", "40%"] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

function ScoringEngineAnimation() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
        setProgress(Math.floor(Math.random() * 30) + 70)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <motion.span 
        key={progress}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-5xl md:text-7xl font-black font-mono text-[#1D1D1F]"
      >
        {progress}
      </motion.span>
      <span className="text-sm font-black uppercase tracking-widest text-[#86868B]">Fairness Score</span>
      <div className="w-full max-w-[140px] h-2 bg-[#1D1D1F]/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(115,115,115,0.4)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}

function DeepAnalysisAnimation() {
    return (
        <div className="flex items-center justify-center h-full relative group">
            <div className="relative w-32 h-32">
                {[1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        className="absolute inset-0 border-2 border-primary/20 rounded-[2rem]"
                        animate={{ 
                            rotate: i * 45,
                            scale: [1, 1.1 + (i * 0.1), 1],
                            opacity: [0.2, 0.5, 0.2]
                        }}
                        transition={{ 
                            duration: 3 + i, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                        }}
                    />
                ))}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="bg-muted text-primary p-4 rounded-2xl shadow-sm"
                    >
                        <Layers className="h-8 w-8" />
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

// --- Main Section ---

export function EquiHireCoreFeatures() {
  const features = [
    {
      title: "AI Bias Detection",
      description: "Detects cultural, gender, and linguistic bias in real-time before you ask the question.",
      icon: Zap,
      animation: <BiasDetectorAnimation />,
      color: "bg-white",
      href: "/analyze"
    },
    {
      title: "Bias Scoring Engine",
      description: "Quantifies risk with explainable scoring, providing actionable metrics for HR leaders.",
      icon: Activity,
      animation: <ScoringEngineAnimation />,
      color: "bg-white",
      href: "/history"
    },
    {
      title: "Deep Analysis Mode",
      description: "Multi-layer AI analysis for enterprise-grade audits spanning massive question banks.",
      icon: Layers,
      animation: <DeepAnalysisAnimation />,
      color: "bg-white",
      dark: false,
      href: "/analyze"
    },
    {
      title: "Fair Question Generator",
      description: "Auto-generates inclusive and unbiased alternatives that accurately assess candidate skills.",
      icon: Sparkles,
      animation: <QuestionGenAnimation />,
      color: "bg-white",
      href: "/kit"
    }
  ]

  return (
    <section id="core-features" className="py-32 px-6 lg:px-12 relative bg-[#FAFAFA] border-y border-black/[0.03] overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-6xl font-black text-[#1D1D1F] tracking-tight">Core Features</h2>
                  <p className="text-xl text-[#86868B] font-medium max-w-xl">Enterprise-grade capabilities for modern hiring teams obsessed with quality.</p>
                </div>
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Link href="/analyze" className="flex items-center gap-2 font-black text-sm uppercase tracking-widest text-[#1D1D1F] border-b-2 border-primary pb-1 group">
                        Explore Full Audit
                        <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                </motion.div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                {features.map((feature, idx) => (
                    <motion.div
                        key={idx}
                        className={`group relative p-1 rounded-[3rem] ${feature.dark ? 'bg-black' : 'bg-white'} border border-black/[0.05] shadow-[0_20px_60px_rgba(0,0,0,0.02)] overflow-hidden`}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ y: -8 }}
                    >
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center min-h-[340px]">
                            <div className="p-10 flex flex-col h-full justify-between border-b lg:border-b-0 lg:border-r border-black/[0.03]">
                                <div>
                                    <h3 className={`text-2xl font-bold ${feature.dark ? 'text-white' : 'text-[#1D1D1F]'} mb-4`}>{feature.title}</h3>
                                    <p className={`${feature.dark ? 'text-white/60' : 'text-[#86868B]'} text-lg leading-relaxed`}>
                                        {feature.description}
                                    </p>
                                </div>

                                <motion.div 
                                    className={`mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest ${feature.dark ? 'text-white' : 'text-primary'} cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity`}
                                >
                                    <Link href={feature.href} className="flex items-center gap-2">
                                        Learn More <ArrowUpRight className="h-3 w-3" />
                                    </Link>
                                </motion.div>
                            </div>

                            <div className="h-full min-h-[240px] flex items-center justify-center bg-[#FAFAFA]/50 overflow-hidden relative">
                                {feature.animation}
                                {/* Glass shine overlay */}
                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
  )
}
