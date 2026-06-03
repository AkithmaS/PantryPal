import db from './config/db.js';

async function setup() {
  try {
    console.log('Checking for cooking_tips column...');
    const result = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='recipes' AND column_name='cooking_tips';
    `);

    if (result.rows.length === 0) {
      console.log('Adding cooking_tips column...');
      await db.query('ALTER TABLE recipes ADD COLUMN cooking_tips TEXT[];');
      console.log('Column added successfully.');
    } else {
      console.log('cooking_tips column already exists.');
    }
  } catch (err) {
    console.error('Error adding column:', err);
  } finally {
    process.exit();
  }
}

setup();
