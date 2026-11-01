import type { LibraryItem } from "../types/library";

export function getLibraryItemImage(
  item: Pick<LibraryItem, "imageUrl" | "type">,
): string {
  if (item.imageUrl) {
    return item.imageUrl;
  }

  switch (item.type) {
    case "BOOK":
      return "/images/bok.png";
    case "DVD":
      return "/images/dvd.png";
    case "AUDIOBOOK":
      return "/images/ljudbok.png";
    case "REFERENCE_BOOK":
      return "/images/referensbok.png";
  }
}
