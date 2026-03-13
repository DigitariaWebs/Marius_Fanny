export interface SmsPayload {
  to: string;
  body: string;
}

const isTruthy = (value?: string) => {
  if (!value) return false;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
};

const normalizeCanadianPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  if (phone.startsWith("+")) {
    return phone;
  }

  throw new Error("Numero de telephone invalide pour SMS (Canada)");
};

export const sendSms = async ({ to, body }: SmsPayload) => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const dryRun = isTruthy(process.env.SMS_DRY_RUN);

  console.log(`📱 [SMS] Mode: ${dryRun ? "dry-run" : "real"} (SMS_DRY_RUN=${process.env.SMS_DRY_RUN ?? "undefined"})`);

  const destination = normalizeCanadianPhone(to);

  if (dryRun) {
    console.log("📱 [SMS] Dry-run enabled: Twilio request skipped", {
      to: destination,
      from: from || "TWILIO_FROM_NUMBER_NOT_SET",
      body,
    });

    return {
      dryRun: true,
      to: destination,
      from: from || null,
      body,
      provider: "twilio",
      sid: "SM_DRY_RUN",
      status: "queued",
    };
  }

  if (!sid || !token || !from) {
    throw new Error(
      "Configuration SMS manquante. Definir TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN et TWILIO_FROM_NUMBER",
    );
  }

  const payload = new URLSearchParams({
    To: destination,
    From: from,
    Body: body,
  });

  const auth = Buffer.from(`${sid}:${token}`).toString("base64");

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload.toString(),
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Echec envoi SMS Twilio: ${detail}`);
  }

  return response.json();
};
