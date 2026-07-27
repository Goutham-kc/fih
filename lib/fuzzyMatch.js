import stringSimilarity from 'string-similarity';

/**
 * Find the best matching item(s) from a list by title.
 * Returns { match, ambiguous, candidates }
 *   match      – single best match object (similarity >= threshold)
 *   ambiguous  – true if multiple candidates are above threshold
 *   candidates – all items above threshold, sorted by score desc
 */
export function fuzzyMatch(query, items, threshold = 0.4) {
  if (!items || items.length === 0) return { match: null, ambiguous: false, candidates: [] };
  const titles = items.map((i) => i.title);
  const { bestMatch, bestMatchIndex, ratings } = stringSimilarity.findBestMatch(
    query.toLowerCase(),
    titles.map((t) => t.toLowerCase())
  );

  const candidates = ratings
    .map((r, idx) => ({ item: items[idx], score: r.rating }))
    .filter((r) => r.score >= threshold)
    .sort((a, b) => b.score - a.score);

  if (candidates.length === 0) return { match: null, ambiguous: false, candidates: [] };
  if (candidates.length === 1) return { match: candidates[0].item, ambiguous: false, candidates };
  // Multiple candidates – check if the top one is clearly dominant
  const [top, second] = candidates;
  const dominant = top.score - second.score > 0.2;
  return {
    match: dominant ? top.item : null,
    ambiguous: !dominant,
    candidates,
  };
}
