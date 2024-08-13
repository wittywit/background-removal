const nodemailer = require('nodemailer');
const express = require('express');
const multer = require('multer');
const path = require('path');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static('public'));

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Endpoint to handle image upload
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const imageUrl = `http://localhost:${port}/uploads/${req.file.filename}`;
  res.json({ imageUrl: imageUrl });
});

// Endpoint to generate QR code
app.post('/generate-qr', (req, res) => {
  const imageUrl = req.body.imageUrl;

  QRCode.toDataURL(imageUrl, (err, url) => {
    if (err) {
      console.error('Error generating QR Code:', err);
      return res.status(500).send('Failed to generate QR Code');
    }
    res.json({ qrCodeUrl: url });
  });
});

// Endpoint to send email with the image and QR code
app.post('/send-email', (req, res) => {
  const { email, imageUrl, qrCodeUrl } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'mymailsendertests@gmail.com',// Replace with your email
      pass: 'nknm rgru mxrt ksad',// Replace with your App Password   
    },
  });

  const mailOptions = {
    from: 'mymailsendertests@gmail.com', // Replace with your email
    to: email,
    subject: 'Your Generated Image and QR Code',
    html: `
      <p>Here is your generated image:</p>
      <img src="${imageUrl}" alt="Generated Image" style="max-width: 100%; height: auto;"/>
      <p>And here is your QR code:</p>
      <img src="${qrCodeUrl}" alt="QR Code" style="max-width: 100%; height: auto;"/>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).send('Error sending email');
    }
    console.log('Email sent:', info.response);
    res.send('Email sent: ' + info.response);
  });
});

// Serve the uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});











      
    