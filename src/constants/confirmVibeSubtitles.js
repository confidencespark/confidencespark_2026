/**
 * Subtitle copy for ConfirmVibe + Lookup (same situation key × mood as MoodSelectScreen).
 */

const SUBTITLE_BY_SITUATION_AND_VIBE = {
  pitch: {
    calm: 'Present, Not Performing',
    power: 'Command the Room',
    playful: 'Pitch, Please',
  },
  interview: {
    calm:
      'Anchor In: Feel your shoulders naturally settle into confidence.',
    power: 'Let Them See You',
    playful: 'Flow Into It',
  },
  interview_career: {
    calm:
      'Anchor In: Feel your shoulders naturally settle into confidence.',
    power: 'Let Them See You',
    playful: 'Flow Into It',
  },
  performance: {
    calm: 'Centered Stage',
    power: 'Stage Energy',
    playful: 'Let It Rip',
  },
  negotiation: {
    calm: 'Hold the Line',
    power: 'Know Your Worth',
    playful: "Let's Dance",
  },
  presentation: {
    calm: 'Speak from Center',
    power: 'Own the Mic',
    playful: 'Speak Easy',
  },
  difficult: {
    calm: 'Steady first. Then speak.',
    power: 'Clear, firm, and anchored.',
    playful: 'Soft tone. Strong message.',
  },
};

export const DEFAULT_CONFIRM_VIBE_SUBTITLE =
  "You're all set. Let's step into it.\nTap Start below and own the moment.";

export function getConfirmVibeSubtitle(situationKey, moodKey) {
  const row =
    situationKey && moodKey && SUBTITLE_BY_SITUATION_AND_VIBE[situationKey];
  const line = row && row[moodKey];
  return line || DEFAULT_CONFIRM_VIBE_SUBTITLE;
}
// ConfidenceSpark workspace batch
