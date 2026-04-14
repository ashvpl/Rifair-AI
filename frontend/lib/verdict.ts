export const getVerdict = (score: number, type: 'kit' | 'analysis' = 'analysis') => {
  if (type === 'kit') {
    if (score === 0) return { 
      label: 'BIAS FREE', 
      color: 'text-success', 
      bg: 'bg-success/10', 
      border: 'border-success/20',
      showCheck: true
    };
    if (score <= 15) return { 
      label: 'CLEAN', 
      color: 'text-success', 
      bg: 'bg-success/10', 
      border: 'border-success/20'
    };
    if (score >= 40) return { 
      label: 'REVIEW NEEDED', 
      color: 'text-danger', 
      bg: 'bg-danger/10', 
      border: 'border-danger/20'
    };
    return { 
      label: 'LOW BIAS', 
      color: 'text-success', 
      bg: 'bg-success/5', 
      border: 'border-success/10'
    };
  }

  // Analysis scoring
  if (score >= 55) return { 
    label: 'HIGH BIAS', 
    color: 'text-danger', 
    bg: 'bg-danger/10', 
    border: 'border-danger/20'
  };
  if (score >= 25) return { 
    label: 'MODERATE', 
    color: 'text-warning', 
    bg: 'bg-warning/10', 
    border: 'border-warning/20'
  };
  return { 
    label: 'CLEAN', 
    color: 'text-emerald-500', 
    bg: 'bg-emerald-50', 
    border: 'border-emerald-200'
  };
};
