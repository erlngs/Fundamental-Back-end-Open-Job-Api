const pool = require('../database');
const { ClientError } = require('../utils/errors'); 

const AuthenticationsRepository = {
  async addRefreshToken(token) {
    await pool.query(
      'INSERT INTO authentications (token) VALUES ($1)',
      [token]
    );
  },

  async verifyRefreshToken(token) {
    const result = await pool.query(
      'SELECT token FROM authentications WHERE token = $1',
      [token]
    );
    if (!result.rows[0]) throw new ClientError('Refresh token not valid', 400); // ← ganti ini
  },

  async deleteRefreshToken(token) {
    await pool.query(
      'DELETE FROM authentications WHERE token = $1',
      [token]
    );
  },
};

module.exports = AuthenticationsRepository;