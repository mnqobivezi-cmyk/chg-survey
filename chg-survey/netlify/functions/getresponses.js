const { neon } = require('@neondatabase/serverless');

exports.handler = async function() {
  const sql = neon(process.env.NEON_DATABASE_URL);
  try {
    const respondents = await sql`SELECT * FROM respondents ORDER BY submitted_at DESC`;
    const identifiedAnswers = await sql`SELECT * FROM identified_answers ORDER BY created_at DESC`;
    const anonymousAnswers = await sql`SELECT * FROM anonymous_answers ORDER BY created_at DESC`;
    const followUpRequests = await sql`SELECT * FROM follow_up_requests ORDER BY created_at DESC`;
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ respondents, identifiedAnswers, anonymousAnswers, followUpRequests })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
