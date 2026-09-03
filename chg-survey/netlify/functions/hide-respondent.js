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
  const hidden = !!body.hidden;
  if (!respondentId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing respondentId' }) };
  }
  const sql = neon(process.env.NEON_DATABASE_URL);
  try {
    await sql`CREATE TABLE IF NOT EXISTS hidden_respondents (
      respondent_id uuid PRIMARY KEY,
      hidden_at timestamptz DEFAULT now()
    )`;
    if (hidden) {
      await sql`INSERT INTO hidden_respondents (respondent_id) VALUES (${respondentId}) ON CONFLICT (respondent_id) DO NOTHING`;
    } else {
      await sql`DELETE FROM hidden_respondents WHERE respondent_id = ${respondentId}`;
    }
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
