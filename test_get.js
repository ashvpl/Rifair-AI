const http = require('http');

http.get('http://localhost:3000/api/kit-audit/2299b8d2-1080-42ef-a3ce-f0e9c3a7b62a', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Body: ${data}`);
  });
}).on('error', (err) => {
  console.log('Error: ', err.message);
});
