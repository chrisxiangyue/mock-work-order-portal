import Link from "next/link";
import { isStorageConfigured, listPostedInvoices } from "@/data/posted-invoices-store";

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
  const storageConfigured = isStorageConfigured();
  const invoices = storageConfigured ? await listPostedInvoices() : [];

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
          <strong>Storage not configured on Vercel.</strong> Link a Blob store to this project
          (Storage → Blob → Connect) and redeploy. Vercel injects{" "}
          <code>BLOB_STORE_ID</code> + <code>VERCEL_OIDC_TOKEN</code>, or{" "}
          <code>BLOB_READ_WRITE_TOKEN</code>.
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
