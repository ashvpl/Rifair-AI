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
    // Allow growth and enterprise only
    const hasAccess = ['growth', 'enterprise'].includes(planTier);

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
  const hasAccess = ['growth', 'enterprise'].includes(planTier);
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
          'flex items-center gap-2 px-4 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all w-full justify-center',
          variant === 'primary' && (
            type === 'analysis' ? 'bg-[#dc2626] text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' :
            type === 'kit' || type === 'audit' ? 'bg-[#10b981] text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' :
            type === 'jd' ? 'bg-[#f59e0b] text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' :
            type === 'evaluation' ? 'bg-indigo-600 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' :
            'bg-[#1D1D1F] text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
          ),
          variant === 'primary' && 'hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5',
          variant === 'secondary' && (
            type === 'analysis' ? 'border-2 border-black text-[#dc2626] bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' :
            type === 'kit' || type === 'audit' ? 'border-2 border-black text-[#10b981] bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' :
            type === 'jd' ? 'border-2 border-black text-[#f59e0b] bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' :
            type === 'evaluation' ? 'border-2 border-black text-indigo-600 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' :
            'border-2 border-black text-[#1D1D1F] bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
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
