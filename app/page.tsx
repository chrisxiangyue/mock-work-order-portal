import Link from "next/link";
import { formatAmount, WORK_ORDERS } from "@/data/jobs";

export default function HomePage() {
  return (
    <main>
      <h1>Work Order Portal</h1>
      <p>Mock system of record for AP invoice verification.</p>

      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>Job reference</th>
            <th>Vendor</th>
            <th>Hours logged</th>
            <th>Recorded amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {WORK_ORDERS.map((job) => (
            <tr key={job.ref}>
              <td>
                <Link href={`/jobs/${job.ref}`}>{job.ref}</Link>
              </td>
              <td>{job.vendor}</td>
              <td>{job.hours}</td>
              <td>{formatAmount(job.amount)}</td>
              <td>{job.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>
        Unknown refs (e.g. <Link href="/jobs/JOB-4040">JOB-4040</Link>) return a not-found page for
        mismatch testing.
      </p>
    </main>
  );
}
