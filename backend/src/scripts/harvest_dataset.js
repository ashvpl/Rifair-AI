const fs = require('fs');
const path = require('path');

/**
 * DATASET HARVESTER
 * Extracts high-quality neutral questions from Mock_interview_questions.json
 */

const datasetPath = '/Users/ayushpatil/Downloads/Mock_interview_questions.json';
const outputPath = path.join(__dirname, '../data/neutral_bank.json');

try {
  const data = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
  const allQuestions = data.questions || [];

  const bank = {
    technical: [],
    leadership: [],
    analytical: [],
    general: []
  };

  // 1. Categorize and clean
  allQuestions.forEach(item => {
    const q = item.question.trim();
    if (q.length < 30 || q.length > 300) return; // filter out too short/long

    // Simple heuristic for categorization
    const field = (item.field || "").toLowerCase();
    
    if (field.includes('computer') || field.includes('math') || field.includes('science')) {
      if (bank.technical.length < 50) bank.technical.push(q);
    } else if (field.includes('political') || field.includes('sociology') || field.includes('economics')) {
      if (bank.analytical.length < 50) bank.analytical.push(q);
    } else if (q.toLowerCase().includes('manage') || q.toLowerCase().includes('lead') || q.toLowerCase().includes('team')) {
      if (bank.leadership.length < 50) bank.leadership.push(q);
    } else {
      if (bank.general.length < 50) bank.general.push(q);
    }
  });

  // 2. Extract Patterns (Most common sentence starters)
  const starters = new Map();
  allQuestions.slice(0, 1000).forEach(item => {
    const words = item.question.split(' ');
    const starter = words.slice(0, 3).join(' ');
    starters.set(starter, (starters.get(starter) || 0) + 1);
  });

  const topStarters = Array.from(starters.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(entry => entry[0]);

  const outputData = {
    patterns: topStarters,
    bank
  };

  if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  console.log(`Successfully harvested ${Object.values(bank).flat().length} questions into ${outputPath}`);
  console.log(`Top Neutral Patterns: ${topStarters.join(', ')}`);

} catch (e) {
  console.error("Harvester Failed:", e.message);
}
