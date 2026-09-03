const { neon } = require('@neondatabase/serverless');

exports.handler = async function() {
  const sql = neon(process.env.NEON_DATABASE_URL);
  try {
    await sql`CREATE TABLE IF NOT EXISTS hidden_respondents (
      respondent_id uuid PRIMARY KEY,
      visible boolean,
      hidden_at timestamptz DEFAULT now()
    )`;
    await sql`ALTER TABLE hidden_respondents ADD COLUMN IF NOT EXISTS visible boolean`;
    await sql`UPDATE hidden_respondents SET visible = false WHERE visible IS NULL`;
    await sql`ALTER TABLE cell_group_allocations ADD COLUMN IF NOT EXISTS approved boolean NOT NULL DEFAULT true`;
    const respondents = await sql`SELECT * FROM respondents ORDER BY submitted_at DESC`;
    const identifiedAnswers = await sql`SELECT * FROM identified_answers ORDER BY created_at DESC`;
    const anonymousAnswers = await sql`SELECT * FROM anonymous_answers ORDER BY created_at DESC`;
    const followUpRequests = await sql`SELECT * FROM follow_up_requests ORDER BY created_at DESC`;
    const settingsRows = await sql`SELECT group_names FROM cell_group_settings WHERE id = 1`;
    const cellGroupAllocations = await sql`SELECT * FROM cell_group_allocations`;
    const overrideRows = await sql`SELECT respondent_id, visible FROM hidden_respondents`;
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        respondents, identifiedAnswers, anonymousAnswers, followUpRequests,
        cellGroupSettings: settingsRows[0] ? settingsRows[0].group_names : null,
        cellGroupAllocations,
        hiddenRespondentIds: overrideRows.filter(r => r.visible === false).map(r => r.respondent_id),
        forceVisibleRespondentIds: overrideRows.filter(r => r.visible === true).map(r => r.respondent_id)
      })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
