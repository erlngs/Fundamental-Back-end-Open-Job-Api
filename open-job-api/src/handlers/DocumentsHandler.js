const DocumentsRepository = require('../repositories/DocumentsRepository');
const { ClientError } = require('../utils/errors');
const path = require('path');

const DocumentsHandler = {
  async upload(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'failed',
        message: 'File is required',
      });
    }
    const user_id = req.user.id;
    const file_url = `/uploads/${req.file.filename}`;
    const file_type = req.file.mimetype;
    const name = req.file.originalname;

    const document = await DocumentsRepository.create({
      user_id, name, file_url, file_type,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Document uploaded',
      data: {
        documentId: document.id,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (err) { next(err); }
},

  async getAll(req, res, next) {
    try {
      const documents = await DocumentsRepository.findAll();
      return res.status(200).json({
        status: 'success',
        data: { documents },
      });
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
  try {
    const document = await DocumentsRepository.findById(req.params.id);
    const filePath = path.join(__dirname, '../../uploads', path.basename(document.file_url));
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${document.name}"`);
    return res.sendFile(filePath);
  } catch (err) { next(err); }
},
  async serveFile(req, res, next) {
    try {
      const document = await DocumentsRepository.findById(req.params.id);
      const filePath = path.join(__dirname, '../../', document.file_url);
      return res.sendFile(filePath);
    } catch (err) { next(err); }
  },

  async delete(req, res, next) {
    try {
      await DocumentsRepository.delete(req.params.id, req.user.id);
      return res.status(200).json({
        status: 'success',
        message: 'Document deleted',
      });
    } catch (err) { next(err); }
  },
};

module.exports = DocumentsHandler;