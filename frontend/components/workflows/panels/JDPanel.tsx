"use client";

import { OptimizedJDOutput } from "@/lib/workflows/types";
import { CheckCircle2, TrendingUp, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface JDPanelProps {
  jd: OptimizedJDOutput;
}

export function JDPanel({ jd }: JDPanelProps) {
  if (!jd) return <EmptyState label="No job description generated." />;

  const biasScore = jd.bias_verification?.bias_score ?? null;
  const biasColor =
    biasScore === null
      ? "text-gray-500"
      : biasScore <= 15
      ? "text-emerald-600"
      : biasScore <= 35
      ? "text-amber-500"
      : "text-red-500";

  return (
    <div className="space-y-8">
      {/* Headline card */}
      {jd.headline && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1D1D1F] to-[#3a3a3c] text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-1.5">Role Headline</p>
          <p className="text-lg md:text-xl font-black leading-snug">{jd.headline}</p>
        </div>
      )}

      {/* Conversion Insights */}
      {jd.conversion_insights && (
        <div className="grid grid-cols-3 gap-3">
          <InsightCard
            icon={<Users className="w-4 h-4" />}
            label="Talent Pool Reach"
            value={jd.conversion_insights.estimated_talent_pool_reach}
            color="text-blue-600"
            bg="bg-blue-50 border-blue-100"
          />
          <InsightCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Gender Balance"
            value={jd.conversion_insights.gender_balance?.replace(/_/g, " ")}
            color="text-violet-600"
            bg="bg-violet-50 border-violet-100"
          />
          <InsightCard
            icon={<Zap className="w-4 h-4" />}
            label="Top Strength"
            value={jd.conversion_insights.top_strength}
            color="text-amber-600"
            bg="bg-amber-50 border-amber-100"
          />
        </div>
      )}

      {/* Sections grid */}
      {jd.sections && (
        <div className="space-y-5">
          {jd.sections.about_company && (
            <SectionBlock title="About the Company" content={jd.sections.about_company} />
          )}

          {jd.sections.what_youll_do?.length > 0 && (
            <SectionBlock title="What You'll Do">
              <BulletList items={jd.sections.what_youll_do} />
            </SectionBlock>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {jd.sections.must_have?.length > 0 && (
              <SectionBlock title="Must Have" accent="border-l-2 border-l-black/80 pl-4">
                <BulletList items={jd.sections.must_have} bullet="●" />
              </SectionBlock>
            )}
            {jd.sections.nice_to_have?.length > 0 && (
              <SectionBlock title="Nice to Have" accent="border-l-2 border-l-black/20 pl-4">
                <BulletList items={jd.sections.nice_to_have} bullet="○" />
              </SectionBlock>
            )}
          </div>

          {jd.sections.what_we_offer?.length > 0 && (
            <SectionBlock title="What We Offer">
              <BulletList items={jd.sections.what_we_offer} />
            </SectionBlock>
          )}

          {jd.sections.hiring_process && (
            <SectionBlock title="Hiring Process" content={jd.sections.hiring_process} />
          )}

          {jd.sections.cta && (
            <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-black/[0.05] text-sm font-medium text-[#1D1D1F] italic">
              {jd.sections.cta}
            </div>
          )}
        </div>
      )}

      {/* Bias Verification */}
      {jd.bias_verification && (
        <div className="p-5 rounded-2xl border border-black/[0.06] bg-white space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-[0.15em] text-[#86868B]">Bias Verification</p>
            {jd.bias_verification.verified_clean && (
              <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Verified Clean
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-4xl font-black tracking-tight">
              <span className={biasColor}>{biasScore ?? "–"}</span>
              <span className="text-sm text-[#86868B] font-bold">/100</span>
            </div>
            <div className="flex-1">
              <div className="w-full h-2 rounded-full bg-[#F5F5F7] overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    biasScore !== null && biasScore <= 15 ? "bg-emerald-500" :
                    biasScore !== null && biasScore <= 35 ? "bg-amber-400" : "bg-red-500"
                  )}
                  style={{ width: `${Math.min(biasScore ?? 0, 100)}%` }}
                />
              </div>
              <p className="text-[10px] font-bold text-[#86868B] mt-1">Lower = Less Bias</p>
            </div>
          </div>
          {jd.bias_verification.inclusive_language_used?.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-[#86868B] mb-2">Inclusive Language Used</p>
              <div className="flex flex-wrap gap-1.5">
                {jd.bias_verification.inclusive_language_used.map((term, i) => (
                  <span key={i} className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700">
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}
          {jd.bias_verification.requirements_calibration && (
            <p className="text-xs font-medium text-[#86868B] leading-relaxed border-t border-black/[0.04] pt-3">
              {jd.bias_verification.requirements_calibration}
            </p>
          )}
        </div>
      )}

      {/* Full JD Markdown preview */}
      {jd.full_jd && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B] mb-3">Full Job Description (Raw)</p>
          <div className="p-5 rounded-2xl bg-[#F5F5F7]/60 border border-black/[0.05] text-sm text-[#1D1D1F] font-medium leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
            {jd.full_jd}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helper sub-components ───────────────────────────────────────────────────

function SectionBlock({ title, content, children, accent }: {
  title: string;
  content?: string;
  children?: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className={cn("space-y-2", accent)}>
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#86868B]">{title}</p>
      {content && <p className="text-sm font-medium text-[#1D1D1F] leading-relaxed">{content}</p>}
      {children}
    </div>
  );
}

function BulletList({ items, bullet = "·" }: { items: string[]; bullet?: string }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm font-medium text-[#1D1D1F]">
          <span className="text-black/40 mt-0.5 shrink-0">{bullet}</span>
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function InsightCard({ icon, label, value, color, bg }: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  color: string;
  bg: string;
}) {
  return (
    <div className={cn("p-3.5 rounded-2xl border flex flex-col gap-1", bg)}>
      <div className={cn("w-7 h-7 flex items-center justify-center rounded-xl bg-white shadow-sm", color)}>
        {icon}
      </div>
      <p className="text-[9px] font-black uppercase tracking-wider text-[#86868B] mt-1">{label}</p>
      <p className="text-xs font-black text-[#1D1D1F] capitalize leading-tight">{value ?? "–"}</p>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="py-16 text-center">
      <p className="text-[#86868B] text-sm font-medium">{label}</p>
    </div>
  );
}
