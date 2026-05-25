import Recipe from '../models/Recipe.js';
import PantryItem from '../models/Pantryitem.js';
import {
    generateRecipe as generateRecipeAI,
    generatePantrySuggestionsAI
} from '../utils/gemini.js';

// Generate recipe using AI
export const generateRecipe = async (req, res, next) => {
    try {
        const {
            ingredients = [],
            usePantryIngredients = false,
            dietaryPreferences = [],
            cuisineType = 'any',
            servingSize = 4,
            cookingTime = 'medium'
        } = req.body;

        let finalIngredients = [...ingredients];

        // Add pantry ingredients if requested
        if (usePantryIngredients) {
            const pantryItems = await PantryItem.getAllByUserId(req.user.id);

            const pantryIngredientNames = pantryItems.map(item =>
                item.name.toLowerCase()
            );

            finalIngredients = [
                ...new Set([
                    ...finalIngredients,
                    ...pantryIngredientNames
                ])
            ];
        }

        // Validate ingredients
        if (finalIngredients.length === 0) {
            return res.status(400).json({
                success: false,
                message:
                    'Please provide at least one ingredient or enable pantry ingredients'
            });
        }

        // Generate recipe using Gemini AI
        const recipeData = await generateRecipeAI({
            ingredients: finalIngredients,
            dietaryPreferences,
            cuisineType,
            servingSize,
            cookingTime
        });

        res.json({
            success: true,
            message: 'Recipe generated successfully',
            data: {
                recipe: recipeData
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get pantry suggestions
export const getPantrySuggestions = async (req, res, next) => {
    try {
        const pantryItems = await PantryItem.getAllByUserId(req.user.id);

        const expiringSoonItems = await PantryItem.getExpiringSoon(
            req.user.id,
            7
        );

        const expiringSoonItemNames = expiringSoonItems.map(
            item => item.name
        );

        const suggestions =
            await generatePantrySuggestionsAI(
                pantryItems,
                expiringSoonItemNames
            );

        res.json({
            success: true,
            data: { suggestions }
        });
    } catch (error) {
        next(error);
    }
};

// Save recipe
export const saveRecipe = async (req, res, next) => {
    try {
        const recipe = await Recipe.create(
            req.user.id,
            req.body
        );

        res.status(201).json({
            success: true,
            data: recipe
        });
    } catch (error) {
        next(error);
    }
};

// Get all recipes
export const getRecipes = async (req, res, next) => {
    try {
        const {
            search,
            cuisine,
            difficulty,
            dietary,
            maxCookingTime,
            sort_by,
            sort_order,
            limit,
            offset
        } = req.query;

        const recipes = await Recipe.getAllByUserId(
            req.user.id,
            {
                search,
                cuisine,
                difficulty,
                dietary,
                maxCookingTime: maxCookingTime
                    ? parseInt(maxCookingTime)
                    : undefined,
                sort_by,
                sort_order,
                limit: limit
                    ? parseInt(limit)
                    : undefined,
                offset: offset
                    ? parseInt(offset)
                    : undefined
            }
        );

        res.json({
            success: true,
            data: recipes
        });
    } catch (error) {
        next(error);
    }
};

// Get recent recipes
export const getRecentRecipes = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 5;

        const recipes =
            await Recipe.getRecentByUserId(
                req.user.id,
                limit
            );

        res.json({
            success: true,
            data: recipes
        });
    } catch (error) {
        next(error);
    }
};

// Get recipe by ID
export const getRecipeById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const recipe = await Recipe.getById(
            req.user.id,
            id
        );

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        res.json({
            success: true,
            data: recipe
        });
    } catch (error) {
        next(error);
    }
};

// Update recipe
export const updateRecipe = async (req, res, next) => {
    try {
        const { id } = req.params;

        const recipe = await Recipe.update(
            req.user.id,
            id,
            req.body
        );

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        res.json({
            success: true,
            data: recipe
        });
    } catch (error) {
        next(error);
    }
};

// Delete recipe
export const deleteRecipe = async (req, res, next) => {
    try {
        const { id } = req.params;

        const recipe = await Recipe.delete(
            req.user.id,
            id
        );

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        res.json({
            success: true,
            message: 'Recipe deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Get recipe stats
export const getRecipeStats = async (req, res, next) => {
    try {
        const stats =
            await Recipe.getStatsByUserId(req.user.id);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};