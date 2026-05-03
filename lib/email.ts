import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.EMAIL_FROM || "Cestooy <noreply@Cestooy.app>";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
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
        <p style="font-size: 12px; color: #666;">Cestooy – Vaše centrum sdílených předplatných.</p>
      </div>
    `,
  }),
};
