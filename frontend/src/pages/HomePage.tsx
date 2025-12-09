import React from 'react';
import { ChefHat, Camera, Sparkles, TrendingUp, Heart } from 'lucide-react';

interface HomePageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export default function HomePage({ onGetStarted, onSignIn }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-gray-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChefHat className="w-8 h-8 text-emerald-600" />
              <span className="text-xl font-bold text-gray-900">Smart Recipe Generator</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onSignIn}
                className="px-5 py-2 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition-all"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          AI-Powered Nutrition Planning
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Turn Your Ingredients Into
          <span className="text-emerald-600"> Personalized Recipes</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
          Upload a photo of your fridge, and we'll generate custom recipes tailored to your health goals using AI-powered ingredient recognition and nutrition planning.
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-semibold text-lg hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl"
          >
            Start Cooking Smart
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How It Works
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100">
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
              <Camera className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              1. Upload Photo
            </h3>
            <p className="text-gray-600">
              Take a photo of your fridge or pantry. Our AI will identify all your ingredients instantly.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100">
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
              <Heart className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              2. Set Your Goals
            </h3>
            <p className="text-gray-600">
              Tell us your height, weight, and whether you want to lose, maintain, or gain weight.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100">
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
              <TrendingUp className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              3. Get Personalized Recipes
            </h3>
            <p className="text-gray-600">
              Receive custom recipes with adjusted portions and nutrition info tailored to your goals.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-12">Powered by Advanced AI</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-5xl font-bold mb-2">230K+</div>
              <div className="text-emerald-100">Recipes in Database</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">95%</div>
              <div className="text-emerald-100">Ingredient Accuracy</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">AI</div>
              <div className="text-emerald-100">Gemini Vision Powered</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
          Ready to Cook Smarter?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Start your personalized recipe journey today
        </p>
        <button
          onClick={onGetStarted}
          className="px-10 py-4 bg-emerald-600 text-white rounded-xl font-semibold text-lg hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl"
        >
          Get Started Now
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ChefHat className="w-6 h-6 text-emerald-500" />
            <span className="text-white font-semibold">Smart Recipe Generator</span>
          </div>
          <p className="text-sm">
            CPSC 571 Project - University of Calgary
          </p>
          <p className="text-xs mt-2">
            Michael Zhai • Umer Rehman • Hamzah Niazi
          </p>
        </div>
      </footer>
    </div>
  );
}