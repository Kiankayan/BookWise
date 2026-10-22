import type { Category } from "../types/library";
import CategoryManager from "../components/CategoryManager";
import { motion } from "motion/react";

type CategoriesPageProps = {
  categories: Category[];
  onCategoriesChanged: () => Promise<void>;
};

function CategoriesPage({
  categories,
  onCategoriesChanged,
}: CategoriesPageProps) {
  return (
    <motion.div
      className="categories-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <section className="page-intro">
        <p className="eyebrow">ORGANISATION</p>
        <h2>Kategorier</h2>
        <p>
          Organisera bibliotekets material genom att skapa, redigera och ta bort
          kategorier.
        </p>
      </section>

      <section className="page-panel">
        <div className="page-panel-heading">
          <div>
            <h3>Kategorihantering</h3>
            <p>{categories.length} kategorier registrerade</p>
          </div>
        </div>

        <CategoryManager
          categories={categories}
          onCategoriesChanged={onCategoriesChanged}
        />
      </section>
    </motion.div>
  );
}

export default CategoriesPage;
