import type { LibraryItem } from "../types/library";

export function getTitleAbbreviation(title: string) {
  return title
    .split(" ")
    .filter((word) => word.length > 0)
    .map((word) => word[0].toUpperCase())
    .join("");
}

export function isOverdue(dueDate: string | null) {
  if (!dueDate) {
    return false;
  }

  const date = new Date(dueDate);
  const today = new Date();

  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return date < today;
}

export function getTypeLabel(
  type: LibraryItem["type"],
  translate: (key: string) => string,
) {
  switch (type) {
    case "BOOK":
      return translate("library.book");
    case "DVD":
      return translate("library.dvd");
    case "AUDIOBOOK":
      return translate("library.audiobook");
    case "REFERENCE_BOOK":
      return translate("library.referenceBook");
  }
}
