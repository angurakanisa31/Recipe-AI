import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const GroceryList = () => {
  const [missingItems, setMissingItems] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    
    // Load missing ingredients from localStorage
    const loadMissingIngredients = () => {
      setLoading(true);
      try {
        const stored = localStorage.getItem('missingIngredients');
        if (stored) {
          const items = JSON.parse(stored);
          
          // Ensure items is an array
          if (Array.isArray(items) && items.length > 0) {
            setMissingItems(items);
            
            // Initialize checked state for all items
            const initialCheckedState = {};
            items.forEach(item => {
              initialCheckedState[item] = false;
            });
            setCheckedItems(initialCheckedState);
          } else {
            console.log('No missing ingredients found or invalid format');
          }
        } else {
          console.log('No missing ingredients in localStorage');
        }
      } catch (error) {
        console.error('Error loading missing ingredients:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMissingIngredients();
  }, [userId, navigate]);
  
  const handleCheckItem = (item) => {
    setCheckedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };
  
  const getCompletedCount = () => {
    return Object.values(checkedItems).filter(Boolean).length;
  };
  
  const getTotalCount = () => {
    return missingItems.length;
  };
  
  const handleClearChecked = () => {
    // Remove checked items from the list
    const newMissingItems = missingItems.filter(item => !checkedItems[item]);
    setMissingItems(newMissingItems);
    
    // Reset checked state for remaining items
    const newCheckedState = {};
    newMissingItems.forEach(item => {
      newCheckedState[item] = false;
    });
    setCheckedItems(newCheckedState);
    
    // Update localStorage
    localStorage.setItem('missingIngredients', JSON.stringify(newMissingItems));
  };

  return (
    <div className="container">
      <h2>Grocery List</h2>
      
      {loading ? (
        <p>Loading grocery list...</p>
      ) : (
        <>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p>Items checked: {getCompletedCount()} of {getTotalCount()}</p>
            {getCompletedCount() > 0 && (
              <button 
                onClick={handleClearChecked}
                style={{ 
                  backgroundColor: '#ff6f61', 
                  color: 'white', 
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Remove Checked Items
              </button>
            )}
          </div>
          
          {missingItems.length > 0 ? (
            <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
              {missingItems.map((item, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid #eee'
                }}>
                  <input 
                    type="checkbox" 
                    checked={checkedItems[item] || false}
                    onChange={() => handleCheckItem(item)}
                    style={{ marginRight: '15px', transform: 'scale(1.2)' }}
                  />
                  <span style={{ 
                    textDecoration: checkedItems[item] ? 'line-through' : 'none',
                    color: checkedItems[item] ? '#888' : '#333',
                    fontSize: '1.1rem'
                  }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f8f8f8', 
              borderRadius: '8px',
              textAlign: 'center',
              marginTop: '20px'
            }}>
              <p>No missing items! All ingredients for your recipes are available.</p>
            </div>
          )}
          
          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
            <Link to="/generate">
              <button>Generate New Recipe</button>
            </Link>
            <Link to="/add">
              <button>View My Recipes</button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default GroceryList;
