import { Resend } from "resend";

/**
 * Contact-form delivery. Sends each submission as an email to the team via
 * Resend, with the sender's address as reply-to so replies go straight back.
 *
 * Runtime env (set on the deploy platform):
 *   RESEND_API_KEY  — required to actually send (Resend API key).
 *   CONTACT_TO      — recipient (default hello@nuroai.dev).
 *   CONTACT_FROM    — verified sender (default "Nuro <hello@nuroai.dev>";
 *                     the domain must be verified in Resend).
 *
 * If RESEND_API_KEY is unset, the submission is logged server-side instead of
 * sent — so local dev and a mis-configured deploy never break the form.
 */

export type ContactEntry = {
  name: string;
  email: string;
  message: string;
};

const TO = process.env.CONTACT_TO ?? "hello@nuroai.dev";
const FROM = process.env.CONTACT_FROM ?? "Nuro <hello@nuroai.dev>";

export async function saveContactEntry(entry: ContactEntry): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn(
      "[contact] RESEND_API_KEY not set — logging submission instead of sending",
      JSON.stringify(entry),
    );
    return;
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: FROM,
    to: [TO],
    replyTo: entry.email,
    subject: `New contact message from ${entry.name}`,
    text: [
      `Name:  ${entry.name}`,
      `Email: ${entry.email}`,
      "",
      entry.message,
    ].join("\n"),
  });

  if (error) {
    // Surface to the route handler so the client gets a 500 (not a false ok).
    throw new Error(`Resend send failed: ${error.message}`);
  }
}
