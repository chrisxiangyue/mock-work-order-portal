export type WorkOrder = {
  ref: string;
  vendor: string;
  hours: number;
  amount: number;
  status: string;
};

export const WORK_ORDERS: WorkOrder[] = [
  {
    ref: "JOB-1234",
    vendor: "Acme HVAC Services",
    hours: 8,
    amount: 1200,
    status: "Completed",
  },
  {
    ref: "JOB-5678",
    vendor: "Bright Electric Co.",
    hours: 4.5,
    amount: 675,
    status: "Completed",
  },
  {
    ref: "JOB-8821",
    vendor: "Premier Plumbing LLC",
    hours: 6,
    amount: 900,
    status: "Completed",
  },
  {
    ref: "JOB-9999",
    vendor: "OverTime Industries",
    hours: 480,
    amount: 72000,
    status: "Completed",
  },
  {
    ref: "JOB-3141",
    vendor: "Delta Maintenance Group",
    hours: 12,
    amount: 1840,
    status: "In progress",
  },
];

export function getWorkOrder(ref: string): WorkOrder | undefined {
  const normalized = ref.trim().toUpperCase();
  return WORK_ORDERS.find((job) => job.ref === normalized);
}

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
