import { Resend } from "resend";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "No se encontró RESEND_API_KEY en las variables de entorno." });
  }

  const resend = new Resend(apiKey);

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { name, amount, city, phone, email, service, message } = body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: "Por favor completa los campos requeridos (nombre, email, teléfono, mensaje)." });
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || "Solución Créditicia <informacion@solucioncrediticia.org>";
    const toEmailRaw = process.env.RESEND_TO_EMAIL || "informacion@solucioncrediticia.org, gerencia@solucioncrediticia.org";
    const toEmails = toEmailRaw.split(",").map((e) => e.trim()).filter(Boolean);

    const data = await resend.emails.send({
      from: fromEmail,
      to: toEmails,
      replyTo: email,
      subject: `Nueva solicitud de asesoría — ${service || "General"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e9e6dd; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #C5A059;">
            <h2 style="color: #0A192F; margin: 0; font-size: 22px;">Nueva Solicitud de Asesoría Créditicia</h2>
            <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Enviada desde el formulario de contacto web</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px; font-weight: bold; width: 150px; color: #0A192F;">Nombre:</td>
              <td style="padding: 10px; color: #333;">${name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px; font-weight: bold; color: #0A192F;">Monto Solicitado:</td>
              <td style="padding: 10px; color: #333;">${amount || "No especificado"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px; font-weight: bold; color: #0A192F;">Ciudad:</td>
              <td style="padding: 10px; color: #333;">${city || "No especificada"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px; font-weight: bold; color: #0A192F;">Teléfono:</td>
              <td style="padding: 10px; color: #333;">${phone}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px; font-weight: bold; color: #0A192F;">Correo electrónico:</td>
              <td style="padding: 10px; color: #333;"><a href="mailto:${email}" style="color: #C5A059; text-decoration: none;">${email}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px; font-weight: bold; color: #0A192F;">Servicio de interés:</td>
              <td style="padding: 10px; color: #333;">${service || "General"}</td>
            </tr>
          </table>

          <div style="margin-top: 24px; padding: 16px; background-color: #F8F9FA; border-left: 4px solid #C5A059; border-radius: 6px;">
            <p style="margin: 0; font-weight: bold; color: #0A192F; font-size: 14px;">Mensaje del cliente:</p>
            <p style="margin-top: 8px; margin-bottom: 0; white-space: pre-wrap; color: #444; font-size: 14px; line-height: 1.5;">${message}</p>
          </div>

          <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 15px;">
            Solución Créditicia — Notificación automática
          </div>
        </div>
      `,
    });

    return res.status(200).json({ success: true, id: data.data?.id });
  } catch (error: any) {
    console.error("Error enviando email con Resend:", error);
    return res.status(500).json({ error: error?.message || "Error interno al enviar el correo." });
  }
}
