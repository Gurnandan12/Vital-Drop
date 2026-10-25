const http = require('http');

const data = JSON.stringify({
  userQuery: "Why is my portfolio going down?",
  portfolioData: {
    stocks: [
      { name: "Reliance", price: 2450, change: "+1.2%" },
      { name: "TCS", price: 3900, change: "-0.5%" }
    ]
  }
});

const req = http.request(
  'http://localhost:3001/api/ai-insights',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  },
  (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => console.log('Response:', body));
  }
);
req.on('error', (e) => console.error('Error:', e));
req.write(data);
req.end();
