require('dotenv').config();
const amqp = require('amqplib');

const RABBITMQ_URL = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`;

let connection = null;
let channel = null;

const connect = async () => {
  connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertQueue('applications', { durable: true });
  console.log('RabbitMQ connected');
  return channel;
};

const getChannel = () => channel;

module.exports = { connect, getChannel };