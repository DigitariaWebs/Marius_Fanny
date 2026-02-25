export type ParsedChoice = {
  label: string;
  price: number | null;
  raw: string;
};

export const parseChoiceInput = (choice: string): ParsedChoice => {
  const trimmed = choice?.trim() || "";

  if (!trimmed) {
    return { label: "", price: null, raw: "" };
  }

  const dashMatch = trimmed.match(/^(.*?)\s*[-–—]\s*([\d.,]+)\s*\$?$/);
  if (dashMatch) {
    return {
      label: dashMatch[1].trim(),
      price: Number.isFinite(parseFloat(dashMatch[2])) ? parseFloat(dashMatch[2].replace(",", ".")) : null,
      raw: trimmed,
    };
  }

  const parenMatch = trimmed.match(/^(.*?)\s*\(([\d.,]+)\s*\$?\)$/);
  if (parenMatch) {
    return {
      label: parenMatch[1].trim(),
      price: Number.isFinite(parseFloat(parenMatch[2])) ? parseFloat(parenMatch[2].replace(",", ".")) : null,
      raw: trimmed,
    };
  }

  return {
    label: trimmed,
    price: null,
    raw: trimmed,
  };
};

export const formatChoiceForSaving = (label: string, price?: string | number): string => {
  const normalizedLabel = label?.trim();
  if (!normalizedLabel) return "";

  if (price === undefined || price === null || price === "") {
    return normalizedLabel;
  }

  const numericPrice = typeof price === "number" ? price : parseFloat(price.toString().replace(",", "."));
  if (!Number.isFinite(numericPrice)) {
    return normalizedLabel;
  }

  return `${normalizedLabel} - ${numericPrice.toFixed(2)} $`;
};

export const formatChoiceDisplay = (choice: string): string => {
  const parsed = parseChoiceInput(choice);
  if (!parsed.label) return "";
  if (parsed.price === null) return parsed.label;
  return `${parsed.label} (${parsed.price.toFixed(2)} $)`;
};

export const getChoicePrice = (choice: string): number | null => {
  const parsed = parseChoiceInput(choice);
  return parsed.price;
};
