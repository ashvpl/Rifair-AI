const DRAFT_PREFIX = 'rifair_draft_';

export const draftStorage = {
  save: (key: string, data: any) => {
    localStorage.setItem(`${DRAFT_PREFIX}${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  },
  
  load: (key: string) => {
    const raw = localStorage.getItem(`${DRAFT_PREFIX}${key}`);
    if (!raw) return null;
    
    const parsed = JSON.parse(raw);
    // Expire after 7 days
    if (Date.now() - parsed.timestamp > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(`${DRAFT_PREFIX}${key}`);
      return null;
    }
    return parsed.data;
  },
  
  clear: (key: string) => {
    localStorage.removeItem(`${DRAFT_PREFIX}${key}`);
  }
};
