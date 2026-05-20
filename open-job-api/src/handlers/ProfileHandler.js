const UsersRepository = require('../repositories/UsersRepository');
const ApplicationsRepository = require('../repositories/ApplicationsRepository');
const BookmarksRepository = require('../repositories/BookmarksRepository');

const ProfileHandler = {
  async getProfile(req, res, next) {
    try {
      const user = await UsersRepository.findById(req.user.id);
      return res.status(200).json({
        status: 'success',
        data: user, 
      });
    } catch (err) { next(err); }
  },

  async getMyApplications(req, res, next) {
    try {
      const applications = await ApplicationsRepository.findByUser(req.user.id);
      return res.status(200).json({
        status: 'success',
        data: { applications },
      });
    } catch (err) { next(err); }
  },

  async getMyBookmarks(req, res, next) {
    try {
      const bookmarks = await BookmarksRepository.findAll(req.user.id);
      return res.status(200).json({
        status: 'success',
        data: { bookmarks },
      });
    } catch (err) { next(err); }
  },
};

module.exports = ProfileHandler;