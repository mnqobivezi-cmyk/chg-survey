const { neon } = require('@neondatabase/serverless');

const ADMIN_PW = 'OT2026surveyCellG';

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
  if (body.adminPassword !== ADMIN_PW) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const { groupNames, allocations } = body;
  const sql = neon(process.env.NEON_DATABASE_URL);

  try {
    await sql`ALTER TABLE cell_group_allocations ADD COLUMN IF NOT EXISTS approved boolean NOT NULL DEFAULT true`;
    if (Array.isArray(groupNames)) {
      await sql`
        INSERT INTO cell_group_settings (id, group_names, updated_at)
        VALUES (1, ${JSON.stringify(groupNames)}::jsonb, now())
        ON CONFLICT (id) DO UPDATE SET group_names = EXCLUDED.group_names, updated_at = now()
      `;
    }

    if (Array.isArray(allocations)) {
      for (const a of allocations) {
        await sql`
          INSERT INTO cell_group_allocations (respondent_id, group_name, method, approved, updated_at)
          VALUES (${a.respondent_id}, ${a.group_name}, ${a.method || 'manual'}, true, now())
          ON CONFLICT (respondent_id) DO UPDATE SET group_name = EXCLUDED.group_name, method = EXCLUDED.method, approved = true, updated_at = now()
        `;
      }
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
