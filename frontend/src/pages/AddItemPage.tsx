import type { Category } from "../types/library";
import LibraryItemForm from "../components/LibraryItemForm";
import { motion } from "motion/react";

type AddItemPageProps = {
  categories: Category[];
  onLibraryItemCreated: () => Promise<void>;
};

function AddItemPage({ categories, onLibraryItemCreated }: AddItemPageProps) {
  return (
    <motion.div
      className="add-item-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <section className="page-intro">
        <p className="eyebrow">UTÖKA SAMLINGEN</p>
        <h2>Lägg till material</h2>
        <p>Registrera en ny bok, DVD eller annan bibliotekspost i samlingen.</p>
      </section>

      <section className="page-panel add-item-panel">
        <div className="page-panel-heading">
          <div>
            <h3>Ny bibliotekspost</h3>
            <p>Fyll i uppgifterna för materialet nedan.</p>
          </div>
        </div>

        <LibraryItemForm
          categories={categories}
          onLibraryItemCreated={onLibraryItemCreated}
        />
      </section>
    </motion.div>
  );
}

export default AddItemPage;
