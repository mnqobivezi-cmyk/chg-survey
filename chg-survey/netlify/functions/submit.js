const { neon } = require('@neondatabase/serverless');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { respondent, identifiedAnswers, anonymousAnswers, followUp, selfSelectedCellGroup } = payload;
  const sql = neon(process.env.NEON_DATABASE_URL);

  try {
    if (followUp && followUp.topic) {
      await sql`ALTER TABLE follow_up_requests ADD COLUMN IF NOT EXISTS urgency text`;
    }
    if (selfSelectedCellGroup) {
      await sql`ALTER TABLE cell_group_allocations ADD COLUMN IF NOT EXISTS approved boolean NOT NULL DEFAULT true`;
    }
    const [row] = await sql`
      INSERT INTO respondents (
        first_name, surname, gender, date_of_birth, phone,
        formatted_address, street, suburb, city, province, postal_code,
        latitude, longitude, knows_cell_group, stated_cell_group, submitted_at, device
      ) VALUES (
        ${respondent.first_name}, ${respondent.surname}, ${respondent.gender},
        ${respondent.date_of_birth}, ${respondent.phone},
        ${respondent.formatted_address}, ${respondent.street}, ${respondent.suburb}, ${respondent.city},
        ${respondent.province}, ${respondent.postal_code},
        ${respondent.latitude}, ${respondent.longitude}, ${respondent.knows_cell_group},
        ${respondent.stated_cell_group}, ${respondent.submitted_at}, ${respondent.device}
      )
      RETURNING id
    `;
    const respondentId = row.id;

    const queries = [];

    if (Array.isArray(identifiedAnswers)) {
      identifiedAnswers.forEach(a => {
        queries.push(sql`
          INSERT INTO identified_answers (respondent_id, section, question_key, answer)
          VALUES (${respondentId}, ${a.section}, ${a.question_key}, ${a.answer})
        `);
      });
    }

    if (Array.isArray(anonymousAnswers)) {
      anonymousAnswers.forEach(a => {
        queries.push(sql`
          INSERT INTO anonymous_answers (section, question_key, answer)
          VALUES (${a.section}, ${a.question_key}, ${a.answer})
        `);
      });
    }

    if (followUp && followUp.topic) {
      queries.push(sql`
        INSERT INTO follow_up_requests (respondent_id, topic, urgency)
        VALUES (${respondentId}, ${followUp.topic}, ${followUp.urgency || null})
      `);
    }

    if (selfSelectedCellGroup) {
      queries.push(sql`
        INSERT INTO cell_group_allocations (respondent_id, group_name, method, approved, updated_at)
        VALUES (${respondentId}, ${selfSelectedCellGroup}, 'self-selected', false, now())
        ON CONFLICT (respondent_id) DO NOTHING
      `);
    }

    if (queries.length) {
      await sql.transaction(queries);
    }

    return { statusCode: 200, body: JSON.stringify({ success: true, respondentId }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
