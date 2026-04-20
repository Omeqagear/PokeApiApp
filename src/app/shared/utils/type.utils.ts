const POKEMON_TYPE_COLORS: Record<string, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC'
};

export function getTypeColor(type: string): string {
  return POKEMON_TYPE_COLORS[type.toLowerCase()] || '#A8A878';
}

export function getTypeGradient(type: string, angle = 135): string {
  const color = getTypeColor(type);
  return `linear-gradient(${angle}deg, ${color} 0%, ${adjustBrightness(color, -30)} 100%)`;
}

export function getTypeTextColor(type: string): string {
  const lightTypes = ['electric', 'ice', 'ground', 'steel'];
  if (lightTypes.includes(type.toLowerCase())) {
    return '#1a202c';
  }
  return '#ffffff';
}

function adjustBrightness(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}
