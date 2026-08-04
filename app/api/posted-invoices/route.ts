import { addPostedInvoice, listPostedInvoices } from "@/data/posted-invoices-store";
import { NextResponse } from "next/server";

type PostBody = {
  vendor?: string;
  invoiceNumber?: string;
  jobReference?: string;
  amount?: number;
  hours?: number | null;
};

export async function GET() {
  return NextResponse.json({ invoices: listPostedInvoices() });
}

export async function POST(request: Request) {
  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const vendor = body.vendor?.trim();
  const invoiceNumber = body.invoiceNumber?.trim();
  const jobReference = body.jobReference?.trim();
  const amount = body.amount;

  if (!vendor || !invoiceNumber || !jobReference || typeof amount !== "number") {
    return NextResponse.json(
      { error: "Required fields: vendor, invoiceNumber, jobReference, amount (number)" },
      { status: 400 },
    );
  }

  const hours = body.hours == null ? null : Number(body.hours);
  if (hours != null && Number.isNaN(hours)) {
    return NextResponse.json({ error: "hours must be a number when provided" }, { status: 400 });
  }

  const invoice = addPostedInvoice({
    vendor,
    invoiceNumber,
    jobReference,
    amount,
    hours,
  });

  return NextResponse.json({ ok: true, invoice }, { status: 201 });
}
