const fs = require('fs');

function replaceUsage(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/evaluations_used:\s*\(?usage\.evaluations_used\s*\?\?\s*0\)?\s*\+\s*1,/g, '// evaluations_used omitted due to schema missing');
  content = content.replace(/jd_analyses_used:\s*\(?usage\.jd_analyses_used\s*\?\?\s*0\)?\s*\+\s*1,/g, '// jd_analyses_used omitted due to schema missing');
  fs.writeFileSync(file, content);
}

replaceUsage('src/controllers/evaluationController.js');
replaceUsage('src/controllers/jdAnalyzerController.js');

let subService = fs.readFileSync('src/services/subscriptionService.js', 'utf8');
subService = subService.replace(/jd_analyses_used:\s*0,\n\s*evaluations_used:\s*0,/g, '');
fs.writeFileSync('src/services/subscriptionService.js', subService);
console.log("Fixed usage updates");
