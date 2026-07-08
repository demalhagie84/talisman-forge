/**
 * Shared talisman template builders. Each builder is a deterministic,
 * presentation-agnostic generator so the same logic can back both the
 * server-rendered tool pages (pages/tools/*.tsx) and the Pro API layer
 * (pages/api/v1/talismans/*).
 */

export type TemplateId = "fire-square" | "daira" | "jaljalutia";

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  element: string;
  description: string;
  minTier: "FREE" | "PREMIUM" | "PRO";
}

export const TEMPLATES: Record<TemplateId, TemplateMeta> = {
  "fire-square": {
    id: "fire-square",
    name: "Fire Square",
    element: "Fire",
    description: "A 3x3 fire-aligned magic square for focus and momentum.",
    minTier: "FREE",
  },
  daira: {
    id: "daira",
    name: "Da'ira",
    element: "Air",
    description: "A circular arrangement (da'ira) of abjad-derived values used for protective enclosures.",
    minTier: "PRO",
  },
  jaljalutia: {
    id: "jaljalutia",
    name: "Jaljalutia Chart",
    element: "Spirit",
    description: "A sequential numerological chart inspired by the jaljalutia tradition of layered invocations.",
    minTier: "PRO",
  },
};

export const FREE_MONTHLY_LIMIT = 3;

const ABJAD_LETTERS = [
  "alif", "ba", "jim", "dal", "ha", "waw", "za", "ha", "ta", "ya",
  "kaf", "lam", "mim", "nun", "sin", "ayn", "fa", "sad", "qaf", "ra",
  "shin", "ta", "tha", "kha", "dhal", "dad", "zah", "ghayn",
];

function abjadValueFromText(text: string): number {
  const normalized = text.trim().toLowerCase() || "talisman";
  let total = 0;
  for (let i = 0; i < normalized.length; i += 1) {
    total += normalized.charCodeAt(i) * (i + 1);
  }
  // Fold down into a stable, human-scale range (1-999).
  return (total % 999) + 1;
}

export interface FireSquareResult {
  type: "grid";
  size: number;
  cells: number[][];
}

export function buildFireSquare(): FireSquareResult {
  return {
    type: "grid",
    size: 3,
    cells: [
      [2, 7, 6],
      [9, 5, 1],
      [4, 3, 8],
    ],
  };
}

export interface DairaResult {
  type: "circle";
  abjadValue: number;
  ringSize: number;
  segments: { position: number; label: string; value: number }[];
  centerValue: number;
}

export function buildDaira(intention: string): DairaResult {
  const abjadValue = abjadValueFromText(intention);
  const ringSize = 8;
  const segments = Array.from({ length: ringSize }, (_, index) => {
    const value = ((abjadValue + index * 7) % 99) + 1;
    return {
      position: index,
      label: ABJAD_LETTERS[(abjadValue + index) % ABJAD_LETTERS.length],
      value,
    };
  });

  return {
    type: "circle",
    abjadValue,
    ringSize,
    segments,
    centerValue: (abjadValue % 9) + 1,
  };
}

export interface JaljalutiaResult {
  type: "sequence";
  abjadValue: number;
  rows: { row: number; letter: string; value: number }[];
}

export function buildJaljalutia(intention: string): JaljalutiaResult {
  const abjadValue = abjadValueFromText(intention);
  const rowCount = 7;
  const rows = Array.from({ length: rowCount }, (_, index) => ({
    row: index + 1,
    letter: ABJAD_LETTERS[(abjadValue + index * 3) % ABJAD_LETTERS.length],
    value: ((abjadValue * (index + 1)) % 121) + 1,
  }));

  return { type: "sequence", abjadValue, rows };
}

export function buildTemplate(templateId: TemplateId, intention: string) {
  switch (templateId) {
    case "fire-square":
      return buildFireSquare();
    case "daira":
      return buildDaira(intention);
    case "jaljalutia":
      return buildJaljalutia(intention);
    default:
      throw new Error(`Unknown template: ${templateId}`);
  }
}
