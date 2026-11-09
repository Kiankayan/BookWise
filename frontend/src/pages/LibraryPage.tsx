import type { Dispatch, SetStateAction } from "react";
import type { Category, LibraryItem, LibrarySort } from "../types/library";
import LibraryItemList from "../components/LibraryItemList";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

type LibraryPageProps = {
  libraryItems: LibraryItem[];
  categories: Category[];
  sort: LibrarySort;
  setSort: Dispatch<SetStateAction<LibrarySort>>;
  onLibraryItemUpdated: () => Promise<void>;
};

function LibraryPage({
  libraryItems,
  categories,
  sort,
  setSort,
  onLibraryItemUpdated,
}: LibraryPageProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      className="library-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <section className="page-intro">
        <p className="eyebrow">{t("library.eyebrow")}</p>
        <h2>{t("library.title")}</h2>
        <p>{t("library.description")}</p>
      </section>

      <section className="page-panel">
        <div className="page-panel-heading">
          <div>
            <h3>{t("library.allItems")}</h3>
            <p>{t("library.itemCount", { count: libraryItems.length })}</p>
          </div>
        </div>

        <LibraryItemList
          libraryItems={libraryItems}
          categories={categories}
          sort={sort}
          setSort={setSort}
          onLibraryItemUpdated={onLibraryItemUpdated}
        />
      </section>
    </motion.div>
  );
}

export default LibraryPage;
