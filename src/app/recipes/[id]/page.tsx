"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Recipe, Ingredient } from "@/types/recipe";
import CommentsRatings from "@/components/CommentsRatings";
import { useFavorites } from "@/context/FavoritesContext";
import { useAuth } from "@/context/AuthContext";
import Tag from "@/components/Tag";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

const fetchUserAvatar = async (userId: string) => {
  try {
    const folderRef = ref(storage, "profilePhotos");
    const list = await listAll(folderRef);

    const file = list.items.find((item) => item.name.startsWith(userId));

    if (!file) return "/default-profile.svg";

    return await getDownloadURL(file);
  } catch {
    return "/default-profile.svg";
  }
};

const numberToFraction = (num: number): string => {
  if (num % 1 === 0) return num.toString();

  const wholePart = Math.floor(num);
  const fractionalPart = num - wholePart;
  const tolerance = 0.01;

  const commonFractions = [
    { value: 0.5, fraction: "1/2" },
    { value: 1 / 3, fraction: "1/3" },
    { value: 2 / 3, fraction: "2/3" },
    { value: 0.25, fraction: "1/4" },
    { value: 0.75, fraction: "3/4" },
    { value: 0.2, fraction: "1/5" },
    { value: 0.4, fraction: "2/5" },
    { value: 0.6, fraction: "3/5" },
    { value: 0.8, fraction: "4/5" },
    { value: 1 / 6, fraction: "1/6" },
    { value: 5 / 6, fraction: "5/6" },
    { value: 0.125, fraction: "1/8" },
    { value: 0.375, fraction: "3/8" },
    { value: 0.625, fraction: "5/8" },
    { value: 0.875, fraction: "7/8" },
  ];

  for (const { value, fraction } of commonFractions) {
    if (Math.abs(fractionalPart - value) < tolerance) {
      if (wholePart === 0) {
        return fraction;
      }
      return `${wholePart} ${fraction}`;
    }
  }

  return num.toFixed(2).replace(/\.?0+$/, "");
};

const calculateScaledQuantity = (
  baseQuantity: number | string | undefined,
  baseServings: number,
  currentServings: number
): string => {
  if (baseQuantity === undefined || baseQuantity === null) return "";

  const quantity = parseFloat(String(baseQuantity));
  if (isNaN(quantity) || baseServings === 0) return "";

  const safeCurrentServings =
    currentServings > 0 ? currentServings : baseServings;

  const scaled = (quantity / baseServings) * safeCurrentServings;

  return numberToFraction(scaled);
};

export default function RecipePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [servings, setServings] = useState(1);
  const [creator, setCreator] = useState<{
    name: string;
    avatarUrl?: string;
  } | null>(null);

  const DIETARY_OPTIONS = [
    { value: "vegetarian", label: "Vegetarian", icon: "🌱" },
    { value: "vegan", label: "Vegan", icon: "🌿" },
    { value: "pescatarian", label: "Pescatarian", icon: "🐟" },
    { value: "glutenFree", label: "Gluten-Free", icon: "🌾" },
    { value: "dairyFree", label: "Dairy-Free", icon: "🥛" },
    { value: "nutFree", label: "Nut-Free", icon: "🥜" },
    { value: "halal", label: "Halal", icon: "☪️" },
    { value: "kosher", label: "Kosher", icon: "✡️" },
  ];

  const [creatorAvatar, setCreatorAvatar] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipeAndCreator = async () => {
      const id = typeof params.id === "string" ? params.id : params.id?.[0];
      if (!id) return setLoading(false);

      try {
        const snapshot = await getDoc(doc(db, "recipes", id));
        if (snapshot.exists()) {
          const rawRecipe = snapshot.data();

          const ingredients: Ingredient[] = (rawRecipe.ingredients || []).map(
            (ing: any) => {
              const rawQuantity = ing.name?.quantity || ing.quantity;
              const quantity =
                rawQuantity !== undefined && rawQuantity !== null
                  ? parseFloat(String(rawQuantity))
                  : undefined;

              const ingredientName =
                typeof ing.name === "string" ? ing.name : ing.name?.name || "";

              return {
                name: ingredientName,
                quantity: quantity,
                unit: ing.name?.unit || ing.unit,
                notes: ing.name?.notes || ing.notes,
              };
            }
          );

          const recipeData: Recipe = {
            id: snapshot.id,
            title: rawRecipe.title,
            description: rawRecipe.description,
            servings: rawRecipe.servings || 1,
            ingredients,
            steps: rawRecipe.steps || [],
            tags: rawRecipe.tags || [],
            imageUrl: rawRecipe.imageUrl,
            authorId: rawRecipe.authorId,
            authorName: rawRecipe.authorName,
            createdAt: rawRecipe.createdAt,
            dietary: rawRecipe.dietary || [],
            minActivePrepTime: rawRecipe.minActivePrepTime || 0,
            maxActivePrepTime: rawRecipe.maxActivePrepTime || 0,
            minPassiveTime: rawRecipe.minPassiveTime || 0,
            maxPassiveTime: rawRecipe.maxPassiveTime || 0,
            difficulty: rawRecipe.difficulty,
            mealType: rawRecipe.mealType,
          };

          setRecipe(recipeData);
          setServings(recipeData.servings);

          if (recipeData.authorId) {
            const avatar = await fetchUserAvatar(recipeData.authorId);
            setCreator({
              name: recipeData.authorName || "Unknown",
              avatarUrl: avatar,
            });
          }
        }
      } catch (err) {
        console.error("Error fetching recipe/creator:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeAndCreator();
  }, [params.id]);

  if (loading)
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-(--color-primary) border-t-transparent"></div>
      </div>
    );

  if (!recipe)
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-(--color-text-muted) text-lg">Recipe not found</p>
      </div>
    );

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h && m) return `${h}h ${m}m`;
    if (h) return `${h}h`;
    return `${m}m`;
  };

  const handleFavoriteToggle = () => {
    if (!user || !recipe.id) return alert("Please log in to add favorites");
    isFavorite(recipe.id) ? removeFavorite(recipe.id) : addFavorite(recipe.id);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: `Check out this recipe: ${recipe.title}`,
          url,
        });
      } catch {
        console.log("Share cancelled");
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
      } catch {
        alert("Failed to copy link");
      }
    }
  };

  const totalTime =
    (recipe.minActivePrepTime || 0) + (recipe.minPassiveTime || 0);

  return (
    <div className="min-h-screen bg-(--color-bg)">
      {/* Back Button */}
      <button
        onClick={() => router.push("/")}
        className="fixed bottom-8 left-8 z-50 bg-(--color-primary) shadow-[4px_4px_0_0_var(--color-shadow)] rounded-full w-14 h-14 hover:brightness-110 transition flex items-center justify-center"
        aria-label="Back"
      >
        <span className="text-white text-2xl">←</span>
      </button>

      {/* Hero Section */}
      <div className="relative">
        {recipe.imageUrl ? (
          <div className="w-full h-96 relative">
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-(--color-bg) via-transparent to-transparent"></div>
          </div>
        ) : (
          <div className="w-full h-64 bg-(--color-bg-secondary) flex items-center justify-center">
            <span className="text-9xl opacity-20">🍽️</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 -mt-20 relative z-10">
        <div className="bg-(--color-bg) border-2 border-(--color-border) rounded-3xl p-8 shadow-[8px_8px_0_0_var(--color-shadow)] mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <h1 className="text-5xl font-bold garet-heavy text-(--color-text) mb-4">
                {recipe.title}
              </h1>

              {/* Creator Info */}
              {creator && (
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={creator.avatarUrl || "/default-profile.svg"}
                    alt={creator.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="text-sm font-semibold text-(--color-text-muted)">
                    By {creator.name}
                  </span>
                </div>
              )}

              {/* Description */}
              {recipe.description && (
                <p className="text-(--color-text-muted) mb-4 text-lg leading-relaxed">
                  {recipe.description}
                </p>
              )}

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 text-sm text-(--color-text-muted) mb-4">
                {/* Servings Control */}
                <div className="flex items-center gap-2 bg-(--color-bg-secondary) px-3 py-2 rounded-full">
                  <span className="text-lg">🍽️</span>
                  <span className="font-semibold mr-1">Servings</span>

                  <button
                    onClick={() => setServings((s) => Math.max(1, s - 1))}
                    className="w-8 h-8 rounded-full bg-(--color-bg) border-2 border-(--color-border) font-bold hover:bg-(--color-primary) hover:text-white transition"
                    aria-label="Decrease servings"
                  >
                    −
                  </button>

                  <span className="w-8 text-center font-semibold text-(--color-text)">
                    {servings}
                  </span>

                  <button
                    onClick={() => setServings((s) => s + 1)}
                    className="w-8 h-8 rounded-full bg-(--color-bg) border-2 border-(--color-border) font-bold hover:bg-(--color-primary) hover:text-white transition"
                    aria-label="Increase servings"
                  >
                    +
                  </button>
                </div>
                {totalTime > 0 && (
                  <div className="flex items-center gap-2 bg-(--color-bg-secondary) px-3 py-2 rounded-full">
                    <span className="text-lg">⏱️</span>
                    <span className="font-semibold">
                      {formatTime(totalTime)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-(--color-bg-secondary) px-3 py-2 rounded-full">
                  <span className="text-lg">🥄</span>
                  <span className="font-semibold">
                    {recipe.ingredients.length} ingredients
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-(--color-bg-secondary) px-3 py-2 rounded-full">
                  <span className="text-lg">📝</span>
                  <span className="font-semibold">
                    {recipe.steps.length} steps
                  </span>
                </div>
              </div>

              {/* Dietary Badges */}
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map(
                  (opt) =>
                    (recipe.dietary as string[]).includes(opt.value) && (
                      <span
                        key={opt.value}
                        className="bg-(--color-success) text-white px-3 py-1 rounded-full text-sm font-semibold"
                      >
                        {opt.icon} {opt.label}
                      </span>
                    )
                )}
              </div>

              {/* Clickable Tags */}
              <div className="flex flex-wrap gap-2 mt-2">
                {recipe.tags.slice(0, 3).map((tag, i) => (
                  <Tag
                    key={i}
                    label={tag}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/?q=${encodeURIComponent(tag)}`);
                    }}
                  />
                ))}
                {recipe.tags.length > 3 && (
                  <span className="text-xs self-center text-(--color-text-muted)">
                    +{recipe.tags.length - 3}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 shrink-0">
              <button
                onClick={handleShare}
                className="px-6 py-3 rounded-full font-semibold shadow-[4px_4px_0_0_var(--color-shadow)] transition-all hover:brightness-110 bg-(--color-secondary) text-white"
                title="Share recipe"
              >
                🔗 Share
              </button>
              {user && (
                <button
                  onClick={handleFavoriteToggle}
                  className={`px-6 py-3 rounded-full font-semibold shadow-[4px_4px_0_0_var(--color-shadow)] transition-all hover:brightness-110 ${
                    isFavorite(recipe.id!)
                      ? "bg-(--color-danger) text-white"
                      : "bg-(--color-primary)-white"
                  }`}
                >
                  {isFavorite(recipe.id!) ? "❤️ Saved" : "🤍 Save"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Instructions & Ingredients */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            <div className="bg-(--color-bg-secondary) border-2 border-(--color-border) rounded-2xl p-6 lg:sticky lg:top-8">
              <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
              <ul className="space-y-3">
                {recipe.ingredients.map((ing, i) => {
                  const scaledQuantity = calculateScaledQuantity(
                    ing.quantity,
                    recipe.servings,
                    servings
                  );

                  return (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-(--color-text)"
                    >
                      <span className="text-(--color-primary) mt-1">•</span>
                      <span>
                        {scaledQuantity && ing.unit
                          ? `${scaledQuantity} ${ing.unit} `
                          : scaledQuantity
                          ? `${scaledQuantity} `
                          : ""}
                        <strong>{ing.name}</strong>
                        {ing.notes && (
                          <span className="text-(--color-text-muted) text-sm">
                            {" "}
                            ({ing.notes})
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-(--color-bg-secondary) border-2 border-(--color-border) rounded-2xl p-6">
              <h2 className="text-2xl font-semibold mb-6 garet-heavy text-(--color-text)">
                Instructions
              </h2>
              <ol className="space-y-6">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-(--color-primary) text-white font-bold flex items-center justify-center shadow-[2px_2px_0_0_var(--color-shadow)]">
                      {i + 1}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-(--color-text) mb-3 leading-relaxed">
                        {step.text}
                      </p>
                      {step.imageUrl && (
                        <img
                          src={step.imageUrl}
                          alt={`Step ${i + 1}`}
                          className="w-full max-w-lg rounded-xl shadow-md border-2 border-(--color-border)"
                        />
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Comments & Ratings */}
        <div className="bg-(--color-bg-secondary) border-2 border-(--color-border) rounded-2xl p-8 mb-8">
          <CommentsRatings
            recipeId={recipe.id!}
            recipeOwnerId={recipe.authorId}
          />
        </div>
      </div>
    </div>
  );
}
