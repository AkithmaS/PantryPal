import express from 'express';
const router = express.Router();
import * as shoppingListController from '../controllers/shoppingListController.js';
import authMiddleware from '../middleware/auth.js';

router.use(authMiddleware);

router.get('/', shoppingListController.getShoppingListItems);
router.post('/generate', shoppingListController.generateShoppingList);
router.post('/', shoppingListController.addItem);
router.post('/preflight', shoppingListController.preflightAddToPantry);
router.post('/add-to-pantry/confirm', shoppingListController.confirmAddToPantry);
router.put('/:id', shoppingListController.updateItem);
router.put('/:id/toggle', shoppingListController.toggleChecked);
router.delete('/clear-checked', shoppingListController.clearChecked);
router.delete('/clear-all', shoppingListController.clearAll);
router.delete('/:id', shoppingListController.deleteItem);
router.post('/add-to-pantry', shoppingListController.addCheckedToPantry);


export default router;

