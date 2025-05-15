const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const User = require('./models/User');
const Recipe = require('./models/Recipe');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/recipe-ai', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Signup
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(200).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    res.status(200).json({ message: 'Login successful', userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recipes for a specific user
app.get('/api/recipes/:userId', async (req, res) => {
  try {
    const recipes = await Recipe.find({ userId: req.params.userId });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new recipe
app.post("/api/recipes/add", async (req, res) => {
  try {
    const { name, ingredients, instructions, missingIngredients, userId, isAI } = req.body;

    if (!name || !ingredients || !userId) {
      return res.status(400).json({ error: "Missing name, ingredients, or userId" });
    }

    const recipe = new Recipe({
      name,
      ingredients,
      instructions: instructions || '',
      missingIngredients: missingIngredients || [],
      userId,
      isAI: isAI || false
    });

    await recipe.save();

    res.status(200).json(recipe);
  } catch (error) {
    console.error("Error saving recipe:", error);
    res.status(500).json({ error: "Failed to add recipe" });
  }
});

// Generate a recipe based on ingredients
app.post('/api/recipes/generate', async (req, res) => {
  try {
    const { ingredients, userId } = req.body;
    
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ message: 'Invalid ingredients' });
    }
    
    // Recipe database for matching
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
        ingredients.some(userIng => userIng.includes(reqIng))
      );
    });
    
    let generatedRecipe;
    
    if (matchingRecipes.length === 0) {
      // If no match, return a default recipe
      generatedRecipe = {
        name: "Simple Toast",
        ingredients: ["bread", "butter"],
        instructions: "Toast bread and spread butter on it.",
        missingIngredients: ["bread", "butter"].filter(ing => 
          !ingredients.some(userIng => userIng.includes(ing))
        ),
        isAI: true
      };
    } else {
      // Select the best matching recipe (first one for simplicity)
      const selectedRecipe = matchingRecipes[0];
      
      // Determine missing ingredients
      const missingIngredients = selectedRecipe.ingredients.filter(ing => 
        !ingredients.some(userIng => userIng.includes(ing.toLowerCase()))
      );
      
      generatedRecipe = {
        name: selectedRecipe.name,
        ingredients: selectedRecipe.ingredients,
        instructions: selectedRecipe.instructions,
        missingIngredients: missingIngredients,
        isAI: true
      };
    }
    
    res.json(generatedRecipe);
    
  } catch (error) {
    console.error("Error generating recipe:", error);
    res.status(500).json({ message: "Failed to generate recipe" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
