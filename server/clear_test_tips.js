import db from './config/db.js';

async function clearTips() {
  const id = '31f0bf5a-8690-4885-b5ba-55618559da3b';
  try {
    console.log('Clearing tips for recipe...');
    await db.query('UPDATE recipes SET cooking_tips = $1 WHERE id = $2', [[], id]);
    console.log('Tips cleared successfully.');
  } catch (err) {
    console.error('Error clearing tips:', err);
  } finally {
    process.exit();
  }
}

clearTips();
