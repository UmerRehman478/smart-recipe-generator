const API_BASE_URL = 'http://127.0.0.1:8000/api';

export interface Ingredient {
  name: string;
  confidence: number;
  raw_labels: string[];
}

export interface RecognizeResponse {
  ingredients: Ingredient[];
}

export interface RecommendRequest {
  ingredients: string[];
  max_missing?: number;
  limit?: number;
}

export interface RecipeRecommendation {
  id: number;
  title: string;
  minutes: number;
  calories: number | null;
  match_count: number;
  missing_count: number;
  score: number;
}

export interface RecommendResponse {
  results: RecipeRecommendation[];
}

export interface RecipeDetail {
  id: number;
  title: string;
  minutes: number;
  calories: number | null;
  fat_g: number | null;
  sugar_g: number | null;
  sodium_mg: number | null;
  protein_g: number | null;
  sat_fat_g: number | null;
  carbs_g: number | null;
  n_steps: number;
  steps: string[];
  ingredients: Array<{
    raw: string;
    norm: string;
  }>;
  generated_measurements: Array<{
    ingredient: string;
    grams: number;
  }>;
}

// 1. RECOGNIZE INGREDIENTS (Upload Step)
export async function recognizeIngredients(imageFile: File): Promise<RecognizeResponse> {
  const formData = new FormData();
  formData.append('file', imageFile);

  const response = await fetch(`${API_BASE_URL}/recognize`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to recognize ingredients: ${response.statusText}`);
  }

  return response.json();
}

// 2. GET RECOMMENDATIONS (Ingredients Step)
export async function getRecommendations(request: RecommendRequest): Promise<RecommendResponse> {
  const response = await fetch(`${API_BASE_URL}/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ingredients: request.ingredients,
      max_missing: request.max_missing ?? 3,
      limit: request.limit ?? 20,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get recommendations: ${response.statusText}`);
  }

  return response.json();
}

// 3. GET BASIC RECIPE DETAILS (No measurements - for recipes1 tab)
export async function getRecipeBasic(recipeId: number): Promise<Omit<RecipeDetail, 'generated_measurements'>> {
  const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to get recipe: ${response.statusText}`);
  }

  return response.json();
}

// 4. GET RECIPE DETAILS WITH MEASUREMENTS (Final Recipe Step)
export async function getRecipeWithMeasurements(
  recipeId: number, 
  userInfo: { height_cm: string; weight_kg: string; goal: string }
): Promise<RecipeDetail> {
  const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}/user_measurements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      height_cm: parseFloat(userInfo.height_cm),
      weight_kg: parseFloat(userInfo.weight_kg),
      goal: userInfo.goal,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get recipe details: ${response.statusText}`);
  }

  return response.json();
}