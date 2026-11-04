import "server-only";

type MidtransItem = {
  id: string;
  price: number;
  quantity: number;
  name: string;
};

type CreateSnapTransactionInput = {
  orderId: string;
  grossAmount: number;
  items: MidtransItem[];
  customer: {
    firstName?: string | null;
    email?: string | null;
  };
};

type MidtransSnapResponse = {
  token: string;
  redirect_url: string;
};

function getMidtransEndpoint(): string {
  return process.env.MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";
}

function getMidtransServerKey(): string {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;

  if (!serverKey) {
    throw new Error("MIDTRANS_SERVER_KEY belum dikonfigurasi.");
  }

  return serverKey;
}

export async function createSnapTransaction(
  input: CreateSnapTransactionInput,
): Promise<MidtransSnapResponse> {
  const serverKey = getMidtransServerKey();

  const authorization = Buffer.from(`${serverKey}:`).toString("base64");

  const response = await fetch(getMidtransEndpoint(), {
    method: "POST",
    headers: {
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: input.orderId,
        gross_amount: input.grossAmount,
      },
      item_details: input.items,
      customer_details: {
        first_name: input.customer.firstName ?? undefined,
        email: input.customer.email ?? undefined,
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Midtrans Snap creation failed:", errorText);

    throw new Error("Payment session gagal dibuat.");
  }

  const data = (await response.json()) as MidtransSnapResponse;

  if (!data.token || !data.redirect_url) {
    throw new Error("Response payment dari Midtrans tidak valid.");
  }

  return data;
}
