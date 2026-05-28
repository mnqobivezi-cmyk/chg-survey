const fetch = require('node-fetch');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Verify PIN before doing anything
  let body;
  try {
    body = JSON.parse(event.body);
  } catch(e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request' }) };
  }

  if (!body || body.pin !== '2636') {
    return { statusCode: 403, body: JSON.stringify({ error: 'Incorrect PIN' }) };
  }

  const SB_URL = 'https://hozytvscjvnjlmzxphgk.supabase.co';
  const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvenl0dnNjanZuamxtenhwaGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MDY2NjksImV4cCI6MjA5NTQ4MjY2OX0.6iOdeWP3HylsqwGYuuChe8pA99PnLz7mcTXB-f9234k';

  try {
    const response = await fetch(
      SB_URL + '/rest/v1/cell_group_responses?id=neq.00000000-0000-0000-0000-000000000000',
      {
        method: 'DELETE',
        headers: {
          'apikey': SB_KEY,
          'Authorization': 'Bearer ' + SB_KEY,
          'Prefer': 'return=minimal'
        }
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return { statusCode: response.status, body: text };
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
