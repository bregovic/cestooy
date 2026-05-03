import { Resend } from "resend";

const fromEmail = process.env.EMAIL_FROM || "Cestooy <noreply@cestooy.app>";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.includes("vloz_svuj_klic")) {
    console.warn("[Email] Skipping send - No valid API key provided.");
    return { success: false, error: "Missing API Key" };
  }

  try {
    const resend = new Resend(apiKey);
    const data = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error("[Email Error]", error);
    return { success: false, error };
  }
}

export const emailTemplates = {
  passwordReset: (resetUrl: string) => ({
    subject: "Obnovení hesla – Cestooy",
    html: `
      <div style="font-family: sans-serif; padding: 24px; background-color: #f9f9f9; color: #333;">
        <h2 style="color: #6366f1;">Zapomenuté heslo?</h2>
        <p>Obdrželi jsme žádost o obnovení hesla k vašemu účtu na platformě <strong>Cestooy</strong>.</p>
        <p>Kliknutím na tlačítko níže si nastavíte nové heslo:</p>
        <div style="margin: 32px 0;">
          <a href="${resetUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Obnovit heslo</a>
        </div>
        <p style="font-size: 13px; color: #666;">Tento odkaz vyprší za 1 hodinu. Pokud jste o změnu nežádali, tento email ignorujte.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="font-size: 11px; color: #999;">Odesláno z Cestooy Platform</p>
      </div>
    `,
  }),

  accessApproved: (serviceName: string, dashboardUrl: string) => ({
    subject: `✅ Přístup ke službě ${serviceName} schválen`,
    html: `
      <div style="font-family: sans-serif; padding: 24px; color: #333;">
        <h2 style="color: #10b981;">Skvělá zpráva!</h2>
        <p>Vaše žádost o přístup ke službě <strong>${serviceName}</strong> byla schválena.</p>
        <p>Nyní můžete využívat sdílené prostředky podle domluvených podmínek.</p>
        <div style="margin: 24px 0;">
          <a href="${dashboardUrl}" style="background-color: #10b981; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none;">Přejít do dashboardu</a>
        </div>
        <p style="font-size: 12px; color: #666;">Podrobnosti o vyúčtování a přístupech naleznete ve svém profilu.</p>
      </div>
    `,
  }),

  accessRequestReceived: (ownerName: string, requesterName: string, serviceName: string, requestsUrl: string) => ({
    subject: `📥 Nová žádost o přístup: ${serviceName}`,
    html: `
      <div style="font-family: sans-serif; padding: 24px; color: #333;">
        <h2 style="color: #6366f1;">Nová žádost o přístup</h2>
        <p>Ahoj ${ownerName},</p>
        <p><strong>${requesterName}</strong> by se rád přidal k tvému sdílení služby <strong>${serviceName}</strong>.</p>
        <p>Žádost můžete schválit nebo zamítnout v sekci Žádosti.</p>
        <div style="margin: 24px 0;">
          <a href="${requestsUrl}" style="background-color: #6366f1; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none;">Zobrazit žádost</a>
        </div>
        <p style="font-size: 12px; color: #666;">Cestooy – Tvoje cesty. Tvoje příběhy.</p>
      </div>
    `,
  }),

  friendRequestReceived: (addresseeName: string, requesterName: string, contactsUrl: string) => ({
    subject: `👋 Nová žádost o propojení od ${requesterName}`,
    html: `
      <div style="font-family: sans-serif; padding: 24px; color: #333;">
        <h2 style="color: #6366f1;">Žádost o propojení</h2>
        <p>Ahoj ${addresseeName},</p>
        <p>Uživatel <strong>${requesterName}</strong> si tě chce přidat do svých kontaktů na Cestooy.</p>
        <div style="margin: 24px 0;">
          <a href="${contactsUrl}" style="background-color: #6366f1; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none;">Zobrazit žádost</a>
        </div>
        <p style="font-size: 12px; color: #666;">Cestooy – Tvoje cesty. Tvoje příběhy.</p>
      </div>
    `,
  }),

  invitationReceived: (inviterName: string, registerUrl: string, message?: string) => ({
    subject: `📩 Pozvánka do Cestooy od ${inviterName}`,
    html: `
      <div style="font-family: sans-serif; padding: 32px; background-color: #F5F5EA; color: #1E3A3A;">
        <h2 style="color: #1E3A3A;">Ahoj!</h2>
        <p>Uživatel <strong>${inviterName}</strong> tě zve do nové platformy <strong>Cestooy</strong>.</p>
        ${message ? `<div style="padding: 16px; background: white; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F9A521;">"${message}"</div>` : ''}
        <p>Přidej se a začni sdílet své cestovatelské zážitky a příběhy.</p>
        <div style="margin: 32px 0;">
          <a href="${registerUrl}" style="background-color: #F9A521; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">Vytvořit účet</a>
        </div>
        <p style="font-size: 12px; color: #305555;">Cestooy – Tvoje cesty. Tvoje příběhy.</p>
      </div>
    `,
  }),
};
