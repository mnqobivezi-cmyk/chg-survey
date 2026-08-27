const fetch = require('node-fetch');

const SB_URL = process.env.SB_URL;
const SB_KEY = process.env.SB_ANON_KEY;

async function sb(path, options) {
  const res = await fetch(SB_URL + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SB_KEY,
      'Authorization': 'Bearer ' + SB_KEY,
      ...(options && options.headers ? options.headers : {})
    }
  });
  return res;
}

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { respondent, identifiedAnswers, anonymousAnswers, followUp } = payload;

  try {
    const respRes = await sb('/rest/v1/respondents', {
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify(respondent)
    });
    if (!respRes.ok) {
      const text = await respRes.text();
      return { statusCode: respRes.status, body: text };
    }
    const respData = await respRes.json();
    const respondentId = respData[0] && respData[0].id;

    if (Array.isArray(identifiedAnswers) && identifiedAnswers.length) {
      const rows = identifiedAnswers.map(a => ({ ...a, respondent_id: respondentId }));
      const r = await sb('/rest/v1/identified_answers', {
        method: 'POST',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify(rows)
      });
      if (!r.ok) {
        const text = await r.text();
        return { statusCode: r.status, body: text };
      }
    }

    if (Array.isArray(anonymousAnswers) && anonymousAnswers.length) {
      const r = await sb('/rest/v1/anonymous_answers', {
        method: 'POST',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify(anonymousAnswers)
      });
      if (!r.ok) {
        const text = await r.text();
        return { statusCode: r.status, body: text };
      }
    }

    if (followUp && followUp.topic) {
      const r = await sb('/rest/v1/follow_up_requests', {
        method: 'POST',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify({ respondent_id: respondentId, topic: followUp.topic })
      });
      if (!r.ok) {
        const text = await r.text();
        return { statusCode: r.status, body: text };
      }
    }

    return { statusCode: 200, body: JSON.stringify({ success: true, respondentId }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
