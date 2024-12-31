import express from 'express';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';
import fs from 'fs';

const app = express(); // تعريف التطبيق بشكل صحيح

app.use(bodyParser.urlencoded({ extended: true }));

// Load configuration
const rawData = fs.readFileSync('./config/config.json');
const config = JSON.parse(rawData);

// Create a router
const Contact = express.Router();

// Define a route on the router
Contact.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Setup Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.mail.yahoo.com",
      service: config.service, // e.g., 'gmail'
      port: 465,
      secure: true,
      auth: {
        user: config.email,
        pass: config.password,
      },
    });

    // Email options
    const mailOptions = {
      from: email,
      to: config.email,
      subject: `Contact Form Submission from ${name}`,
      text: message,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: 'Email sent successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Attach the router to the app

export default Contact;
