const JobsRepository = require('../repositories/JobsRepository');

const JobsHandler = {
  async create(req, res, next) {
    try {
      const job = await JobsRepository.create(req.body);
      return res.status(201).json({
        status: 'success',
        message: 'Job created',
        data: { id: job.id },
      });
    } catch (err) { next(err); }
  },

  async getAll(req, res, next) {
    try {
      const title = req.query['title'];
      const companyName = req.query['company-name'];
      const jobs = await JobsRepository.findAll({ title, companyName });
      return res.status(200).json({
        status: 'success',
        data: { jobs },
      });
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
    try {
      const job = await JobsRepository.findById(req.params.id);
      return res.status(200).json({
  status: 'success',
  data: job,
});
    } catch (err) { next(err); }
  },

  async getByCompany(req, res, next) {
    try {
      const jobs = await JobsRepository.findByCompany(req.params.companyId);
      return res.status(200).json({
        status: 'success',
        data: { jobs },
      });
    } catch (err) { next(err); }
  },

  async getByCategory(req, res, next) {
    try {
      const jobs = await JobsRepository.findByCategory(req.params.categoryId);
      return res.status(200).json({
        status: 'success',
        data: { jobs },
      });
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      const job = await JobsRepository.update(req.params.id, req.user.id, req.body);
      return res.status(200).json({
        status: 'success',
        message: 'Job updated',
        data: { job },
      });
    } catch (err) { next(err); }
  },

  async delete(req, res, next) {
    try {
      await JobsRepository.delete(req.params.id, req.user.id);
      return res.status(200).json({
        status: 'success',
        message: 'Job deleted',
      });
    } catch (err) { next(err); }
  },
};

module.exports = JobsHandler;