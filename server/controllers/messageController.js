const Message = require('../models/Message');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

const submitMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    // Input validation
    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: 'Name must be a non-empty string' });
    }
    if (typeof email !== 'string' || email.trim().length === 0) {
      return res.status(400).json({ message: 'Email must be a valid email address' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }
    if (typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message must be a non-empty string' });
    }

    // Length limits
    if (name.length > 100) {
      return res.status(400).json({ message: 'Name must be less than 100 characters' });
    }
    if (email.length > 255) {
      return res.status(400).json({ message: 'Email must be less than 255 characters' });
    }
    if (message.length > 5000) {
      return res.status(400).json({ message: 'Message must be less than 5000 characters' });
    }

    // Save message to MongoDB Atlas
    const newMessage = new Message({ 
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim()
    });
    const savedMessage = await newMessage.save();
    console.log('✅ Message saved to MongoDB Atlas from:', name);

    // Send email to admin (non-blocking — don't fail if email fails)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.ADMIN_EMAIL) {
      const adminEmail = process.env.ADMIN_EMAIL;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: adminEmail,
        subject: `New Message from ${name} - Portfolio`,
        html: `
          <h2>New Message from Your Portfolio</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p><small>This message was sent from your portfolio contact form.</small></p>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${adminEmail}`);
      } catch (emailError) {
        console.warn('⚠️  Email sending failed:', emailError.message);
      }
    } else {
      console.warn('⚠️  Email configuration incomplete. Skipping email notification.');
    }

    res.status(201).json({ message: 'Message received successfully. We will get back to you soon!', data: savedMessage });
  } catch (error) {
    console.error('❌ Error saving message:', error.message);
    res.status(500).json({ message: 'Failed to save message to database', error: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error('❌ Error fetching messages:', error.message);
    res.status(500).json({ message: 'Failed to fetch messages from database', error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findByIdAndUpdate(id, { read: true }, { new: true });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    console.log('✅ Message marked as read in MongoDB Atlas');
    res.json(message);
  } catch (error) {
    console.error('❌ Error marking message as read:', error.message);
    res.status(500).json({ message: 'Failed to update message', error: error.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findByIdAndDelete(id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    console.log('✅ Message deleted from MongoDB Atlas');
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting message:', error.message);
    res.status(500).json({ message: 'Failed to delete message', error: error.message });
  }
};

module.exports = { submitMessage, getMessages, markAsRead, deleteMessage };
