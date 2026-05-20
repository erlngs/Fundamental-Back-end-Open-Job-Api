const bcrypt = require('bcrypt');
const UsersRepository = require('../repositories/UsersRepository');
const redis = require('../redis');

const CACHE_TTL = 3600;

const UsersHandler = {
  async register(req, res, next) {
    try {
      const { name, email, password, role } = req.body;
      await UsersRepository.checkEmailExists(email);
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await UsersRepository.create({ name, email, hashedPassword, role });
      return res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: { id: user.id },
      });
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const cached = await redis.get(`user:${id}`);
      if (cached) {
        return res.status(200)
          .set('X-Data-Source', 'cache')
          .json({
            status: 'success',
            data: JSON.parse(cached),
          });
      }

      const user = await UsersRepository.findById(id);
      await redis.setEx(`user:${id}`, CACHE_TTL, JSON.stringify(user));

      return res.status(200)
        .set('X-Data-Source', 'database')
        .json({
          status: 'success',
          data: user,
        });
    } catch (err) { next(err); }
  },
};

module.exports = UsersHandler;