import { Resend } from "resend";

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY saknas i miljövariablerna.");
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: "BookWise <onboarding@resend.dev>",
    to: [email],
    subject: "Återställ ditt lösenord – BookWise",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Återställ ditt lösenord</h1>
        <p>Vi har fått en begäran om att återställa lösenordet för ditt BookWise-konto.</p>
        <p>Klicka på länken nedan för att välja ett nytt lösenord. Länken är giltig i 30 minuter.</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #7049c6; color: white; text-decoration: none; border-radius: 8px;">
          Återställ lösenord
        </a>
        <p>Om du inte begärde detta kan du ignorera mejlet.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }
}
