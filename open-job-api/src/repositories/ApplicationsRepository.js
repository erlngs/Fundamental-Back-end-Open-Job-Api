const pool = require('../database');
const { v4: uuidv4 } = require('uuid');
const { NotFoundError, AuthorizationError, ConflictError } = require('../utils/errors');

const ApplicationsRepository = {
  async create({ user_id, job_id, cover_letter }) {
  const existing = await pool.query(
    'SELECT id FROM applications WHERE user_id = $1 AND job_id = $2',
    [user_id, job_id]
  );
  if (existing.rows[0]) throw new ConflictError('You have already applied for this job');

  // Cek job exists dulu
  const jobExists = await pool.query('SELECT id FROM jobs WHERE id = $1', [job_id]);
  if (!jobExists.rows[0]) throw new NotFoundError('Job not found');

  const id = `application-${uuidv4()}`;
  const result = await pool.query(
    `INSERT INTO applications (id, user_id, job_id, cover_letter)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [id, user_id, job_id, cover_letter]
  );
  return result.rows[0];
},

  async findAll() {
  const result = await pool.query(
    `SELECT a.id, a.user_id, a.job_id, a.status, a.cover_letter, 
            a.created_at, a.updated_at,
            u.name as user_name, u.email as user_email,
            j.title as job_title, j.company_id, j.category_id,
            c.name as company_name
     FROM applications a
     LEFT JOIN users u ON a.user_id = u.id
     LEFT JOIN jobs j ON a.job_id = j.id
     LEFT JOIN companies c ON j.company_id = c.id
     ORDER BY a.created_at DESC`
  );
  return result.rows;
},

  async findById(id) {
    const result = await pool.query(
      `SELECT a.*, u.name as user_name, u.email as user_email,
              j.title as job_title, c.name as company_name
       FROM applications a
       LEFT JOIN users u ON a.user_id = u.id
       LEFT JOIN jobs j ON a.job_id = j.id
       LEFT JOIN companies c ON j.company_id = c.id
       WHERE a.id = $1`,
      [id]
    );
    if (!result.rows[0]) throw new NotFoundError('Application not found');
    return result.rows[0];
  },

  async findByUser(userId) {
  const result = await pool.query(
    `SELECT a.id, a.user_id, a.job_id, a.status, a.cover_letter,
            a.created_at, a.updated_at,
            j.title as job_title, j.company_id, j.category_id,
            j.location as job_location, j.job_type, j.salary_min,
            j.salary_max, c.name as company_name
     FROM applications a
     LEFT JOIN jobs j ON a.job_id = j.id
     LEFT JOIN companies c ON j.company_id = c.id
     WHERE a.user_id = $1 ORDER BY a.created_at DESC`,
    [userId]
  );
  return result.rows;
},

  async findByJob(jobId) {
    const result = await pool.query(
      `SELECT a.*, u.name as user_name, u.email as user_email
       FROM applications a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.job_id = $1 ORDER BY a.created_at DESC`,
      [jobId]
    );
    return result.rows;
  },

  async updateStatus(id, userId, status) {
    const app = await this.findById(id);
    const jobOwner = await pool.query(
      `SELECT c.user_id FROM jobs j 
       LEFT JOIN companies c ON j.company_id = c.id 
       WHERE j.id = $1`,
      [app.job_id]
    );
    const isJobOwner = jobOwner.rows[0] && jobOwner.rows[0].user_id === userId;
    const isApplicant = app.user_id === userId;

    if (!isJobOwner && !isApplicant) {
      throw new AuthorizationError('You are not authorized to update this application');
    }
    const result = await pool.query(
      'UPDATE applications SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  },

  async delete(id, userId) {
    const app = await this.findById(id);
    if (app.user_id !== userId) {
      throw new AuthorizationError('You are not authorized to delete this application');
    }
    await pool.query('DELETE FROM applications WHERE id = $1', [id]);
  },
};

module.exports = ApplicationsRepository;