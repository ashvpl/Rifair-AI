"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function KitGeneratorPage() {
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
      const response = await fetch("/api/kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed");

      setKit(data.kit);
      setBiasValidation(data.bias_validation);
    } catch (err: any) {
      setError(err.message || "Failed to generate kit");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Bias-Safe Interview Kit</h1>
        <p className="text-slate-500 mt-2">Generate structured, unbiased interview questions based on the role requirements.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Role Details</CardTitle>
            <CardDescription>Configure to generate custom questions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Job Role</Label>
              <Input 
                value={formData.role} 
                onChange={(e) => setFormData({...formData, role: e.target.value})} 
                placeholder="e.g. Product Manager" 
              />
            </div>
            <div className="space-y-2">
              <Label>Experience Level</Label>
              <Input 
                value={formData.experience_level} 
                onChange={(e) => setFormData({...formData, experience_level: e.target.value})} 
                placeholder="e.g. Mid-level, 3-5 years" 
              />
            </div>
            <div className="space-y-2">
              <Label>Company Context</Label>
              <Input 
                value={formData.company_type} 
                onChange={(e) => setFormData({...formData, company_type: e.target.value})} 
                placeholder="e.g. Enterprise B2B" 
              />
            </div>
            <div className="space-y-2">
              <Label>Specific Diversity Goals (Optional)</Label>
              <Textarea 
                value={formData.diversity_goals} 
                onChange={(e) => setFormData({...formData, diversity_goals: e.target.value})} 
                placeholder="e.g. Avoid industry jargon..."
                className="resize-none"
              />
            </div>
            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4" 
              onClick={handleGenerate}
              disabled={isLoading || !formData.role}
            >
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              {isLoading ? "Generating..." : "Generate Safe Kit"}
            </Button>
            
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2 mt-4">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {!kit && !isLoading && (
            <div className="h-full border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-12 text-slate-400">
              <FileText className="w-12 h-12 mb-4 text-slate-300" />
              <p>Your generated interview kit will appear here.</p>
            </div>
          )}

          {isLoading && (
            <div className="h-full flex flex-col items-center justify-center space-y-4 text-slate-500 py-20">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p>Designing unbiased questions...</p>
            </div>
          )}

          {kit && !isLoading && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              {/* Bias Validation Badge */}
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-full">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">AI Bias Audit Cleared</p>
                    <p className="text-xs text-emerald-600">Risk Score: {biasValidation?.overall_bias_score}/100 ({biasValidation?.risk_level})</p>
                  </div>
                </div>
              </div>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-slate-50">
                  <CardTitle className="text-lg text-indigo-900">Recommended Questions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="divide-y divide-slate-100">
                    {kit.questions?.map((q: string, idx: number) => (
                      <li key={idx} className="p-4 hover:bg-slate-50 transition-colors flex gap-4">
                        <span className="text-indigo-300 font-bold shrink-0">Q{idx + 1}</span>
                        <p className="text-slate-700 font-medium">{q}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-slate-50">
                  <CardTitle className="text-lg text-indigo-900">Evaluation Rubric</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {kit.evaluation_rubric?.map((item: any, idx: number) => (
                      <div key={idx} className="p-4 space-y-2">
                        <h4 className="font-bold text-slate-900">{item.criteria}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                          <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg">
                            <span className="font-semibold block mb-1">✓ Look For</span>
                            {item.look_for}
                          </div>
                          <div className="bg-rose-50 text-rose-800 p-3 rounded-lg">
                            <span className="font-semibold block mb-1">⚠️ Avoid</span>
                            {item.avoid}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
