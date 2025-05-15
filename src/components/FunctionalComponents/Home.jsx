import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      {/* Logo in top left corner */}
      <div className="logo">Recipe Generator</div>
      
      {/* Navigation bar with buttons in top right corner */}
      <div className="nav-buttons">
        <Link to="/signup">
          <button className="signup-btn">Sign Up</button>
        </Link>
        <Link to="/login">
          <button className="login-btn">Login</button>
        </Link>
      </div>

      {/* Main content centered on page */}
      <div className="content-container">
        <div className="content-box">
          <h1 className="title">Welcome To Recipe Generator</h1>
          <p className="subtitle">
            Create, discover, and organize your favorite recipes with our AI-powered platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;