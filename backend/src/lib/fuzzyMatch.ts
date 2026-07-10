import { distance } from "fastest-levenshtein";

export function nameSimilarity(a: string, b: string): number {
  const left = a.trim().toLowerCase();
  const right = b.trim().toLowerCase();
  if (!left || !right) return 0;
  if (left === right) return 1;

  const editDistance = distance(left, right);
  const maxLen = Math.max(left.length, right.length);
  return 1 - editDistance / maxLen;
}

export interface ScoredContact<T> {
  contact: T;
  score: number;
}

export function rankContactsByName<T>(
  contacts: T[],
  spokenName: string,
  getName: (contact: T) => string,
  threshold = 0.7
): ScoredContact<T>[] {
  return contacts
    .map((contact) => ({ contact, score: nameSimilarity(spokenName, getName(contact)) }))
    .filter(({ score }) => score >= threshold)
    .sort((a, b) => b.score - a.score);
}
