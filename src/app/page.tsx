"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Recipe } from "@/types/recipe";
import RecipeCard from "@/components/RecipeCard";
import { fetchRecipesPage } from "@/lib/listenRecipesPaginated";
import { QueryDocumentSnapshot } from "firebase/firestore";

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const [page, setPage] = useState(pageFromUrl);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [cursors, setCursors] = useState<(QueryDocumentSnapshot | null)[]>([null]);
  const [totalPages, setTotalPages] = useState(1);

  const MAX_VISIBLE_PAGES = 5;

  const loadPage = async (pageNumber: number) => {
    setLoading(true);

    const cursor = cursors[pageNumber - 1] ?? null;
    const { recipes, lastDoc, hasNext } = await fetchRecipesPage(cursor);

    setRecipes(recipes);
    setHasNext(hasNext);

    setCursors(prev => {
      const updated = [...prev];
      updated[pageNumber] = lastDoc;
      return updated;
    });

    setTotalPages(prev =>
      hasNext ? Math.max(prev, pageNumber + 1) : pageNumber
    );

    setLoading(false);
  };

  useEffect(() => {
    loadPage(page);
  }, [page]);

  useEffect(() => {
    router.replace(`/?page=${page}`);
  }, [page, router]);

  const search = searchParams.get("q")?.toLowerCase() ?? "";

  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(search) ||
    recipe.ingredients.join(" ").toLowerCase().includes(search) ||
    recipe.tags.join(" ").toLowerCase().includes(search) ||
    recipe.steps.some(step => step.text.toLowerCase().includes(search))
  );

  const getPaginationItems = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= MAX_VISIBLE_PAGES + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const left = Math.max(2, page - 1);
      const right = Math.min(totalPages - 1, page + 1);

      pages.push(1);
      if (left > 2) pages.push("…");

      for (let i = left; i <= right; i++) pages.push(i);

      if (right < totalPages - 1) pages.push("…");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-(--color-text) garet-heavy">Discover Recipes</h1>

      {filteredRecipes.length === 0 ? (
        <p>No recipes found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredRecipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-10">
        <button
          disabled={page === 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
          className="px-3 py-2 rounded border disabled:opacity-50"
        >
          Prev
        </button>

        {getPaginationItems().map((item, index) =>
          item === "…" ? (
            <span key={`ellipsis-${index}`} className="px-4 py-2">
              …
            </span>
          ) : (
            <button
              key={item}
              onClick={() => setPage(Number(item))}
              className={`px-4 py-2 rounded border ${
                page === item ? "bg-(--color-primary) text-white" : ""
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          disabled={!hasNext}
          onClick={() => setPage(p => p + 1)}
          className="px-3 py-2 rounded border disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {loading && <p className="text-center mt-4">Loading...</p>}
    </main>
  );
}
