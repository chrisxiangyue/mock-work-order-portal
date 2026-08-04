import Link from "next/link";

export default function JobNotFound() {
  return (
    <main>
      <h1>Work order not found</h1>
      <p>No work order exists for that job reference.</p>
      <p>
        <Link href="/">Back to work orders</Link>
      </p>
    </main>
  );
}
