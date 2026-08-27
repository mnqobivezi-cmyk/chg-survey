const fetch = require('node-fetch');

const SB_URL = process.env.SB_URL;
const SB_SERVICE_KEY = process.env.SB_SERVICE_ROLE_KEY;
const RESET_PIN = '2636';

async function wipe(table) {
  const res = await fetch(SB_URL + '/rest/v1/' + table + '?id=not.is.null', {
    method: 'DELETE',
    headers: {
      'apikey': SB_SERVICE_KEY,
      'Authorization': 'Bearer ' + SB_SERVICE_KEY
    }
  });
  if (!res.ok) throw new Error(await res.text());
}

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
  try {
    await wipe('follow_up_requests');
    await wipe('identified_answers');
    await wipe('anonymous_answers');
    await wipe('respondents');
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
