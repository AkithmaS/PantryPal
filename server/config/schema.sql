CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--user table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--user preferences table
CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL,

    dietary_restrictions TEXT[] DEFAULT '{}',
    allergies TEXT[] DEFAULT '{}',
    preffered_cuisines TEXT[] DEFAULT '{}',

    default_serving_size INTEGER DEFAULT 4,
    measurement_units VARCHAR(20) DEFAULT 'metric',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_preferences_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
--pantry table
CREATE TABLE IF NOT EXISTS pantry_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    is_running_low BOOLEAN DEFAULT FALSE,
    expiration_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--recipies table
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cuisine_type VARCHAR(100),
    difficulty VARCHAR(50) default 'medium',
    preparation_time INTEGER,
    cooking_time INTEGER,
    instructions JSONB NOT NULL,
    servings INTEGER,
    dietary_tags TEXT[] DEFAULT '{}',
    user_notes TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


--recipe ingredients table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--recipe nutrition table
CREATE TABLE IF NOT EXISTS recipe_nutrition (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    calories INTEGER,
    carbohydrates DECIMAL(10, 2),
    protein  DECIMAL(10, 2),
    fiber DECIMAL(10, 2),
    fat DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (recipe_id)
);

--meal plan table
CREATE TABLE IF NOT EXISTS meal_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
    meal_type VARCHAR(50) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
    meal_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, meal_date, meal_type)
);

--shopping list table
CREATE TABLE IF NOT EXISTS shopping_list_items (    
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ingredient_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit VARCHAR(50) NOT NULL,
    is_checked BOOLEAN DEFAULT FALSE,
    from_meal_plan BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_pantry_user_id ON pantry_items(user_id);
CREATE INDEX IF NOT EXISTS idx_pantry_category ON pantry_items(category);
create index if not exists idx_pantry_expiry on pantry_items(expiration_date);

CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_cuisine_type ON recipes(cuisine_type);

CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);

create index if not exists idx_shopping_list_user_id on shopping_list_items(user_id);

--dunction to update the updated_at column on update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

--triggers to update the updated_at column on update
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pantry_items_updated_at ON pantry_items;
CREATE TRIGGER update_pantry_items_updated_at BEFORE UPDATE ON pantry_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recipes_updated_at ON recipes;
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recipe_ingredients_updated_at ON recipe_ingredients;
CREATE TRIGGER update_recipe_ingredients_updated_at BEFORE UPDATE ON recipe_ingredients
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recipe_nutrition_updated_at ON recipe_nutrition;
CREATE TRIGGER update_recipe_nutrition_updated_at BEFORE UPDATE ON recipe_nutrition
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_meal_plans_updated_at ON meal_plans;
CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON meal_plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shopping_list_items_updated_at ON shopping_list_items;
CREATE TRIGGER update_shopping_list_items_updated_at BEFORE UPDATE ON shopping_list_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();