const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const authMiddleware = require('./middleware/auth');
const validate = require('./middleware/validate');
const {
  UserSchema,
  CompanySchema,
  CompanyUpdateSchema,
  CategorySchema,
  JobSchema,
  JobUpdateSchema,
  ApplicationSchema,
  ApplicationStatusSchema,
  LoginSchema,
  RefreshTokenSchema,
} = require('./validators/schemas');

const UsersHandler = require('./handlers/UsersHandler');
const AuthenticationsHandler = require('./handlers/AuthenticationsHandler');
const CompaniesHandler = require('./handlers/CompaniesHandler');
const CategoriesHandler = require('./handlers/CategoriesHandler');
const JobsHandler = require('./handlers/JobsHandler');
const ApplicationsHandler = require('./handlers/ApplicationsHandler');
const BookmarksHandler = require('./handlers/BookmarksHandler');
const DocumentsHandler = require('./handlers/DocumentsHandler');
const ProfileHandler = require('./handlers/ProfileHandler');

// Setup multer untuk upload file
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

const router = express.Router();

// ── USERS ─────────────────────────────────────────────
router.post('/users', validate(UserSchema), UsersHandler.register);
router.get('/users/:id', UsersHandler.getById);

// ── AUTHENTICATIONS ───────────────────────────────────
router.post('/authentications', validate(LoginSchema), AuthenticationsHandler.login);
router.put('/authentications', validate(RefreshTokenSchema), AuthenticationsHandler.refresh);
router.delete('/authentications', validate(RefreshTokenSchema), authMiddleware, AuthenticationsHandler.logout);

// ── COMPANIES ─────────────────────────────────────────
router.get('/companies', CompaniesHandler.getAll);
router.get('/companies/:id', CompaniesHandler.getById);
router.post('/companies', authMiddleware, validate(CompanySchema), CompaniesHandler.create);
router.put('/companies/:id', authMiddleware, validate(CompanyUpdateSchema), CompaniesHandler.update);
router.delete('/companies/:id', authMiddleware, CompaniesHandler.delete);

// ── CATEGORIES ────────────────────────────────────────
router.get('/categories', CategoriesHandler.getAll);
router.get('/categories/:id', CategoriesHandler.getById);
router.post('/categories', authMiddleware, validate(CategorySchema), CategoriesHandler.create);
router.put('/categories/:id', authMiddleware, validate(CategorySchema), CategoriesHandler.update);
router.delete('/categories/:id', authMiddleware, CategoriesHandler.delete);

// ── JOBS ──────────────────────────────────────────────
router.get('/jobs', JobsHandler.getAll);
router.get('/jobs/company/:companyId', JobsHandler.getByCompany);
router.get('/jobs/category/:categoryId', JobsHandler.getByCategory);
router.get('/jobs/:id', JobsHandler.getById);
router.post('/jobs', authMiddleware, validate(JobSchema), JobsHandler.create);
router.put('/jobs/:id', authMiddleware, validate(JobUpdateSchema), JobsHandler.update);
router.delete('/jobs/:id', authMiddleware, JobsHandler.delete);

// ── BOOKMARKS ─────────────────────────────────────────
router.post('/jobs/:jobId/bookmark', authMiddleware, BookmarksHandler.create);
router.get('/jobs/:jobId/bookmark/:id', authMiddleware, BookmarksHandler.getById);
router.delete('/jobs/:jobId/bookmark', authMiddleware, BookmarksHandler.deleteByUserAndJob);
router.get('/bookmarks', authMiddleware, BookmarksHandler.getMyBookmarks);

// ── APPLICATIONS ──────────────────────────────────────
router.post('/applications', authMiddleware, validate(ApplicationSchema), ApplicationsHandler.create);
router.get('/applications', authMiddleware, ApplicationsHandler.getAll);
router.get('/applications/user/:userId', authMiddleware, ApplicationsHandler.getByUser);
router.get('/applications/job/:jobId', authMiddleware, ApplicationsHandler.getByJob);
router.get('/applications/:id', authMiddleware, ApplicationsHandler.getById);
router.put('/applications/:id', authMiddleware, validate(ApplicationStatusSchema), ApplicationsHandler.updateStatus);
router.delete('/applications/:id', authMiddleware, ApplicationsHandler.delete);

// ── DOCUMENTS ─────────────────────────────────────────
router.get('/documents', DocumentsHandler.getAll);
router.get('/documents/:id', DocumentsHandler.getById);
router.get('/documents/:id/file', DocumentsHandler.serveFile);
router.post('/documents', authMiddleware, (req, res, next) => {
  upload.single('document')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        status: 'failed',
        message: 'File is required to be PDF format and max 5MB',
      });
    }
    next();
  });
}, DocumentsHandler.upload);
router.delete('/documents/:id', authMiddleware, DocumentsHandler.delete);

// ── PROFILE ───────────────────────────────────────────
router.get('/profile', authMiddleware, ProfileHandler.getProfile);
router.get('/profile/applications', authMiddleware, ProfileHandler.getMyApplications);
router.get('/profile/bookmarks', authMiddleware, ProfileHandler.getMyBookmarks);

module.exports = router;