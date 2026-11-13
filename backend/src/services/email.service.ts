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
      <div style="margin: 0; padding: 40px 16px; background-color: #f5f3fa; font-family: Arial, Helvetica, sans-serif;">
        <div style="max-width: 560px; margin: 0 auto; overflow: hidden; background-color: #ffffff; border-radius: 18px;">

          <div style="padding: 36px 24px; text-align: center; background: linear-gradient(135deg, #493078, #7652a8);">
            <div style="display: inline-block; width: 54px; height: 54px; line-height: 54px; border-radius: 15px; background-color: #7652c8; color: #ffffff; font-size: 30px; font-weight: bold;">
              B
            </div>
            <h1 style="margin: 12px 0 0; color: #ffffff; font-size: 28px; letter-spacing: 0.5px;">
              BookWise
            </h1>
            <p style="margin: 7px 0 0; color: #d9c9ff; font-size: 11px; letter-spacing: 2px;">
              YOUR PERSONAL LIBRARY
            </p>
          </div>

          <div style="padding: 36px 32px 30px;">
            <h2 style="margin: 0 0 20px; color: #29213b; font-size: 25px;">
              Återställ ditt lösenord
            </h2>

            <p style="margin: 0 0 16px; color: #625d70; font-size: 15px; line-height: 1.7;">
              Hej!
            </p>

            <p style="margin: 0 0 16px; color: #625d70; font-size: 15px; line-height: 1.7;">
              Vi har fått en begäran om att återställa lösenordet för ditt BookWise-konto.
            </p>

            <p style="margin: 0 0 28px; color: #625d70; font-size: 15px; line-height: 1.7;">
              Klicka på knappen nedan för att välja ett nytt lösenord. Länken är giltig i 30 minuter.
            </p>

            <div style="text-align: center; margin-bottom: 28px;">
              <a href="${resetUrl}" style="display: inline-block; padding: 15px 30px; background-color: #7652c8; color: #ffffff; text-decoration: none; border-radius: 10px; font-size: 15px; font-weight: bold;">
                Återställ lösenord
              </a>
            </div>

            <p style="margin: 0; color: #8b8499; font-size: 13px; line-height: 1.7;">
              Om du inte begärde detta kan du ignorera mejlet. Ditt lösenord förblir oförändrat.
            </p>
          </div>

          <div style="padding: 20px; text-align: center; background-color: #faf9fc; border-top: 1px solid #eeeaf5;">
            <p style="margin: 0; color: #8b8499; font-size: 12px;">
              © BookWise · Din digitala bokhylla
            </p>
          </div>

        </div>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }
}
