const CategoriesRepository = require('../repositories/CategoriesRepository');

const CategoriesHandler = {
  async create(req, res, next) {
    try {
      const category = await CategoriesRepository.create(req.body);
      return res.status(201).json({
        status: 'success',
        message: 'Category created',
        data: { id: category.id },
      });
    } catch (err) { next(err); }
  },

  async getAll(req, res, next) {
    try {
      const categories = await CategoriesRepository.findAll();
      return res.status(200).json({
        status: 'success',
        data: { categories },
      });
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
    try {
      const category = await CategoriesRepository.findById(req.params.id);
      return res.status(200).json({
  status: 'success',
  data: category,
});
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      const category = await CategoriesRepository.update(req.params.id, req.body);
      return res.status(200).json({
        status: 'success',
        message: 'Category updated',
        data: { category },
      });
    } catch (err) { next(err); }
  },

  async delete(req, res, next) {
    try {
      await CategoriesRepository.delete(req.params.id);
      return res.status(200).json({
        status: 'success',
        message: 'Category deleted',
      });
    } catch (err) { next(err); }
  },
};

module.exports = CategoriesHandler;