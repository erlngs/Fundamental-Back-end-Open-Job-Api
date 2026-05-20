const pool = require('../database');
const { v4: uuidv4 } = require('uuid');
const { NotFoundError, AuthorizationError } = require('../utils/errors');

const CompaniesRepository = {
  async create({ user_id, name, description, industry, location, website, logo_url }) {
    const id = `company-${uuidv4()}`;
    const result = await pool.query(
      `INSERT INTO companies (id, user_id, name, description, industry, location, website, logo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [id, user_id, name, description, industry, location, website, logo_url]
    );
    return result.rows[0];
  },

  async findAll() {
  const result = await pool.query(
    `SELECT id, user_id, name, description, location, created_at
     FROM companies
     ORDER BY created_at DESC`
  );
  return result.rows;
},

  async findById(id) {
    const result = await pool.query(
      `SELECT c.*, u.name as owner_name 
       FROM companies c 
       LEFT JOIN users u ON c.user_id = u.id 
       WHERE c.id = $1`,
      [id]
    );
    if (!result.rows[0]) throw new NotFoundError('Company not found');
    return result.rows[0];
  },

  async update(id, userId, { name, description, industry, location, website, logo_url }) {
    const company = await this.findById(id);
    if (company.user_id !== userId) {
      throw new AuthorizationError('You are not authorized to update this company');
    }
    const result = await pool.query(
      `UPDATE companies SET name=$1, description=$2, industry=$3, location=$4, 
       website=$5, logo_url=$6, updated_at=NOW() WHERE id=$7 RETURNING *`,
      [name, description, industry, location, website, logo_url, id]
    );
    return result.rows[0];
  },

  async delete(id, userId) {
    const company = await this.findById(id);
    if (company.user_id !== userId) {
      throw new AuthorizationError('You are not authorized to delete this company');
    }
    await pool.query('DELETE FROM companies WHERE id = $1', [id]);
  },
};

module.exports = CompaniesRepository;