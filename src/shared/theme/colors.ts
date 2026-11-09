/**
 * Paleta de colores oficial de TickDesk.
 * Coherente con los tokens definidos en global.css para Uniwind / Tailwind.
 */
export const COLORS = {
  PETROL: '#244E65',
  STEEL: '#5B91A5',
  SKY: '#B8DDE3',
  CANVAS: '#F3F6F5',
  CORAL: '#F28C5B',
} as const;

export type ColorKey = keyof typeof COLORS;

export const PETROL = COLORS.PETROL;
export const STEEL = COLORS.STEEL;
export const SKY = COLORS.SKY;
export const CANVAS = COLORS.CANVAS;
export const CORAL = COLORS.CORAL;
