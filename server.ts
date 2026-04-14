import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.post("/api/contact", async (req, res) => {
    const { name, email, phone, expedition, message } = req.body;

    // Validate input
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if SMTP credentials are provided
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("SMTP credentials missing in environment variables.");
      return res.status(500).json({ error: "Server email configuration is incomplete." });
    }

    try {
      // Configure transporter
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Verify connection configuration
      try {
        await transporter.verify();
      } catch (verifyError: any) {
        console.error("SMTP Verification Error:", verifyError);
        if (verifyError.message.includes("Invalid login") || verifyError.code === "EAUTH") {
          return res.status(500).json({ 
            error: "Email authentication failed. Please ensure you are using a Gmail 'App Password' and not your regular account password." 
          });
        }
        throw verifyError;
      }

      const mailOptions = {
        from: `"Wild Ladakh Website" <${process.env.SMTP_USER}>`,
        replyTo: email,
        to: "wildladakhexpedition@gmail.com",
        subject: `New Inquiry: ${expedition} - ${name}`,
        text: `
Name: ${name}
Email: ${email}
Phone: ${phone}
Expedition: ${expedition}

Message:
${message}
        `,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h2 style="color: #111; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">New Inquiry Received</h2>
            <p style="margin-bottom: 20px; color: #666;">You have received a new message from the Wild Ladakh Expedition website contact form.</p>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Name:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><a href="mailto:${email}">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${phone}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Expedition:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${expedition}</td>
              </tr>
            </table>
            
            <div style="margin-top: 30px;">
              <h4 style="margin-bottom: 10px; color: #111; text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em;">Message:</h4>
              <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; color: #444; line-height: 1.6;">
                ${message.replace(/\n/g, '<br/>')}
              </div>
            </div>
            
            <p style="margin-top: 40px; font-size: 10px; color: #999; text-align: center; text-transform: uppercase; letter-spacing: 0.2em;">
              © 2024 Wild Ladakh Expedition
            </p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email. Please check server configuration." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
