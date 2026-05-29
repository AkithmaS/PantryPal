import MealPlan from '../models/MealPlan.js';

//add recipe to meal plan
export const addToMealPlan = async (req, res, next) => {
    try {
        const mealPlan = await MealPlan.addRecipe(req.user.id, req.body);
        res.status(201).json({
            success: true,
            message: 'Recipe added to meal plan successfully',
            data: mealPlan
        });
    } catch (error) {
        next(error);
    }
};
      
//get weekly meal plan
export const getWeeklyMealPlan = async (req, res, next) => {
    try {
        const { start_date, weekstartDate } = req.query;
        const startDate = start_date || weekstartDate;

        if (!startDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date is required'
            });
        }

        const mealPlan = await MealPlan.getWeeklyPlan(req.user.id, startDate);
        res.status(200).json({
            success: true,
            data: mealPlan
        });
    } catch (error) {
        next(error);
    }
};

//get upcoming meals
export const getUpcomingMeals = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const meals = await MealPlan.getUpcomingPlan(req.user.id, limit);
        res.status(200).json({
            success: true,
            data: meals
        });
    } catch (error) {
        next(error);
    }
};

//delete meal plan entry
export const deleteMealPlanEntry = async (req, res, next) => {
    try {
        const { id } = req.params;
        const mealPlan = await MealPlan.delete(req.user.id, id);
        
        if (!mealPlan) {
            return res.status(404).json({
                success: false,
                message: 'Meal plan entry not found'
            });
        }

        res.json({
            success: true,
            message: 'Meal plan entry deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};


//get meal plan stats

export const getMealPlanStats = async (req, res, next) => {
    try {
        const stats = await MealPlan.getStats(req.user.id);
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

