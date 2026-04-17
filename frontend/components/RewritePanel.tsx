"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface RewritePanelProps {
  original: string;
  rewritten: string[] | string;
}

export function RewritePanel({ rewritten }: RewritePanelProps) {
  const rewrittenArray = Array.isArray(rewritten) 
    ? rewritten 
    : (typeof rewritten === "string" ? rewritten.split("\n\n").filter(Boolean) : []);

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50 border-b py-4">
        <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          Bias-Free Alternatives
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 divide-y divide-slate-100">
        {rewrittenArray.map((q: string, i: number) => (
          <div key={i} className="p-4 flex gap-4 hover:bg-slate-50/50 transition-colors">
            <div className="flex-shrink-0 mt-1">
              <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                {i + 1}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-slate-700 leading-relaxed font-medium">{q}</p>
            </div>
          </div>
        ))}
        {rewrittenArray.length === 0 && (
          <div className="p-8 text-center text-slate-400 italic">
            No rewrites needed or provided.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
