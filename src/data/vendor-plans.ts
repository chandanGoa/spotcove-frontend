export type VendorPlanType = "trial" | "paid";

export interface VendorPlanRecord {
  plan: VendorPlanType;
  trialExpiresAt?: string;
}

export const VENDOR_PLANS: Record<string, VendorPlanRecord> = {
  acme: {
    plan: "trial",
    trialExpiresAt: "2099-12-31T23:59:59.000Z",
  },
  beta: {
    plan: "trial",
    trialExpiresAt: "2020-01-01T00:00:00.000Z",
  },
  procorp: {
    plan: "paid",
  },
};

export function getVendorPlan(
  vendorSlug: string,
): VendorPlanRecord | undefined {
  return VENDOR_PLANS[vendorSlug];
}

export function isTrialExpired(vendorPlan: VendorPlanRecord): boolean {
  if (vendorPlan.plan !== "trial") {
    return false;
  }

  if (!vendorPlan.trialExpiresAt) {
    return true;
  }

  return new Date(vendorPlan.trialExpiresAt).getTime() <= Date.now();
}
