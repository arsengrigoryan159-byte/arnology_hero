/** @typedef {{ at: number, stage: number, label: string }} TimelineFrame */

/** @type {readonly TimelineFrame[]} */
export const heroTimeline = Object.freeze([
  { at: 0, stage: 0, label: 'Lead ready' },
  { at: 850, stage: 1, label: 'Facility B selected' },
  { at: 1800, stage: 2, label: 'Reservation created' },
  { at: 2900, stage: 3, label: 'Verification complete' },
  { at: 4000, stage: 4, label: 'Card payment complete' },
  { at: 5200, stage: 5, label: 'Agreement signed' }
]);

export const heroCycleDuration = 7800;
export const heroResetAt = 7300;

export const workflowCopy = Object.freeze([
  'New lead',
  'Facility selected',
  'Reservation held',
  'Verification complete',
  'Card payment complete',
  'Workflow complete'
]);
