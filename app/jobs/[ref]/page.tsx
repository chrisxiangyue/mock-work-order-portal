import Link from "next/link";
import { notFound } from "next/navigation";
import { formatAmount, getWorkOrder } from "@/data/jobs";

type Props = {
  params: Promise<{ ref: string }>;
};

export default async function JobDetailPage({ params }: Props) {
  const { ref } = await params;
  const job = getWorkOrder(ref);

  if (!job) {
    notFound();
  }

  return (
    <main>
      <p>
        <Link href="/">Back to work orders</Link>
      </p>
      <h1>Work order {job.ref}</h1>
      <dl>
        <dt>Job reference</dt>
        <dd>{job.ref}</dd>
        <dt>Vendor</dt>
        <dd>{job.vendor}</dd>
        <dt>Hours logged</dt>
        <dd>{job.hours}</dd>
        <dt>Recorded amount</dt>
        <dd>{formatAmount(job.amount)}</dd>
        <dt>Status</dt>
        <dd>{job.status}</dd>
      </dl>
    </main>
  );
}
