"use client";

interface Props {
  search: string;
  setSearch: (v: string) => void;
  vegetarian: boolean;
  setVegetarian: (v: boolean) => void;
  glutenFree: boolean;
  setGlutenFree: (v: boolean) => void;
  maxPrepTime: number;
  setMaxPrepTime: (v: number) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
}

export default function RecipeFilters(props: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <input
        className="border p-2 rounded"
        placeholder="Search recipes..."
        value={props.search}
        onChange={e => props.setSearch(e.target.value)}
      />

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={props.vegetarian}
          onChange={e => props.setVegetarian(e.target.checked)}
        />
        Vegetarian
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={props.glutenFree}
          onChange={e => props.setGlutenFree(e.target.checked)}
        />
        Gluten-free
      </label>

      <input
        type="number"
        className="border p-2 rounded"
        placeholder="Max prep time (min)"
        value={props.maxPrepTime}
        onChange={e => props.setMaxPrepTime(Number(e.target.value))}
      />

      <select
        className="border p-2 rounded"
        value={props.sortBy}
        onChange={e => props.setSortBy(e.target.value)}
      >
        <option value="date">Newest</option>
        <option value="rating">Popularity</option>
      </select>
    </div>
  );
}
