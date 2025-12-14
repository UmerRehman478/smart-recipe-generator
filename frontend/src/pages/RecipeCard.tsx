import React from 'react';
import { Heart, Trash2, Share2 } from 'lucide-react';

interface Recipe {
  id: number;
  title: string;
  minutes: number;
  calories: number | null;
  match_count?: number;
  missing_count?: number;
  liked?: boolean;
<<<<<<< HEAD
  protein_g?: number | null;
  carbs_g?: number | null;
  fat_g?: number | null;
  steps?: string[];
  ingredients?: Array<{ raw: string; norm: string }>;
=======
>>>>>>> UNew
}

interface RecipeCardProps {
  recipe: Recipe;
  onToggleLike: (id: number) => void;
  onDelete: (id: number) => void;
<<<<<<< HEAD
  onViewDetails: (id: number) => void;
}

export default function RecipeCard({ recipe, onToggleLike, onDelete, onViewDetails }: RecipeCardProps) {
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: `Check out this recipe: ${recipe.title}`,
          url: window.location.href,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(`${recipe.title} - ${window.location.href}`);
      alert('Recipe link copied!');
    }
=======
  onSelect: (id: number) => void;

  showViewButton?: boolean;
}

export default function RecipeCard({
  recipe,
  onToggleLike,
  onDelete,
  onSelect,
  showViewButton = false
}: RecipeCardProps) {
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLike(recipe.id);
>>>>>>> UNew
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this recipe?')) onDelete(recipe.id);
  };

<<<<<<< HEAD
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLike(recipe.id);
=======
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(recipe.title);
    alert('Recipe copied!');
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(recipe.id);
>>>>>>> UNew
  };

  return (
    <div
<<<<<<< HEAD
      onClick={() => onViewDetails(recipe.id)}
=======
      onClick={() => onSelect(recipe.id)}
>>>>>>> UNew
      className="
        group relative w-full h-full
        bg-white rounded-2xl shadow-md border border-gray-100
        hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer
        flex flex-col
      "
    >
      {/* Main content */}
      <div className="p-6 flex-1 flex flex-col items-center text-center">
<<<<<<< HEAD

        {/* Title */}
=======
>>>>>>> UNew
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 line-clamp-3">
          {recipe.title}
        </h3>

<<<<<<< HEAD
        {/* Stats Box */}
        <div className="w-full max-w-xs bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm mb-5">
          <div className="flex flex-col gap-3">

            {/* Time */}
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium flex items-center gap-2">
                ⏱ <span>Time</span>
              </span>
              <span className="font-semibold text-gray-800">{recipe.minutes} min</span>
            </div>

            {/* HAVE */}
            {recipe.match_count !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-emerald-700 font-medium flex items-center gap-2">
                 <span>Ingredients You Have</span>
                </span>
=======
        <div className="w-full max-w-xs bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm mb-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">⏱ Time</span>
              <span className="font-semibold">{recipe.minutes} min</span>
            </div>

            {recipe.match_count !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-emerald-700 font-medium">You Have</span>
>>>>>>> UNew
                <span className="font-semibold text-emerald-700">
                  {recipe.match_count}
                </span>
              </div>
            )}

<<<<<<< HEAD
            {/* MISSING */}
            {recipe.missing_count !== undefined && recipe.missing_count > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-amber-700 font-medium flex items-center gap-2">
                 <span>Still Needed</span>
                </span>
=======
            {recipe.missing_count !== undefined && recipe.missing_count > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-amber-700 font-medium">Missing</span>
>>>>>>> UNew
                <span className="font-semibold text-amber-700">
                  {recipe.missing_count}
                </span>
              </div>
            )}
<<<<<<< HEAD

            {/* Calories – fallback */}
            {recipe.match_count === undefined && (
              <div className="flex items-center justify-between">
                <span className="text-blue-700 font-medium flex items-center gap-2">
                 <span>Calories</span>
                </span>
                <span className="font-semibold text-blue-700">
                  {recipe.calories ?? 'N/A'}
                </span>
              </div>
            )}

          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onViewDetails(recipe.id); }}
          className="
            px-6 py-2 bg-emerald-600 text-white rounded-full font-semibold
            hover:bg-emerald-700 transition-all shadow
          "
        >
          View Full Recipe
        </button>
=======
          </div>
        </div>

        {showViewButton && (
          <button
            onClick={handleView}
            className="
              px-6 py-2 bg-emerald-600 text-white rounded-full font-semibold
              hover:bg-emerald-700 transition-all shadow
            "
          >
            Click to view recipe
          </button>
        )}
>>>>>>> UNew
      </div>

      {/* Bottom action bar */}
      <div
        className="px-4 py-3 border-t border-gray-100 flex items-center justify-center bg-gray-50 rounded-b-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
<<<<<<< HEAD

          {/* Like Button (upgraded) */}
          <button
            onClick={handleLike}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${recipe.liked
                ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-md scale-105'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
              }
            `}
          >
            <Heart
              className={`
                w-4 h-4 transition-all duration-200
                ${recipe.liked ? 'fill-white scale-110' : 'fill-none'}
              `}
            />
            {recipe.liked ? 'Liked' : 'Like'}
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="
              inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm
              bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition-all
            "
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            className="
              inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm
              bg-red-50 text-red-600 hover:bg-red-100 transition-all
            "
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>

=======
          <button
            onClick={handleLike}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
              ${recipe.liked
                ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'}
            `}
          >
            <Heart className={`w-4 h-4 ${recipe.liked ? 'fill-white' : 'fill-none'}`} />
            {recipe.liked ? 'Selected' : 'Select'}
          </button>

          <button
            onClick={handleShare}
            className="px-4 py-2 rounded-full text-sm bg-white border border-gray-200"
          >
            Share
          </button>

          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-full text-sm bg-red-50 text-red-600"
          >
            Delete
          </button>
>>>>>>> UNew
        </div>
      </div>
    </div>
  );
}
