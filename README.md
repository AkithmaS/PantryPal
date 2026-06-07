# 🍳 PantryPal

> Cook smarter. Plan better. Make the most of what you already have.

PantryPal is a full-stack web application that helps users manage pantry ingredients, generate AI-powered recipes, discover community recipes, plan meals, and organize shopping lists.

---

## 🚀 Features

- 🥫 Pantry Management
  - Add, edit, and remove pantry items
  - Track ingredient quantities and expiry dates
  - Low-stock alerts and inventory monitoring

- 🤖 AI Recipe Generation
  - Generate recipes using available pantry ingredients
  - Customize recipes by cuisine, dietary preference, cooking time, and servings
  - Powered by Google Gemini 2.5 Flash

- 📖 Recipe Management
  - Save AI-generated recipes
  - Create recipes manually
  - Store cooking instructions, ingredients, nutrition information, and cooking tips

- 🌍 Community Recipes
  - Publish recipes for other users
  - Browse and save community-created recipes

- 📅 Meal Planner
  - Plan meals for the week
  - Organize breakfast, lunch, and dinner schedules

- 🛒 Shopping List
  - Create and manage shopping lists
  - Track purchased items
  - Move purchased items directly into the pantry

- 🔐 Authentication
  - User registration and login
  - JWT-based authentication
  - Secure password hashing with bcryptjs
  - OTP-based password recovery

---

## 🛠️ Tech Stack

### Frontend
- React
- React Router DOM
- Tailwind CSS
- Axios
- Lucide React

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL (Neon)

### ORM
- Prisma ORM

### Authentication
- JWT
- bcryptjs

### AI Integration
- Google Gemini 2.5 Flash

### Additional Tools
- Nodemailer
- CORS
- dotenv

---

## 📦 Installation

### Clone the Repository

```bash
git clone https://github.com/AkithmaS/pantrypal.git
cd pantrypal
```

### Install Frontend Dependencies

```bash
cd client
npm install
```

### Install Backend Dependencies

```bash
cd ../server
npm install
```

---

## 🔧 Environment Variables

Create a `.env` file inside the `server` directory.

```env
DATABASE_URL=your_neon_database_url

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_gemini_api_key

EMAIL_USER=your_email_address
EMAIL_PASS=your_email_password
```

---

## 🗄️ Database Setup

Generate Prisma Client:

```bash
npx prisma generate
```

Run Database Migrations:

```bash
npx prisma migrate dev
```

(Optional) Open Prisma Studio:

```bash
npx prisma studio
```

---

## ▶️ Running the Application

### Start Backend

```bash
cd server
npm run dev
```

### Start Frontend

```bash
cd client
npm run dev
```

---

## 📁 Project Structure

```text
PantryPal
├── client
│   ├── src
│   │   ├── pages
│   │   ├── components
│   │   ├── context
│   │   ├── api
│   │   └── utils
│
├── server
│   ├── prisma
│   ├── controllers
│   ├── routes
│   ├── middleware
│   ├── utils
│   ├── lib
│   └── index.js
│
└── README.md
```

---

## 🔮 Future Enhancements

- Mobile Application Support
- Barcode Scanning for Ingredients
- Recipe Ratings and Reviews
- Smart Pantry Notifications
- Advanced Nutrition Tracking

---

## 👩‍💻 Author

**Akithma Sandanaki**

