const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: String,
  ingredients: [String],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isAI: { type: Boolean, default: false },
  instructions: { type: String, default: '' },
  missingIngredients: [String]
});

module.exports = mongoose.model('Recipe', recipeSchema);
