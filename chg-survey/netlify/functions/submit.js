exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const SB_URL = 'https://qqikvklpnkfxauwavmj.supabase.co';
  const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxaWt2a2xwbmtmeGF1d2F2dm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MTgwNzAsImV4cCI6MjA5MzI5NDA3MH0.R1iG33nxvomwTkWeERXncgK7MZ0tOB6bGUG5wD3atj0';

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
