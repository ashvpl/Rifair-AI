const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function extractDemoData() {
  const submissionPath = path.join(__dirname, '../submission.csv');
  const candidatesPath = path.join(__dirname, '../candidates.jsonl');
  const outputPath = path.join(__dirname, '../frontend/lib/demo-real-data.json');

  console.log('Reading submission.csv...');
  const submissionContent = fs.readFileSync(submissionPath, 'utf-8');
  const lines = submissionContent.split('\n').filter(l => l.trim().length > 0);
  
  // Skip header, get top 5
  const topRows = lines.slice(1, 6);
  const targetIds = new Set();
  const candidateMeta = {}; // id -> { rank, score, reasoning }

  topRows.forEach(row => {
    // Basic CSV parsing since the reasoning column has quotes and commas
    const parts = row.split(',');
    const candidate_id = parts[0];
    const rank = parseInt(parts[1], 10);
    const score = parseFloat(parts[2]);
    // The reasoning is everything else, usually wrapped in quotes.
    const reasoning = parts.slice(3).join(',').replace(/^"|"$/g, '');
    
    targetIds.add(candidate_id);
    candidateMeta[candidate_id] = { rank, score, reasoning };
  });

  console.log(`Searching for ${targetIds.size} candidates in candidates.jsonl...`);
  
  const foundCandidates = [];
  const fileStream = fs.createReadStream(candidatesPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.trim()) {
      try {
        const c = JSON.parse(line);
        if (targetIds.has(c.candidate_id)) {
          foundCandidates.push(c);
          if (foundCandidates.length === targetIds.size) {
            break; // Found all
          }
        }
      } catch (err) {}
    }
  }

  console.log(`Found ${foundCandidates.length} candidates.`);

  // Transform to the Candidate schema
  const finalData = foundCandidates.map(c => {
    const meta = candidateMeta[c.candidate_id];
    
    // Parse reasoning into rough explainability parts
    const reasoningStr = meta.reasoning;
    const strengths = reasoningStr.split('. ')
      .filter(s => s.trim().length > 0)
      .map(s => s.trim().replace(/\.$/, ''));

    // Base scores around the overall score
    const overall = Math.round(meta.score * 100);
    const relevance = Math.min(99, overall + Math.floor(Math.random() * 5));
    const experience = Math.min(98, overall + Math.floor(Math.random() * 5));
    const behavior = Math.round(c.redrob_signals?.recruiter_response_rate * 100) || 85;
    const trust = c.redrob_signals?.verified_email || c.redrob_signals?.verified_phone ? 95 : 88;
    const shipper = c.redrob_signals?.github_activity_score > 0 ? 92 : 80;

    return {
      id: c.candidate_id,
      rank: meta.rank,
      name: c.profile?.anonymized_name || 'Unknown Candidate',
      currentTitle: c.profile?.current_title || 'Software Engineer',
      yearsExperience: c.profile?.years_of_experience || 5,
      industry: c.profile?.current_industry || 'Tech',
      location: c.profile?.location || 'Remote',
      scores: {
        overall,
        relevance,
        experience,
        behavior,
        trust,
        shipper
      },
      explainability: {
        strengths: strengths,
        weaknesses: c.redrob_signals?.notice_period_days > 45 ? [`Notice period is ${c.redrob_signals.notice_period_days} days`] : [],
        missingRequirements: []
      },
      authenticity: {
        timelineValidation: 'Verified',
        skillValidation: 'Verified',
        honeypotRisk: 'Low'
      },
      behavior: {
        recruiterResponseRate: `${Math.round((c.redrob_signals?.recruiter_response_rate || 0.8) * 100)}%`,
        interviewCompletionRate: `${Math.round((c.redrob_signals?.interview_completion_rate || 0.7) * 100)}%`,
        openToWorkStatus: c.redrob_signals?.open_to_work_flag ? 'Actively Looking' : 'Passive'
      }
    };
  });

  // Sort by rank
  finalData.sort((a, b) => a.rank - b.rank);

  fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));
  console.log(`Saved demo data to ${outputPath}`);
}

extractDemoData().catch(console.error);
