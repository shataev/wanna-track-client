export const BUTTON_BACKGROUND_COLORS = [
  '#ffda4d',
  '#FFDA4C',
  '#CAE39D',
  '#E1D165',
  '#A7C76C',
  '#74795e'
]

// Analytics deltas: more spending is the bad direction. Drawn as pills with their
// own background, so they read the same anywhere on the page gradient; white text
// keeps at least 7:1 on every pill
export const DELTA_COLORS = {
  up: { color: '#FFFFFF', backgroundColor: '#9F1D1D' },
  down: { color: '#FFFFFF', backgroundColor: '#2F5D2F' },
  flat: { color: '#F6FDEB', backgroundColor: '#4A4840' }
}

// Analytics trend series, largest first. Each one keeps at least 3:1 contrast
// against #5F5B53, the darkest end of the page background
export const TREND_COLORS = ['#FFDA4D', '#9CC7F0', '#CAE39D', '#C3B2F5', '#8FD9C4', '#FF9EC0']
export const TREND_OTHER_COLOR = '#CFD2C4'
