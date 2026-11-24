// Allowed status moves for an enquiry. Anything else is rejected, so a declined
// or closed enquiry can never be reopened and "closed" is only reachable after
// the professional has accepted.
export const TRANSITIONS: Record<string, string[]> = {
  pending: ['accepted', 'declined'],
  accepted: ['closed'],
  declined: [],
  closed: [],
};

export const canMove = (from: string, to: string): boolean => (TRANSITIONS[from] ?? []).includes(to);
