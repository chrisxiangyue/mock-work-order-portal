import { addPostedInvoice, isStorageConfigured, listPostedInvoices } from "@/data/posted-invoices-store";
import { NextResponse } from "next/server";

type PostBody = {
  vendor?: string;
  invoiceNumber?: string;
  jobReference?: string;
  amount?: number;
  hours?: number | null;
  postedAt?: string;
};

export async function GET() {
  if (!isStorageConfigured()) {
    return NextResponse.json(
      {
        error: "Blob storage is not configured. Create a Vercel Blob store for this project.",
        invoices: [],
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ invoices: await listPostedInvoices() });
}

export async function POST(request: Request) {
  if (!isStorageConfigured()) {
    return NextResponse.json(
      { error: "Blob storage is not configured. Create a Vercel Blob store for this project." },
      { status: 503 },
    );
  }

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

  if (body.postedAt != null && Number.isNaN(Date.parse(body.postedAt))) {
    return NextResponse.json(
      { error: "postedAt must be a valid ISO timestamp when provided" },
      { status: 400 },
    );
  }

  const invoice = await addPostedInvoice({
    vendor,
    invoiceNumber,
    jobReference,
    amount,
    hours,
    postedAt: body.postedAt,
  });

  return NextResponse.json({ ok: true, invoice }, { status: 201 });
}
