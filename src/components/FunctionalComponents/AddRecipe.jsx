import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AddRecipe = ({ onRecipeAdded, recipes: initialRecipes = [] }) => {
  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [recipes, setRecipes] = useState(initialRecipes);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingRecipe, setAddingRecipe] = useState(false);
  const navigate = useNavigate();

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      navigate('/login');
    } else {
      const fetchRecipes = async () => {
        setLoading(true);
        setError('');
        
        try {
          // Try to fetch from server
          let recipesData = [];
          
          try {
            const res = await fetch(`http://localhost:5000/api/recipes/${userId}`);
            if (res.ok) {
              recipesData = await res.json();
            } else {
              throw new Error('Server returned an error');
            }
          } catch (serverError) {
            console.warn('Server connection failed when fetching recipes:', serverError);
            
            // Fallback to local storage
            const localRecipes = JSON.parse(localStorage.getItem('localRecipes') || '[]');
            recipesData = localRecipes.filter(recipe => recipe.userId === userId);
            
            console.log('Using local recipes:', recipesData);
          }
          
          // Combine with any initial recipes passed as props
          const combinedRecipes = [...initialRecipes];
          
          // Add server/local recipes that aren't already in the list
          recipesData.forEach(recipe => {
            if (!combinedRecipes.some(r => r._id === recipe._id)) {
              combinedRecipes.push(recipe);
            }
          });
          
          setRecipes(combinedRecipes);
        } catch (err) {
          console.error('Failed to fetch recipes:', err);
          setError('Failed to load recipes. Please try again later.');
        } finally {
          setLoading(false);
        }
      };

      fetchRecipes();
    }
  }, [userId, navigate, initialRecipes]);

  const handleAddRecipe = async () => {
    if (!recipeName.trim()) {
      setError('Please enter a recipe name.');
      return;
    }
    
    if (!ingredients.trim()) {
      setError('Please enter ingredients.');
      return;
    }

    setError('');
    setAddingRecipe(true);

    try {
      const ingredientsList = ingredients.split(',').map((ing) => ing.trim()).filter(ing => ing);
      let newRecipe;
      
      try {
        // Try to save to server
        const res = await fetch('http://localhost:5000/api/recipes/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: recipeName,
            ingredients: ingredientsList,
            instructions: instructions,
            userId,
            isAI: false,
            missingIngredients: []
          }),
        });

        if (res.ok) {
          newRecipe = await res.json();
        } else {
          throw new Error('Server returned an error');
        }
      } catch (serverError) {
        console.warn('Server connection failed when adding recipe:', serverError);
        
        // Create a local version of the recipe
        newRecipe = {
          _id: 'local-' + Date.now(),
          name: recipeName,
          ingredients: ingredientsList,
          instructions: instructions,
          userId,
          isAI: false,
          missingIngredients: []
        };
        
        // Store in localStorage
        const localRecipes = JSON.parse(localStorage.getItem('localRecipes') || '[]');
        localRecipes.push(newRecipe);
        localStorage.setItem('localRecipes', JSON.stringify(localRecipes));
      }
      
      // Update UI
      setRecipes([...recipes, newRecipe]);
      setRecipeName('');
      setIngredients('');
      setInstructions('');
      
      // Notify parent component
      if (typeof onRecipeAdded === 'function') {
        onRecipeAdded(newRecipe);
      }
      
    } catch (err) {
      console.error('Error adding recipe:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setAddingRecipe(false);
    }
  };

  const handleViewRecipe = (recipe) => {
    // Show recipe details in a more user-friendly way
    const recipeDetails = document.createElement('div');
    recipeDetails.innerHTML = `
      <h3>${recipe.name}</h3>
      <h4>Ingredients:</h4>
      <ul>
        ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
      </ul>
      ${recipe.instructions ? `<h4>Instructions:</h4><p>${recipe.instructions}</p>` : ''}
      ${recipe.missingIngredients && recipe.missingIngredients.length > 0 ? 
        `<h4>Missing Ingredients:</h4>
        <ul>${recipe.missingIngredients.map(ing => `<li>${ing}</li>`).join('')}</ul>` : ''}
    `;
    
    const existingModal = document.getElementById('recipe-modal');
    if (existingModal) {
      document.body.removeChild(existingModal);
    }
    
    const modal = document.createElement('div');
    modal.id = 'recipe-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'white';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.maxWidth = '500px';
    modalContent.style.width = '90%';
    modalContent.style.maxHeight = '80vh';
    modalContent.style.overflow = 'auto';
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.marginTop = '20px';
    closeButton.style.padding = '8px 16px';
    closeButton.style.backgroundColor = '#ff6f61';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    
    closeButton.onclick = () => {
      document.body.removeChild(modal);
    };
    
    modalContent.appendChild(recipeDetails);
    modalContent.appendChild(closeButton);
    modal.appendChild(modalContent);
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.onclick = (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    };
  };

  return (
    <div className="container">
      <h2>My Recipe Collection</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <div style={{ 
        marginBottom: '2rem', 
        padding: '1.5rem', 
        backgroundColor: '#f8f8f8', 
        borderRadius: '8px' 
      }}>
        <h3>Add New Recipe</h3>
        <input
          type="text"
          placeholder="Recipe Name"
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
          style={{ marginBottom: '1rem', width: '100%' }}
        />
        <textarea
          placeholder="Ingredients (comma separated)"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          rows={3}
          style={{ marginBottom: '1rem', width: '100%' }}
        />
        <textarea
          placeholder="Instructions (Optional)"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={4}
          style={{ marginBottom: '1rem', width: '100%' }}
        />
        <button 
          onClick={handleAddRecipe} 
          disabled={addingRecipe || !recipeName.trim() || !ingredients.trim()}
          style={{ width: '100%' }}
        >
          {addingRecipe ? 'Adding...' : 'Add Recipe'}
        </button>
      </div>
      
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Your Recipes</h3>
          <Link to="/generate">
            <button style={{ backgroundColor: '#ff6f61' }}>
              Generate New Recipe
            </button>
          </Link>
        </div>
        
        {loading && <p>Loading recipes...</p>}
        
        {!loading && recipes.length === 0 && (
          <div style={{ 
            padding: '2rem', 
            backgroundColor: '#f8f8f8', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p>You haven't added any recipes yet. Add your first recipe above or generate one!</p>
          </div>
        )}
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '1rem'
        }}>
          {recipes.map((recipe, index) => (
            <div 
              key={index} 
              style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px',
                padding: '1rem',
                cursor: 'pointer',
                backgroundColor: recipe.isAI ? '#f0f8ff' : '#fff',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onClick={() => handleViewRecipe(recipe)}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              <h4 style={{ marginTop: 0, color: '#333' }}>
                {recipe.name} 
                {recipe.isAI && (
                  <span style={{ 
                    color: 'white', 
                    backgroundColor: '#4CAF50',
                    fontSize: '0.7rem', 
                    padding: '2px 6px',
                    borderRadius: '10px',
                    marginLeft: '8px',
                    verticalAlign: 'middle'
                  }}>
                    AI
                  </span>
                )}
              </h4>
              <p><strong>Ingredients:</strong> {recipe.ingredients.slice(0, 3).join(', ')}
                {recipe.ingredients.length > 3 && '...'}
              </p>
              {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
                <p style={{ color: '#ff6f61' }}>
                  <strong>Missing:</strong> {recipe.missingIngredients.slice(0, 2).join(', ')}
                  {recipe.missingIngredients.length > 2 && '...'}
                </p>
              )}
              <div style={{ 
                marginTop: '10px', 
                textAlign: 'right', 
                color: '#666',
                fontSize: '0.8rem'
              }}>
                Click to view details
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddRecipe;
