const { neon } = require('@neondatabase/serverless');

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

  const respondentId = body.respondentId;
  const message = (body.message || '').trim();
  if (!respondentId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing respondent' }) };
  }

  const sql = neon(process.env.NEON_DATABASE_URL);
  try {
    await sql`
      INSERT INTO allocation_disputes (respondent_id, message)
      VALUES (${respondentId}, ${message || null})
    `;
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
