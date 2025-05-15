const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');

// Add new recipe
router.post('/add', async (req, res) => {
  try {
    const { name, ingredients, userId, isAI, instructions, missingIngredients } = req.body;
    const newRecipe = new Recipe({ 
      name, 
      ingredients, 
      userId, 
      isAI: isAI || false,
      instructions: instructions || '',
      missingIngredients: missingIngredients || []
    });
    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (error) {
    console.error('Error adding recipe:', error);
    res.status(500).json({ error: 'Failed to add recipe' });
  }
});

// Get recipes for a user
router.get('/:userId', async (req, res) => {
  try {
    const recipes = await Recipe.find({ userId: req.params.userId });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// Generate AI recipe based on user ingredients
router.post('/generate', async (req, res) => {
  try {
    const { ingredients, userId } = req.body;
    
    if (!ingredients || !ingredients.length) {
      return res.status(400).json({ error: 'Ingredients are required' });
    }

    // Simple AI recipe generation logic
    // In a real app, this would call an AI service like OpenAI
    const availableIngredients = ingredients.map(ing => ing.toLowerCase().trim());
    
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
        availableIngredients.some(userIng => userIng.includes(reqIng))
      );
    });
    
    if (matchingRecipes.length === 0) {
      return res.status(404).json({ 
        error: 'No recipes found with your ingredients',
        suggestion: 'Try adding more common ingredients like eggs, chicken, or vegetables'
      });
    }
    
    // Select the best matching recipe (first one for simplicity)
    const selectedRecipe = matchingRecipes[0];
    
    // Determine missing ingredients
    const missingIngredients = selectedRecipe.ingredients.filter(ing => 
      !availableIngredients.some(userIng => userIng.includes(ing.toLowerCase()))
    );
    
    // Return the generated recipe
    res.json({
      name: selectedRecipe.name,
      ingredients: selectedRecipe.ingredients,
      instructions: selectedRecipe.instructions,
      missingIngredients: missingIngredients,
      isAI: true
    });
    
  } catch (error) {
    console.error('Error generating recipe:', error);
    res.status(500).json({ error: 'Failed to generate recipe' });
  }
});

module.exports = router;
