const BookmarksRepository = require('../repositories/BookmarksRepository');
const redis = require('../redis');

const CACHE_TTL = 3600;

const BookmarksHandler = {
  async create(req, res, next) {
    try {
      const user_id = req.user.id;
      const job_id = req.params.jobId;
      const bookmark = await BookmarksRepository.create({ user_id, job_id });

      // Invalidate cache
      await redis.del(`bookmarks:user:${user_id}`);

      return res.status(201).json({
        status: 'success',
        message: 'Bookmark created',
        data: { id: bookmark.id },
      });
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
    try {
      const bookmark = await BookmarksRepository.findById(req.params.id);
      return res.status(200).json({
        status: 'success',
        data: bookmark,
      });
    } catch (err) { next(err); }
  },

  async deleteByUserAndJob(req, res, next) {
    try {
      const user_id = req.user.id;
      const job_id = req.params.jobId;
      await BookmarksRepository.deleteByUserAndJob(user_id, job_id);

      // Invalidate cache
      await redis.del(`bookmarks:user:${user_id}`);

      return res.status(200).json({
        status: 'success',
        message: 'Bookmark deleted',
      });
    } catch (err) { next(err); }
  },

  async getMyBookmarks(req, res, next) {
    try {
      const userId = req.user.id;

      const cached = await redis.get(`bookmarks:user:${userId}`);
      if (cached) {
        return res.status(200)
          .set('X-Data-Source', 'cache')
          .json({
            status: 'success',
            data: { bookmarks: JSON.parse(cached) },
          });
      }

      const bookmarks = await BookmarksRepository.findAll(userId);
      await redis.setEx(`bookmarks:user:${userId}`, CACHE_TTL, JSON.stringify(bookmarks));

      return res.status(200)
  .set('X-Data-Source', 'database')
  .json({
    status: 'success',
    data: { bookmarks },
  });
    } catch (err) { next(err); }
  },
};

module.exports = BookmarksHandler;