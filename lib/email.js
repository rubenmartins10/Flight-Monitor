import nodemailer from 'nodemailer';

export async function sendAlertEmail(alerts, cfg = {}) {
  const from = cfg.from || process.env.EMAIL_FROM;
  const to   = cfg.to   || process.env.EMAIL_TO || process.env.EMAIL_FROM;
  const pass = cfg.pass || process.env.EMAIL_PASSWORD;

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', port: 587, secure: false,
    auth: { user: from, pass },
  });

  const rows = alerts.map(a => {
    const isAbs    = a.type === 'absolute';
    const badge    = isAbs ? `abaixo de EUR${a.threshold}` : `-${Math.round(a.savings_pct)}% vs media`;
    const clr      = isAbs ? '#7f1d1d' : '#14532d';
    const avgLine  = a.avg ? `<br><span style="color:#555;font-size:.8em">media: EUR${Math.round(a.avg)}</span>` : '';
    const stops    = a.stops === 0 ? 'direto' : `${a.stops} escala(s)`;
    return `
    <tr>
      <td style="padding:16px 14px;border-bottom:1px solid #1a1a1a">
        <span style="font-family:Georgia,serif;font-size:1.1em;color:#f0ece4">${a.label}</span><br>
        <span style="font-family:monospace;font-size:.75em;color:#555">${a.departure_date} &rarr; ${a.return_date} &middot; ${a.airline} &middot; ${a.duration_h}h &middot; ${stops}</span>
      </td>
      <td style="padding:16px 14px;border-bottom:1px solid #1a1a1a;text-align:center">
        <span style="font-family:Georgia,serif;font-size:2em;color:#f0ece4;font-weight:600">EUR ${a.price}</span>${avgLine}
      </td>
      <td style="padding:16px 14px;border-bottom:1px solid #1a1a1a;text-align:center">
        <span style="background:${clr};color:#fff;padding:5px 12px;font-family:monospace;font-size:.72em;letter-spacing:.06em">${badge}</span>
      </td>
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html><body style="background:#080808;margin:0;padding:40px 20px">
<div style="max-width:620px;margin:auto">
  <div style="border-bottom:1px solid #1a1a1a;padding-bottom:24px;margin-bottom:28px">
    <h1 style="font-family:Georgia,serif;font-weight:300;color:#f0ece4;font-size:1.6em;letter-spacing:.12em;margin:0">FLIGHT MONITOR</h1>
    <p style="color:#444;font-size:.72em;margin:8px 0 0;font-family:monospace;letter-spacing:.08em">
      ${new Date().toLocaleDateString('pt-PT',{weekday:'long',year:'numeric',month:'long',day:'numeric'}).toUpperCase()}
    </p>
  </div>
  <p style="color:#666;font-size:.82em;font-family:monospace;margin:0 0 20px">
    ${alerts.length} oferta${alerts.length > 1 ? 's' : ''} encontrada${alerts.length > 1 ? 's' : ''} abaixo do criterio definido
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;border:1px solid #1a1a1a">
    <thead>
      <tr style="background:#141414">
        <th style="padding:10px 14px;text-align:left;color:#333;font-size:.65em;letter-spacing:.12em;font-weight:400;font-family:monospace">ROTA</th>
        <th style="padding:10px 14px;color:#333;font-size:.65em;letter-spacing:.12em;font-weight:400;font-family:monospace">PRECO</th>
        <th style="padding:10px 14px;color:#333;font-size:.65em;letter-spacing:.12em;font-weight:400;font-family:monospace">POUPANCA</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <p style="color:#2a2a2a;font-size:.68em;font-family:monospace;margin-top:28px;line-height:1.7">
    Dados via Google Flights (SerpApi). Precos sujeitos a alteracao. Verifica antes de comprar.
  </p>
</div>
</body></html>`;

  await transporter.sendMail({
    from,
    to,
    subject: `Flight Monitor — ${alerts.length} oferta${alerts.length > 1 ? 's' : ''} encontrada${alerts.length > 1 ? 's' : ''}`,
    html,
  });
}
