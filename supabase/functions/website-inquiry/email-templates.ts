/**
 * Lakache Auto branded inquiry emails.
 * This module is intended for Supabase Edge Functions (Deno).
 * No secrets, DB operations, or Resend delivery logic live here.
 * Keep existing website-inquiry validation, CRM insert, deduplication,
 * email event tracking and Resend error handling unchanged.
 */
export type InquiryEmailData = {
  inquiryId: string;
  buyerName: string;
  buyerEmail: string;
  phone?: string | null;
  vehicle?: string | null;
  destination?: string | null;
  buyerType?: string | null;
  message?: string | null;
  location?: string | null;
  shipping?: string | null;
  timeline?: string | null;
  contactPreference?: string | null;
};

const esc = (value: unknown) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const shortReference = (id: string) => `LA-${id.replace(/-/g, "").slice(0, 12).toUpperCase()}`;
const show = (value: unknown) => esc(value || "Not provided");
const cell = (label: string, value: unknown) => `<tr><td style="padding:12px 14px;color:#666;font-size:13px;border-bottom:1px solid #e9e9e9;width:35%;vertical-align:top">${esc(label)}</td><td style="padding:12px 14px;color:#202124;font-size:13px;font-weight:600;border-bottom:1px solid #e9e9e9;overflow-wrap:anywhere">${show(value)}</td></tr>`;
const panel = (rows: string) => `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #e5e5e5;border-collapse:collapse">${rows}</table>`;
const shell = (preheader: string, eyebrow: string, heading: string, body: string, footer: string) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#f3f4f5;color:#202124;font-family:Arial,Helvetica,sans-serif"><div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">${esc(preheader)}</div><table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f3f4f5"><tr><td align="center" style="padding:26px 12px"><table role="presentation" cellpadding="0" cellspacing="0" width="600" style="width:100%;max-width:600px;background:#fff;border:1px solid #e3e3e3"><tr><td style="padding:25px 30px;background:#151719;border-bottom:4px solid #d82332"><table role="presentation" width="100%"><tr><td style="font-weight:800;font-size:21px;letter-spacing:1px;color:#fff"><img src="https://lakacheautos.com/lakache-auto-favicon-512.png" alt="Lakache Auto LA logo" width="48" height="48" style="display:inline-block;vertical-align:middle;background:#fff;border-radius:5px;padding:3px;margin-right:12px;border:0"><span style="vertical-align:middle">LAKACHE <span style="color:#ee3441">AUTO</span></span></td><td align="right" style="font-size:10px;line-height:1.5;letter-spacing:1px;color:#dedede">VEHICLE SALES<br>INTERNATIONAL EXPORT</td></tr></table></td></tr><tr><td style="padding:32px 30px 18px"><p style="margin:0 0 10px;color:#d82332;font-size:11px;font-weight:700;letter-spacing:2px">${esc(eyebrow)}</p><h1 style="font-size:27px;line-height:1.2;margin:0 0 24px;color:#161719">${esc(heading)}</h1>${body}</td></tr><tr><td style="padding:16px 30px 26px"><table role="presentation" width="100%" style="border-top:1px solid #e5e5e5"><tr><td style="padding-top:18px"><img src="https://lakacheautos.com/lakache-auto-favicon-512.png" width="74" height="74" alt="" style="display:block;border:0;opacity:.16;margin:0 0 5px"><div style="font-size:12px;line-height:1.8;color:#777">Lakache Auto · California, USA<br><a href="mailto:sales@lakacheautos.com" style="color:#c51d2a">sales@lakacheautos.com</a> · <a href="https://lakacheautos.com" style="color:#c51d2a">lakacheautos.com</a></div></td></tr></table><img src="https://lakacheautos.com/White%20Volkswagen%20Golf%20GTI%20Overlooking%20City.png" width="540" alt="White Volkswagen Golf GTI overlooking the city" style="display:block;width:100%;max-width:540px;height:auto;opacity:.26;margin-top:16px;border:0"></td></tr><tr><td style="background:#151719;padding:16px 30px;font-size:11px;line-height:1.6;color:#d2d2d2">${esc(footer)}</td></tr></table></td></tr></table></body></html>`;
const p = (s: string) => `<p style="font-size:14px;line-height:1.8;margin:0 0 16px">${s}</p>`;
const h = (s: string) => `<h2 style="font-size:16px;margin:26px 0 12px">${esc(s)}</h2>`;

export function customerConfirmation(data: InquiryEmailData): { subject: string; html: string; text: string } {
  const rows = panel(cell("Vehicle", data.vehicle) + cell("Destination", data.destination) + cell("Buyer type", data.buyerType) + cell("Reference", shortReference(data.inquiryId)));
  const body = p(`Hello <strong>${show(data.buyerName)}</strong>,`) + p("Thank you for contacting Lakache Auto. We've received your vehicle inquiry and our team will review your request.") + h("Your inquiry details") + rows + h("What happens next?") + p("Our team will review your request and contact you using the details provided. Availability, pricing and eligibility will be confirmed before proceeding.") + p("If you need to add information, simply reply to this email and include your inquiry reference.") + p("Best regards,<br><strong>Lakache Auto Sales Team</strong>");
  return {
    subject: "We received your inquiry | Lakache Auto",
    html: shell("Your Lakache Auto inquiry has been received.", "LAKACHE AUTO", "Thank you for your inquiry.", body, "This acknowledgment does not confirm vehicle availability, pricing, eligibility or acceptance of a transaction."),
    text: `Hello ${data.buyerName},\n\nThank you for contacting Lakache Auto. We've received your vehicle inquiry and will review your request.\n\nVehicle: ${data.vehicle || "Not provided"}\nDestination: ${data.destination || "Not provided"}\nBuyer type: ${data.buyerType || "Not provided"}\nReference: ${shortReference(data.inquiryId)}\n\nOur team will follow up using the details provided. Availability, pricing and eligibility will be confirmed before proceeding.\n\nLakache Auto Sales Team\nsales@lakacheautos.com\nhttps://lakacheautos.com`
  };
}


// The public website currently appends these answers to the message text.
// Extract only recognized, labeled lines; preserve all original message text.
const inquiryDetails = (data: InquiryEmailData) => {
  const lines = (data.message || "").split(/\r?\n/);
  const find = (labels: string[]) => {
    for (const line of lines) {
      const match = line.match(/^\s*([^:]{2,45})\s*:\s*(.*?)\s*$/);
      if (match && labels.includes(match[1].trim().toLowerCase()) && match[2]) return match[2];
    }
    return undefined;
  };
  return {
    location: data.location || find(["city / region", "city/region", "city", "location"]),
    shipping: data.shipping || find(["shipping arrangements", "shipping arrangement", "shipping"]),
    timeline: find(["buying timeline", "buying time line", "timeline"]) || data.timeline,
    contactPreference: data.contactPreference || find(["preferred contact", "contact preference"])
  };
};

export function internalSalesNotification(data: InquiryEmailData): { subject: string; html: string; text: string } {
  const details = inquiryDetails(data);
  const rows = panel(
    cell("Name", data.buyerName) + cell("Email", data.buyerEmail) + cell("Phone", data.phone) +
    cell("Vehicle", data.vehicle) + cell("Location", details.location) + cell("Destination", data.destination) +
    cell("Buyer type", data.buyerType) + cell("Shipping", details.shipping) + cell("Timeline", details.timeline) +
    cell("Preferred contact", details.contactPreference) + cell("Reference", shortReference(data.inquiryId))
  );
  const message = `<div style="padding:15px;background:#f7f7f7;border-left:3px solid #d82332;font-size:14px;line-height:1.7;white-space:pre-wrap;overflow-wrap:anywhere">${show(data.message)}</div>`;
  const body = p("A new inquiry has been submitted through the Lakache Auto website. Review the details below and arrange follow-up.") + h("Buyer information") + rows + h("Customer message") + message + h("Next action") + p("Review this inquiry in Supabase CRM, verify the buyer's requirements, and schedule follow-up.");
  return {
    subject: `New vehicle inquiry — ${data.vehicle || "Lakache Auto"}`,
    html: shell("New buyer inquiry received.", "LAKACHE AUTO CRM", "New buyer inquiry", body, "Internal notification · Lakache Auto CRM · Do not forward externally."),
    text: `New Lakache Auto inquiry\n\nName: ${data.buyerName}\nEmail: ${data.buyerEmail}\nPhone: ${data.phone || "Not provided"}\nVehicle: ${data.vehicle || "Not provided"}\nLocation: ${details.location || "Not provided"}\nDestination: ${data.destination || "Not provided"}\nBuyer type: ${data.buyerType || "Not provided"}\nShipping: ${details.shipping || "Not provided"}\nTimeline: ${details.timeline || "Not provided"}\nPreferred contact: ${details.contactPreference || "Not provided"}\nReference: ${shortReference(data.inquiryId)}\n\nMessage:\n${data.message || "Not provided"}\n\nFull CRM inquiry ID: ${data.inquiryId}\n\nReview and follow up in Supabase CRM.`
  };
}
