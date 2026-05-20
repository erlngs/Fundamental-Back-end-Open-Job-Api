require('dotenv').config();
const express = require('express');
const path = require('path');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { connect } = require('./rabbitmq');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(routes);
app.use(errorHandler);

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await connect();
    app.listen(PORT, HOST, () => {
      console.log(`OpenJob API running at http://${HOST}:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();

module.exports = app;