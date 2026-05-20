require('dotenv').config();
const amqp = require('amqplib');
const nodemailer = require('nodemailer');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
});

const RABBITMQ_URL = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`;

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

const processMessage = async (applicationId) => {
  try {
    const appResult = await pool.query(
      `SELECT a.*, 
              u.name as applicant_name, 
              u.email as applicant_email,
              j.title as job_title,
              j.company_id
       FROM applications a
       LEFT JOIN users u ON a.user_id = u.id
       LEFT JOIN jobs j ON a.job_id = j.id
       WHERE a.id = $1`,
      [applicationId]
    );

    if (!appResult.rows[0]) {
      console.log('Application not found:', applicationId);
      return;
    }

    const application = appResult.rows[0];

    const ownerResult = await pool.query(
      `SELECT u.email, u.name 
       FROM companies c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [application.company_id]
    );

    if (!ownerResult.rows[0]) {
      console.log('Job owner not found');
      return;
    }

    const owner = ownerResult.rows[0];

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: owner.email,
      subject: `New Application for ${application.job_title}`,
      html: `
        <h2>New Job Application Received</h2>
        <p>Dear ${owner.name},</p>
        <p>You have received a new application for <strong>${application.job_title}</strong>.</p>
        <br/>
        <h3>Applicant Details:</h3>
        <ul>
          <li><strong>Name:</strong> ${application.applicant_name}</li>
          <li><strong>Email:</strong> ${application.applicant_email}</li>
          <li><strong>Applied Date:</strong> ${new Date(application.created_at).toLocaleDateString('id-ID')}</li>
        </ul>
        <br/>
        <p>Please login to OpenJob to review this application.</p>
        <p>Best regards,<br/>OpenJob Team</p>
      `,
    });

    console.log(`Email sent to ${owner.email} for application ${applicationId}`);
  } catch (err) {
    console.error('Error processing message:', err);
  }
};

const start = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue('applications', { durable: true });

    console.log('Consumer waiting for messages...');

    channel.consume('applications', async (msg) => {
      if (msg !== null) {
        const { application_id } = JSON.parse(msg.content.toString());
        console.log('Received application_id:', application_id);
        await processMessage(application_id);
        channel.ack(msg);
      }
    });
  } catch (err) {
    console.error('Consumer error:', err);
    setTimeout(start, 5000);
  }
};

start();