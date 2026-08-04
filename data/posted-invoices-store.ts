import { list, put } from "@vercel/blob";
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

export type BlobStorageDiagnostics = {
  vercel: boolean;
  hasBlobReadWriteToken: boolean;
  hasBlobStoreId: boolean;
  hasOidcToken: boolean;
};

export class StorageNotConfiguredError extends Error {
  constructor(message = "Blob storage is not configured for this Vercel project.") {
    super(message);
    this.name = "StorageNotConfiguredError";
  }
}

const BLOB_PATHNAME = "mock-posted-invoices.json";

function localStorePath(): string {
  return join(process.cwd(), "data", "posted-invoices.json");
}

function readLocalStore(): PostedInvoice[] {
  const path = localStorePath();
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

function writeLocalStore(invoices: PostedInvoice[]): void {
  const path = localStorePath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(invoices, null, 2)}\n`, "utf8");
}

function isBlobAuthError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return (
    message.includes("no blob credentials") ||
    message.includes("no read-write token") ||
    message.includes("blob_read_write_token")
  );
}

async function readBlobStore(): Promise<PostedInvoice[]> {
  const { blobs } = await list({ prefix: BLOB_PATHNAME, limit: 1 });
  if (blobs.length === 0) {
    return [];
  }

  const response = await fetch(blobs[0].url, { cache: "no-store" });
  if (!response.ok) {
    return [];
  }

  const parsed = (await response.json()) as unknown;
  return Array.isArray(parsed) ? (parsed as PostedInvoice[]) : [];
}

async function writeBlobStore(invoices: PostedInvoice[]): Promise<void> {
  await put(BLOB_PATHNAME, JSON.stringify(invoices, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

function isVercelRuntime(): boolean {
  return process.env.VERCEL === "1";
}

export function blobStorageDiagnostics(): BlobStorageDiagnostics {
  return {
    vercel: isVercelRuntime(),
    hasBlobReadWriteToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    hasBlobStoreId: Boolean(process.env.BLOB_STORE_ID),
    hasOidcToken: Boolean(process.env.VERCEL_OIDC_TOKEN),
  };
}

export function isStorageConfigured(): boolean {
  if (!isVercelRuntime()) {
    return true;
  }
  const diagnostics = blobStorageDiagnostics();
  return diagnostics.hasBlobReadWriteToken || diagnostics.hasBlobStoreId;
}

async function readStore(): Promise<PostedInvoice[]> {
  if (!isVercelRuntime()) {
    return readLocalStore();
  }

  try {
    return await readBlobStore();
  } catch (error) {
    if (isBlobAuthError(error)) {
      throw new StorageNotConfiguredError();
    }
    throw error;
  }
}

async function writeStore(invoices: PostedInvoice[]): Promise<void> {
  if (!isVercelRuntime()) {
    writeLocalStore(invoices);
    return;
  }

  try {
    await writeBlobStore(invoices);
  } catch (error) {
    if (isBlobAuthError(error)) {
      throw new StorageNotConfiguredError();
    }
    throw error;
  }
}

export async function listPostedInvoices(): Promise<PostedInvoice[]> {
  const invoices = await readStore();
  return invoices.sort((a, b) => b.postedAt.localeCompare(a.postedAt));
}

export async function addPostedInvoice(input: {
  vendor: string;
  invoiceNumber: string;
  jobReference: string;
  amount: number;
  hours?: number | null;
  postedAt?: string;
}): Promise<PostedInvoice> {
  const postedAt =
    input.postedAt != null && !Number.isNaN(Date.parse(input.postedAt))
      ? new Date(input.postedAt).toISOString()
      : new Date().toISOString();

  const invoice: PostedInvoice = {
    vendor: input.vendor,
    invoiceNumber: input.invoiceNumber,
    jobReference: input.jobReference,
    amount: input.amount,
    hours: input.hours ?? null,
    postedAt,
  };

  const invoices = await readStore();
  invoices.push(invoice);
  await writeStore(invoices);
  return invoice;
}
