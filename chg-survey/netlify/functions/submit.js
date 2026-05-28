const fetch = require('node-fetch');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const SB_URL = 'https://hozytvscjvnjlmzxphgk.supabase.co';
  const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvenl0dnNjanZuamxtenhwaGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MDY2NjksImV4cCI6MjA5NTQ4MjY2OX0.6iOdeWP3HylsqwGYuuChe8pA99PnLz7mcTXB-f9234k';

  try {
    const response = await fetch(SB_URL + '/rest/v1/cell_group_responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + SB_KEY,
        'Prefer': 'return=minimal'
      },
      body: event.body
    });

    if (!response.ok) {
      const text = await response.text();
      return { statusCode: response.status, body: text };
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
