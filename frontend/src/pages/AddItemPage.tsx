import type { Category } from "../types/library";
import LibraryItemForm from "../components/LibraryItemForm";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

type AddItemPageProps = {
  categories: Category[];
  onLibraryItemCreated: () => Promise<void>;
};

function AddItemPage({ categories, onLibraryItemCreated }: AddItemPageProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      className="add-item-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <section className="page-intro">
        <p className="eyebrow">{t("addItem.eyebrow")}</p>
        <h2>{t("addItem.title")}</h2>
        <p>{t("addItem.description")}</p>
      </section>

      <section className="page-panel add-item-panel">
        <div className="page-panel-heading">
          <div>
            <h3>{t("addItem.panelTitle")}</h3>
            <p>{t("addItem.panelDescription")}</p>
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
