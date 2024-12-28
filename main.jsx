import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, X, ChevronsUpDown, ExternalLink } from 'lucide-react';

const RecipeFinder = () => {
  const [ingredients, setIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const addIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim().toLowerCase())) {
      const newIngredients = [...ingredients, currentIngredient.trim().toLowerCase()];
      setIngredients(newIngredients);
      setCurrentIngredient('');
      findRecipes(newIngredients);
    }
  };

  const removeIngredient = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
    findRecipes(newIngredients);
  };

  const findRecipes = async (ingredientList) => {
    if (ingredientList.length === 0) {
      setRecipes([]);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Format ingredients for API query
      const query = ingredientList.join(',');
      const appId = 'YOUR_APP_ID'; // You'll need to replace these with actual Edamam API credentials
      const appKey = 'YOUR_APP_KEY';
      
      const response = await fetch(
        `https://api.edamam.com/api/recipes/v2?type=public&q=${query}&app_id=${appId}&app_key=${appKey}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }

      const data = await response.json();
      
      // Transform API response into our recipe format
      const formattedRecipes = data.hits.map(hit => ({
        id: hit.recipe.uri,
        name: hit.recipe.label,
        ingredients: hit.recipe.ingredientLines,
        image: hit.recipe.image,
        url: hit.recipe.url,
        source: hit.recipe.source,
        calories: Math.round(hit.recipe.calories),
        servings: hit.recipe.yield,
        dietLabels: hit.recipe.dietLabels,
        healthLabels: hit.recipe.healthLabels
      }));

      setRecipes(formattedRecipes);
    } catch (err) {
      setError('Error fetching recipes. Please try again later.');
      console.error('Recipe fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Recipe Finder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Ingredient Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={currentIngredient}
                onChange={(e) => setCurrentIngredient(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                placeholder="Enter an ingredient"
                className="flex-1 p-2 border rounded"
              />
              <button
                onClick={addIngredient}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Ingredients List */}
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ingredient, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-2"
                >
                  {ingredient}
                  <button
                    onClick={() => removeIngredient(index)}
                    className="hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-center">
                {error}
              </div>
            )}

            {/* Recipes List */}
            <div className="space-y-6 mt-6">
              {isLoading ? (
                <div className="text-center">
                  <ChevronsUpDown className="w-6 h-6 animate-bounce mx-auto" />
                  <p>Finding recipes...</p>
                </div>
              ) : recipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recipes.map((recipe) => (
                    <div key={recipe.id} className="border rounded-lg overflow-hidden">
                      {recipe.image && (
                        <img
                          src="/api/placeholder/400/200"
                          alt={recipe.name}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-lg">{recipe.name}</h3>
                        <p className="text-sm text-gray-600">
                          {recipe.source} • {recipe.calories} cal • {recipe.servings} servings
                        </p>
                        
                        {/* Diet and Health Labels */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {recipe.dietLabels.map(label => (
                            <span key={label} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              {label}
                            </span>
                          ))}
                          {recipe.healthLabels.slice(0, 3).map(label => (
                            <span key={label} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {label}
                            </span>
                          ))}
                        </div>

                        {/* Ingredients Preview */}
                        <div className="mt-3">
                          <h4 className="font-semibold">Ingredients:</h4>
                          <ul className="text-sm mt-1">
                            {recipe.ingredients.slice(0, 4).map((ingredient, idx) => (
                              <li key={idx}>{ingredient}</li>
                            ))}
                            {recipe.ingredients.length > 4 && (
                              <li className="text-gray-500">
                                +{recipe.ingredients.length - 4} more ingredients
                              </li>
                            )}
                          </ul>
                        </div>

                        {/* View Recipe Link */}
                        <a
                          href={recipe.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center text-blue-500 hover:text-blue-700"
                        >
                          View Full Recipe
                          <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : ingredients.length > 0 ? (
                <p className="text-center text-gray-600">
                  No recipes found with these ingredients. Try adding more!
                </p>
              ) : (
                <p className="text-center text-gray-600">
                  Add some ingredients to find matching recipes!
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecipeFinder;
