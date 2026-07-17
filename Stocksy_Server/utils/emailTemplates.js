// utils/emailTemplates.js

const forgotPasswordTemplate = (name, otp) => {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Reset Your Password</title>
</head>

<body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fb;padding:40px 0;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);">

<tr>
<td style="background:#2563EB;padding:30px;text-align:center;">
<h1 style="margin:0;color:#ffffff;font-size:30px;">
Stocksy
</h1>
</td>
</tr>

<tr>
<td style="padding:40px;">

<h2 style="margin-top:0;color:#111827;">
Reset Your Password
</h2>

<p style="font-size:16px;color:#4B5563;line-height:26px;">
Hello ${name || "User"},
</p>

<p style="font-size:16px;color:#4B5563;line-height:26px;">
We received a request to reset the password for your Stocksy account.
Use the OTP below to continue.
</p>

<div style="margin:35px 0;text-align:center;">
<div style="
display:inline-block;
padding:18px 40px;
font-size:34px;
font-weight:bold;
letter-spacing:12px;
background:#EFF6FF;
color:#2563EB;
border-radius:12px;
border:2px dashed #2563EB;
">
${otp}
</div>
</div>

<p style="font-size:16px;color:#4B5563;line-height:26px;">
This OTP will expire in <strong>5 minutes.</strong>
</p>

<p style="font-size:16px;color:#4B5563;line-height:26px;">
If you did not request a password reset, you can safely ignore this email.
Your password will remain unchanged.
</p>

<hr style="margin:35px 0;border:none;border-top:1px solid #E5E7EB;">

<p style="font-size:13px;color:#9CA3AF;line-height:22px;">
This is a system-generated email. Please do not reply to this message.
</p>

<p style="margin-top:35px;font-size:15px;color:#374151;">
Regards,<br>
<strong>Team Stocksy</strong>
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
};

module.exports = {
  forgotPasswordTemplate,
};