"use client";

type CategoryFilterProps = {
  categories: string[];
  activeCategory: string;
  onChange: (category: string) => void;
};

export function CategoryFilter({
  categories,
  activeCategory,
  onChange,
}: CategoryFilterProps) {
  const allCategories = ["Усі", ...categories];

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-dark/70">Категорія</p>
      <div className="flex flex-wrap gap-2">
        {allCategories.map((category) => {
          const active = activeCategory === category;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onChange(category)}
              className={`min-h-11 rounded-lg px-4 text-sm font-bold transition ${
                active
                  ? "bg-dark text-white"
                  : "border border-dark/10 bg-white text-dark/70 hover:border-dark/30 hover:text-dark"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}
