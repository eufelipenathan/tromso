export function calculateItemRelevance<T>(
  item: T,
  searchTerm: string,
  searchableFields: (keyof T)[]
): number {
  let maxRelevance = 0;

  searchableFields.forEach(field => {
    const value = item[field];
    if (!value) return;

    const stringValue = String(value).toLowerCase();
    const termLower = searchTerm.toLowerCase();

    // Pontuação base para correspondência
    if (stringValue.includes(termLower)) {
      let score = 1;

      // Bônus para correspondência exata
      if (stringValue === termLower) {
        score += 2;
      }
      // Bônus para início de palavra
      else if (stringValue.startsWith(termLower)) {
        score += 1;
      }
      // Bônus para correspondência de palavra completa
      else if (stringValue.split(' ').includes(termLower)) {
        score += 0.5;
      }

      maxRelevance = Math.max(maxRelevance, score);
    }
  });

  return maxRelevance;
}