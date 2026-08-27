const { getDatabase } = require('@netlify/database');

exports.handler = async function() {
  const db = getDatabase();
  try {
    const respondents = await db.sql`SELECT * FROM respondents ORDER BY submitted_at DESC`;
    const identifiedAnswers = await db.sql`SELECT * FROM identified_answers ORDER BY created_at DESC`;
    const anonymousAnswers = await db.sql`SELECT * FROM anonymous_answers ORDER BY created_at DESC`;
    const followUpRequests = await db.sql`SELECT * FROM follow_up_requests ORDER BY created_at DESC`;
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ respondents, identifiedAnswers, anonymousAnswers, followUpRequests })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
