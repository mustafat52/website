import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,      // hussainiautomations72@gmail.com
    pass: process.env.EMAIL_APP_PASS,  // Gmail App Password
  },
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, industry, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  console.log("New Lead:", { name, email, industry, message });

  try {
    // Email to YOU — lead notification
    await transporter.sendMail({
      from: `"Hussaini Automations Site" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `🔥 New Lead: ${name} — ${industry || "Unknown Industry"}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;">
          <h2 style="color:#c84b2f;margin-bottom:20px;">New Lead from Website</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;color:#888;width:100px;vertical-align:top;">Name</td>
              <td style="padding:10px 0;font-weight:600;">${name}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#888;vertical-align:top;">Email</td>
              <td style="padding:10px 0;"><a href="mailto:${email}" style="color:#c84b2f;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#888;vertical-align:top;">Industry</td>
              <td style="padding:10px 0;">${industry || "Not specified"}</td>
            </tr>
          </table>
          <div style="margin-top:20px;padding:18px;background:#f5f0e8;border-left:3px solid #c84b2f;border-radius:2px;">
            <strong style="display:block;margin-bottom:10px;">Their message:</strong>
            <p style="margin:0;line-height:1.7;color:#2a2a2a;">${message}</p>
          </div>
          <p style="margin-top:24px;color:#aaa;font-size:12px;">
            Submitted via hussainiautomations.com · Reply directly to <a href="mailto:${email}">${email}</a>
          </p>
        </div>
      `,
    });

    // Auto-reply to the LEAD
    await transporter.sendMail({
      from: `"Hussaini Automations" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Got your message, ${name.split(" ")[0]} — we'll be in touch within 24h`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;">
          <h2 style="color:#c84b2f;">Hey ${name.split(" ")[0]},</h2>
          <p style="line-height:1.75;color:#2a2a2a;">
            Thanks for reaching out to Hussaini Automations. I personally review every inquiry and will get back to you within <strong>24 hours</strong> with a clear take on how we can help.
          </p>
          <p style="line-height:1.75;color:#2a2a2a;">
            No jargon. No sales pitch. Just an honest conversation about what's slowing your business down — and what we can actually do about it.
          </p>
          <div style="margin:28px 0;padding:18px 22px;background:#f5f0e8;border-left:3px solid #c84b2f;border-radius:2px;">
            <p style="margin:0;font-size:14px;color:#6b6456;line-height:1.7;">
              In the meantime, feel free to explore our AI Advisor on the site — it can give you an instant feel for where automation might help your business specifically.
            </p>
          </div>
          <p style="color:#6b6456;font-size:14px;line-height:1.7;margin:0;">
            — Hussaini Automations<br/>
            Hyderabad, India<br/>
            <a href="mailto:hussainiautomations72@gmail.com" style="color:#c84b2f;">hussainiautomations72@gmail.com</a>
          </p>
        </div>
      `,
    });
  } catch (emailErr) {
    // Don't fail the whole request if email breaks — lead is still logged
    console.error("Email send error:", emailErr.message);
  }

  res.status(200).json({ success: true });
}