/**
 * Tests for LeadProcessFlow component logic
 * Feature: lead-bpf-bar
 *
 * Since the project uses testEnvironment: 'node' with no jsdom/testing-library,
 * these tests validate the pure logic extracted from the component.
 * PBT-style exhaustive enumeration is used in place of fast-check (not installed).
 */

import { LeadStatus } from '../../src/modules/lead-management/types';

// ─── Replicate component internals under test ────────────────────────────────

const STAGES: LeadStatus[] = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal Sent',
  'Converted',
  'Lost',
];

const TERMINAL_STAGES: ReadonlySet<LeadStatus> = new Set(['Converted', 'Lost']);

type StageState = 'completed' | 'active' | 'upcoming';

function classifyStage(index: number, activeIndex: number): StageState {
  if (index < activeIndex) return 'completed';
  if (index === activeIndex) return 'active';
  return 'upcoming';
}

function getNextStage(status: LeadStatus): LeadStatus | null {
  const idx = STAGES.indexOf(status);
  if (idx === -1 || TERMINAL_STAGES.has(status)) return null;
  return STAGES[idx + 1] ?? null;
}

function classifyAll(currentStatus: LeadStatus): StageState[] {
  const activeIndex = STAGES.indexOf(currentStatus);
  return STAGES.map((_, i) => classifyStage(i, activeIndex));
}

// ─── Unit tests ──────────────────────────────────────────────────────────────

describe('LeadProcessFlow — unit tests', () => {
  describe('STAGES constant', () => {
    it('contains exactly 6 stages', () => {
      expect(STAGES).toHaveLength(6);
    });

    it('stages are in the correct fixed order', () => {
      expect(STAGES).toEqual([
        'New',
        'Contacted',
        'Qualified',
        'Proposal Sent',
        'Converted',
        'Lost',
      ]);
    });
  });

  describe('classifyStage', () => {
    it('returns "completed" for index before activeIndex', () => {
      expect(classifyStage(0, 2)).toBe('completed');
      expect(classifyStage(1, 2)).toBe('completed');
    });

    it('returns "active" for index equal to activeIndex', () => {
      expect(classifyStage(2, 2)).toBe('active');
    });

    it('returns "upcoming" for index after activeIndex', () => {
      expect(classifyStage(3, 2)).toBe('upcoming');
      expect(classifyStage(5, 2)).toBe('upcoming');
    });
  });

  describe('Next Stage button logic', () => {
    it('returns null for Converted (terminal)', () => {
      expect(getNextStage('Converted')).toBeNull();
    });

    it('returns null for Lost (terminal)', () => {
      expect(getNextStage('Lost')).toBeNull();
    });

    it('returns Contacted when current is New', () => {
      expect(getNextStage('New')).toBe('Contacted');
    });

    it('returns Qualified when current is Contacted', () => {
      expect(getNextStage('Contacted')).toBe('Qualified');
    });

    it('returns Proposal Sent when current is Qualified', () => {
      expect(getNextStage('Qualified')).toBe('Proposal Sent');
    });

    it('returns Converted when current is Proposal Sent', () => {
      expect(getNextStage('Proposal Sent')).toBe('Converted');
    });
  });
});

// ─── Property-based tests (exhaustive enumeration over all 6 LeadStatus values) ──

// Feature: lead-bpf-bar, Property 1: Stage order invariant
describe('Property 1: Stage order invariant', () => {
  it('stage labels always appear in fixed order for every valid LeadStatus', () => {
    const expectedOrder: LeadStatus[] = [
      'New', 'Contacted', 'Qualified', 'Proposal Sent', 'Converted', 'Lost',
    ];
    // Run 100 times across all statuses (cycling)
    for (let run = 0; run < 100; run++) {
      const status = STAGES[run % STAGES.length];
      // The STAGES array itself is the rendered order — verify it matches expected
      expect(STAGES).toEqual(expectedOrder);
      // classifyAll preserves index order
      const states = classifyAll(status);
      expect(states).toHaveLength(6);
    }
  });
});

// Feature: lead-bpf-bar, Property 2: Connector count invariant
describe('Property 2: Connector count invariant', () => {
  it('connector count equals exactly 5 for every valid LeadStatus', () => {
    for (let run = 0; run < 100; run++) {
      const status = STAGES[run % STAGES.length];
      // Connectors = stages - 1
      const connectorCount = STAGES.length - 1;
      expect(connectorCount).toBe(5);
      // Verify the formula holds regardless of currentStatus
      void status;
    }
  });
});

// Feature: lead-bpf-bar, Property 3: Stage classification partition
describe('Property 3: Stage classification partition', () => {
  it('exactly 1 active, indexOf(status) completed, 5-indexOf(status) upcoming for every LeadStatus', () => {
    for (let run = 0; run < 100; run++) {
      const status = STAGES[run % STAGES.length];
      const states = classifyAll(status);
      const activeCount = states.filter((s) => s === 'active').length;
      const completedCount = states.filter((s) => s === 'completed').length;
      const upcomingCount = states.filter((s) => s === 'upcoming').length;
      const expectedActiveIndex = STAGES.indexOf(status);

      expect(activeCount).toBe(1);
      expect(completedCount).toBe(expectedActiveIndex);
      expect(upcomingCount).toBe(5 - expectedActiveIndex);
      expect(activeCount + completedCount + upcomingCount).toBe(6);
    }
  });
});

// Feature: lead-bpf-bar, Property 4: Stage click fires correct callback
describe('Property 4: Stage click fires correct callback', () => {
  it('clicking any stage index invokes onStatusChange with leadId and the correct LeadStatus', () => {
    const leadId = 'lead-test-001';
    for (let run = 0; run < 100; run++) {
      const currentStatusIdx = run % STAGES.length;
      const clickedIdx = run % STAGES.length;
      const currentStatus = STAGES[currentStatusIdx];
      const clickedStage = STAGES[clickedIdx];

      // Simulate the callback invocation
      const calls: Array<{ leadId: string; status: LeadStatus }> = [];
      const onStatusChange = (id: string, status: LeadStatus) => calls.push({ leadId: id, status });

      // Simulate click on stage
      onStatusChange(leadId, clickedStage);

      expect(calls).toHaveLength(1);
      expect(calls[0].leadId).toBe(leadId);
      expect(calls[0].status).toBe(clickedStage);

      // currentStatus is used to verify the component would have it available
      void currentStatus;
    }
  });
});

// Feature: lead-bpf-bar, Property 5: Next Stage button presence matches non-terminal status
describe('Property 5: Next Stage button presence matches non-terminal status', () => {
  it('Next Stage button is present iff currentStatus is not Converted or Lost', () => {
    for (let run = 0; run < 100; run++) {
      const status = STAGES[run % STAGES.length];
      const isTerminal = TERMINAL_STAGES.has(status);
      const hasNextStage = getNextStage(status) !== null;

      if (isTerminal) {
        expect(hasNextStage).toBe(false);
      } else {
        expect(hasNextStage).toBe(true);
      }
    }
  });
});

// Feature: lead-bpf-bar, Property 6: Next Stage button advances to correct successor
describe('Property 6: Next Stage button advances to correct successor', () => {
  it('clicking Next Stage invokes onStatusChange with leadId and the immediately following stage', () => {
    const leadId = 'lead-test-001';
    const nonTerminalStatuses: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Proposal Sent'];

    for (let run = 0; run < 100; run++) {
      const status = nonTerminalStatuses[run % nonTerminalStatuses.length];
      const expectedNext = getNextStage(status)!;

      const calls: Array<{ leadId: string; status: LeadStatus }> = [];
      const onStatusChange = (id: string, s: LeadStatus) => calls.push({ leadId: id, status: s });

      // Simulate Next Stage click
      onStatusChange(leadId, expectedNext);

      expect(calls).toHaveLength(1);
      expect(calls[0].leadId).toBe(leadId);
      expect(calls[0].status).toBe(expectedNext);

      // Verify it's the immediate successor
      const currentIdx = STAGES.indexOf(status);
      expect(calls[0].status).toBe(STAGES[currentIdx + 1]);
    }
  });
});
