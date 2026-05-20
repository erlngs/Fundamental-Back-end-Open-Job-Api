const pool = require('../database');
const { v4: uuidv4 } = require('uuid');
const { NotFoundError, AuthorizationError, ConflictError } = require('../utils/errors');

const BookmarksRepository = {
  async create({ user_id, job_id }) {
    const existing = await pool.query(
      'SELECT id FROM bookmarks WHERE user_id = $1 AND job_id = $2',
      [user_id, job_id]
    );
    if (existing.rows[0]) throw new ConflictError('Job already bookmarked');

    const id = `bookmark-${uuidv4()}`;
    const result = await pool.query(
      'INSERT INTO bookmarks (id, user_id, job_id) VALUES ($1, $2, $3) RETURNING *',
      [id, user_id, job_id]
    );
    return result.rows[0];
  },

  async findAll(userId) {
  const result = await pool.query(
    `SELECT b.id, b.user_id, b.job_id, b.created_at,
            j.title as job_title, j.description as job_description,
            j.location as job_location, j.salary_min, j.salary_max,
            j.job_type, j.status as job_status, j.experience_level,
            j.location_type, j.location_city, j.is_salary_visible,
            j.category_id, c.id as company_id, c.name as company_name
     FROM bookmarks b
     LEFT JOIN jobs j ON b.job_id = j.id
     LEFT JOIN companies c ON j.company_id = c.id
     WHERE b.user_id = $1 ORDER BY b.created_at DESC`,
    [userId]
  );
  return result.rows;
},

  async findById(id) {
    const result = await pool.query(
      `SELECT b.*, j.title as job_title 
       FROM bookmarks b
       LEFT JOIN jobs j ON b.job_id = j.id
       WHERE b.id = $1`,
      [id]
    );
    if (!result.rows[0]) throw new NotFoundError('Bookmark not found');
    return result.rows[0];
  },

  async deleteByUserAndJob(userId, jobId) {
    const result = await pool.query(
      'DELETE FROM bookmarks WHERE user_id = $1 AND job_id = $2 RETURNING *',
      [userId, jobId]
    );
    if (!result.rows[0]) throw new NotFoundError('Bookmark not found');
    return result.rows[0];
  },
};

module.exports = BookmarksRepository;