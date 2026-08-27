const fetch = require('node-fetch');

const SB_URL = process.env.SB_URL;
const SB_KEY = process.env.SB_ANON_KEY;

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
