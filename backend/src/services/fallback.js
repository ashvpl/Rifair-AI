const fs = require('fs');
const path = require('path');
const { FALLBACK_TEMPLATES: GENERIC_TEMPLATES } = require("../utils/constants");

// Load the newly harvested HR Structured Dataset
let hrDataset = {};
let allDatasetQuestions = [];

try {
  const structurePath = path.join(__dirname, '../../data/hr_structured_dataset.json');
  if (fs.existsSync(structurePath)) {
    hrDataset = JSON.parse(fs.readFileSync(structurePath, 'utf8'));
    
    // Pre-calculate flattened list
    allDatasetQuestions = Object.values(hrDataset)
      .flatMap(roleObj => Object.values(roleObj)
        .flatMap(expObj => Object.values(expObj).flat())
      );
    console.log("[FALLBACK] HR Structured Dataset loaded successfully. Unique questions:", allDatasetQuestions.length);
  }
} catch (e) {
  console.warn("[FALLBACK] Could not load HR Structured Dataset.", e.message);
}

// Basic programmatic word replacements for contextual fallbacks
const REPLACEMENTS = {
  "bro culture": "team culture",
  "male-dominated": "diverse",
  "aggressive": "proactive",
  "young": "motivated",
  "old": "experienced",
  "young and energetic": "motivated",
  "start a family": "manage long-term goals",
  "family": "personal commitments",
  "late nights": "high-demand periods",
  "perfect english": "effective communication",
  "guys": "team",
  "manpower": "workforce",
  "chairman": "chairperson",
  "rockstar": "top performer",
  "ninja": "expert",
  "sexy": "professional",
  "background might make it hard": "skills can contribute"
};

function getRandom(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function getStructuredQuestions(role, experience, category) {
  if (!hrDataset[role] || !hrDataset[role][experience] || !hrDataset[role][experience][category]) {
    return [];
  }
  return hrDataset[role][experience][category];
}

/**
 * Fallback Engine — Dataset Matching Layer
 * Falls back to HR Dataset questions or templates depending on available data
 */
function getFallback(classification, originalText = "", context = { role: null, experience: null }) {
  let rewritten = originalText;
  let changed = false;

  if (originalText) {
    const lower = originalText.toLowerCase();
    for (const [bad, good] of Object.entries(REPLACEMENTS)) {
      if (lower.includes(bad)) {
        const regex = new RegExp(`\\b${bad}\\b`, "gi");
        rewritten = rewritten.replace(regex, good);
        changed = true;
      }
    }
  }

  // If programmatic replacement worked perfectly, use it!
  if (changed && rewritten !== originalText) {
    return rewritten;
  }

  const types = classification?.bias_types || [];
  
  // MATCHING LAYER (Dataset)
  if (context.role && context.experience) {
    let targetCat = "General";
    if (types.includes("work_life")) targetCat = "Time Management";
    if (types.includes("cultural")) targetCat = "Cultural Fit";
    if (types.includes("gender")) targetCat = "Teamwork";
    
    // Attempt exact match for structured category
    const specificQs = getStructuredQuestions(context.role, context.experience, targetCat);
    if (specificQs.length > 0) return getRandom(specificQs);
    
    // Fallback within role/exp
    const allCatQuestions = Object.values(hrDataset[context.role][context.experience] || {}).flat();
    if (allCatQuestions.length > 0) return getRandom(allCatQuestions);
  }

  // Absolute fallback: pick randomly from ALL extracted questions
  if (allDatasetQuestions.length > 0) return getRandom(allDatasetQuestions);

  // If dataset missing, use generic constants list
  return getRandom(GENERIC_TEMPLATES) || "Could you describe your relevant experience?";
}

/**
 * SEARCH-BASED GROUNDING
 * Scans all 250k+ questions for keywords to find relevant technical/behavioral patterns.
 */
function getSearchGroundedQuestions(role = "", count = 5) {
  if (!role || allDatasetQuestions.length === 0) return [];
  
  const keywords = role.toLowerCase().split(' ').filter(w => w.length > 3);
  const matches = [];
  
  for (const q of allDatasetQuestions) {
    const lowerQ = q.toLowerCase();
    const score = keywords.reduce((acc, kw) => acc + (lowerQ.includes(kw) ? 1 : 0), 0);
    if (score > 0) {
      matches.push({ q, score });
    }
    if (matches.length > 1000) break; // Optimization
  }
  
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(m => m.q);
}

/**
 * NEW: Interview Kit Generator powered by Dataset
 * Calibrated for fuzzy matching and experience-level resilience.
 */
function generateInterviewKit(role = "", experience = "") {
  if (!role) return null;
  
  const normalizedRole = role.toLowerCase().trim();
  const normalizedExp = experience.toLowerCase().trim();

  // 1. EXACT MATCH (Case Insensitive)
  const exactRoleKey = Object.keys(hrDataset).find(k => k.toLowerCase() === normalizedRole);
  if (exactRoleKey) {
    const roleData = hrDataset[exactRoleKey];
    const expKey = Object.keys(roleData).find(k => 
      k.toLowerCase() === normalizedExp || 
      normalizedExp.includes(k.toLowerCase()) ||
      k.toLowerCase().includes(normalizedExp)
    ) || Object.keys(roleData)[0];
    
    return {
      role: exactRoleKey,
      experience: expKey,
      categories: roleData[expKey]
    };
  }

  // 2. FUZZY MATCH
  const fuzzyRoleKey = Object.keys(hrDataset).find(k => 
    normalizedRole.includes(k.toLowerCase()) || 
    k.toLowerCase().includes(normalizedRole)
  );
  
  if (fuzzyRoleKey) {
    const roleData = hrDataset[fuzzyRoleKey];
    const expKey = Object.keys(roleData).find(k => 
      k.toLowerCase() === normalizedExp || 
      normalizedExp.includes(k.toLowerCase()) ||
      k.toLowerCase().includes(normalizedExp)
    ) || Object.keys(roleData)[0];

    return {
      role: fuzzyRoleKey,
      experience: expKey,
      categories: roleData[expKey]
    };
  }

  // 3. KEYWORD SEARCH FALLBACK
  const searchMatches = getSearchGroundedQuestions(role, 8);
  if (searchMatches.length >= 3) {
    return {
      role: role,
      experience: experience,
      categories: { "Search Grounded": searchMatches }
    };
  }
  
  return null; 
}

module.exports = { getFallback, generateInterviewKit, getStructuredQuestions };
