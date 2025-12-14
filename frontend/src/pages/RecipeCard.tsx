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
}

interface RecipeCardProps {
  recipe: Recipe;
  onToggleLike: (id: number) => void;
  onDelete: (id: number) => void;
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
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this recipe?')) onDelete(recipe.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(recipe.title);
    alert('Recipe copied!');
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(recipe.id);
  };

  return (
    <div
      onClick={() => onSelect(recipe.id)}
      className="
        group relative w-full h-full
        bg-white rounded-2xl shadow-md border border-gray-100
        hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer
        flex flex-col
      "
    >
      {/* Main content */}
      <div className="p-6 flex-1 flex flex-col items-center text-center">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 line-clamp-3">
          {recipe.title}
        </h3>

        <div className="w-full max-w-xs bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm mb-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">⏱ Time</span>
              <span className="font-semibold">{recipe.minutes} min</span>
            </div>

            {recipe.match_count !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-emerald-700 font-medium">You Have</span>
                <span className="font-semibold text-emerald-700">
                  {recipe.match_count}
                </span>
              </div>
            )}

            {recipe.missing_count !== undefined && recipe.missing_count > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-amber-700 font-medium">Missing</span>
                <span className="font-semibold text-amber-700">
                  {recipe.missing_count}
                </span>
              </div>
            )}
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
      </div>

      {/* Bottom action bar */}
      <div
        className="px-4 py-3 border-t border-gray-100 flex items-center justify-center bg-gray-50 rounded-b-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
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
        </div>
      </div>
    </div>
  );
}
