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
  const sql = neon(process.env.NEON_DATABASE_URL);
  try {
    await sql`DELETE FROM follow_up_requests`;
    await sql`DELETE FROM identified_answers`;
    await sql`DELETE FROM anonymous_answers`;
    await sql`DELETE FROM respondents`;
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
