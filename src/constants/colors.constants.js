export const BUTTON_BACKGROUND_COLORS = [
  '#ffda4d',
  '#FFDA4C',
  '#CAE39D',
  '#E1D165',
  '#A7C76C',
  '#74795e'
]

// Analytics deltas: more spending is the bad direction. Warm pills from the site's
// palette with dark olive text, so they read the same anywhere on the page gradient;
// the text keeps at least 4.5:1 on every pill
export const DELTA_COLORS = {
  up: { color: '#3F3D36', backgroundColor: '#F4A261' },
  down: { color: '#3F3D36', backgroundColor: '#CAE39D' },
  flat: { color: '#3F3D36', backgroundColor: '#F6FDEB' }
}

// A refusal on the Expenses page, in the warm tone of the "more spending" pill rather
// than a harsh red
export const ALERT_COLORS = { color: '#3F3D36', backgroundColor: '#F4A261' }

// Analytics trend series, largest first. Each one keeps at least 3:1 contrast
// against #5F5B53, the darkest end of the page background
export const TREND_COLORS = ['#FFDA4D', '#9CC7F0', '#CAE39D', '#C3B2F5', '#8FD9C4', '#FF9EC0']
export const TREND_OTHER_COLOR = '#CFD2C4'
