const fetch = require('node-fetch'); // Assuming node-fetch is available, or we use native fetch if Node >= 18

async function testAnalyze() {
  try {
    const response = await fetch('http://localhost:5001/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: "Are you aggressive enough to handle tight deadlines?\nDo you think you'll fit into our fast-paced bro culture?\nCan you handle working under a male-dominated team?"
      })
    });
    
    if (!response.ok) {
       console.log("Status:", response.status);
       const errorText = await response.text();
       console.log("Error:", errorText);
       return;
    }

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
}

testAnalyze();
