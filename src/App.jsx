import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/FunctionalComponents/Home';
import Signup from './components/FunctionalComponents/Signup';
import Login from './components/FunctionalComponents/Login';
import AddRecipe from './components/FunctionalComponents/AddRecipe';
import RecipeGenerator from './components/FunctionalComponents/RecipeGenerator';
import GroceryList from './components/FunctionalComponents/GroceryList';
import Navbar from './components/FunctionalComponents/Navbar';
import './App.css';

const App = () => {
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [groceryNeeded, setGroceryNeeded] = useState(false);
  const [recipes, setRecipes] = useState([]);

  // Check if user is already logged in
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      setIsAuthenticated(true);
      
      // Fetch user's recipes when authenticated
      const fetchUserRecipes = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/recipes/${userId}`);
          if (response.ok) {
            const data = await response.json();
            setRecipes(data);
          }
        } catch (error) {
          console.error('Error fetching recipes:', error);
          
          // Fallback to local storage if server is unavailable
          try {
            const localRecipes = JSON.parse(localStorage.getItem('localRecipes') || '[]');
            const userRecipes = localRecipes.filter(recipe => recipe.userId === userId);
            setRecipes(userRecipes);
          } catch (localError) {
            console.error('Error loading local recipes:', localError);
          }
        }
      };
      
      fetchUserRecipes();
    }
  }, [isAuthenticated]);

  const addRecipe = (newRecipe) => {
    setRecipes((prev) => {
      // Check if recipe already exists in the array
      const exists = prev.some(r => r._id === newRecipe._id);
      if (exists) {
        return prev;
      }
      return [...prev, newRecipe];
    });
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleSignup = () => {
    setIsSignedUp(true);
  };

  return (
    <Router>
      <div className="app-container">
        <Navbar isAuthenticated={isAuthenticated} />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup onSignup={handleSignup} />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            
            {/* Recipe Generator - First step after login */}
            <Route
              path="/generate"
              element={
                <RecipeGenerator
                  setIsGenerated={setIsGenerated}
                  setGroceryNeeded={setGroceryNeeded}
                  addRecipe={addRecipe}
                />
              }
            />
            
            {/* Add Recipe - View and manage recipes */}
            <Route
              path="/add"
              element={<AddRecipe onRecipeAdded={addRecipe} recipes={recipes} />}
            />
            
            {/* Grocery List - View missing ingredients */}
            <Route
              path="/grocery"
              element={<GroceryList />}
            />
            
            {/* Redirect to login if trying to access protected routes without authentication */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
