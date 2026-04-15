const fs = require('fs');
const readline = require('readline');
const path = require('path');

const datasetPath = '/Users/ayushpatil/Documents/RifairAI/hr_interview_questions_dataset.json';
const outputPath = path.join(__dirname, '../../data/hr_structured_dataset.json');

if (!fs.existsSync(path.dirname(outputPath))) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
}

let outputData = {};
let seenQuestions = new Set();
let count = 0;
let kept = 0;

let currentObjectLines = [];
let inObject = false;

console.log('Starting to process dataset...');

const rl = readline.createInterface({
  input: fs.createReadStream(datasetPath),
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  const trimmed = line.trim();
  
  if (trimmed === '{') {
    inObject = true;
    currentObjectLines = ['{'];
  } else if (inObject) {
    if (trimmed === '}' || trimmed === '},') {
      currentObjectLines.push('}');
      inObject = false;
      try {
        const objStr = currentObjectLines.join('\n');
        const obj = JSON.parse(objStr);
        processObject(obj);
      } catch (err) {
        // ignore parse errors for a single object
      }
    } else {
      currentObjectLines.push(line);
    }
  }
});

function processObject(obj) {
  count++;
  if (count % 10000 === 0) console.log(`Processed ${count} items... Kept: ${kept}`);
  
  if (!obj.question || !obj.role || !obj.category || !obj.experience) return;
  
  let q = obj.question.trim().replace(/\s+/g, ' ');
  q = q.charAt(0).toUpperCase() + q.slice(1);
  
  let role = obj.role.trim();
  let exp = obj.experience.trim();
  let cat = obj.category.trim();
  
  const qLower = q.toLowerCase();
  const bucketKey = `${role}|${exp}|${cat}|${qLower}`;
  if (seenQuestions.has(bucketKey)) return;
  
  const words = q.split(' ');
  // "Length between 8–25 words"
  if (words.length < 8 || words.length > 25) return;
  
  // naive check for typical personal/biased words
  const biasWords = ['age', 'married', 'religion', 'pregnant', 'kids', 'young', 'old', 'race', 'gender'];
  for (const bw of biasWords) {
    if (qLower.includes(` ${bw} `)) return;
  }
  
  seenQuestions.add(bucketKey);
  kept++;
  
  if (!outputData[role]) outputData[role] = {};
  if (!outputData[role][exp]) outputData[role][exp] = {};
  if (!outputData[role][exp][cat]) outputData[role][exp][cat] = [];
  
  outputData[role][exp][cat].push(q);
}

rl.on('close', () => {
  console.log(`Finished processing. Total: ${count}, Kept: ${kept}`);
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  console.log('Saved to', outputPath);
  
  // Also log the size of the generated file
  const stats = fs.statSync(outputPath);
  console.log(`File size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
});
