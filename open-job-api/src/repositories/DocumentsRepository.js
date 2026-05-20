const pool = require('../database');
const { v4: uuidv4 } = require('uuid');
const { NotFoundError, AuthorizationError } = require('../utils/errors');

const DocumentsRepository = {
  async create({ user_id, name, file_url, file_type }) {
    const id = `document-${uuidv4()}`;
    const result = await pool.query(
      'INSERT INTO documents (id, user_id, name, file_url, file_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, user_id, name, file_url, file_type]
    );
    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query(
      `SELECT d.*, u.name as user_name 
       FROM documents d
       LEFT JOIN users u ON d.user_id = u.id
       ORDER BY d.created_at DESC`
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT d.*, u.name as user_name 
       FROM documents d
       LEFT JOIN users u ON d.user_id = u.id
       WHERE d.id = $1`,
      [id]
    );
    if (!result.rows[0]) throw new NotFoundError('Document not found');
    return result.rows[0];
  },

  async delete(id, userId) {
    const doc = await this.findById(id);
    if (doc.user_id !== userId) {
      throw new AuthorizationError('You are not authorized to delete this document');
    }
    await pool.query('DELETE FROM documents WHERE id = $1', [id]);
  },
};

module.exports = DocumentsRepository;