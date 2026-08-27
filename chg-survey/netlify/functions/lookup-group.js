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

  const firstName = (body.first_name || '').trim();
  const surname = (body.surname || '').trim();
  const phone = (body.phone || '').trim();
  if (!firstName || !surname || !phone) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing details' }) };
  }

  const sql = neon(process.env.NEON_DATABASE_URL);
  try {
    const matches = await sql`
      SELECT r.id, a.group_name
      FROM respondents r
      LEFT JOIN cell_group_allocations a ON a.respondent_id = r.id
      WHERE lower(trim(r.first_name)) = lower(${firstName})
        AND lower(trim(r.surname)) = lower(${surname})
        AND trim(r.phone) = ${phone}
      ORDER BY r.submitted_at DESC
      LIMIT 1
    `;
    if (!matches.length) {
      return { statusCode: 200, body: JSON.stringify({ found: false }) };
    }
    const m = matches[0];
    return {
      statusCode: 200,
      body: JSON.stringify({
        found: true,
        respondentId: m.id,
        groupName: m.group_name || null
      })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
