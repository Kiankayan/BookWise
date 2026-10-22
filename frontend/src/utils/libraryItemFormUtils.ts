import type { LibraryItemInput, LibraryItemType } from "../types/library";

interface LibraryItemFormValues {
  title: string;
  categoryId: string;
  isBorrowable: boolean;
  type: LibraryItemType;
  author: string;
  nbrPages: string;
  runTimeMinutes: string;
}

export function buildLibraryItemFormData(
  values: LibraryItemFormValues,
): LibraryItemInput {
  const {
    title,
    categoryId,
    isBorrowable,
    type,
    author,
    nbrPages,
    runTimeMinutes,
  } = values;

  return {
    title: title.trim(),
    categoryId,
    isBorrowable,
    type,
    ...(type === "BOOK" || type === "REFERENCE_BOOK"
      ? {
          author: author.trim(),
          nbrPages: Number(nbrPages),
        }
      : {}),
    ...(type === "DVD" || type === "AUDIOBOOK"
      ? {
          runTimeMinutes: Number(runTimeMinutes),
        }
      : {}),
  };
}
