import type { Category } from "../types/library";
import CategoryManager from "../components/CategoryManager";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

type CategoriesPageProps = {
  categories: Category[];
  onCategoriesChanged: () => Promise<void>;
};

function CategoriesPage({
  categories,
  onCategoriesChanged,
}: CategoriesPageProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      className="categories-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <section className="page-intro">
        <p className="eyebrow">{t("categoriesPage.eyebrow")}</p>
        <h2>{t("categoriesPage.title")}</h2>
        <p>{t("categoriesPage.description")}</p>
      </section>

      <section className="page-panel">
        <div className="page-panel-heading">
          <div>
            <h3>{t("categoriesPage.panelTitle")}</h3>
            <p>
              {t("categoriesPage.categoryCount", {
                count: categories.length,
              })}
            </p>
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
