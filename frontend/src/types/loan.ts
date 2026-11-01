import type { LibraryItem } from "./library";

export type Loan = {
  id: string;
  userId: string | null;
  itemId: string;
  borrowerName: string;
  borrowDate: string;
  dueDate: string;
  returnedAt: string | null;
  item: Omit<LibraryItem, "loans">;
};
