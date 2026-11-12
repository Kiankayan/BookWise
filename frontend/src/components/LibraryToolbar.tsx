import { useTranslation } from "react-i18next";
import type { Category, LibrarySort } from "../types/library";

interface LibraryToolbarProps {
  categories: Category[];
  sort: LibrarySort;
  setSort: (sort: LibrarySort) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedAvailability: string;
  setSelectedAvailability: (value: string) => void;
  showAbbreviations: boolean;
  setShowAbbreviations: (value: boolean) => void;
}

function LibraryToolbar({
  categories,
  sort,
  setSort,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedAvailability,
  setSelectedAvailability,
  showAbbreviations,
  setShowAbbreviations,
}: LibraryToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="library-toolbar">
      <div className="library-search">
        <label htmlFor="library-search-input">{t("library.searchLabel")}</label>
        <input
          id="library-search-input"
          type="search"
          placeholder={t("library.searchPlaceholder")}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      <div className="sort-control">
        <label htmlFor="category-filter">{t("library.categoryFilter")}</label>
        <select
          id="category-filter"
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
        >
          <option value="all">{t("library.allCategories")}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="sort-control">
        <label htmlFor="availability-filter">{t("library.availability")}</label>
        <select
          id="availability-filter"
          value={selectedAvailability}
          onChange={(event) => setSelectedAvailability(event.target.value)}
        >
          <option value="all">{t("library.allMaterials")}</option>
          <option value="available">{t("library.available")}</option>
          <option value="borrowed">{t("library.borrowed")}</option>
          <option value="reference">{t("library.reference")}</option>
        </select>
      </div>

      <div className="sort-control">
        <label htmlFor="sort">{t("library.sortBy")}</label>
        <select
          id="sort"
          value={sort}
          onChange={(event) => setSort(event.target.value as LibrarySort)}
        >
          <option value="title-asc">{t("library.titleAsc")}</option>
          <option value="title-desc">{t("library.titleDesc")}</option>
          <option value="category">{t("library.categoryAsc")}</option>
          <option value="type">{t("library.type")}</option>
        </select>
      </div>

      <button
        type="button"
        onClick={() => setShowAbbreviations(!showAbbreviations)}
      >
        {showAbbreviations
          ? t("library.showFullTitles")
          : t("library.showAbbreviatedTitles")}
      </button>
    </div>
  );
}

export default LibraryToolbar;
