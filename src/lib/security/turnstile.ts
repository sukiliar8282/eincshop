import "server-only";

export async function verifyTurnstileToken(
  token: string,
  ip?: string,
): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error("TURNSTILE_SECRET_KEY belum dikonfigurasi.");
    return false;
  }

  if (!token || typeof token !== "string" || token.trim() === "") {
    return false;
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (ip && ip !== "unknown") {
      formData.append("remoteip", ip);
    }

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
      },
    );

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Gagal verifikasi Cloudflare Turnstile:", error);
    return false;
  }
}
