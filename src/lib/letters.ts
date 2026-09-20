/*
 * The Albanian alphabet as it is typed — one character each, and the rule that
 * both word games count length by.
 *
 * A letter written with two characters — DH, GJ, LL, NJ, RR, SH, TH, XH, ZH —
 * is two characters here, the way it is typed and the way a box holds it:
 * GARDH is five, SHTËPI is six. Fjalëz fills one box per character and Lëmsh
 * scrambles one tile per character, so the two games agree on what a word's
 * length is without either of them owning the answer.
 *
 * Pure, and free of node imports: this runs in the browser and in the
 * generators alike.
 */

export const ALPHABET = [
  'a', 'b', 'c', 'ç', 'd', 'e', 'ë', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'x', 'y', 'z',
];

const LETTERS = new Set(ALPHABET);

/** The word's characters, or `null` if it holds anything outside the alphabet. */
export const splitLetters = (word: string): string[] | null => {
  const letters = [...word.toLowerCase()];
  return letters.every((letter) => LETTERS.has(letter)) ? letters : null;
};
