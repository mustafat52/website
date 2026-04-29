const nodemailer = require("nodemailer");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { name, email, industry, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  console.log("New Lead:", { name, email, industry, message });

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASS,
      },
    });

    // Notify you
    await transporter.sendMail({
      from: `"Hussaini Automations Site" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Lead: ${name} — ${industry || "Unknown Industry"}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;">
          <h2 style="color:#c84b2f;">New Lead from Website</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Industry:</strong> ${industry || "Not specified"}</p>
          <div style="margin-top:16px;padding:16px;background:#f5f0e8;border-left:3px solid #c84b2f;">
            <strong>Message:</strong><br/><br/>${message}
          </div>
        </div>
      `,
    });

    // Auto-reply to lead
    await transporter.sendMail({
      from: `"Hussaini Automations" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Got your message, ${name.split(" ")[0]} — we'll be in touch within 24h`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;">
          <h2 style="color:#c84b2f;">Hey ${name.split(" ")[0]},</h2>
          <p style="line-height:1.75;">Thanks for reaching out. I personally review every inquiry and will get back to you within <strong>24 hours</strong>.</p>
          <p style="line-height:1.75;">No jargon. No sales pitch. Just an honest conversation about what's slowing your business down — and what we can do about it.</p>
          <p style="color:#6b6456;font-size:14px;margin-top:24px;">— Hussaini Automations<br/>Hyderabad, India</p>
        </div>
      `,
    });
  } catch (emailErr) {
    console.error("Email error:", emailErr.message);
    // Don't fail the request — lead is still logged
  }

  return res.status(200).json({ success: true });
};