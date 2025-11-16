export const CREDIT_COSTS = {
  create_plan: 15,
  discovery: 15,
  // future actions can be added here, e.g., 'export_pdf': 10, 'hotel_suggestions': 5
} as const;

export type CreditAction = keyof typeof CREDIT_COSTS;