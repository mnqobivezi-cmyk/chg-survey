const { neon } = require('@neondatabase/serverless');

exports.handler = async function() {
  const sql = neon(process.env.NEON_DATABASE_URL);
  try {
    const respondents = await sql`SELECT * FROM respondents ORDER BY submitted_at DESC`;
    const identifiedAnswers = await sql`SELECT * FROM identified_answers ORDER BY created_at DESC`;
    const anonymousAnswers = await sql`SELECT * FROM anonymous_answers ORDER BY created_at DESC`;
    const followUpRequests = await sql`SELECT * FROM follow_up_requests ORDER BY created_at DESC`;
    const settingsRows = await sql`SELECT group_names FROM cell_group_settings WHERE id = 1`;
    const cellGroupAllocations = await sql`SELECT * FROM cell_group_allocations`;
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        respondents, identifiedAnswers, anonymousAnswers, followUpRequests,
        cellGroupSettings: settingsRows[0] ? settingsRows[0].group_names : null,
        cellGroupAllocations
      })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
