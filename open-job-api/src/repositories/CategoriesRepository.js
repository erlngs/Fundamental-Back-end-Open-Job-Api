const pool = require('../database');
const { v4: uuidv4 } = require('uuid');
const { NotFoundError } = require('../utils/errors');

const CategoriesRepository = {
  async create({ name, description }) {
    const id = `category-${uuidv4()}`;
    const result = await pool.query(
      'INSERT INTO categories (id, name, description) VALUES ($1, $2, $3) RETURNING *',
      [id, name, description]
    );
    return result.rows[0];
  },

  async findAll() {
  const result = await pool.query(
    `SELECT id, name, description, created_at
     FROM categories
     ORDER BY created_at DESC`
  );
  return result.rows;
},

  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );
    if (!result.rows[0]) throw new NotFoundError('Category not found');
    return result.rows[0];
  },

  async update(id, { name, description }) {
    await this.findById(id);
    const result = await pool.query(
      'UPDATE categories SET name=$1, description=$2, updated_at=NOW() WHERE id=$3 RETURNING *',
      [name, description, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    await this.findById(id);
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
  },
};

module.exports = CategoriesRepository;