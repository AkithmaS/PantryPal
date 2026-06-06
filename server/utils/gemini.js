import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

if (!process.env.GEMINI_API_KEY) {
    console.warn(
        'Warning: Gemini API key is not set. Please set GEMINI_API_KEY in your environment variables.'
    );
}

export const generateRecipe = async ({
        ingredients,
        manualIngredients = [],
        pantryIngredients = [],
        dietaryRestrictions = [],
        cuisineType = 'any',
        servingSize = 4,
        cookingTime = 'medium'
}) => {

        const dietaryInfo =
                dietaryRestrictions.length > 0
                        ? `Dietary restrictions: ${dietaryRestrictions.join(', ')}.`
                        : 'No dietary restrictions.';

        const timeGuide = {
                short: 'under 30 minutes',
                medium: '30-60 minutes',
                long: 'over 60 minutes'
        };

        const manualList = manualIngredients.length > 0
                ? manualIngredients.join(', ')
                : 'None provided';

        const pantryList = pantryIngredients.length > 0
                ? pantryIngredients.join(', ')
                : 'None provided';

        const prompt = `
Generate a detailed recipe with the following requirements:

User-added ingredients: ${manualList}.
Pantry ingredients: ${pantryList}.
Combined ingredients available: ${ingredients.join(', ')}.
${dietaryInfo}

Cuisine type: ${cuisineType}.
Serving size: ${servingSize}.
Cooking time: ${timeGuide[cookingTime] || 'any'}.

Important instructions:
- Use every user-added ingredient listed above.
- Use pantry ingredients together with the user-added ingredients whenever possible.
- Do not omit user-added ingredients from the final recipe.
- If an ingredient is not ideal for the main dish, incorporate it meaningfully rather than dropping it.

Please provide the recipe in the following JSON format:

{
    "name": "Recipe Name",
    "description": "Brief description of the recipe",
    "cuisineType": "${cuisineType}",
    "difficulty": "easy/medium/hard",
    "prepTime": "time in minutes",
    "cookTime": "time in minutes",
    "servingSize": ${servingSize},
    "ingredients": [
        {
            "name": "ingredient name",
            "quantity": "amount",
            "unit": "unit"
        }
    ],
    "instructions": [
        "Step 1 instruction",
        "Step 2 instruction"
    ],
    "dietaryInfo": [
        "vegetarian",
        "gluten-free"
    ],
    "nutritionalInfo": {
        "calories": "calories per serving"
    },
    "cookingTips": [
        "Tip 1",
        "Tip 2"
    ]
}

Make sure the recipe is creative and not a common one.
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        let generatedText = response.text.trim();

        // Remove markdown code blocks
        if (generatedText.startsWith('```json')) {
            generatedText = generatedText
                .replace(/^```json\n?/, '')
                .replace(/```$/, '');
        } else if (generatedText.startsWith('```')) {
            generatedText = generatedText
                .replace(/^```\n?/, '')
                .replace(/```$/, '');
        }

        const recipe = JSON.parse(generatedText);
        return recipe;

    } catch (error) {
        console.error('Error generating recipe:', error);
        throw new Error('Failed to generate recipe. Please try again.');
    }
};

export const generatePantrySuggestions = async (pantryItems) => {

    const ingredientList = pantryItems
        .map(item => item.name)
        .join(', ');

    const prompt = `
Based on these available ingredients: ${ingredientList}.

Suggest 3 creative recipe ideas that use these ingredients.

Return ONLY a JSON array of strings (no markdown):

["recipe idea 1", "recipe idea 2", "recipe idea 3"]

Each suggestion should be a brief, appetizing description (1-2 sentences).
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        let generatedText = response.text.trim();

        // Remove markdown code blocks
        if (generatedText.startsWith('```json')) {
            generatedText = generatedText
                .replace(/^```json\n?/, '')
                .replace(/```$/, '');
        } else if (generatedText.startsWith('```')) {
            generatedText = generatedText
                .replace(/^```\n?/, '')
                .replace(/```$/, '');
        }

        const suggestions = JSON.parse(generatedText);

        return suggestions;

    } catch (error) {
        console.error('Error generating pantry suggestions:', error);
        throw new Error('Failed to generate recipe suggestions. Please try again.');
    }
};

export const generateCookingTips = async (recipe) => {

    const prompt = `
Based on the recipe: ${recipe.name}

Ingredients: ${recipe.ingredients.map(ing => ing.name).join(', ')}.

Suggest 3 cooking tips to help make this recipe turn out great.

Return ONLY a JSON array of strings (no markdown):

["tip 1", "tip 2", "tip 3"]
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        let generatedText = response.text.trim();

        // Remove markdown code blocks
        if (generatedText.startsWith('```json')) {
            generatedText = generatedText
                .replace(/^```json\n?/, '')
                .replace(/```$/, '');
        } else if (generatedText.startsWith('```')) {
            generatedText = generatedText
                .replace(/^```\n?/, '')
                .replace(/```$/, '');
        }

        const tips = JSON.parse(generatedText);

        return tips;

    } catch (error) {
        console.error('Error generating cooking tips:', error);
        throw new Error('Failed to generate cooking tips. Please try again.');
    }
};

export default {
    generateRecipe,
    generatePantrySuggestions,
    generateCookingTips
};