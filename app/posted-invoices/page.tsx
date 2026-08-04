import Link from "next/link";
import {
  blobStorageDiagnostics,
  listPostedInvoices,
  StorageNotConfiguredError,
} from "@/data/posted-invoices-store";

export const dynamic = "force-dynamic";

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

export default async function PostedInvoicesPage() {
  let storageConfigured = true;
  let invoices: Awaited<ReturnType<typeof listPostedInvoices>> = [];

  try {
    invoices = await listPostedInvoices();
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      storageConfigured = false;
    } else {
      throw error;
    }
  }

  const diagnostics = blobStorageDiagnostics();

  return (
    <main>
      <p>
        <Link href="/">Back to work orders</Link>
      </p>
      <h1>Mock financial system (stand-in for Workday)</h1>
      <p>
        Demo-only view of invoices auto-posted by the Runbook AP workflow. This is not a real
        Workday or ERP integration.
      </p>

      {!storageConfigured ? (
        <p>
          <strong>Storage not linked on Vercel.</strong> Open{" "}
          <strong>Storage → your Blob store → Projects</strong>, connect this app, include{" "}
          <strong>Production</strong>, redeploy. Expected env vars:{" "}
          <code>BLOB_STORE_ID</code> or <code>BLOB_READ_WRITE_TOKEN</code>.
          <br />
          Diagnostics: BLOB_STORE_ID={diagnostics.hasBlobStoreId ? "yes" : "no"},{" "}
          BLOB_READ_WRITE_TOKEN={diagnostics.hasBlobReadWriteToken ? "yes" : "no"},{" "}
          VERCEL_OIDC_TOKEN={diagnostics.hasOidcToken ? "yes" : "no"}
        </p>
      ) : null}

      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Invoice number</th>
            <th>Job reference</th>
            <th>Amount</th>
            <th>Hours</th>
            <th>Timestamp posted</th>
          </tr>
        </thead>
        <tbody>
          {!storageConfigured ? (
            <tr>
              <td colSpan={6}>Configure Vercel Blob storage to persist posted invoices.</td>
            </tr>
          ) : invoices.length === 0 ? (
            <tr>
              <td colSpan={6}>No invoices posted yet.</td>
            </tr>
          ) : (
            invoices.map((invoice) => (
              <tr key={`${invoice.invoiceNumber}-${invoice.postedAt}`}>
                <td>{invoice.vendor}</td>
                <td>{invoice.invoiceNumber}</td>
                <td>{invoice.jobReference}</td>
                <td>{formatAmount(invoice.amount)}</td>
                <td>{invoice.hours ?? "—"}</td>
                <td>{formatTimestamp(invoice.postedAt)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </main>
  );
}
