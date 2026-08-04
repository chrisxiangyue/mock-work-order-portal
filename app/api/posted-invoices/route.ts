import {
  addPostedInvoice,
  blobStorageDiagnostics,
  listPostedInvoices,
  StorageNotConfiguredError,
} from "@/data/posted-invoices-store";
import { NextResponse } from "next/server";

type PostBody = {
  vendor?: string;
  invoiceNumber?: string;
  jobReference?: string;
  amount?: number;
  hours?: number | null;
  postedAt?: string;
};

function storageNotConfiguredResponse() {
  return NextResponse.json(
    {
      error:
        "Blob storage is not linked to this Vercel project. Open Storage → your Blob store → Projects, connect mock-work-order-portal, include Production, then redeploy.",
      invoices: [],
      diagnostics: blobStorageDiagnostics(),
    },
    { status: 503 },
  );
}

export async function GET() {
  try {
    return NextResponse.json({ invoices: await listPostedInvoices() });
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      return storageNotConfiguredResponse();
    }
    throw error;
  }
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

  if (body.postedAt != null && Number.isNaN(Date.parse(body.postedAt))) {
    return NextResponse.json(
      { error: "postedAt must be a valid ISO timestamp when provided" },
      { status: 400 },
    );
  }

  try {
    const invoice = await addPostedInvoice({
      vendor,
      invoiceNumber,
      jobReference,
      amount,
      hours,
      postedAt: body.postedAt,
    });

    return NextResponse.json({ ok: true, invoice }, { status: 201 });
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      return storageNotConfiguredResponse();
    }
    throw error;
  }
}
