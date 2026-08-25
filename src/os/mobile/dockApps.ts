/**
 * The dock.
 *
 * Four slots, chosen for what someone arriving on a phone actually came for:
 * the professional summary, the work, the resume, and a way to make contact.
 * Everything else is one tap away in the home grid.
 *
 * Kept as data rather than inline in the component so the choice can be tested
 * — a dock that quietly lost Recruiter Mode would be a real regression.
 */
export const DOCK_APP_IDS = ['recruiter', 'projects', 'resume', 'contact'] as const;

export type DockAppId = (typeof DOCK_APP_IDS)[number];
