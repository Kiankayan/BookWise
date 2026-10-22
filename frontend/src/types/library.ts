export type LibraryItemType = "BOOK" | "DVD" | "AUDIOBOOK" | "REFERENCE_BOOK";

export interface Category {
  id: string;
  name: string;
}

export interface LibraryItem {
  id: string;
  title: string;
  author: string | null;
  nbrPages: number | null;
  runTimeMinutes: number | null;
  type: LibraryItemType;
  isBorrowable: boolean;
  borrower: string | null;
  borrowDate: string | null;
  dueDate: string | null;
  categoryId: string;
  category: Category;
  imageUrl: string | null;
}

export interface LibraryItemInput {
  title: string;
  categoryId: string;
  isBorrowable: boolean;
  type: LibraryItemType;
  author?: string;
  nbrPages?: number;
  runTimeMinutes?: number;
  imageUrl?: string;
}

export type LibrarySort = "title-asc" | "title-desc" | "category" | "type";
