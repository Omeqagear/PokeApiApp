export const GENERATION_COLORS: Record<string, string> = {
  kanto: '#DC0A2D',
  johto: '#C8A030',
  hoenn: '#00A0B0',
  sinnoh: '#686878',
  unova: '#2C2C2C',
  kalos: '#5B3A8C',
  alola: '#FF6B6B',
  galar: '#8B5CF6',
  paldea: '#14B8A6',
};

export const DEFAULT_GENERATION_COLOR = '#E8453C';

export function getGenerationColor(region: string): string {
  if (!region) return DEFAULT_GENERATION_COLOR;
  const normalized = region.toLowerCase().trim();
  return GENERATION_COLORS[normalized] || DEFAULT_GENERATION_COLOR;
}
