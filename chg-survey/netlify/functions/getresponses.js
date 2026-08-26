const fetch = require('node-fetch');

const SB_URL = 'https://hozytvscjvnjlmzxphgk.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvenl0dnNjanZuamxtenhwaGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MDY2NjksImV4cCI6MjA5NTQ4MjY2OX0.6iOdeWP3HylsqwGYuuChe8pA99PnLz7mcTXB-f9234k';

async function getAll(table, order) {
  const res = await fetch(
    SB_URL + '/rest/v1/' + table + '?select=*' + (order ? '&order=' + order : ''),
    {
      headers: {
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + SB_KEY
      }
    }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

exports.handler = async function() {
  try {
    const [respondents, identifiedAnswers, anonymousAnswers, followUpRequests] = await Promise.all([
      getAll('respondents', 'submitted_at.desc'),
      getAll('identified_answers', 'created_at.desc'),
      getAll('anonymous_answers', 'created_at.desc'),
      getAll('follow_up_requests', 'created_at.desc')
    ]);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ respondents, identifiedAnswers, anonymousAnswers, followUpRequests })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
