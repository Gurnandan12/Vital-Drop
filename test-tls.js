const https = require('https');
const req = https.request('https://api.openai.com/v1/chat/completions', { method: 'HEAD' }, (res) => {
  console.log('Status:', res.statusCode);
});
req.on('error', (e) => console.log('Error:', e.message));
req.end();
