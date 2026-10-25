import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import type { LibraryItem } from "../types/library";

type BookDetailsModalProps = {
  item: LibraryItem | null;
  onClose: () => void;
};

function BookDetailsModal({ item, onClose }: BookDetailsModalProps) {
  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="book-details-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.section
            className="book-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-details-title"
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="book-details-close"
              aria-label="Stäng bokdetaljer"
              onClick={onClose}
            >
              <X size={22} />
            </button>

            <div className="book-details-content">
              {item.imageUrl ? (
                <img
                  className="book-details-cover"
                  src={item.imageUrl}
                  alt={`Omslag till ${item.title}`}
                />
              ) : (
                <div className="book-details-cover-placeholder">
                  Inget omslag
                </div>
              )}

              <div className="book-details-info">
                <p className="eyebrow">BOKDETALJER</p>
                <h2 id="book-details-title">{item.title}</h2>
                <p className="book-details-author">
                  {item.author || "Okänd författare"}
                </p>

                <dl className="book-details-metadata">
                  <div>
                    <dt>Kategori</dt>
                    <dd>{item.category?.name ?? "Ingen kategori"}</dd>
                  </div>
                  <div>
                    <dt>Materialtyp</dt>
                    <dd>
                      {item.type === "BOOK"
                        ? "Bok"
                        : item.type === "DVD"
                          ? "DVD"
                          : item.type === "AUDIOBOOK"
                            ? "Ljudbok"
                            : "Referensbok"}
                    </dd>
                  </div>
                  {item.nbrPages !== null && (
                    <div>
                      <dt>Antal sidor</dt>
                      <dd>{item.nbrPages}</dd>
                    </div>
                  )}
                  {item.runTimeMinutes !== null && (
                    <div>
                      <dt>Speltid</dt>
                      <dd>{item.runTimeMinutes} minuter</dd>
                    </div>
                  )}
                  <div>
                    <dt>Kan lånas</dt>
                    <dd>{item.isBorrowable ? "Ja" : "Nej"}</dd>
                  </div>
                  <div>
                    <dt>Lånestatus</dt>
                    <dd>
                      {item.borrower
                        ? `Utlånad till ${item.borrower}`
                        : "Tillgänglig"}
                    </dd>
                  </div>
                  {item.borrowDate && (
                    <div>
                      <dt>Utlåningsdatum</dt>
                      <dd>
                        {new Date(item.borrowDate).toLocaleDateString("sv-SE")}
                      </dd>
                    </div>
                  )}
                  {item.dueDate && (
                    <div>
                      <dt>Återlämningsdatum</dt>
                      <dd>
                        {new Date(item.dueDate).toLocaleDateString("sv-SE")}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default BookDetailsModal;
