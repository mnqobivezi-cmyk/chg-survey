const fetch = require('node-fetch');

const SB_URL = 'https://hozytvscjvnjlmzxphgk.supabase.co';
const SB_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvenl0dnNjanZuamxtenhwaGdrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkwNjY2OSwiZXhwIjoyMDk1NDgyNjY5fQ.wM7ox0wZYs0Ij1iZvVBwlygmIeGqoTup-sYb1Jc1hX4';

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch(e) { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request' }) }; }

  if (!body || body.pin !== '2636') {
    return { statusCode: 403, body: JSON.stringify({ error: 'Incorrect PIN' }) };
  }

  // id provided = delete single row, otherwise delete all
  const url = body.id
    ? `${SB_URL}/rest/v1/cell_group_responses?id=eq.${body.id}`
    : `${SB_URL}/rest/v1/cell_group_responses?id=neq.00000000-0000-0000-0000-000000000000`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'apikey': SB_SERVICE_KEY,
        'Authorization': 'Bearer ' + SB_SERVICE_KEY,
        'Prefer': 'return=minimal'
      }
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
