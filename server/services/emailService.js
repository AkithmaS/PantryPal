import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(toEmail, resetLink) {
    await resend.emails.send({
        from: 'PantryPal <onboarding@resend.dev>',
        to: toEmail,
        subject: 'Reset your PantryPal password',
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background:#fff8f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f0;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:24px;border:1px solid #ead9c7;overflow:hidden;box-shadow:0 18px 45px rgba(17,17,17,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#ff7a18,#ea6d11);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">
                PantryPal
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                Your kitchen companion
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 12px;color:#111111;font-size:22px;font-weight:600;">
                Reset your password
              </h2>
              <p style="margin:0 0 24px;color:#6e6258;font-size:15px;line-height:1.7;">
                We received a request to reset the password for your PantryPal account.
                Click the button below to choose a new password. This link expires in
                <strong>1 hour</strong>.
              </p>

              <div style="text-align:center;margin:32px 0;">
                <a href="${resetLink}"
                  style="display:inline-block;background:#ff7a18;color:#ffffff;text-decoration:none;
                         font-size:15px;font-weight:700;padding:14px 36px;border-radius:100px;
                         box-shadow:0 18px 35px rgba(255,122,24,0.30);">
                  Reset Password
                </a>
              </div>

              <p style="margin:0 0 8px;color:#6e6258;font-size:13px;line-height:1.6;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 24px;word-break:break-all;">
                <a href="${resetLink}" style="color:#d45d10;font-size:13px;">${resetLink}</a>
              </p>

              <hr style="border:none;border-top:1px solid #ead9c7;margin:24px 0;" />

              <p style="margin:0;color:#a09080;font-size:12px;line-height:1.6;">
                If you didn't request a password reset, you can safely ignore this email.
                Your password won't change until you click the link above.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fff4ea;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#a09080;font-size:12px;">
                © ${new Date().getFullYear()} PantryPal. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `.trim(),
    });
}
