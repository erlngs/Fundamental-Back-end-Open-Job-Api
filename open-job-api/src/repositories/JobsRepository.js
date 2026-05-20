const pool = require('../database');
const { v4: uuidv4 } = require('uuid');
const { NotFoundError, AuthorizationError } = require('../utils/errors');

const JobsRepository = {
  async create({ company_id, category_id, title, description, requirements, 
               location, location_type, location_city, salary_min, salary_max, 
               is_salary_visible, job_type, experience_level, status }) {
  const id = `job-${uuidv4()}`;
  const result = await pool.query(
    `INSERT INTO jobs (id, company_id, category_id, title, description, requirements, 
      location, location_type, location_city, salary_min, salary_max, is_salary_visible,
      job_type, experience_level, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
    [id, company_id, category_id, title, description, requirements,
     location, location_type, location_city, salary_min, salary_max, is_salary_visible,
     job_type, experience_level, status || 'open']
  );
  return result.rows[0];
},

  async findAll({ title, companyName } = {}) {
  let query = `
    SELECT j.id, j.company_id, j.category_id, j.title, j.description,
           j.requirements, j.location, j.salary_min, j.salary_max,
           j.job_type, j.status, j.created_at, c.name as company_name
    FROM jobs j
    LEFT JOIN companies c ON j.company_id = c.id
    LEFT JOIN categories cat ON j.category_id = cat.id
    WHERE 1=1
  `;
  const values = [];
  let idx = 1;
  if (title) {
    query += ` AND j.title ILIKE $${idx}`;
    values.push(`%${title}%`);
    idx++;
  }
  if (companyName) {
    query += ` AND c.name ILIKE $${idx}`;
    values.push(`%${companyName}%`);
  }
  query += ' ORDER BY j.created_at DESC';
  const result = await pool.query(query, values);
  return result.rows;
},

  async findById(id) {
    const result = await pool.query(
      `SELECT j.*, c.name as company_name, c.location as company_location,
              cat.name as category_name
       FROM jobs j
       LEFT JOIN companies c ON j.company_id = c.id
       LEFT JOIN categories cat ON j.category_id = cat.id
       WHERE j.id = $1`,
      [id]
    );
    if (!result.rows[0]) throw new NotFoundError('Job not found');
    return result.rows[0];
  },

  async findByCompany(companyId) {
    const result = await pool.query(
      `SELECT j.*, cat.name as category_name 
       FROM jobs j
       LEFT JOIN categories cat ON j.category_id = cat.id
       WHERE j.company_id = $1 ORDER BY j.created_at DESC`,
      [companyId]
    );
    return result.rows;
  },

  async findByCategory(categoryId) {
    const result = await pool.query(
      `SELECT j.*, c.name as company_name 
       FROM jobs j
       LEFT JOIN companies c ON j.company_id = c.id
       WHERE j.category_id = $1 ORDER BY j.created_at DESC`,
      [categoryId]
    );
    return result.rows;
  },

  async update(id, userId, data) {
  const job = await this.findById(id);
  const companyCheck = await pool.query(
    'SELECT user_id FROM companies WHERE id = $1',
    [job.company_id]
  );
  if (!companyCheck.rows[0] || companyCheck.rows[0].user_id !== userId) {
    throw new AuthorizationError('You are not authorized to update this job');
  }
  
  // Merge data lama dengan data baru
  const company_id = data.company_id ?? job.company_id;
  const category_id = data.category_id ?? job.category_id;
  const title = data.title ?? job.title;
  const description = data.description ?? job.description;
  const requirements = data.requirements ?? job.requirements;
  const location = data.location ?? job.location;
  const salary_min = data.salary_min ?? job.salary_min;
  const salary_max = data.salary_max ?? job.salary_max;
  const job_type = data.job_type ?? job.job_type;
  const status = data.status ?? job.status;

  const result = await pool.query(
    `UPDATE jobs SET company_id=$1, category_id=$2, title=$3, description=$4, requirements=$5,
     location=$6, salary_min=$7, salary_max=$8, job_type=$9, status=$10, updated_at=NOW()
     WHERE id=$11 RETURNING *`,
    [company_id, category_id, title, description, requirements, location, salary_min, salary_max, job_type, status, id]
  );
  return result.rows[0];
},

  async delete(id, userId) {
    const job = await this.findById(id);
    const companyCheck = await pool.query(
      'SELECT user_id FROM companies WHERE id = $1',
      [job.company_id]
    );
    if (!companyCheck.rows[0] || companyCheck.rows[0].user_id !== userId) {
      throw new AuthorizationError('You are not authorized to delete this job');
    }
    await pool.query('DELETE FROM jobs WHERE id = $1', [id]);
  },
};

module.exports = JobsRepository;