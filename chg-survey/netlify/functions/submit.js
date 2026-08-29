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

  const { respondent, identifiedAnswers, anonymousAnswers, followUp } = payload;
  const sql = neon(process.env.NEON_DATABASE_URL);

  try {
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
        INSERT INTO follow_up_requests (respondent_id, topic)
        VALUES (${respondentId}, ${followUp.topic})
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
