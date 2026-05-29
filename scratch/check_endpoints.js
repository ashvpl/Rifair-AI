const https = require('https');

const urls = [
  'https://rifairai.com',
  'https://rifairai.com/pricing',
  'https://rifairai.com/privacy',
  'https://rifairai.com/terms',
  'https://rifairai.com/refund',
  'https://rifairai.com/sign-in',
  'https://rifairai.com/sign-up',
  'https://rifairai.com/help',
  'https://rifairai.com/dashboard',
  'https://rifairai.com/analyze',
  'https://rifairai.com/kit',
  'https://rifairai.com/jd-analyser',
  'https://rifairai.com/evaluations'
];

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', (err) => {
      resolve({ url, status: 'ERROR: ' + err.message });
    });
  });
}

async function run() {
  console.log('Checking critical live endpoints...');
  for (const url of urls) {
    const res = await checkUrl(url);
    console.log(`${res.url} -> ${res.status}`);
  }
}

run();
