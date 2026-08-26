const fetch = require('node-fetch');

const SB_URL = 'https://hozytvscjvnjlmzxphgk.supabase.co';
const SB_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvenl0dnNjanZuamxtenhwaGdrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkwNjY2OSwiZXhwIjoyMDk1NDgyNjY5fQ.wM7ox0wZYs0Ij1iZvVBwlygmIeGqoTup-sYb1Jc1hX4';
const RESET_PIN = '2636';

async function wipe(table) {
  const res = await fetch(SB_URL + '/rest/v1/' + table + '?id=not.is.null', {
    method: 'DELETE',
    headers: {
      'apikey': SB_SERVICE_KEY,
      'Authorization': 'Bearer ' + SB_SERVICE_KEY
    }
  });
  if (!res.ok) throw new Error(await res.text());
}

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }
  if (body.pin !== RESET_PIN) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Incorrect PIN' }) };
  }
  try {
    await wipe('follow_up_requests');
    await wipe('identified_answers');
    await wipe('anonymous_answers');
    await wipe('respondents');
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
