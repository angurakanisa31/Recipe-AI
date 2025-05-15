import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ isAuthenticated }) => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  
  const handleLogout = () => {
    localStorage.removeItem('userId');
    // Also clear any other user-related data
    localStorage.removeItem('missingIngredients');
    navigate('/');
    // Force page reload to clear any state
    window.location.reload();
  };
  
  return (
    <nav style={{ 
      backgroundColor: '#ff6f61', 
      color: 'white', 
      padding: '1rem', 
      display: 'flex', 
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem' }}>
          Recipe Generator
        </Link>
      </div>
      
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {userId ? (
          <>
            <Link to="/generate" style={{ color: 'white', textDecoration: 'none' }}>Generate Recipe</Link>
            <Link to="/add" style={{ color: 'white', textDecoration: 'none' }}>My Recipes</Link>
            <Link to="/grocery" style={{ color: 'white', textDecoration: 'none' }}>Grocery List</Link>
            <button 
              onClick={handleLogout} 
              style={{ 
                backgroundColor: 'transparent', 
                border: 'none', 
                color: 'white', 
                cursor: 'pointer',
                padding: 0
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
            <Link to="/signup" style={{ color: 'white', textDecoration: 'none' }}>Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;