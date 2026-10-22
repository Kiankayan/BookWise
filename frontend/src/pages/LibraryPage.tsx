import type { Dispatch, SetStateAction } from "react";
import type { Category, LibraryItem, LibrarySort } from "../types/library";
import LibraryItemList from "../components/LibraryItemList";
import { motion } from "motion/react";

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
  return (
    <motion.div
      className="library-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <section className="page-intro">
        <p className="eyebrow">DIN SAMLING</p>
        <h2>Bibliotek</h2>
        <p>
          Visa, sortera och hantera böcker, DVD:er och annat biblioteksmaterial.
        </p>
      </section>

      <section className="page-panel">
        <div className="page-panel-heading">
          <div>
            <h3>Alla biblioteksposter</h3>
            <p>{libraryItems.length} poster i samlingen</p>
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
