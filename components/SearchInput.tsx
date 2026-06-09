"use client";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-dark/70">
        Пошук за назвою або брендом
      </span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Наприклад: Brit Care або шампунь"
        className="min-h-12 w-full rounded-lg border border-dark/10 bg-white px-4 text-sm font-medium text-dark outline-none transition placeholder:text-dark/35 focus:border-dark/35 focus:ring-4 focus:ring-primary/30"
      />
    </label>
  );
}
