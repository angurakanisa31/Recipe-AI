import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RecipeGenerator = ({ setIsGenerated, setGroceryNeeded, addRecipe }) => {
  const [ingredients, setIngredients] = useState('');
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const navigate = useNavigate();
  
  const userId = localStorage.getItem('userId');
  
  useEffect(() => {
    if (!userId) {
      navigate('/login');
    }
  }, [userId, navigate]);

  const handleGenerateRecipe = async () => {
    setError('');
    setGeneratedRecipe(null);
    setLoading(true);

    if (!ingredients.trim()) {
      setError('Please enter some ingredients.');
      setLoading(false);
      return;
    }

    try {
      
      const userIngredients = ingredients
        .split(',')
        .map(i => i.trim().toLowerCase())
        .filter(i => i); 
      
      console.log('Sending ingredients to server:', userIngredients);
      
      
      let recipeData;
      
      try {
        
        const response = await fetch('http://localhost:5000/api/recipes/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ingredients: userIngredients,
            userId
          }),
        });
        
        if (!response.ok) {
          throw new Error('Server returned an error');
        }
        
        recipeData = await response.json();
      } catch (serverError) {
        console.warn('Server connection failed, using fallback data:', serverError);
        
        // Fallback to local recipe generation if server is unavailable
        recipeData = generateLocalRecipe(userIngredients);
      }
      
      console.log('Recipe data:', recipeData);
      setGeneratedRecipe(recipeData);
      
      // If there are missing ingredients, set the flag
      if (recipeData.missingIngredients && recipeData.missingIngredients.length > 0) {
        setGroceryNeeded(true);
        // Store missing ingredients for grocery list
        localStorage.setItem('missingIngredients', JSON.stringify(recipeData.missingIngredients));
      }
      
      // Automatically save the recipe after generation
      await saveRecipe(recipeData);
      
    } catch (err) {
      console.error('Error in recipe generation process:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Local recipe generation function as fallback
  const generateLocalRecipe = (userIngredients) => {
    console.log('Generating recipe locally with ingredients:', userIngredients);
    
    // Helper to normalize ingredient names (lowercase, trim, singularize)
    const normalizeIngredient = (ing) => {
      if (!ing) return '';
      let s = ing.toLowerCase().trim();
      if (s.endsWith('ies')) {
        s = s.slice(0, -3) + 'y';
      } else if (s.endsWith('es') && !s.endsWith('cheese')) {
        s = s.slice(0, -2);
      } else if (s.endsWith('s') && s.length > 3 && s !== 'pasta') {
        s = s.slice(0, -1);
      }
      return s;
    };

    // Expanded local recipe database (15+ recipes)
    const expandedRecipeDatabase = [
      {
        name: "Bread Omelet",
        ingredients: ["bread", "eggs", "onions", "green chilies", "butter", "salt", "pepper"],
        instructions: "Whisk eggs with chopped onions, green chilies, salt, and pepper. Pour into a hot buttered pan. Place bread slices on top, flip, and cook until done. Fold the omelet over the bread.",
        requiredIngredients: ["bread", "eggs"]
      },
      {
        name: "French Toast",
        ingredients: ["bread", "eggs", "milk", "sugar", "butter", "cinnamon"],
        instructions: "Whisk eggs, milk, sugar, and cinnamon in a bowl. Dip bread slices in the mixture. Cook on a hot buttered pan until golden brown on both sides.",
        requiredIngredients: ["bread", "eggs", "milk"]
      },
      {
        name: "Egg Sandwich",
        ingredients: ["bread", "eggs", "butter", "mayonnaise", "salt", "pepper"],
        instructions: "Boil or fry eggs. Butter bread slices, spread mayonnaise, and layer with eggs, salt, and pepper.",
        requiredIngredients: ["bread", "eggs"]
      },
      {
        name: "Cheese Sandwich",
        ingredients: ["bread", "cheese", "butter"],
        instructions: "Place cheese slices between buttered bread slices. Toast on a pan until bread is golden and cheese is melted.",
        requiredIngredients: ["bread", "cheese"]
      },
      {
        name: "Scrambled Eggs",
        ingredients: ["eggs", "butter", "salt", "pepper", "milk"],
        instructions: "Beat eggs with milk, salt and pepper. Melt butter in pan and cook eggs until scrambled.",
        requiredIngredients: ["eggs"]
      },
      {
        name: "Pasta Carbonara",
        ingredients: ["pasta", "eggs", "bacon", "parmesan cheese", "black pepper", "salt"],
        instructions: "Cook pasta. Fry bacon. Mix eggs with cheese. Combine all ingredients.",
        requiredIngredients: ["pasta", "eggs"]
      },
      {
        name: "Tomato Pasta",
        ingredients: ["pasta", "tomatoes", "garlic", "olive oil", "basil", "salt", "parmesan cheese"],
        instructions: "Cook pasta. Sauté minced garlic in olive oil, add crushed tomatoes and cook down. Toss pasta with the sauce, salt, and basil. Top with parmesan.",
        requiredIngredients: ["pasta", "tomatoes"]
      },
      {
        name: "Chicken Curry",
        ingredients: ["chicken", "curry powder", "onions", "garlic", "coconut milk", "tomatoes", "rice"],
        instructions: "Sauté onions and garlic. Add chicken and curry powder. Add tomatoes and coconut milk. Simmer until chicken is cooked. Serve with rice.",
        requiredIngredients: ["chicken", "curry powder"]
      },
      {
        name: "Chicken Fried Rice",
        ingredients: ["rice", "chicken", "eggs", "soy sauce", "garlic", "vegetable oil", "carrots", "peas"],
        instructions: "Cook rice and let cool. Sauté garlic and diced chicken in oil. Add carrots and peas. Push to side, scramble eggs, then toss in rice and soy sauce.",
        requiredIngredients: ["rice", "chicken"]
      },
      {
        name: "Egg Fried Rice",
        ingredients: ["rice", "eggs", "soy sauce", "garlic", "vegetable oil", "onions", "peas"],
        instructions: "Cook rice and let cool. Sauté garlic and onions in oil. Scramble eggs in the pan, toss in the rice, peas, and soy sauce.",
        requiredIngredients: ["rice", "eggs"]
      },
      {
        name: "Vegetable Stir Fry",
        ingredients: ["bell peppers", "broccoli", "carrots", "soy sauce", "garlic", "ginger", "vegetable oil", "rice"],
        instructions: "Chop vegetables. Heat oil and stir fry vegetables with garlic and ginger. Add soy sauce. Serve with rice.",
        requiredIngredients: ["bell peppers", "broccoli", "carrots"]
      },
      {
        name: "Fruit Smoothie",
        ingredients: ["banana", "strawberries", "yogurt", "honey", "ice"],
        instructions: "Blend all ingredients until smooth.",
        requiredIngredients: ["banana", "strawberries"]
      },
      {
        name: "Banana Milkshake",
        ingredients: ["banana", "milk", "sugar", "ice cream", "ice"],
        instructions: "Blend banana, milk, sugar, and ice until smooth. Optionally top with a scoop of ice cream.",
        requiredIngredients: ["banana", "milk"]
      },
      {
        name: "Pancakes",
        ingredients: ["flour", "milk", "eggs", "butter", "sugar", "baking powder", "maple syrup"],
        instructions: "Whisk dry ingredients together. Whisk wet ingredients, combine, and pour batter onto a hot greased griddle. Flip when bubbles form and cook until golden. Serve with maple syrup.",
        requiredIngredients: ["flour", "milk", "eggs"]
      },
      {
        name: "French Fries",
        ingredients: ["potatoes", "vegetable oil", "salt"],
        instructions: "Cut potatoes into sticks. Soak in cold water, dry, and deep fry in hot oil until golden brown. Drain and toss with salt.",
        requiredIngredients: ["potatoes"]
      }
    ];

    const normalizedUserIngredients = userIngredients.map(ing => normalizeIngredient(ing));
    
    // Find matching recipes based on requiredIngredients (all must be met)
    const matchingRecipes = expandedRecipeDatabase.filter(recipe => {
      return recipe.requiredIngredients.every(reqIng => {
        const normalizedReqIng = normalizeIngredient(reqIng);
        return normalizedUserIngredients.some(userIng => 
          userIng.includes(normalizedReqIng) || normalizedReqIng.includes(userIng)
        );
      });
    });
    
    if (matchingRecipes.length === 0) {
      const hasBread = normalizedUserIngredients.some(ing => ing.includes('bread'));
      if (hasBread) {
        return {
          name: "Simple Toast",
          ingredients: ["bread", "butter"],
          instructions: "Toast bread and spread butter on it.",
          missingIngredients: ["butter"],
          isAI: true
        };
      } else {
        return {
          name: "Scrambled Eggs",
          ingredients: ["eggs", "butter", "salt", "pepper", "milk"],
          instructions: "Beat eggs with milk, salt and pepper. Melt butter in pan and cook eggs until scrambled.",
          missingIngredients: ["butter", "salt", "pepper", "milk"],
          isAI: true
        };
      }
    }
    
    // Score matching recipes
    const scoredRecipes = matchingRecipes.map(recipe => {
      let matchedCount = 0;
      
      recipe.ingredients.forEach(recipeIng => {
        const normalizedRecipeIng = normalizeIngredient(recipeIng);
        const isMatched = normalizedUserIngredients.some(userIng => 
          userIng.includes(normalizedRecipeIng) || normalizedRecipeIng.includes(userIng)
        );
        if (isMatched) {
          matchedCount++;
        }
      });
      
      let matchedRequiredCount = 0;
      recipe.requiredIngredients.forEach(reqIng => {
        const normalizedReqIng = normalizeIngredient(reqIng);
        const isMatched = normalizedUserIngredients.some(userIng => 
          userIng.includes(normalizedReqIng) || normalizedReqIng.includes(userIng)
        );
        if (isMatched) {
          matchedRequiredCount++;
        }
      });
      
      const score = (matchedRequiredCount * 10) + matchedCount;
      return { recipe, score };
    });
    
    scoredRecipes.sort((a, b) => b.score - a.score);
    const selectedRecipe = scoredRecipes[0].recipe;
    
    // Determine missing ingredients
    const missingIngredients = selectedRecipe.ingredients.filter(recipeIng => {
      const normalizedRecipeIng = normalizeIngredient(recipeIng);
      const isMatched = normalizedUserIngredients.some(userIng => 
        userIng.includes(normalizedRecipeIng) || normalizedRecipeIng.includes(userIng)
      );
      return !isMatched;
    });
    
    return {
      name: selectedRecipe.name,
      ingredients: selectedRecipe.ingredients,
      instructions: selectedRecipe.instructions,
      missingIngredients: missingIngredients,
      isAI: true
    };
  };
  
  const saveRecipe = async (recipe) => {
    if (!recipe) return;
    
    setSaveLoading(true);
    
    try {
      console.log('Saving recipe:', recipe);
      
      // Try to save to server, but have a fallback if server is unavailable
      let savedRecipe;
      
      try {
        const response = await fetch('http://localhost:5000/api/recipes/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: recipe.name,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            missingIngredients: recipe.missingIngredients,
            userId,
            isAI: true
          }),
        });
        
        if (!response.ok) {
          throw new Error('Server returned an error');
        }
        
        savedRecipe = await response.json();
      } catch (serverError) {
        console.warn('Server connection failed when saving, using local data:', serverError);
        
        // Create a local version of the saved recipe
        savedRecipe = {
          ...recipe,
          _id: 'local-' + Date.now(), // Generate a temporary ID
          userId: userId
        };
        
        // Store in localStorage as a fallback
        const localRecipes = JSON.parse(localStorage.getItem('localRecipes') || '[]');
        localRecipes.push(savedRecipe);
        localStorage.setItem('localRecipes', JSON.stringify(localRecipes));
      }
      
      console.log('Recipe saved:', savedRecipe);
      
      // Update app state
      if (typeof setIsGenerated === 'function') {
        setIsGenerated(true);
      }
      
      // If addRecipe function exists, call it
      if (typeof addRecipe === 'function') {
        addRecipe(savedRecipe);
      }
      
    } catch (err) {
      console.error('Error in save recipe process:', err);
      setError('An error occurred while saving. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };
  
  const handleViewGroceryList = () => {
    navigate('/grocery');
  };
  
  const handleViewRecipes = () => {
    navigate('/add');
  };

  return (
    <div className="container">
      <h2>AI Recipe Generator</h2>
      <p>Enter ingredients you have, separated by commas</p>
      <textarea
        value={ingredients}
        onChange={e => setIngredients(e.target.value)}
        placeholder="e.g. chicken, rice, onions, garlic"
        rows={4}
      />
      <button 
        onClick={handleGenerateRecipe} 
        disabled={loading || !ingredients.trim()}
      >
        {loading ? 'Generating...' : 'Generate Recipe'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {generatedRecipe && (
        <div className="recipe-details">
          <h3>{generatedRecipe.name}</h3>
          
          <h4>Ingredients:</h4>
          <ul>
            {generatedRecipe.ingredients.map((ing, idx) => (
              <li key={idx}>{ing}</li>
            ))}
          </ul>
          
          <h4>Instructions:</h4>
          <p>{generatedRecipe.instructions}</p>

          {generatedRecipe.missingIngredients && generatedRecipe.missingIngredients.length > 0 && (
            <div className="missing-ingredients">
              <h4>Missing Ingredients:</h4>
              <ul>
                {generatedRecipe.missingIngredients.map((ing, idx) => (
                  <li key={idx}>{ing}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {generatedRecipe.missingIngredients && generatedRecipe.missingIngredients.length > 0 ? (
              <button onClick={handleViewGroceryList}>
                View Grocery List
              </button>
            ) : (
              <button onClick={handleViewRecipes}>
                View My Recipes
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeGenerator;
