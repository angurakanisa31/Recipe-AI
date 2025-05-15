import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Recipe Generator</h3>
          <p>Your AI-powered recipe assistant that helps you create delicious meals with ingredients you already have.</p>
        </div>
        
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/generate">Generate Recipe</a></li>
            <li><a href="/add">My Recipes</a></li>
            <li><a href="/grocery">Grocery List</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Contact</h3>
          <p>Email: support@recipegenerator.com</p>
          <p>Phone: (123) 456-7890</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} Recipe Generator. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;