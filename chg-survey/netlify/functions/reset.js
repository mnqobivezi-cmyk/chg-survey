const { getDatabase } = require('@netlify/database');

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
  const db = getDatabase();
  try {
    await db.sql`DELETE FROM follow_up_requests`;
    await db.sql`DELETE FROM identified_answers`;
    await db.sql`DELETE FROM anonymous_answers`;
    await db.sql`DELETE FROM respondents`;
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
