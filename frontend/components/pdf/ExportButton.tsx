'use client';

import { useState } from 'react';
import { Download, Lock, Loader2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  type: 'analysis' | 'kit' | 'evaluation' | 'jd' | 'audit';
  id: string;
  planTier: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  buttonClassName?: string;
}

export default function ExportButton({
  type,
  id,
  planTier,
  label = 'Export PDF',
  variant = 'primary',
  className,
  buttonClassName,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExport = async () => {
    // Allow growth, enterprise, and starter (if it has candidate_reports)
    const hasAccess = ['growth', 'enterprise'].includes(planTier) || process.env.NODE_ENV === 'development';

    if (!hasAccess) {
      window.location.href = '/pricing?reason=pdf_export';
      return;
    }

    if (!id) {
      setError('No report ID — save the report first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id }),
      });

      if (res.status === 403) {
        const data = await res.json();
        window.location.href = data.upgradeUrl || '/pricing?reason=pdf_export';
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.error || 'Export failed');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      // Try to get filename from server headers, fallback to formal naming
      const disposition = res.headers.get('Content-Disposition');
      let filename = '';
      
      if (disposition && disposition.includes('filename=')) {
        filename = disposition.split('filename=')[1].replace(/"/g, '');
      } else {
        const formalType = type === 'jd' ? 'JD Audit' : 
                         type === 'analysis' ? 'Bias Analysis' :
                         type === 'kit' ? 'Interview Kit' :
                         type === 'audit' ? 'Kit Audit' :
                         type === 'evaluation' ? 'Candidate Evaluation' :
                         (type as string).charAt(0).toUpperCase() + (type as string).slice(1);
        filename = `Rifair ${formalType} Report ${(id || '').slice(0, 8)}.pdf`;
      }

      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        a.remove();
      }, 150);
    } catch (err: any) {
      setError(err.message || 'Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  // Locked state for non-authorised plans
  const hasAccess = ['growth', 'enterprise'].includes(planTier) || process.env.NODE_ENV === 'development';
  if (!hasAccess) {
    return (
      <div className={cn('relative group', className)}>
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-400 text-sm font-medium cursor-not-allowed w-full justify-center"
        >
          <Lock className="w-4 h-4" /> {label}
        </button>
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-[#0a3d2e] rounded-xl text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          <p className="font-semibold mb-1">PDF Export — Growth Only</p>
          <p className="text-white/80">Export compliance-ready reports with your branding.</p>
          <div className="mt-2 pt-2 border-t border-white/20">
            <span className="text-[#1D9E75] font-semibold">Upgrade to Growth →</span>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0a3d2e]" />
        </div>
      </div>
    );
  }

  // Active Growth plan button
  return (
    <div className={className}>
      <button
        onClick={handleExport}
        disabled={loading}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all w-full justify-center',
          variant === 'primary' && (
            type === 'analysis' ? 'bg-[#dc2626] hover:bg-[#b91c1c] text-white' :
            type === 'kit' || type === 'audit' ? 'bg-[#10b981] hover:bg-[#059669] text-white' :
            type === 'jd' ? 'bg-[#f59e0b] hover:bg-[#d97706] text-white' :
            type === 'evaluation' ? 'bg-[#3b82f6] hover:bg-[#2563eb] text-white' :
            'bg-[#1D1D1F] text-white hover:bg-black'
          ),
          variant === 'secondary' && (
            type === 'analysis' ? 'border border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626]/5' :
            type === 'kit' || type === 'audit' ? 'border border-[#10b981] text-[#10b981] hover:bg-[#10b981]/5' :
            type === 'jd' ? 'border border-[#f59e0b] text-[#f59e0b] hover:bg-[#f59e0b]/5' :
            type === 'evaluation' ? 'border border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/5' :
            'border border-[#1D1D1F] text-[#1D1D1F] hover:bg-black/5'
          ),
          variant === 'ghost' && 'text-neutral-600 hover:bg-neutral-100',
          loading && 'opacity-70 cursor-wait',
          'active:scale-[0.98]'
        )}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        {loading ? 'Generating PDF...' : label}
      </button>
      {error && <p className="text-xs text-red-600 mt-2 text-center">{error}</p>}
    </div>
  );
}
