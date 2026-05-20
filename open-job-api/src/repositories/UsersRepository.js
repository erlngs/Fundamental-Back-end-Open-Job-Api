const pool = require('../database');
const { v4: uuidv4 } = require('uuid');
const { NotFoundError, ConflictError } = require('../utils/errors');

const UsersRepository = {
  async create({ name, email, hashedPassword, role }) {
    const id = `user-${uuidv4()}`;
    const result = await pool.query(
      `INSERT INTO users (id, name, email, password, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, created_at`,
      [id, name, email, hashedPassword, role || 'candidate']
    );
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  },

  async findById(id) {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    if (!result.rows[0]) throw new NotFoundError('User not found');
    return result.rows[0];
  },

  async checkEmailExists(email) {
    const result = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    if (result.rows[0]) throw new ConflictError('Email already registered');
  },
};

module.exports = UsersRepository;