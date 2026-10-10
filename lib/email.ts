export type ContactEmail = {
  name: string;
  email: string;
  other: string;
  message: string;
};

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const INK = "#0a0a0a";
const PAPER = "#f4efe6";
const ACCENT = "#d6ff3f";
const MUTED = "#a8a39a";
const LINE = "#262626";
const MONO = "'SFMono-Regular',Menlo,Consolas,'Liberation Mono',monospace";
const SANS = "'Helvetica Neue',Helvetica,Arial,sans-serif";

function detail(label: string, valueHtml: string) {
  return `<tr>
    <td style="padding:14px 0;border-top:1px solid ${LINE};font-family:${MONO};font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${MUTED};width:110px;vertical-align:top">${label}</td>
    <td style="padding:14px 0;border-top:1px solid ${LINE};font-family:${SANS};font-size:16px;line-height:1.4;color:${PAPER};vertical-align:top">${valueHtml}</td>
  </tr>`;
}

export function renderContactEmail({ name, email, other, message }: ContactEmail) {
  const n = escapeHtml(name);
  const e = escapeHtml(email);
  const reply = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent("Re: your message via my portfolio")}`;
  const body = escapeHtml(message).replace(/\r?\n/g, "<br>");
  const preheader = escapeHtml(message.replace(/\s+/g, " ").slice(0, 110));

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<title>New portfolio message</title>
</head>
<body style="margin:0;padding:0;background:#161616">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#161616">
<tr><td align="center" style="padding:32px 16px">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${INK};border-radius:6px;overflow:hidden">
    <tr><td style="height:6px;background:${ACCENT};font-size:0;line-height:0">&nbsp;</td></tr>
    <tr><td style="padding:36px 40px 8px">
      <div style="font-family:${MONO};font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${ACCENT}">New message &middot; Portfolio</div>
      <div style="margin-top:18px;font-family:${SANS};font-size:34px;line-height:1.1;font-weight:300;letter-spacing:-.02em;color:${PAPER}">${n}</div>
      <div style="margin-top:6px;font-family:${SANS};font-size:15px;color:${MUTED}">sent you a message through your website</div>
    </td></tr>
    <tr><td style="padding:24px 40px 8px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${detail("From", n)}
        ${detail("Reply to", `<a href="${escapeHtml(reply)}" style="color:${ACCENT};text-decoration:none">${e}</a>`)}
        ${other ? detail("Also at", escapeHtml(other)) : ""}
      </table>
    </td></tr>
    <tr><td style="padding:16px 40px 8px">
      <div style="font-family:${MONO};font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${MUTED};margin-bottom:12px">Message</div>
      <div style="padding:22px 24px;background:#141414;border-left:3px solid ${ACCENT};border-radius:2px;font-family:${SANS};font-size:17px;line-height:1.6;color:${PAPER}">${body}</div>
    </td></tr>
    <tr><td style="padding:28px 40px 40px">
      <a href="${escapeHtml(reply)}" style="display:inline-block;background:${ACCENT};color:${INK};font-family:${MONO};font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;text-decoration:none;padding:14px 28px;border-radius:999px">Reply to ${escapeHtml(name.split(" ")[0])}</a>
    </td></tr>
    <tr><td style="padding:18px 40px;border-top:1px solid ${LINE};font-family:${MONO};font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#6f6b64">Sent from the contact form on your portfolio</td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;

  return html;
}
