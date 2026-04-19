export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function extractPokemonId(url: string): number {
  const parts = url.split('/').filter(Boolean);
  return parseInt(parts[parts.length - 1], 10);
}

export function getGeneration(id: number): number {
  const genRanges = [
    { start: 1, end: 151 },
    { start: 152, end: 251 },
    { start: 252, end: 386 },
    { start: 387, end: 493 },
    { start: 494, end: 649 },
    { start: 650, end: 721 },
    { start: 722, end: 809 },
    { start: 810, end: 905 },
    { start: 906, end: 1025 },
  ];
  for (let i = 0; i < genRanges.length; i++) {
    if (id >= genRanges[i].start && id <= genRanges[i].end) {
      return i + 1;
    }
  }
  return 9;
}

export function getOfficialArtworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function getDreamWorldUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`;
}

export function getStatShortName(statName: string): string {
  const shortNames: Record<string, string> = {
    'hp': 'HP',
    'attack': 'ATK',
    'defense': 'DEF',
    'special-attack': 'SPA',
    'special-defense': 'SPD',
    'speed': 'SPE'
  };
  return shortNames[statName] || statName;
}

export function getStatPercentage(baseStat: number, maxValue = 255): number {
  return Math.min((baseStat / maxValue) * 100, 100);
}

export function getStatColor(baseStat: number): string {
  if (baseStat >= 150) return '#ff4081';
  if (baseStat >= 120) return '#ff7043';
  if (baseStat >= 90) return '#ffca28';
  if (baseStat >= 60) return '#66bb6a';
  return '#42a5f5';
}
