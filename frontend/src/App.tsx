import React, { useState } from 'react';
import { Upload, Camera, ChefHat, Scale, Target, X, Check, Heart, Trash2 } from 'lucide-react';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';

interface Ingredient {
  name: string;
  confidence: number;
  raw_labels: string[];
}

interface RecognizeResponse {
  ingredients: Ingredient[];
}

interface Recipe {
  id: string;
  title: string;
  description?: string;
  image?: string;
  ingredients?: string[];
  liked?: boolean;
  nutrition?: {
    calories?: number | string;
    protein?: string;
    carbs?: string;
    fat?: string;
  };
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
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [confirmedIngredients, setConfirmedIngredients] = useState<string[]>([]);
  const [manualIngredient, setManualIngredient] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    height: '',
    weight: '',
    goal: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const recognizeIngredients = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      const blob = await fetch(selectedImage!).then(r => r.blob());
      formData.append('image', blob);
      
      const response = await fetch('http://localhost:8000/recognize', {
        method: 'POST',
        body: formData
      });
      
      const data: RecognizeResponse = await response.json();
      setIngredients(data.ingredients);
      setConfirmedIngredients(data.ingredients.map(ing => ing.name));
      setCurrentStep('confirm');
    } catch (error) {
      console.error('Error recognizing ingredients:', error);
      const demoIngredients: Ingredient[] = [
        { name: 'chicken breast', confidence: 0.95, raw_labels: ['chicken'] },
        { name: 'broccoli', confidence: 0.88, raw_labels: ['broccoli'] },
        { name: 'rice', confidence: 0.92, raw_labels: ['white rice'] },
      ];
      setIngredients(demoIngredients);
      setConfirmedIngredients(demoIngredients.map(ing => ing.name));
      setCurrentStep('confirm');
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
    const newIngredient: Ingredient = { name: ingName, confidence: 1, raw_labels: [ingName] };
    setIngredients(prev => [...prev, newIngredient]);
    setConfirmedIngredients(prev => prev.includes(ingName) ? prev : [...prev, ingName]);
    setManualIngredient('');
  };

  const proceedToProfile = () => {
    setCurrentStep('profile');
  };

  const getRecipes = async () => {
    setIsLoading(true);
    try {
      const requestBody = {
        ingredients: confirmedIngredients,
        max_missing: 3,
        limit: 20
      };
      
      const response = await fetch('http://localhost:8000/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      const returned: Recipe[] = Array.isArray(data) ? data : (data.recipes ?? []);
      if (!returned || returned.length === 0) {
        throw new Error('No recipes returned');
      }
      setRecipes(returned.map(r => ({ ...r, liked: false })));
      setCurrentStep('results');
    } catch (error) {
      console.error('Error getting recipes:', error);
      // fallback demo recipes
      const demoRecipes: Recipe[] = [
        { id: 'r1', title: 'Garlic Chicken & Rice', description: 'Savory roasted chicken with garlic and steamed rice', ingredients: ['chicken', 'rice', 'garlic'], liked: false, nutrition: { calories: 520, protein: '35g', carbs: '50g', fat: '18g' } },
        { id: 'r2', title: 'Stir-fried Broccoli', description: 'Quick stir-fry with broccoli and soy glaze', ingredients: ['broccoli', 'soy sauce'], liked: false, nutrition: { calories: 220, protein: '6g', carbs: '14g', fat: '12g' } },
        { id: 'r3', title: 'Chicken Fried Rice', description: 'Classic fried rice with chicken and veggies', ingredients: ['chicken', 'rice', 'eggs'], liked: false, nutrition: { calories: 610, protein: '28g', carbs: '72g', fat: '20g' } },
      ];
      setRecipes(demoRecipes);
      setCurrentStep('results');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLike = (id: string) => {
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, liked: !r.liked } : r));
  };

  const deleteRecipe = (id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
  };

  const resetApp = () => {
    setCurrentStep('home');
    setSelectedImage(null);
    setIngredients([]);
    setConfirmedIngredients([]);
    setUserProfile({ height: '', weight: '', goal: '' });
  };

  const handleLogin = (user: { email?: string; name?: string }) => {
    if (user.email) setUserEmail(user.email);
    setCurrentStep('upload');
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
                      onClick={() => setSelectedImage(null)}
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

              {/* Manual add ingredient */}
              <div className="mb-6 max-w-md mx-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">Add ingredient manually</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualIngredient}
                    onChange={(e) => setManualIngredient(e.target.value)}
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
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                    <ChefHat className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Your Personalized Recipes</h2>
                    <p className="text-gray-600 mt-1 text-sm">Based on your {confirmedIngredients.length} ingredients and your {userProfile.goal} goal</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={resetApp} className="px-4 py-2 bg-white text-emerald-600 border border-emerald-200 rounded-md hover:bg-emerald-50 transition-all">Start Over</button>
                </div>
              </div>

              {recipes.length === 0 ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8 text-center">
                  <p className="text-emerald-800">🎉 No recipes found yet.</p>
                  <p className="text-sm text-emerald-700 mt-2">Try refining ingredients or add more items.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {recipes.map((r) => (
                    <div key={r.id} className="bg-white rounded-xl shadow p-4 flex flex-col">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{r.title}</h3>
                          {r.description && <p className="text-sm text-gray-600 mb-3">{r.description}</p>}
                          {r.ingredients && (
                            <div className="text-sm text-gray-700 mb-3">
                              <span className="font-medium">Ingredients:</span> {r.ingredients.join(', ')}
                            </div>
                          )}

                          {r.nutrition && (
                            <div className="mt-2 p-3 bg-gray-50 border border-gray-100 rounded-md text-sm text-gray-700">
                              <div className="font-medium mb-2">Nutrition (per serving)</div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {r.nutrition.calories !== undefined && <div>Calories: <span className="font-semibold">{r.nutrition.calories}</span></div>}
                                {r.nutrition.protein && <div>Protein: <span className="font-semibold">{r.nutrition.protein}</span></div>}
                                {r.nutrition.carbs && <div>Carbs: <span className="font-semibold">{r.nutrition.carbs}</span></div>}
                                {r.nutrition.fat && <div>Fat: <span className="font-semibold">{r.nutrition.fat}</span></div>}
                              </div>
                            </div>
                          )}
                        </div>
                      <div className="mt-3 flex items-center justify-between">
                        <button onClick={() => toggleLike(r.id)} className={`flex items-center gap-2 px-3 py-1 rounded-md font-medium transition-all ${r.liked ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-600 border border-emerald-200'}`}>
                          <Heart className="w-4 h-4" />
                          {r.liked ? 'Liked' : 'Like'}
                        </button>
                        <button onClick={() => deleteRecipe(r.id)} className="flex items-center gap-2 px-3 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-all">
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}