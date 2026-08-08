import React, { useState } from 'react';
import { FilterState, Category, Condition, Language } from '../types';
import { getTranslation } from '../lib/translations';
import { formatPrice } from '../lib/formatters';
import { soundFx } from '../lib/sound';

interface FilterSidebarProps {
  filter: FilterState;
  onFilterChange: (newFilter: FilterState) => void;
  onResetFilter: () => void;
  language: Language;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filter,
  onFilterChange,
  onResetFilter,
  language
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const [isMinimized, setIsMinimized] = useState(false);

  const categoriesList: Category[] = ['DRINKS', 'SNACKS', 'FOOD', 'MERCH', 'HARDWARE', 'PERIPHERALS', 'ACCESSORIES'];
  const conditionsList: Condition[] = ['FRESH MADE', 'MINT IN BOX', 'REFURBISHED', 'LIMITED EDITION', 'PARTS ONLY'];

  const handleCategoryToggle = (cat: Category) => {
    soundFx.playClick();
    const updated = filter.categories.includes(cat)
      ? filter.categories.filter((c) => c !== cat)
      : [...filter.categories, cat];
    onFilterChange({ ...filter, categories: updated });
  };

  const handleConditionToggle = (cond: Condition) => {
    soundFx.playClick();
    const updated = filter.conditions.includes(cond)
      ? filter.conditions.filter((c) => c !== cond)
      : [...filter.conditions, cond];
    onFilterChange({ ...filter, conditions: updated });
  };

  return (
    <aside className="w-full md:w-64 flex-shrink-0 flex flex-col gap-4">
      <div className="retro-window bg-[#1d1e30]">
        {/* Title Bar */}
        <div className="window-header bg-[#00a68d] p-2 flex justify-between items-center text-black">
          <span className="font-headline text-sm font-bold uppercase flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">tune</span>
            {t('filtersTitle')}
          </span>
          <div className="window-controls flex items-center gap-1">
            <button
              onClick={() => {
                soundFx.playClick();
                setIsMinimized((prev) => !prev);
              }}
              className="win-btn bg-[#1d1e30] text-[#00a68d] hover:bg-black hover:text-[#00a68d] cursor-pointer font-bold px-1.5 py-0.5"
              title={isMinimized ? "Expand Filters" : "Minimize Filters"}
            >
              {isMinimized ? '+' : '_'}
            </button>
            <button
              onClick={() => {
                soundFx.playClose();
                onResetFilter();
              }}
              className="win-btn bg-[#ff7700] text-black hover:bg-[#ffb68d] cursor-pointer font-bold px-1.5 py-0.5"
              title="Reset Filters (X)"
            >
              X
            </button>
          </div>
        </div>

        {/* Filter Controls Body */}
        {!isMinimized && (
          <div className="p-4 flex flex-col gap-5 text-[#e1e0f9]">
          {/* Search Input */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label text-xs uppercase text-[#ffb68d] font-bold">
              {language === 'ID' ? 'CARI PRODUK' : 'SEARCH PRODUCTS'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={filter.searchQuery}
                onChange={(e) => onFilterChange({ ...filter, searchQuery: e.target.value })}
                placeholder={t('searchPlaceholder')}
                className="w-full bg-[#111223] border-2 border-[#584235] p-2 font-body text-xs text-[#e1e0f9] focus:border-[#ff7700] outline-none pixel-inset"
              />
              {filter.searchQuery && (
                <button
                  onClick={() => onFilterChange({ ...filter, searchQuery: '' })}
                  className="absolute right-2 top-2 text-[#e0c0b0] hover:text-[#ff7700] text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label text-xs uppercase text-[#ffb68d] font-bold">{t('sortBy')}</label>
            <select
              value={filter.sortBy}
              onChange={(e) => onFilterChange({ ...filter, sortBy: e.target.value as FilterState['sortBy'] })}
              className="w-full bg-[#111223] border-2 border-[#584235] p-2 font-label text-xs text-[#e1e0f9] focus:border-[#ff7700] outline-none rounded-none cursor-pointer"
            >
              <option value="featured">{t('sortFeatured')}</option>
              <option value="price-low">{t('sortLowHigh')}</option>
              <option value="price-high">{t('sortHighLow')}</option>
              <option value="rating">{t('sortRating')}</option>
            </select>
          </div>

          {/* Categories */}
          <div className="flex flex-col gap-2">
            <label className="font-label text-xs uppercase text-[#ffb68d] font-bold">{t('categories')}</label>
            <div className="bg-[#111223] p-2.5 border-2 border-[#584235] flex flex-col gap-2 pixel-inset">
              {categoriesList.map((cat) => (
                <label key={cat} className="flex items-center gap-2.5 cursor-pointer font-label text-xs text-[#e0c0b0] hover:text-[#59dbc0] select-none">
                  <input
                    type="checkbox"
                    checked={filter.categories.includes(cat)}
                    onChange={() => handleCategoryToggle(cat)}
                    className="accent-[#ff7700] w-4 h-4 rounded-none cursor-pointer"
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div className="flex flex-col gap-2">
            <label className="font-label text-xs uppercase text-[#ffb68d] font-bold">{t('condition')}</label>
            <div className="bg-[#111223] p-2.5 border-2 border-[#584235] flex flex-col gap-2 pixel-inset">
              {conditionsList.map((cond) => (
                <label key={cond} className="flex items-center gap-2.5 cursor-pointer font-label text-xs text-[#e0c0b0] hover:text-[#59dbc0] select-none">
                  <input
                    type="checkbox"
                    checked={filter.conditions.includes(cond)}
                    onChange={() => handleConditionToggle(cond)}
                    className="accent-[#ff7700] w-4 h-4 rounded-none cursor-pointer"
                  />
                  <span>{cond}</span>
                </label>
              ))}
            </div>
          </div>

          {/* In Stock Only Checkbox */}
          <label className="flex items-center gap-2.5 cursor-pointer font-label text-xs text-[#59dbc0] hover:underline select-none bg-[#111223] p-2 border-2 border-[#584235]">
            <input
              type="checkbox"
              checked={filter.inStockOnly}
              onChange={(e) => {
                soundFx.playClick();
                onFilterChange({ ...filter, inStockOnly: e.target.checked });
              }}
              className="accent-[#00a68d] w-4 h-4 rounded-none cursor-pointer"
            />
            <span className="font-bold">{t('inStockOnly')}</span>
          </label>

          {/* Price Range */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center font-label text-xs">
              <span className="uppercase text-[#ffb68d] font-bold">{t('priceRange')}</span>
              <span className="text-[#59dbc0] font-bold">{formatPrice(filter.maxPrice, language)}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="100000000"
              step="50000"
              value={filter.maxPrice}
              onChange={(e) => onFilterChange({ ...filter, maxPrice: Number(e.target.value) })}
              className="w-full accent-[#ff7700] cursor-pointer"
            />
          </div>

          {/* Actions */}
          <button
            onClick={() => {
              soundFx.playClick();
              onResetFilter();
            }}
            className="retro-btn bg-[#323346] text-[#e1e0f9] hover:bg-[#ff7700] hover:text-black font-label text-xs py-2 uppercase mt-2 w-full font-bold"
          >
            {t('resetFilter')}
          </button>
        </div>
        )}
      </div>
    </aside>
  );
};
