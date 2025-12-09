import React, { useState } from 'react';
import { Upload, Camera, ChefHat, Scale, Target, X, Check, Clock, Flame } from 'lucide-react';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import RecipeCard from './pages/RecipeCard';
import * as api from './api';

interface Ingredient {
  name: string;
  confidence: number;
  raw_labels: string[];
}

interface Recipe {
  id: number;
  title: string;
  minutes: number;
  calories: number | null;
  match_count?: number;
  missing_count?: number;
  score?: number;
  liked?: boolean;
  fat_g?: number | null;
  sugar_g?: number | null;
  sodium_mg?: number | null;
  protein_g?: number | null;
  sat_fat_g?: number | null;
  carbs_g?: number | null;
  // backend may also send:
  steps?: string[];
  ingredients?: Array<{ raw: string; norm: string }>;
}

interface UserProfile {
  height: string;
  weight: string;
  goal: 'lose' | 'maintain' | 'gain' | '';
}

type Step = 'home' | 'auth' | 'upload' | 'confirm' | 'profile' | 'results';

export default function App() {
  const [currentStep, setCurrentStep] = useState<Step>('home');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [confirmedIngredients, setConfirmedIngredients] = useState<string[]>([]);
  const [manualIngredient, setManualIngredient] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    height: '',
    weight: '',
    goal: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  // NEW: recipe detail state
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [recipeDetails, setRecipeDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const recognizeIngredients = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.recognizeIngredients(selectedFile);
      setIngredients(response.ingredients);
      setConfirmedIngredients(response.ingredients.map((ing: Ingredient) => ing.name));
      setCurrentStep('confirm');
    } catch (err) {
      console.error('Error recognizing ingredients:', err);
      setError(err instanceof Error ? err.message : 'Failed to recognize ingredients');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleIngredient = (ingredientName: string) => {
    setConfirmedIngredients(prev =>
      prev.includes(ingredientName)
        ? prev.filter(name => name !== ingredientName)
        : [...prev, ingredientName]
    );
  };

  const addManualIngredient = (name?: string) => {
    const ingName = (name ?? manualIngredient).trim();
    if (!ingName) return;
    const newIngredient: Ingredient = { 
      name: ingName, 
      confidence: 1, 
      raw_labels: [ingName] 
    };
    setIngredients(prev => [...prev, newIngredient]);
    setConfirmedIngredients(prev => prev.includes(ingName) ? prev : [...prev, ingName]);
    setManualIngredient('');
  };

  const proceedToProfile = () => {
    setCurrentStep('profile');
  };

  const getRecipes = async () => {
    if (confirmedIngredients.length === 0) {
      setError('Please select at least one ingredient');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.getRecommendations({
        ingredients: confirmedIngredients,
        max_missing: 3,
        limit: 20
      });
      
      if (!response.results || response.results.length === 0) {
        setError('No recipes found. Try adding more ingredients or reducing restrictions.');
        setRecipes([]);
      } else {
        setRecipes(response.results.map((r: Recipe) => ({ ...r, liked: false })));
        setCurrentStep('results');
      }
    } catch (err) {
      console.error('Error getting recipes:', err);
      setError(err instanceof Error ? err.message : 'Failed to get recipe recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLike = (id: number) => {
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, liked: !r.liked } : r));
  };

  const deleteRecipe = (id: number) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
  };

  const resetApp = () => {
    setCurrentStep('home');
    setSelectedImage(null);
    setSelectedFile(null);
    setIngredients([]);
    setConfirmedIngredients([]);
    setUserProfile({ height: '', weight: '', goal: '' });
    setError(null);
    setRecipes([]);
    setSelectedRecipeId(null);
    setRecipeDetails(null);
  };

  const handleLogin = (user: { email?: string; name?: string }) => {
    if (user.email) setUserEmail(user.email);
    setCurrentStep('upload');
  };

  // NEW: view/close details
  const viewRecipeDetails = async (recipeId: number) => {
    setLoadingDetails(true);
    setSelectedRecipeId(recipeId);
    
    try {
      const details = await api.getRecipeDetail(recipeId);
      setRecipeDetails(details);
    } catch (err) {
      console.error('Error loading recipe details:', err);
      setError('Failed to load recipe details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeRecipeModal = () => {
    setSelectedRecipeId(null);
    setRecipeDetails(null);
  };

  // Show homepage
  if (currentStep === 'home') {
    return (
      <HomePage 
        onGetStarted={() => setCurrentStep('upload')}
        onSignIn={() => setCurrentStep('auth')}
      />
    );
  }

  // Show auth page
  if (currentStep === 'auth') {
    return (
      <AuthPage 
        onBack={() => setCurrentStep('home')}
        onLogin={(email) => handleLogin({ email })}
      />
    );
  }

  // Show main app
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChefHat className="w-8 h-8 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-900">Smart Recipe Generator</h1>
            </div>
            <div className="flex items-center gap-4">
              {userEmail && (
                <span className="text-sm text-gray-600">Welcome, {userEmail}</span>
              )}
              <button
                onClick={resetApp}
                className="text-sm px-3 py-1 bg-white text-emerald-600 border border-emerald-200 rounded-md hover:bg-emerald-50 transition-all"
              >
                ← Back to Home
              </button>
            </div>
          </div>
          <p className="text-gray-600 mt-1 text-sm">Personalized recipes based on what you have</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-12">
          {['Upload', 'Confirm', 'Profile', 'Results'].map((label, idx) => (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  ['upload', 'confirm', 'profile', 'results'][idx] === currentStep || 
                  ['upload', 'confirm', 'profile', 'results'].indexOf(currentStep) > idx
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {idx + 1}
                </div>
                <span className="text-xs mt-2 text-gray-600 font-medium">{label}</span>
              </div>
              {idx < 3 && (
                <div className={`flex-1 h-0.5 mx-4 transition-all ${
                  ['upload', 'confirm', 'profile', 'results'].indexOf(currentStep) > idx
                    ? 'bg-emerald-600'
                    : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {currentStep === 'upload' && (
            <div className="text-center">
              <Camera className="w-16 h-16 mx-auto text-emerald-600 mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Upload Your Fridge Photo
              </h2>
              <p className="text-gray-600 mb-8">
                Take a photo of your ingredients and we'll identify them for you
              </p>

              {!selectedImage ? (
                <label className="cursor-pointer">
                  <div className="border-3 border-dashed border-gray-300 rounded-xl p-12 hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-700 font-medium mb-1">Click to upload image</p>
                    <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="space-y-4">
                  <img
                    src={selectedImage}
                    alt="Uploaded ingredients"
                    className="max-h-80 mx-auto rounded-xl shadow-md"
                  />
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        setSelectedFile(null);
                      }}
                      className="px-6 py-2.5 bg-white text-emerald-600 font-medium rounded-lg hover:bg-emerald-50 transition-all"
                    >
                      Change Image
                    </button>
                    <button
                      onClick={recognizeIngredients}
                      disabled={isLoading}
                      className="px-8 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Analyzing...' : 'Recognize Ingredients'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 'confirm' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Confirm Your Ingredients
              </h2>
              <p className="text-gray-600 mb-6">
                Click to toggle ingredients. We detected {ingredients.length} items.
              </p>

              <div className="mb-6 max-w-md mx-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">Add ingredient manually</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualIngredient}
                    onChange={(e) => setManualIngredient(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addManualIngredient()}
                    placeholder="e.g., tomatoes"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                  <button
                    onClick={() => addManualIngredient()}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                {ingredients.map((ingredient) => (
                  <button
                    key={ingredient.name}
                    onClick={() => toggleIngredient(ingredient.name)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      confirmedIngredients.includes(ingredient.name)
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 capitalize">
                        {ingredient.name}
                      </span>
                      {confirmedIngredients.includes(ingredient.name) ? (
                        <Check className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.round(ingredient.confidence * 100)}% confidence
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep('upload')}
                  className="px-6 py-2.5 bg-white text-emerald-600 border border-emerald-200 rounded-lg font-medium hover:bg-emerald-50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={proceedToProfile}
                  disabled={confirmedIngredients.length === 0}
                  className="px-8 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue ({confirmedIngredients.length} selected)
                </button>
              </div>
            </div>
          )}

          {currentStep === 'profile' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Your Health Profile
              </h2>
              <p className="text-gray-600 mb-8">
                Help us personalize recipes to your nutritional goals
              </p>

              <div className="space-y-6 max-w-md mx-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Scale className="w-4 h-4 inline mr-2" />
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={userProfile.weight}
                    onChange={(e) => setUserProfile({...userProfile, weight: e.target.value})}
                    placeholder="70"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={userProfile.height}
                    onChange={(e) => setUserProfile({...userProfile, height: e.target.value})}
                    placeholder="175"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Target className="w-4 h-4 inline mr-2" />
                    Your Goal
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'lose', label: 'Lose Weight', emoji: '📉' },
                      { value: 'maintain', label: 'Maintain', emoji: '⚖️' },
                      { value: 'gain', label: 'Gain Weight', emoji: '📈' }
                    ].map(({ value, label, emoji }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setUserProfile({...userProfile, goal: value as any})}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          userProfile.goal === value
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 bg-white hover:border-emerald-400'
                        }`}
                      >
                        <div className="text-2xl mb-1">{emoji}</div>
                        <div className="text-sm font-medium text-emerald-700">{label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-10">
                <button
                  onClick={() => setCurrentStep('confirm')}
                  className="px-6 py-2.5 bg-white text-emerald-600 border border-emerald-200 rounded-lg font-medium hover:bg-emerald-50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={getRecipes}
                  disabled={!userProfile.height || !userProfile.weight || !userProfile.goal || isLoading}
                  className="px-8 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Finding Recipes...' : 'Get My Recipes'}
                </button>
              </div>
            </div>
          )}

          {currentStep === 'results' && (
            <div>
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                    <ChefHat className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Your Recipes</h2>
                    <p className="text-gray-600 mt-1">
                      {recipes.length} recipes found • {confirmedIngredients.length} ingredients used
                    </p>
                  </div>
                </div>
                <button 
                  onClick={resetApp} 
                  className="px-4 py-2 bg-white text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-all font-medium"
                >
                  Start Over
                </button>
              </div>

              {recipes.length === 0 ? (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-12 text-center">
                  <div className="text-6xl mb-4">🍳</div>
                  <p className="text-xl font-bold text-amber-900 mb-2">No recipes found</p>
                  <p className="text-amber-700 mb-6">
                    Try adding more common ingredients like chicken, rice, or tomatoes
                  </p>
                  <button
                    onClick={() => setCurrentStep('confirm')}
                    className="px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-all"
                  >
                    Adjust Ingredients
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recipes.map((recipe) => (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        onToggleLike={toggleLike}
                        onDelete={deleteRecipe}
                        onViewDetails={viewRecipeDetails}
                      />
                    ))}
                  </div>

                  {/* Recipe Detail Modal */}
                  {selectedRecipeId && (
                    <div 
                      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                      onClick={closeRecipeModal}
                    >
                      <div 
                        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {loadingDetails ? (
                          <div className="flex items-center justify-center h-96">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
                          </div>
                        ) : recipeDetails ? (
                          <div className="overflow-y-auto max-h-[90vh]">
                            {/* Header */}
                            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-green-700 text-white p-6">
                              <button
                                onClick={closeRecipeModal}
                                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all"
                              >
                                <X className="w-5 h-5" />
                              </button>
                              <h2 className="text-2xl font-bold pr-12">{recipeDetails.title}</h2>
                              <div className="flex gap-4 mt-3 text-sm">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {recipeDetails.minutes} min
                                </span>
                                <span className="flex items-center gap-1">
                                  <Flame className="w-4 h-4" />
                                  {recipeDetails.calories || 'N/A'} cal
                                </span>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                              {/* Nutrition */}
                              {(recipeDetails.protein_g || recipeDetails.carbs_g || recipeDetails.fat_g) && (
                                <div className="bg-emerald-50 rounded-xl p-4 mb-6">
                                  <h3 className="font-bold text-gray-900 mb-3">Nutrition Facts</h3>
                                  <div className="grid grid-cols-4 gap-3 text-center">
                                    {recipeDetails.calories !== null && recipeDetails.calories !== undefined && (
                                      <div>
                                        <div className="text-2xl font-bold text-emerald-700">{recipeDetails.calories || 0}</div>
                                        <div className="text-xs text-gray-600">Calories</div>
                                      </div>
                                    )}
                                    {recipeDetails.protein_g !== null && recipeDetails.protein_g !== undefined && (
                                      <div>
                                        <div className="text-2xl font-bold text-blue-700">{recipeDetails.protein_g !== null ? Math.round(recipeDetails.protein_g) : 0}g</div>
                                        <div className="text-xs text-gray-600">Protein</div>
                                      </div>
                                    )}
                                    {recipeDetails.carbs_g !== null && recipeDetails.carbs_g !== undefined && (
                                      <div>
                                        <div className="text-2xl font-bold text-purple-700">{recipeDetails.carbs_g !== null ? Math.round(recipeDetails.carbs_g) : 0}g</div>
                                        <div className="text-xs text-gray-600">Carbs</div>
                                      </div>
                                    )}
                                    {recipeDetails.fat_g !== null && recipeDetails.fat_g !== undefined && (
                                      <div>
                                        <div className="text-2xl font-bold text-amber-700">{recipeDetails.fat_g !== null ? Math.round(recipeDetails.fat_g) : 0}g</div>
                                        <div className="text-xs text-gray-600">Fat</div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Ingredients */}
                              <div className="mb-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                  <ChefHat className="w-5 h-5 text-emerald-600" />
                                  Ingredients
                                </h3>
                                <ul className="space-y-2">
                                  {recipeDetails.ingredients?.map((ing: any, idx: number) => (
                                    <li key={idx} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-all">
                                      <span className="text-emerald-600 font-bold">•</span>
                                      <span className="capitalize text-gray-700">{ing.raw}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Steps */}
                              {recipeDetails.steps && recipeDetails.steps.length > 0 && (
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                   Instructions
                                  </h3>
                                  <ol className="space-y-3">
                                    {recipeDetails.steps.map((step: string, idx: number) => (
                                      <li key={idx} className="flex gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                                        <span className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                          {idx + 1}
                                        </span>
                                        <span className="text-gray-700 leading-relaxed">{step}</span>
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="p-6 text-center text-gray-500">
                            Failed to load recipe details
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
