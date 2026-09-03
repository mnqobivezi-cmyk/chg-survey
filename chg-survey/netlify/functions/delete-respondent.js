const { neon } = require('@neondatabase/serverless');

const RESET_PIN = '2636';

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
  const respondentId = body.respondentId;
  if (!respondentId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing respondentId' }) };
  }
  const sql = neon(process.env.NEON_DATABASE_URL);
  try {
    await sql.transaction([
      sql`DELETE FROM follow_up_requests WHERE respondent_id = ${respondentId}`,
      sql`DELETE FROM cell_group_allocations WHERE respondent_id = ${respondentId}`,
      sql`DELETE FROM identified_answers WHERE respondent_id = ${respondentId}`,
      sql`DELETE FROM respondents WHERE id = ${respondentId}`
    ]);
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
