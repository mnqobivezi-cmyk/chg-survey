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
  if (!respondentId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing respondentId' }) };
  }
  // visible: true = force-show regardless of launch-date cutoff
  //          false = force-hide regardless of launch-date cutoff
  //          null/undefined = remove override, fall back to the default date-based cutoff
  const visible = body.visible === true ? true : body.visible === false ? false : null;
  const sql = neon(process.env.NEON_DATABASE_URL);
  try {
    await sql`CREATE TABLE IF NOT EXISTS hidden_respondents (
      respondent_id uuid PRIMARY KEY,
      visible boolean,
      hidden_at timestamptz DEFAULT now()
    )`;
    await sql`ALTER TABLE hidden_respondents ADD COLUMN IF NOT EXISTS visible boolean`;
    await sql`UPDATE hidden_respondents SET visible = false WHERE visible IS NULL`;
    if (visible === null) {
      await sql`DELETE FROM hidden_respondents WHERE respondent_id = ${respondentId}`;
    } else {
      await sql`INSERT INTO hidden_respondents (respondent_id, visible) VALUES (${respondentId}, ${visible})
                ON CONFLICT (respondent_id) DO UPDATE SET visible = EXCLUDED.visible, hidden_at = now()`;
    }
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
