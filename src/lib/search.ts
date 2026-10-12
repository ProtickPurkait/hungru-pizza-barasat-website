// The site search in the header. It finds dishes, menu sections, pages, blog posts, delivery
// areas, jobs, questions and policies for whatever a visitor types, and forgives the way people
// really type: spelling slips ("panner", "chiken tika"), plurals ("momos"), everyday words
// ("timings" finds the opening hours, "job" finds Careers) and prices ("under 200", "₹150").
// Pure functions (the entries are passed in, built by search-index.ts), so they are easy to test.
import type { Diet, IconKey } from "@/data/types";

export type SearchKind = "answer" | "section" | "page" | "dish" | "area" | "post" | "job" | "faq" | "policy";
export type SearchIcon = IconKey | "clock" | "phone" | "pin" | "bike" | "page" | "home" | "cart" | "post" | "job" | "faq" | "policy";

/** How much a match in each kind of text counts: a name most, long text least. */
export const WEIGHT = { title: 10, key: 6, about: 3, body: 1 } as const;

/** One thing the search can find. */
export interface SearchEntry {
  id: string;
  kind: SearchKind;
  title: string;
  /** The line under the title. */
  snippet: string;
  /** Where it opens: a page, with #part for one part of it. */
  path: string;
  /** Small text beside the title ("44 dishes", "Guide", "Full time"). */
  meta?: string;
  icon?: SearchIcon;
  /** Dishes: the food mark and every price. */
  diet?: Diet;
  prices?: number[];
  /** More text to match besides the title, with how much each counts. */
  fields: { text: string; weight: number }[];
}

interface Prepared {
  entry: SearchEntry;
  /** The title's words first, then the other fields, each as its own words. */
  fields: { words: string[]; weight: number; title: boolean }[];
  titleWords: string;
}

export interface SearchIndex {
  items: Prepared[];
  /** Every word in the index, once. */
  vocab: string[];
}

export interface SearchHit {
  entry: SearchEntry;
  score: number;
  /** Words of the title that matched, as matched (lower case, without plural "s"), to pick out in the result. */
  marks: string[];
}

export interface SearchResults {
  hits: SearchHit[];
  /** Not every word was found: these are the closest matches. */
  partial: boolean;
  /** "under 200" was typed: only dishes up to this price, cheapest first. */
  maxPrice: number | null;
  /** "cheap" was typed: dishes, cheapest first. */
  cheap: boolean;
  /** The words searched for (lower case, without plural "s"). */
  words: string[];
}

/* ------------------------------------------------------------------ words */

/** Lower case, no accents (jalapeño → jalapeno), "non-veg" as one word, everything else that is not a letter or digit a space. */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/₹/g, " rs ")
    .replace(/&/g, " and ")
    .replace(/['’`]/g, "")
    .replace(/\bnon[\s-]*veg(?:etarian)?\b/g, "nonveg")
    .replace(/\bcheeseburst\b/g, "cheese burst")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Plural to singular, roughly: pizzas → pizza, sandwiches → sandwich. Done to the index and the search alike, so both agree. */
export function stem(word: string): string {
  if (word.length > 4 && /(ch|sh|x)es$/.test(word)) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s") && !/(ss|us|is)$/.test(word)) return word.slice(0, -1);
  return word;
}

export const wordsOf = (text: string): string[] => normalize(text).split(" ").filter(Boolean).map(stem);

/** Words that carry no meaning on their own ("do you have …"). Dropped unless nothing else is left. */
const STOP_WORDS =
  "a an the of for in on at to is are am be do doe did you your we our us i me my what whats which who when how can could would should will with and or any some show find want need please get give there it its from about much many this that these those ha have near now";
const STOP = new Set(STOP_WORDS.split(" "));
/** Words dropped when there are others: "order pizza" means pizza, "price of momos" means momos. */
const SOFT = new Set("price cost rate rs rupee inr order buy eat food item available pure only".split(" "));

/** Everyday words and what they mean on this site. Matches through these count a little less than the word itself. */
const RELATED: Record<string, string[]> = {
  timing: ["hour", "open"],
  time: ["hour"],
  hour: ["timing", "open"],
  open: ["hour"],
  opening: ["hour"],
  close: ["hour"],
  closing: ["hour"],
  closed: ["hour"],
  today: ["hour"],
  call: ["phone"],
  number: ["phone"],
  mobile: ["phone"],
  contact: ["phone"],
  phone: ["call"],
  whatsapp: ["phone"],
  where: ["address", "location"],
  location: ["address"],
  located: ["address"],
  map: ["address"],
  direction: ["address"],
  reach: ["address"],
  address: ["location"],
  deliver: ["delivery"],
  delivery: ["deliver"],
  radius: ["delivery"],
  job: ["career", "hiring", "vacancy"],
  career: ["job"],
  hiring: ["job"],
  hire: ["job"],
  vacancy: ["job"],
  vacancie: ["job"],
  work: ["job"],
  apply: ["job"],
  join: ["job"],
  drink: ["beverage", "shake", "mojito", "lassi", "coffee", "tea", "soda", "coke"],
  beverage: ["drink"],
  juice: ["drink"],
  shake: ["milkshake"],
  milkshake: ["shake"],
  dessert: ["sweet", "lava"],
  sweet: ["dessert", "lava"],
  cake: ["lava"],
  kid: ["children", "child", "baby"],
  children: ["kid"],
  child: ["kid"],
  baby: ["kid"],
  vegetarian: ["veg"],
  veggie: ["veg"],
  meat: ["chicken", "keema", "nonveg"],
  spicy: ["fiery", "inferno", "hot", "devil", "volcano", "peri", "jalapeno", "schezwan", "zing", "heat"],
  hot: ["spicy", "fiery"],
  momo: ["dumpling"],
  dumpling: ["momo"],
  dimsum: ["momo"],
  chip: ["frie"],
  chai: ["tea"],
  panir: ["paneer"],
  pannir: ["paneer"],
  chilly: ["chilli"],
  chocolate: ["choco"],
  choclate: ["choco"],
  small: ["8", "regular"],
  large: ["10"],
  big: ["10"],
  cart: ["basket", "checkout"],
  basket: ["cart"],
  checkout: ["cart"],
  bag: ["cart"],
  photo: ["gallery", "picture"],
  picture: ["photo", "gallery"],
  pic: ["photo", "gallery"],
  image: ["photo", "gallery"],
  gallery: ["photo"],
  refund: ["cancellation", "cancel"],
  cancel: ["cancellation", "refund"],
  custom: ["build", "own"],
  own: ["build"],
  create: ["build"],
  make: ["build"],
  best: ["favourite", "special"],
  popular: ["favourite"],
  famous: ["favourite", "special"],
  recommended: ["special", "favourite"],
};

/* ------------------------------------------------------------------ the question */

export interface ParsedQuery {
  terms: { word: string; related: string[] }[];
  maxPrice: number | null;
  cheap: boolean;
}

const PRICE_WORDS = "under|below|less than|cheaper than|up ?to|within|max(?:imum)?|at most|budget";
const NOT_PRICE = "inch|in|pc|pcs|piece|pieces|ml|km|kg|gm|g|ltr|l|min|mins|minute|minutes|people|person";

/** Reads a search: its words, a price limit ("under 200", "₹150", "pizza 250") and "cheap". */
export function parseQuery(raw: string): ParsedQuery {
  let text = ` ${normalize(raw.slice(0, 120))} `;
  let maxPrice: number | null = null;
  const take = (re: RegExp) => {
    const m = text.match(re);
    if (!m || maxPrice !== null) return;
    maxPrice = Number(m[1]);
    text = text.replace(m[0], " ");
  };
  take(new RegExp(`\\b(?:${PRICE_WORDS}) (?:rs )?(\\d{2,5})(?: (?:rs|rupees?|inr|only))?\\b`));
  take(/\brs (\d{2,5})\b/);
  take(/\b(\d{2,5}) (?:rs|rupees?|inr)\b/);
  // A number on its own between 20 and 2000 is a price, unless it is a size ("10 inch", "6 pcs").
  const bare = text.match(new RegExp(`(?:^| )(\\d{2,4})(?! (?:${NOT_PRICE})\\b)(?= |$)`));
  if (maxPrice === null && bare && Number(bare[1]) >= 20 && Number(bare[1]) <= 2000) {
    maxPrice = Number(bare[1]);
    text = text.replace(bare[0], " ");
  }

  let cheap = false;
  text = text.replace(/\b(?:cheap|cheapest|cheaper|budget|affordable|low cost|low price|lowest price|economical)\b/g, () => {
    cheap = true;
    return " ";
  });

  let words = [...new Set(wordsOf(text))];
  const meaningful = words.filter((w) => !STOP.has(w));
  if (meaningful.length) words = meaningful;
  const solid = words.filter((w) => !SOFT.has(w));
  if (solid.length || maxPrice !== null || cheap) words = solid;
  return { terms: words.map((word) => ({ word, related: RELATED[word] ?? [] })), maxPrice, cheap };
}

/* ------------------------------------------------------------------ matching */

/** Edits (a letter added, dropped, changed or two swapped) between two words, stopping early above `max`. */
export function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev2: number[] = [];
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2]! + 1);
      cur.push(v);
      rowMin = Math.min(rowMin, v);
    }
    if (rowMin > max) return max + 1;
    prev2 = prev;
    prev = cur;
  }
  return prev[b.length]!;
}

/**
 * How well a word in the index answers a searched word: 1 the same, less for its start ("pan" → paneer),
 * its end ("shroom" → mushroom) or a slip ("panner").
 */
export function closeness(q: string, word: string): number {
  if (word === q) return 1;
  if (q.length >= 2 && word.startsWith(q)) return 0.7 + 0.25 * (q.length / word.length);
  if (q.length >= 4 && word.endsWith(q)) return 0.5;
  // Slips: only for longer words, and never in the first letter, or short words would match everything.
  // A four-letter word only matches with a letter left out ("piza" → pizza), so "coke" never finds "come".
  if (q.length < 4 || word[0] !== q[0] || (q.length === 4 && word.length <= 4)) return 0;
  const max = q.length >= 7 ? 2 : 1;
  const d = editDistance(q, word, max);
  if (d <= max) return 0.62 - 0.06 * d;
  // Still typing: "chike" against the start of "chicken".
  if (q.length >= 5 && [q.length, q.length + 1].some((n) => word.length > n && editDistance(q, word.slice(0, n), 1) <= 1)) return 0.5;
  return 0;
}

/** Turns the entries into words once, so each search only has to look them up. */
export function prepareIndex(entries: SearchEntry[]): SearchIndex {
  const vocab = new Set<string>();
  const items = entries.map((entry) => {
    const fields = [{ text: entry.title, weight: WEIGHT.title }, ...entry.fields].map((f, i) => {
      const words = [...new Set(wordsOf(f.text))];
      words.forEach((w) => vocab.add(w));
      return { words, weight: f.weight, title: i === 0 };
    });
    return { entry, fields, titleWords: fields[0]!.words.join(" ") };
  });
  return { items, vocab: [...vocab] };
}

const KIND_WEIGHT: Record<SearchKind, number> = { answer: 1.2, section: 1.15, page: 1.1, dish: 1, area: 1, job: 0.95, post: 0.9, faq: 0.8, policy: 0.7 };
/** Matches through a related word count this much of a match of the word itself. */
const RELATED_SHARE = 0.85;
/** Long text (descriptions, posts, policies) only counts a word that is there, or starts with what was typed, not a near miss. */
const LOOSE_FLOOR = 0.7;
/** Results scoring under this share of the best one are left out: a word deep in a policy is no answer next to a dish of that name. */
const CUTOFF = 0.18;

const minPrice = (e: SearchEntry) => (e.prices?.length ? Math.min(...e.prices) : Number.POSITIVE_INFINITY);

/** Finds what matches a search, best first. */
export function searchSite(index: SearchIndex, raw: string): SearchResults {
  const q = parseQuery(raw);
  const words = q.terms.map((t) => t.word);
  const priced = q.maxPrice !== null || q.cheap;
  const none: SearchResults = { hits: [], partial: false, maxPrice: q.maxPrice, cheap: q.cheap, words };
  if (!priced && (words.length === 0 || words.every((w) => w.length < 2))) return none;

  // For each searched word: every word in the index that answers it, and how well.
  const maps = q.terms.map((t) => {
    const map = new Map<string, number>();
    for (const v of index.vocab) {
      let best = closeness(t.word, v);
      for (const r of t.related) best = Math.max(best, closeness(r, v) * RELATED_SHARE);
      if (best > 0) map.set(v, best);
    }
    return map;
  });
  const phrase = words.join(" ");

  const scored = index.items.map((item, order) => {
    let score = 0;
    let matched = 0;
    const marks = new Set<string>();
    maps.forEach((map) => {
      let best = 0;
      for (const f of item.fields) {
        for (const w of f.words) {
          const c = map.get(w);
          if (!c || (f.weight < WEIGHT.about && c < LOOSE_FLOOR)) continue;
          best = Math.max(best, c * f.weight);
          if (f.title && c >= 0.5) marks.add(w);
        }
      }
      if (best > 0) {
        matched++;
        score += best;
      }
    });
    // The words together, in order: the very name, the start of it, or in it.
    if (item.titleWords === phrase) score += 12;
    else if (words.length > 1 && item.titleWords.startsWith(phrase)) score += 8;
    else if (words.length > 1 && item.titleWords.includes(phrase)) score += 5;
    return { item, order, score: score * KIND_WEIGHT[item.entry.kind], matched, marks };
  });

  const pick = (enough: number) =>
    scored.filter((s) => {
      if (priced) {
        if (s.item.entry.kind !== "dish" || (q.maxPrice !== null && minPrice(s.item.entry) > q.maxPrice)) return false;
        return words.length === 0 || s.matched >= enough;
      }
      return s.matched >= enough && s.score > 0;
    });

  let partial = false;
  let found = pick(words.length);
  if (found.length === 0 && words.length > 1) {
    partial = true;
    found = pick(Math.ceil(words.length / 2)).map((s) => ({ ...s, score: s.score * (s.matched / words.length) ** 2 }));
  }

  found.sort((a, b) =>
    priced ? minPrice(a.item.entry) - minPrice(b.item.entry) || b.score - a.score || a.order - b.order : b.score - a.score || a.order - b.order,
  );
  if (!priced && found.length) {
    const top = found[0]!.score;
    found = found.filter((s) => s.score >= top * CUTOFF);
  }
  return {
    hits: found.map((s) => ({ entry: s.item.entry, score: s.score, marks: [...s.marks] })),
    partial,
    maxPrice: q.maxPrice,
    cheap: q.cheap,
    words,
  };
}

/* ------------------------------------------------------------------ showing them */

export interface SearchGroup {
  kind: SearchKind;
  hits: SearchHit[];
  /** How many more of this kind were found than are shown. */
  more: number;
}

const SHOWN: Record<SearchKind, number> = { answer: 2, section: 4, page: 4, dish: 8, area: 4, post: 3, job: 3, faq: 3, policy: 3 };

/** The results by kind, the kind with the best result first, a few of each (`dishes` dishes). */
export function groupHits(hits: SearchHit[], dishes = SHOWN.dish): SearchGroup[] {
  const groups = new Map<SearchKind, SearchHit[]>();
  for (const h of hits) groups.set(h.entry.kind, [...(groups.get(h.entry.kind) ?? []), h]);
  return [...groups].map(([kind, all]) => {
    const n = kind === "dish" ? dishes : SHOWN[kind];
    return { kind, hits: all.slice(0, n), more: Math.max(0, all.length - n) };
  });
}

/** Splits a title into plain and matched words, to pick out what was found. */
export function markParts(title: string, marks: string[]): { text: string; mark: boolean }[] {
  if (!marks.length) return [{ text: title, mark: false }];
  const set = new Set(marks);
  // Words and what is between them (spaces, commas …), so a mark never takes in the comma after a word.
  return title
    .split(/([^\p{L}\p{N}'’]+)/u)
    .map((part) => ({ text: part, mark: wordsOf(part).some((w) => set.has(w)) }))
    .reduce<{ text: string; mark: boolean }[]>((out, p) => {
      const last = out[out.length - 1];
      if (last && last.mark === p.mark) last.text += p.text;
      else out.push({ ...p });
      return out;
    }, []);
}
