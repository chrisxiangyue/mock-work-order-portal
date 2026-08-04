import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export type PostedInvoice = {
  vendor: string;
  invoiceNumber: string;
  jobReference: string;
  amount: number;
  hours: number | null;
  postedAt: string;
};

function storePath(): string {
  if (process.env.VERCEL === "1") {
    return "/tmp/mock-posted-invoices.json";
  }
  return join(process.cwd(), "data", "posted-invoices.json");
}

function readStore(): PostedInvoice[] {
  const path = storePath();
  if (!existsSync(path)) {
    return [];
  }
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as unknown;
    return Array.isArray(parsed) ? (parsed as PostedInvoice[]) : [];
  } catch {
    return [];
  }
}

function writeStore(invoices: PostedInvoice[]): void {
  const path = storePath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(invoices, null, 2)}\n`, "utf8");
}

export function listPostedInvoices(): PostedInvoice[] {
  return readStore().sort((a, b) => b.postedAt.localeCompare(a.postedAt));
}

export function addPostedInvoice(input: {
  vendor: string;
  invoiceNumber: string;
  jobReference: string;
  amount: number;
  hours?: number | null;
}): PostedInvoice {
  const invoice: PostedInvoice = {
    vendor: input.vendor,
    invoiceNumber: input.invoiceNumber,
    jobReference: input.jobReference,
    amount: input.amount,
    hours: input.hours ?? null,
    postedAt: new Date().toISOString(),
  };

  const invoices = readStore();
  invoices.push(invoice);
  writeStore(invoices);
  return invoice;
}
