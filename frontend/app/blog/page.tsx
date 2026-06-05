import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { NavBarDemo } from "@/components/ui/navbar-demo";
import FooterSection from "@/components/ui/footer-section";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, ArrowRight, Sparkles } from "lucide-react";
import { blogListingImage } from "@/lib/site-images";
import { DEFAULT_KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Rifair AI Blog | Fair Hiring, Interview Kits, and HR Automation",
  description: "Read practical guides on fair hiring, structured interviews, candidate evaluation, job descriptions, recruitment automation, and AI for HR teams.",
  keywords: DEFAULT_KEYWORDS,
  alternates: {
    canonical: "https://rifairai.com/blog",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Rifair AI Blog | Fair Hiring, Interview Kits, and HR Automation",
    description: "Read practical guides on fair hiring, structured interviews, candidate evaluation, job descriptions, recruitment automation, and AI for HR teams.",
    url: "https://rifairai.com/blog",
    type: "website",
    siteName: "Rifair AI",
    images: [
      {
        url: "https://rifairai.com/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Rifair AI Blog - Fair Hiring and AI Recruitment Insights",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rifair AI Blog | Fair Hiring, Interview Kits, and HR Automation",
    description: "Read practical guides on fair hiring, structured interviews, candidate evaluation, job descriptions, recruitment automation, and AI for HR teams.",
    images: ["https://rifairai.com/opengraph-image.png"],
  },
};

interface BlogArticle {
  title: string;
  excerpt: string;
  slug: string;
  category: string;
  categorySlug: string;
  readTime: string;
  date: string;
  image: string;
  imageAlt: string;
}

const ARTICLES: BlogArticle[] = [
  {
    title: "How to Create a Structured Interview Kit for Better Hiring in 2026",
    excerpt: "Learn how recruiters can build structured interview kits with role-specific questions, evaluation criteria, and candidate scorecards to avoid bad hiring mistakes.",
    slug: "how-to-create-structured-interview-kit",
    category: "Interview Kits",
    categorySlug: "interview-kits",
    readTime: "5 min read",
    date: "June 1, 2026",
    ...blogListingImage("how-to-create-structured-interview-kit"),
  },
  {
    title: "How to Detect Bias in Interview Questions (AI vs Manual)",
    excerpt: "Learn how hiring teams identify unconscious bias in questions and replace them with objective, competency-focused alternatives.",
    slug: "how-to-detect-bias-in-interview-questions",
    category: "Fair Hiring",
    categorySlug: "fair-hiring",
    readTime: "6 min read",
    date: "May 28, 2026",
    ...blogListingImage("how-to-detect-bias-in-interview-questions"),
  },
  {
    title: "How to Write a Bias-Free Job Description in 2026",
    excerpt: "Unrealistic requirements and gender-coded wording drive candidates away. Learn how to write JDs that attract top tier talent.",
    slug: "how-to-write-bias-free-job-description",
    category: "Job Descriptions",
    categorySlug: "job-descriptions",
    readTime: "4 min read",
    date: "May 24, 2026",
    ...blogListingImage("how-to-write-bias-free-job-description"),
  },
  {
    title: "Candidate Evaluation Scorecards: A Simple Guide for Recruiters",
    excerpt: "Learn how candidate evaluation scorecards help recruiters compare candidates fairly, remove subjective bias, and hire faster.",
    slug: "candidate-evaluation-scorecards-guide",
    category: "Candidate Evaluation",
    categorySlug: "candidate-evaluation",
    readTime: "5 min read",
    date: "May 20, 2026",
    ...blogListingImage("candidate-evaluation-scorecards-guide"),
  },
  {
    title: "AI in Recruiting: Why Human Oversight Still Matters",
    excerpt: "Learn how hiring teams can use AI in recruiting while keeping human judgment, fairness, and accountability in the process.",
    slug: "ai-in-recruiting-human-oversight",
    category: "Recruiting AI",
    categorySlug: "recruiting-ai",
    readTime: "5 min read",
    date: "May 15, 2026",
    ...blogListingImage("ai-in-recruiting-human-oversight"),
  },
];

const CATEGORIES = [
  { name: "All Articles", slug: "all" },
  { name: "Fair Hiring", slug: "fair-hiring" },
  { name: "Interview Kits", slug: "interview-kits" },
  { name: "Recruiting AI", slug: "recruiting-ai" },
  { name: "Job Descriptions", slug: "job-descriptions" },
  { name: "Candidate Evaluation", slug: "candidate-evaluation" },
  { name: "Startup Hiring", slug: "startup-hiring" },
];

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const resolvedParams = await searchParams;
  const activeSlug = resolvedParams?.category || "all";

  // Filter posts based on query params
  const filteredArticles = activeSlug === "all"
    ? ARTICLES
    : ARTICLES.filter(art => art.categorySlug === activeSlug);

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F7] font-sans selection:bg-primary/20 selection:text-primary transition-colors duration-500">
      <NavBarDemo />

      <main className="flex-1 pt-24 md:pt-32 pb-20">
        {/* Header Hero */}
        <section className="px-6 lg:px-12 py-16 text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-xs font-bold uppercase tracking-wider text-black/60">
            <Sparkles className="w-3.5 h-3.5" />
            Hiring Resources
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1D1D1F] tracking-tight leading-tight">
            Hiring insights for fairer, smarter recruiting
          </h1>
          <p className="text-[#86868B] text-lg font-medium max-w-2xl mx-auto">
            Practical guides and templates for HR teams, recruiters, startups, and hiring managers.
          </p>
        </section>

        {/* Category Filter Row */}
        <section className="px-6 lg:px-12 max-w-7xl mx-auto mb-12">
          <div className="flex flex-wrap gap-2 justify-center border-b border-black/5 pb-8">
            {CATEGORIES.map((cat) => {
              const isActive = activeSlug === cat.slug;
              return (
                <Link
                  key={cat.slug}
                  href={cat.slug === "all" ? "/blog" : `/blog?category=${cat.slug}`}
                  scroll={false}
                >
                  <span className={`px-4 py-2 rounded-full text-xs font-bold transition-all inline-block border-2 ${
                    isActive
                      ? "bg-black text-white border-black"
                      : "bg-white text-[#86868B] border-black/10 hover:border-black hover:text-black shadow-sm"
                  }`}>
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Grid of Articles */}
        <section className="px-6 lg:px-12 max-w-7xl mx-auto">
          {filteredArticles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group rounded-3xl bg-white border-2 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1.5 hover:translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* Card image */}
                  <div className="relative w-full h-44 overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.imageAlt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <span className="absolute bottom-3 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold text-black/80 uppercase tracking-wider">
                      {post.category}
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-end items-center text-xs font-bold text-black/40">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {post.readTime}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-[#1D1D1F] tracking-tight group-hover:text-primary transition-colors leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-[#86868B] text-sm leading-relaxed font-medium">
                        {post.excerpt}
                      </p>
                    </div>
                    <div className="pt-5 mt-2 border-t border-black/5 flex items-center justify-between text-xs text-black/40 font-mono">
                      <span>{post.date}</span>
                      <span className="text-sm font-bold text-black group-hover:text-primary transition-colors font-sans flex items-center gap-1">
                        Read article <span className="transition-transform group-hover:translate-x-1 inline-block">→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border-2 border-dashed border-black/10 rounded-3xl">
              <BookOpen className="w-12 h-12 text-black/30 mx-auto mb-4" />
              <h3 className="text-lg font-black text-black">No articles found</h3>
              <p className="text-black/50 text-sm mt-1">We'll be adding guides for this category soon!</p>
              <div className="mt-6">
                <Link href="/blog">
                  <Button className="font-bold bg-black text-white hover:bg-black/90 rounded-full px-6">
                    Back to All Articles
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </section>

      </main>

      <FooterSection />
    </div>
  );
}
