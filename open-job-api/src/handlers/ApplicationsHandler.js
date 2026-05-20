const ApplicationsRepository = require('../repositories/ApplicationsRepository');
const redis = require('../redis');
const { getChannel } = require('../rabbitmq');

const CACHE_TTL = 3600;

const ApplicationsHandler = {
  async create(req, res, next) {
    try {
      const user_id = req.user.id;
      const application = await ApplicationsRepository.create({ user_id, ...req.body });

      await redis.del(`applications:user:${user_id}`);
      await redis.del(`applications:job:${application.job_id}`);

      const channel = getChannel();
      if (channel) {
        channel.sendToQueue(
          'applications',
          Buffer.from(JSON.stringify({ application_id: application.id })),
          { persistent: true }
        );
      }

      return res.status(201).json({
        status: 'success',
        message: 'Application submitted',
        data: {
          id: application.id,
          user_id: application.user_id,
          job_id: application.job_id,
          status: application.status,
          cover_letter: application.cover_letter,
          created_at: application.created_at,
        },
      });
    } catch (err) { next(err); }
  },

  async getAll(req, res, next) {
    try {
      const applications = await ApplicationsRepository.findAll();
      return res.status(200).json({
        status: 'success',
        data: { applications },
      });
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const cached = await redis.get(`application:${id}`);
      if (cached) {
        return res.status(200)
          .set('X-Data-Source', 'cache')
          .json({
            status: 'success',
            data: JSON.parse(cached),
          });
      }

      const application = await ApplicationsRepository.findById(id);
      await redis.setEx(`application:${id}`, CACHE_TTL, JSON.stringify(application));

      return res.status(200)
        .set('X-Data-Source', 'database')
        .json({
          status: 'success',
          data: application,
        });
    } catch (err) { next(err); }
  },

  async getByUser(req, res, next) {
    try {
      const { userId } = req.params;

      const cached = await redis.get(`applications:user:${userId}`);
      if (cached) {
        return res.status(200)
          .set('X-Data-Source', 'cache')
          .json({
            status: 'success',
            data: { applications: JSON.parse(cached) },
          });
      }

      const applications = await ApplicationsRepository.findByUser(userId);
      await redis.setEx(`applications:user:${userId}`, CACHE_TTL, JSON.stringify(applications));

      return res.status(200)
        .set('X-Data-Source', 'database')
        .json({
          status: 'success',
          data: { applications },
        });
    } catch (err) { next(err); }
  },

  async getByJob(req, res, next) {
    try {
      const { jobId } = req.params;

      const cached = await redis.get(`applications:job:${jobId}`);
      if (cached) {
        return res.status(200)
          .set('X-Data-Source', 'cache')
          .json({
            status: 'success',
            data: { applications: JSON.parse(cached) },
          });
      }

      const applications = await ApplicationsRepository.findByJob(jobId);
      await redis.setEx(`applications:job:${jobId}`, CACHE_TTL, JSON.stringify(applications));

      return res.status(200)
        .set('X-Data-Source', 'database')
        .json({
          status: 'success',
          data: { applications },
        });
    } catch (err) { next(err); }
  },

  async updateStatus(req, res, next) {
    try {
      const application = await ApplicationsRepository.updateStatus(
        req.params.id, req.user.id, req.body.status
      );

      await redis.del(`application:${req.params.id}`);
      await redis.del(`applications:user:${application.user_id}`);
      await redis.del(`applications:job:${application.job_id}`);

      return res.status(200).json({
        status: 'success',
        message: 'Application status updated',
        data: application,
      });
    } catch (err) { next(err); }
  },

  async delete(req, res, next) {
  try {
    const app = await ApplicationsRepository.findById(req.params.id);
    await ApplicationsRepository.delete(req.params.id, req.user.id);
    
    // Invalidate cache
    await redis.del(`application:${req.params.id}`);
    await redis.del(`applications:user:${app.user_id}`);
    await redis.del(`applications:job:${app.job_id}`);

    return res.status(200).json({
      status: 'success',
      message: 'Application deleted',
    });
  } catch (err) { next(err); }
},
};

module.exports = ApplicationsHandler;