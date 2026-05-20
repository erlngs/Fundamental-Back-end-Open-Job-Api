const CompaniesRepository = require('../repositories/CompaniesRepository');
const redis = require('../redis');

const CACHE_TTL = 3600; // 1 jam

const CompaniesHandler = {
  async create(req, res, next) {
    try {
      const userId = req.user.id;
      const company = await CompaniesRepository.create({ user_id: userId, ...req.body });

      await redis.del(`company:${company.id}`);

      return res.status(201).json({
        status: 'success',
        message: 'Company created successfully',
        data: { id: company.id },
      });
    } catch (err) { next(err); }
  },

  async getAll(req, res, next) {
    try {
      const companies = await CompaniesRepository.findAll();
      return res.status(200).json({
        status: 'success',
        data: { companies },
      });
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
  try {
    const { id } = req.params;

    const cached = await redis.get(`company:${id}`);
    if (cached) {
      return res.status(200)
        .set('X-Data-Source', 'cache')  // ← cache hit = 'cache'
        .json({
          status: 'success',
          data: JSON.parse(cached),  // ← parse cached string
        });
    }

    const company = await CompaniesRepository.findById(id);
    await redis.setEx(`company:${id}`, CACHE_TTL, JSON.stringify(company));

    return res.status(200)
      .set('X-Data-Source', 'database')  // ← cache miss = 'database'
      .json({
        status: 'success',
        data: company,
      });
  } catch (err) { next(err); }
},

  async update(req, res, next) {
    try {
      const company = await CompaniesRepository.update(req.params.id, req.user.id, req.body);
      await redis.del(`company:${req.params.id}`);

      return res.status(200).json({
        status: 'success',
        message: 'Company updated',
        data: company,
      });
    } catch (err) { next(err); }
  },

  async delete(req, res, next) {
    try {
      await CompaniesRepository.delete(req.params.id, req.user.id);
      await redis.del(`company:${req.params.id}`);

      return res.status(200).json({
        status: 'success',
        message: 'Company deleted',
      });
    } catch (err) { next(err); }
  },
};

module.exports = CompaniesHandler;