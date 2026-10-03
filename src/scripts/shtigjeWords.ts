/*
 * Builds the Shtigje weeks — the themed grids of the weekly game:
 *
 *   node ./src/scripts/shtigjeWords.ts
 *
 * Its output — `src/data/shtigje/weeks.json` — is committed, unlike
 * `src/data/gen/`, for the same reason the Lëmsh rounds are: the entry pipeline
 * is env-gated down to a handful of words in a development build, and a game
 * may not depend on that gate.
 *
 * What it does, per theme:
 *
 *   1. Checks every pooled word against `data/dictionary.json`. A theme word is
 *      a link to its own entry, so a word that is not a headword would link to
 *      a page that does not exist.
 *   2. Picks the subset of the pool whose letters add up to exactly the grid —
 *      forty-eight cells, no cell spare. This is why a theme carries a pool of
 *      a dozen or more words and not the eight it needs: an exact cover of the
 *      board is a far easier thing to ask of a choice than of a list.
 *   3. Packs that subset into the grid as self-avoiding king-move paths that
 *      partition it. The letters follow from the paths; there is no
 *      letter-matching constraint anywhere, which is what makes this tractable.
 *   4. Reads every other word the finished grid happens to spell — the bonus
 *      words a reader is paid a hint for — out of the dictionary itself.
 *
 * It **fails loudly** rather than writing a partial file: a week that could not
 * be packed, or a pool with a word the dictionary does not hold, stops the run.
 */
import { getScrapedDictionary } from '../lib/dictionary.ts';
import { splitLetters } from '../lib/letters.ts';
import { getSlug } from '../lib/process.ts';
import { writeJson } from '../lib/files.ts';
import {
  CELLS,
  COLS,
  MAX_WORD,
  MIN_WORD,
  MAX_WORDS,
  MIN_WORDS,
  NEIGHBOURS,
  ROWS,
  type Week,
  type WeekWord,
} from '../lib/shtigjeGrid.ts';

const WEEKS_FILENAME = 'src/data/shtigje/weeks.json';

/*
 * A bonus word is read off the grid, so the longer ones cost enumeration and
 * the shorter ones are noise: three letters of Albanian can be traced almost
 * anywhere on a board this dense. Four to eight is the window.
 */
const MIN_BONUS = 4;
const MAX_BONUS = 8;

/*
 * The themes. Each is a title and a pool, and the pool is deliberately larger
 * than the week needs: the generator takes the subset that covers the board
 * exactly, so slack in the pool is what buys an exact cover. Words are concrete
 * and everyday, because a theme is only a theme when the reader can feel the
 * next word coming.
 */
interface Theme {
  title: string;
  pool: string[];
}

const THEMES: Theme[] = [
  {
    title: 'Në kuzhinë',
    pool: [
      'tenxhere', 'tigan', 'lugë', 'pirun', 'thikë', 'tavë', 'pjatë', 'gotë',
      'filxhan', 'kusi', 'sofër', 'furrë', 'kazan', 'kapak', 'tepsi', 'shishe',
      'vorbë', 'magje',
    ],
  },
  {
    title: 'Fruta',
    pool: [
      'mollë', 'dardhë', 'kumbull', 'qershi', 'rrush', 'pjeshkë', 'kajsi',
      'limon', 'shegë', 'ftua', 'arrë', 'bajame', 'lajthi', 'boronicë',
      'banane', 'vadhë', 'pjepër', 'shalqi',
    ],
  },
  {
    title: 'Perime',
    pool: [
      'patate', 'domate', 'spec', 'qepë', 'hudhër', 'karotë', 'lakër',
      'spinaq', 'trangull', 'bathë', 'fasule', 'bizele', 'kungull', 'panxhar',
      'majdanoz', 'presh', 'rrepë', 'qepujkë',
    ],
  },
  {
    title: 'Kafshët e shtëpisë',
    pool: [
      'mace', 'lopë', 'dele', 'kalë', 'gomar', 'derr', 'pulë', 'gjel', 'rosë',
      'patë', 'qengj', 'mushkë', 'buall', 'pelë', 'dash', 'cjap', 'lepur',
      'pëllumb', 'gomaricë', 'derrkuc', 'shqerrë', 'mëshqerrë', 'buallicë',
      'këlysh',
    ],
  },
  {
    title: 'Zogjtë',
    pool: [
      'harabel', 'pëllumb', 'sorrë', 'lejlek', 'bilbil', 'shqiponjë', 'qukapik',
      'trumcak', 'fajkua', 'kukuvajkë', 'thëllëzë', 'laraskë', 'mëllenjë',
      'skifter', 'korb', 'pupëz', 'çafkë', 'gushëkuq',
    ],
  },
  {
    title: 'Pemët e pyllit',
    pool: [
      'dushk', 'bredh', 'pishë', 'plep', 'shelg', 'bungë', 'rrap', 'mështekën',
      'panjë', 'frashër', 'vidh', 'gështenjë', 'qiparis', 'selvi', 'dafinë',
      'ulli', 'shkozë', 'lajthi',
    ],
  },
  {
    title: 'Lulet',
    pool: [
      'trëndafil', 'manushaqe', 'zambak', 'karafil', 'jargavan', 'borzilok',
      'luleborë', 'vjollcë', 'shebojë', 'zymbyl', 'narcis', 'shqopë',
      'luleyll', 'gonxhe', 'nenexhik', 'jasemin', 'lule', 'sumbull',
    ],
  },
  {
    title: 'Deti',
    pool: [
      'valë', 'dallgë', 'anije', 'barkë', 'varkë', 'rërë', 'breg', 'shkëmb',
      'peshk', 'rrjetë', 'kripë', 'baticë', 'zbaticë', 'fener', 'skelë',
      'lundër', 'liman', 'ishull',
    ],
  },
  {
    title: 'Në mal',
    pool: [
      'majë', 'shpat', 'greminë', 'shpellë', 'kodër', 'qafë', 'përrua', 'burim',
      'pyll', 'luginë', 'kullotë', 'stan', 'bjeshkë', 'shkrep', 'humnerë',
      'rrëpirë', 'shteg', 'curril',
    ],
  },
  {
    title: 'Moti',
    pool: [
      'borë', 'breshër', 'vetëtimë', 'bubullimë', 'mjegull', 'ngricë', 'acar',
      'vapë', 'stuhi', 'fllad', 'thatësirë', 'ylber', 'furtunë', 'vranësirë',
      'rrebesh', 'zagushi', 'veri', 'shtrëngim',
    ],
  },
  {
    title: 'Trupi i njeriut',
    pool: [
      'fytyrë', 'vesh', 'hundë', 'gojë', 'dhëmb', 'gjuhë', 'qafë', 'krah',
      'dorë', 'gisht', 'këmbë', 'zemër', 'mushkëri', 'stomak', 'shpinë',
      'bark', 'gjoks', 'lëkurë', 'mjekër', 'ballë', 'bërryl', 'thua',
    ],
  },
  {
    title: 'Familja',
    pool: [
      'nënë', 'baba', 'djalë', 'vajzë', 'motër', 'vëlla', 'gjysh', 'stërgjysh',
      'dajë', 'xhaxha', 'hallë', 'teze', 'mbesë', 'kushëri', 'nuse', 'dhëndër',
      'vjehërr', 'kunat', 'kunatë', 'prind', 'fëmijë',
    ],
  },
  {
    title: 'Veshjet',
    pool: [
      'këmishë', 'fustan', 'xhaketë', 'pallto', 'kapelë', 'çorap', 'këpucë',
      'opingë', 'shami', 'brez', 'jelek', 'xhup', 'fund', 'dorashkë', 'rrobë',
      'gëzof', 'mantel', 'bluzë', 'triko', 'çizme',
    ],
  },
  {
    title: 'Vegla pune',
    pool: [
      'çekiç', 'sharrë', 'gozhdë', 'darë', 'lopatë', 'kazmë', 'sëpatë',
      'drapër', 'kosë', 'parmendë', 'shat', 'fshesë', 'kovë', 'pincë',
      'turjelë', 'rende', 'vidhë', 'gërshërë', 'hell', 'çengel',
    ],
  },
  {
    title: 'Vegla muzikore',
    pool: [
      'çifteli', 'lahutë', 'fyell', 'daulle', 'gajde', 'violinë', 'kitarë',
      'piano', 'zurna', 'harpë', 'sharki', 'tupan', 'buri', 'cyle', 'bilbil',
      'kavall', 'trumbetë', 'organo',
    ],
  },
  {
    title: 'Ngjyrat',
    pool: [
      'bardhë', 'zezë', 'verdhë', 'gjelbër', 'kaltër', 'vjollcë', 'murrmë',
      'hirtë', 'larmë', 'kafe', 'bruz', 'kuqe', 'ngjyrë', 'argjend', 'bojë',
      'blertë', 'ngjyrosur', 'përhimët',
    ],
  },
  {
    title: 'Shtëpia',
    pool: [
      'derë', 'dritare', 'çati', 'dysheme', 'tavan', 'oxhak', 'shkallë',
      'dhomë', 'kuzhinë', 'bodrum', 'ballkon', 'gardh', 'oborr', 'portë',
      'strehë', 'tjegull', 'prag', 'çelës',
    ],
  },
  {
    title: 'Në shkollë',
    pool: [
      'libër', 'fletore', 'laps', 'stilolaps', 'dërrasë', 'bankë', 'mësues',
      'nxënës', 'klasë', 'mësim', 'detyrë', 'provim', 'abetare', 'shkumës',
      'çantë', 'vizore', 'orar', 'dije',
    ],
  },
  {
    title: 'Zanatet',
    pool: [
      'berber', 'kasap', 'marangoz', 'farkëtar', 'murator', 'këpucar', 'bujk',
      'bari', 'peshkatar', 'poçar', 'argjendar', 'kovaç', 'mjeshtër', 'bakall',
      'mullis', 'hanxhi', 'samarxhi', 'terzi',
    ],
  },
  {
    title: 'Gatime',
    pool: [
      'byrek', 'pite', 'tavë', 'tarator', 'japrak', 'qofte', 'pilaf', 'çorbë',
      'supë', 'petull', 'bakllava', 'trahana', 'djathë', 'gjizë', 'paçe',
      'turshi', 'lakror', 'kulaç', 'revani', 'hallvë',
    ],
  },
  {
    title: 'Insektet',
    pool: [
      'mizë', 'mushkonjë', 'bletë', 'grerëz', 'milingonë', 'merimangë',
      'flutur', 'karkalec', 'buburrec', 'plesht', 'morr', 'rriqër', 'kandërr',
      'çimkë', 'gjinkallë', 'vemje', 'krimb', 'bulkth',
    ],
  },
  {
    title: 'Peshqit',
    pool: [
      'krap', 'troftë', 'ngjalë', 'levrek', 'koran', 'sardele', 'skumbri',
      'qefull', 'shojzë', 'peshkaqen', 'delfin', 'oktapod', 'gaforre',
      'midhje', 'gocë', 'barbun', 'rrufull',
    ],
  },
  {
    title: 'Ara dhe drithërat',
    pool: [
      'grurë', 'misër', 'thekër', 'tërshërë', 'oriz', 'pambuk', 'duhan',
      'kashtë', 'kalli', 'plor', 'lëmë', 'mulli', 'miell', 'korrje', 'livadh',
      'fushë', 'bereqet', 'drithë',
    ],
  },
  {
    title: 'Qielli',
    pool: [
      'hënë', 'diell', 'qiell', 'kometë', 'planet', 'galaktikë', 'agim',
      'muzg', 'perëndim', 'lindje', 'ylber', 'errësirë', 'dritë', 'hije',
      'eklips', 'yjësi', 'zbardhje', 'shkëlqim',
    ],
  },
  {
    title: 'Stinët dhe muajt',
    pool: [
      'pranverë', 'verë', 'vjeshtë', 'dimër', 'janar', 'shkurt', 'mars',
      'prill', 'qershor', 'korrik', 'gusht', 'shtator', 'tetor', 'nëntor',
      'dhjetor', 'stinë', 'muaj', 'javë',
    ],
  },
  {
    title: 'Bagëtia dhe stani',
    pool: [
      'dele', 'bari', 'stan', 'kullotë', 'qumësht', 'djathë', 'gjalpë',
      'bulmet', 'kacek', 'këmborë', 'kasolle', 'vathë', 'bagëti', 'tufë',
      'qengj', 'zile', 'dash', 'kope',
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Seeded randomness. A week is a function of its theme and of nothing
 * else, so a run over an unchanged pool rewrites an identical file.
 * ------------------------------------------------------------------ */

const seedOf = (text: string) => {
  let hash = 0x811c9dc5;
  for (const character of text) {
    hash ^= character.codePointAt(0) as number;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
};

const randomOf = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffled = <T>(items: T[], random: () => number) => {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index--) {
    const pick = Math.floor(random() * (index + 1));
    [next[index], next[pick]] = [next[pick] as T, next[index] as T];
  }
  return next;
};

/* ------------------------------------------------------------------ *
 * The packing. The grid is partitioned into one self-avoiding king-move
 * path per word; the letters are written in afterwards. Nothing here
 * looks at a letter, which is what keeps it cheap: this is a path-cover
 * problem on a dense graph, not a crossword.
 * ------------------------------------------------------------------ */

/** How many placements one attempt may try before it is abandoned. */
const STEP_BUDGET = 40_000;
/** How many paths of a given length are considered from one cell. */
const PATH_CAP = 48;
/** Fresh attempts, each with its own subset and its own shuffles. */
const ATTEMPTS = 400;

class Budget extends Error {}

/** Every self-avoiding path of `length` cells from `start` over free ground. */
const findPaths = (
  start: number,
  length: number,
  taken: Int8Array,
  random: () => number
) => {
  const found: number[][] = [];
  const path: number[] = [];
  const visited = new Set<number>();

  const walk = (cell: number) => {
    if (found.length >= PATH_CAP) {
      return;
    }

    path.push(cell);
    visited.add(cell);

    if (path.length === length) {
      found.push([...path]);
    } else {
      for (const next of shuffled(NEIGHBOURS[cell] as number[], random)) {
        if (taken[next] === -1 && !visited.has(next)) {
          walk(next);
        }
      }
    }

    path.pop();
    visited.delete(cell);
  };

  walk(start);

  /*
   * A trail that keeps turning is a trail nobody sees. The candidates are
   * ordered by how often they change direction — the shuffle above is what
   * breaks the ties — so a straighter path is tried first and the serpentine
   * ones are what the packer falls back on.
   */
  return found
    .map((candidate) => ({ candidate, turns: countTurns(candidate) }))
    .sort((a, b) => a.turns - b.turns)
    .map((entry) => entry.candidate);
};

const countTurns = (path: number[]) => {
  let turns = 0;
  for (let index = 2; index < path.length; index++) {
    const previous = path[index - 1] as number;
    const before = path[index - 2] as number;
    const cell = path[index] as number;
    const first = [(previous % COLS) - (before % COLS), Math.floor(previous / COLS) - Math.floor(before / COLS)];
    const second = [(cell % COLS) - (previous % COLS), Math.floor(cell / COLS) - Math.floor(previous / COLS)];
    if (first[0] !== second[0] || first[1] !== second[1]) {
      turns++;
    }
  }
  return turns;
};

/** The sizes of the connected islands of free ground that are left. */
const freeComponents = (taken: Int8Array) => {
  const seen = new Uint8Array(CELLS);
  const sizes: number[] = [];

  for (let cell = 0; cell < CELLS; cell++) {
    if (taken[cell] !== -1 || seen[cell]) {
      continue;
    }

    let size = 0;
    const stack = [cell];
    seen[cell] = 1;

    while (stack.length !== 0) {
      const current = stack.pop() as number;
      size++;
      for (const next of NEIGHBOURS[current] as number[]) {
        if (taken[next] === -1 && !seen[next]) {
          seen[next] = 1;
          stack.push(next);
        }
      }
    }

    sizes.push(size);
  }

  return sizes;
};

/*
 * Can the words that are left fill the islands that are left, exactly? An
 * island nothing adds up to is a dead end several placements before the board
 * notices, and this is what sees it then rather than later.
 */
const canFill = (sizes: number[], lengths: number[]): boolean => {
  if (sizes.length === 0) {
    return lengths.length === 0;
  }

  const [size, ...rest] = sizes as [number, ...number[]];
  const used = new Set<string>();

  const pick = (from: number, left: number, chosen: number[]): boolean => {
    if (left === 0) {
      const remaining = [...lengths];
      for (const index of chosen) {
        remaining[index] = -1;
      }
      return canFill(rest, remaining.filter((length) => length !== -1));
    }

    for (let index = from; index < lengths.length; index++) {
      const length = lengths[index] as number;
      if (length > left) {
        continue;
      }
      // The lengths repeat, and two words of five cells are one choice here.
      const key = `${from}:${left}:${length}`;
      if (used.has(key)) {
        continue;
      }
      used.add(key);
      chosen.push(index);
      if (pick(index + 1, left - length, chosen)) {
        return true;
      }
      chosen.pop();
    }

    return false;
  };

  return pick(0, size, []);
};

/** The free cell with the least room around it — the board's tightest corner. */
const tightestCell = (taken: Int8Array, random: () => number) => {
  let best = -1;
  let fewest = Infinity;
  let ties = 0;

  for (let cell = 0; cell < CELLS; cell++) {
    if (taken[cell] !== -1) {
      continue;
    }
    let free = 0;
    for (const next of NEIGHBOURS[cell] as number[]) {
      if (taken[next] === -1) {
        free++;
      }
    }
    if (free < fewest) {
      fewest = free;
      best = cell;
      ties = 1;
    } else if (free === fewest) {
      // Reservoir sampling, so a flat board does not always start top-left.
      ties++;
      if (random() < 1 / ties) {
        best = cell;
      }
    }
  }

  return best;
};

/**
 * Partitions the grid into one path per length, or returns `null` when this
 * attempt's shuffles do not get there inside the budget.
 */
const packGrid = (lengths: number[], random: () => number): number[][] | null => {
  const taken = new Int8Array(CELLS).fill(-1);
  const paths: number[][] = new Array(lengths.length);
  let steps = 0;

  const place = (remaining: number[]): boolean => {
    if (remaining.length === 0) {
      return true;
    }
    if (++steps > STEP_BUDGET) {
      throw new Budget();
    }

    const start = tightestCell(taken, random);
    /*
     * The tightest cell is made an endpoint rather than merely a member of
     * some path. On a king graph that costs almost nothing — a cell with few
     * free neighbours is an end in nearly every cover — and it is what turns
     * the search from "choose a path" into "choose a path from here".
     */
    const seen = new Set<number>();

    for (const index of shuffled(remaining, random)) {
      const length = lengths[index] as number;
      if (seen.has(length)) {
        continue;
      }
      seen.add(length);

      for (const path of findPaths(start, length, taken, random)) {
        for (const cell of path) {
          taken[cell] = index;
        }

        const rest = remaining.filter((other) => other !== index);
        if (
          canFill(
            freeComponents(taken),
            rest.map((other) => lengths[other] as number)
          ) &&
          place(rest)
        ) {
          paths[index] = path;
          return true;
        }

        for (const cell of path) {
          taken[cell] = -1;
        }
      }
    }

    return false;
  };

  try {
    return place(lengths.map((_, index) => index)) ? paths : null;
  } catch (error) {
    if (error instanceof Budget) {
      return null;
    }
    throw error;
  }
};

/* ------------------------------------------------------------------ *
 * Choosing the week's words out of the theme's pool.
 * ------------------------------------------------------------------ */

interface Candidate {
  word: string;
  slug: string;
  letters: string[];
}

/*
 * Every subset of the pool that covers the board exactly, ordered so that the
 * ones with the most variety in word length come first: a week of eight
 * six-letter words reads as a list, a week that runs from four cells to nine
 * reads as a theme.
 */
const coveringSubsets = (pool: Candidate[]) => {
  const subsets: number[][] = [];

  const walk = (from: number, chosen: number[], total: number) => {
    if (total === CELLS) {
      if (chosen.length >= MIN_WORDS && chosen.length <= MAX_WORDS) {
        subsets.push([...chosen]);
      }
      return;
    }
    if (total > CELLS || chosen.length >= MAX_WORDS || from >= pool.length) {
      return;
    }

    for (let index = from; index < pool.length; index++) {
      chosen.push(index);
      walk(index + 1, chosen, total + (pool[index] as Candidate).letters.length);
      chosen.pop();
    }
  };

  walk(0, [], 0);

  const spread = (subset: number[]) =>
    new Set(subset.map((index) => (pool[index] as Candidate).letters.length)).size;

  return subsets.sort((a, b) => spread(b) - spread(a));
};

/* ------------------------------------------------------------------ *
 * The bonus words: everything else the finished grid spells.
 * ------------------------------------------------------------------ */

interface TrieNode {
  children: Map<string, TrieNode>;
  word: boolean;
}

const newNode = (): TrieNode => ({ children: new Map(), word: false });

const buildTrie = (words: Iterable<string>) => {
  const root = newNode();

  for (const word of words) {
    const letters = splitLetters(word);
    if (!letters || letters.length < MIN_BONUS || letters.length > MAX_BONUS) {
      continue;
    }

    let node = root;
    for (const letter of letters) {
      let next = node.children.get(letter);
      if (!next) {
        next = newNode();
        node.children.set(letter, next);
      }
      node = next;
    }
    node.word = true;
  }

  return root;
};

/*
 * Every word of the dictionary the grid can be made to spell, by any path, that
 * is not one of the week's own. A reader who traces one is paid for it, so the
 * list is the game's economy and not a curiosity — and it is read out of the
 * same dictionary the rest of the site is, which is the only way it could be
 * fair.
 */
const findBonusWords = (letters: string[], trie: TrieNode, theme: Set<string>) => {
  const found = new Set<string>();
  const visited = new Uint8Array(CELLS);

  const walk = (cell: number, node: TrieNode, built: string) => {
    const next = node.children.get(letters[cell] as string);
    if (!next) {
      return;
    }

    const word = built + letters[cell];
    visited[cell] = 1;

    if (next.word && !theme.has(word)) {
      found.add(word);
    }

    if (next.children.size !== 0) {
      for (const neighbour of NEIGHBOURS[cell] as number[]) {
        if (!visited[neighbour]) {
          walk(neighbour, next, word);
        }
      }
    }

    visited[cell] = 0;
  };

  for (let cell = 0; cell < CELLS; cell++) {
    walk(cell, trie, '');
  }

  return [...found].sort();
};

/* ------------------------------------------------------------------ *
 * The dictionary.
 * ------------------------------------------------------------------ */

/** Every headword the dictionary holds as a single word of the alphabet. */
const getHeadwords = async () => {
  const scrapedEntries = await getScrapedDictionary();
  const headwords = new Set<string>();

  for (const entry of scrapedEntries) {
    if (entry.skip) {
      continue;
    }

    // The scraped term carries its grammatical labels — `ACAR m.` — and every
    // part that ends in a full stop is one of those, not part of the word.
    const parts = entry.term
      .split(/\s+/)
      .map((part) => part.trim())
      .filter((part) => part !== '' && !part.endsWith('.'));

    if (parts.length === 1) {
      headwords.add((parts[0] as string).toLowerCase());
    }
  }

  return headwords;
};

/* ------------------------------------------------------------------ */

const buildWeek = (theme: Theme, pool: Candidate[], trie: TrieNode): Week => {
  const random = randomOf(seedOf(theme.title));
  const subsets = coveringSubsets(pool);

  if (subsets.length === 0) {
    throw new Error(
      `${theme.title}: no ${MIN_WORDS}–${MAX_WORDS} words of this pool add up to ${CELLS} cells`
    );
  }

  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    // The first subsets are the most varied; later attempts reach further down
    // the list rather than hammering the same one.
    const subset = subsets[
      Math.min(subsets.length - 1, Math.floor((attempt / ATTEMPTS) * subsets.length))
    ] as number[];

    const chosen = subset.map((index) => pool[index] as Candidate);
    const paths = packGrid(
      chosen.map((candidate) => candidate.letters.length),
      random
    );

    if (!paths) {
      continue;
    }

    const letters = new Array<string>(CELLS).fill('');
    paths.forEach((path, index) => {
      path.forEach((cell, step) => {
        letters[cell] = (chosen[index] as Candidate).letters[step] as string;
      });
    });

    const words: WeekWord[] = chosen
      .map((candidate, index) => ({
        word: candidate.word,
        slug: candidate.slug,
        path: paths[index] as number[],
      }))
      /*
       * Listed longest first, which is the order a hint hands them out in: the
       * word with the most cells is the one worth being given.
       */
      .sort((a, b) => b.path.length - a.path.length || a.word.localeCompare(b.word));

    const rows = Array.from({ length: ROWS }, (_, row) =>
      letters.slice(row * COLS, row * COLS + COLS).join('')
    );

    return {
      theme: theme.title,
      rows,
      words,
      bonus: findBonusWords(
        letters,
        trie,
        new Set(words.map((entry) => entry.word))
      ),
    };
  }

  throw new Error(
    `${theme.title}: could not pack any of its ${subsets.length} covering subsets into ${COLS}×${ROWS}`
  );
};

const main = async () => {
  const headwords = await getHeadwords();
  const trie = buildTrie(headwords);

  const rejected: string[] = [];
  const pools: Candidate[][] = [];

  for (const theme of THEMES) {
    const seen = new Set<string>();
    const pool: Candidate[] = [];

    for (const entry of theme.pool) {
      const word = entry.toLowerCase();
      const letters = splitLetters(word);

      if (seen.has(word)) {
        rejected.push(`${theme.title} — ${word} — përsëritet`);
        continue;
      }
      seen.add(word);

      if (!letters || letters.length < MIN_WORD || letters.length > MAX_WORD) {
        rejected.push(
          `${theme.title} — ${word} — ${MIN_WORD}-${MAX_WORD} shkronja`
        );
        continue;
      }
      if (!headwords.has(word)) {
        rejected.push(`${theme.title} — ${word} — nuk është në fjalor`);
        continue;
      }

      pool.push({ word, slug: getSlug(word), letters });
    }

    pools.push(pool);
  }

  if (rejected.length !== 0) {
    console.error(`Rejected ${rejected.length}:\n  ${rejected.join('\n  ')}`);
    process.exitCode = 1;
    return;
  }

  /*
   * Every theme is tried before anything is said about any of them: a pool
   * that cannot cover the board is a pool to be extended, and extending them
   * one run at a time is a morning gone.
   */
  const weeks: Week[] = [];
  const failed: string[] = [];

  THEMES.forEach((theme, index) => {
    try {
      weeks.push(buildWeek(theme, pools[index] as Candidate[], trie));
    } catch (error) {
      failed.push((error as Error).message);
    }
  });

  if (failed.length !== 0) {
    console.error(`Failed ${failed.length}:\n  ${failed.join('\n  ')}`);
    process.exitCode = 1;
    return;
  }

  await writeJson(WEEKS_FILENAME, weeks, { createDir: true });

  const bonus = weeks.reduce((total, week) => total + week.bonus.length, 0);
  console.debug(
    `Generated ${weeks.length} Shtigje weeks — ${weeks.reduce(
      (total, week) => total + week.words.length,
      0
    )} theme words, ${bonus} bonus words`
  );
};

main();
