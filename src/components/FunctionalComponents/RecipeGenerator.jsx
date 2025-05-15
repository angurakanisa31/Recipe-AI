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
      // Parse user ingredients
      const userIngredients = ingredients
        .split(',')
        .map(i => i.trim().toLowerCase())
        .filter(i => i); // Remove any empty strings
      
      console.log('Sending ingredients to server:', userIngredients);
      
      // For demo purposes, we'll use a simulated response if the server is not available
      let recipeData;
      
      try {
        // Try to connect to the real server first
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
    
    // Predefined recipes database (simplified for demo)
    const recipeDatabase = [
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
        name: "Vegetable Stir Fry",
        ingredients: ["bell peppers", "broccoli", "carrots", "soy sauce", "garlic", "ginger", "vegetable oil", "rice"],
        instructions: "Chop vegetables. Heat oil and stir fry vegetables with garlic and ginger. Add soy sauce. Serve with rice.",
        requiredIngredients: ["bell peppers", "broccoli", "carrots"]
      },
      {
        name: "Chicken Curry",
        ingredients: ["chicken", "curry powder", "onions", "garlic", "coconut milk", "tomatoes", "rice"],
        instructions: "Sauté onions and garlic. Add chicken and curry powder. Add tomatoes and coconut milk. Simmer until chicken is cooked. Serve with rice.",
        requiredIngredients: ["chicken", "curry powder"]
      },
      {
        name: "Fruit Smoothie",
        ingredients: ["banana", "strawberries", "yogurt", "honey", "ice"],
        instructions: "Blend all ingredients until smooth.",
        requiredIngredients: ["banana", "strawberries"]
      }
    ];
    
    // Find matching recipes
    const matchingRecipes = recipeDatabase.filter(recipe => {
      // Check if at least one required ingredient is available
      return recipe.requiredIngredients.some(reqIng => 
        userIngredients.some(userIng => userIng.includes(reqIng))
      );
    });
    
    if (matchingRecipes.length === 0) {
      // If no match, return a default recipe
      return {
        name: "Simple Toast",
        ingredients: ["bread", "butter"],
        instructions: "Toast bread and spread butter on it.",
        missingIngredients: ["bread", "butter"].filter(ing => 
          !userIngredients.some(userIng => userIng.includes(ing))
        ),
        isAI: true
      };
    }
    
    // Select the best matching recipe (first one for simplicity)
    const selectedRecipe = matchingRecipes[0];
    
    // Determine missing ingredients
    const missingIngredients = selectedRecipe.ingredients.filter(ing => 
      !userIngredients.some(userIng => userIng.includes(ing.toLowerCase()))
    );
    
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
