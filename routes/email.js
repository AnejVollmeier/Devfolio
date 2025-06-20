const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Email configuration - Simple version for testing
const createTransporter = () => {
  console.log('Creating transporter...');
  const config = {
    service: 'gmail',
    auth: {
      user: 'anej.vollmeier70@gmail.com',
      pass: process.env.EMAIL_PASSWORD
    }
  };
  
  console.log('Email user:', config.auth.user);
  console.log('Password length:', config.auth.pass ? config.auth.pass.length : 0);
  
  return nodemailer.createTransport(config);
};

// Send contact form email
router.post('/contact', async (req, res) => {
  console.log('=== EMAIL REQUEST RECEIVED ===');
  console.log('Request body:', req.body);
  console.log('Environment check:');
  console.log('EMAIL_PASSWORD exists:', !!process.env.EMAIL_PASSWORD);
  console.log('EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  const { firstName, lastName, email, subject, message } = req.body;

  // Validation
  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Vsa obvezna polja morajo biti izpolnjena.'
    });
  }
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Nepravilen email naslov.'
    });
  }

  try {
    console.log('Attempting to send email with data:', req.body);
    const transporter = createTransporter();

    // Test connection first
    await transporter.verify();
    console.log('SMTP connection verified successfully');

    // Email content
    const mailOptions = {
      from: 'anej.vollmeier70@gmail.com',
      to: 'anej.vollmeier70@gmail.com',
      subject: `DevFolio Kontakt: ${subject || 'Novo sporočilo'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            Novo sporočilo iz DevFolio kontakt forme
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #007bff; margin-top: 0;">Podatki pošiljatelja:</h3>
            <p><strong>Ime:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Zadeva:</strong> ${subject || 'Ni navedeno'}</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px;">
            <h3 style="color: #333; margin-top: 0;">Sporočilo:</h3>
            <p style="line-height: 1.6; color: #555;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #e9ecef; border-radius: 5px; font-size: 12px; color: #6c757d;">
            <p>To sporočilo je bilo poslano preko kontakt forme na DevFolio spletni strani.</p>
            <p>Časovni žig: ${new Date().toLocaleString('sl-SI')}</p>
          </div>
        </div>
      `,
      replyTo: email
    };

    console.log('Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      replyTo: mailOptions.replyTo
    });

    // Send email
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);

    res.status(200).json({
      success: true,
      message: 'Sporočilo je bilo uspešno poslano!'
    });

  } catch (error) {
    console.error('Detailed email error:', error);
    console.error('Error code:', error.code);
    console.error('Error command:', error.command);
    console.error('Error response:', error.response);
    
    let errorMessage = 'Prišlo je do napake pri pošiljanju sporočila.';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Napaka pri avtentifikaciji. Preverite email geslo.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Napaka pri povezavi. Preverite internetno povezavo.';
    } else if (error.responseCode === 535) {
      errorMessage = 'Nepravilno geslo. Preverite App Password.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


module.exports = router;