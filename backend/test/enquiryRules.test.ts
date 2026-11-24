import { describe, it, expect } from 'vitest';
import { canMove, TRANSITIONS } from '../src/lib/enquiryRules';

describe('enquiry status moves', () => {
  it('only allows pending -> accepted/declined and accepted -> closed', () => {
    expect(TRANSITIONS.pending).toEqual(['accepted', 'declined']);
    expect(TRANSITIONS.accepted).toEqual(['closed']);
    expect(canMove('pending', 'closed')).toBe(false);
    expect(canMove('declined', 'accepted')).toBe(false);
    expect(canMove('closed', 'accepted')).toBe(false);
    expect(canMove('mystery', 'accepted')).toBe(false);
  });
});
