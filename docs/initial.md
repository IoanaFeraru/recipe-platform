Collections:
users
  └── uid
      ├── email
      ├── createdAt

recipes
  └── recipeId
      ├── title (string)
      ├── ingredients (string[])
      ├── steps (string[])
      ├── tags (string[])
      ├── imageUrl (string)
      ├── authorId (string)
      ├── createdAt (timestamp)
      ├── ratingAvg (number)
      ├── prepTime (number)
      ├── isVegetarian (boolean)

favorites
  └── userId
      ├── recipeIds (string[])

Your assignment requires:

- Client-side focused implementation
- React / Next.js
- Firebase (Firestore, Auth, Storage)
- Deployment on Vercel

Firebase is the backend. Next.js is both frontend and server layer.

So:
- No Express server
- No REST API
- No backend/ folder
- No duplicated config
- No CORS problems
- No wasted time

recipe-platform/
│
├── src/
│   ├── app/              # routing (pages)
│   ├── components/       # reusable UI
│   ├── context/          # Auth + Favorites (mandatory)
│   ├── lib/              # firebase, helpers
│   ├── types/            # TS interfaces
│   └── tests/            # unit tests
│
├── public/               # static assets
├── .env.local
├── package.json
├── tailwind.config.js
├── next.config.js
└── README.md

“The application uses a serverless architecture. Firebase handles authentication, data storage, and file storage, while Next.js provides routing and server-side capabilities. This reduces complexity and follows modern web development best practices.”

restart the dev server: npm run dev

## Project Overview

**Title:** Development of Web Systems – Recipe Platform
**Type:** Collaborative web application (client-side focused)
**Stack:** Next.js (React), Firebase, Tailwind CSS
**Deployment:** Vercel

This project delivers a modern, responsive recipe-sharing platform aligned with current web development trends. The application is predominantly client-side, uses a JavaScript framework (Next.js), and follows modular, testable, and well-documented development practices.

---

## Objectives

* Build a collaborative platform where users can create, explore, and manage recipes
* Apply modern frontend patterns (React hooks, Context API, file-based routing)
* Integrate authentication, database, and storage services
* Ensure code quality through testing, documentation, and deployment

---

## Functional Requirements

### Core Features

* **Homepage**

  * Displays popular and recently added recipes
  * Supports pagination or infinite scroll (bonus)

* **Recipe Details Page**

  * Dynamic route using Next.js (`/recipes/[id]`)
  * Shows ingredients, preparation steps, images, ratings, and comments

* **User Dashboard**

  * Create, edit, and delete personal recipes
  * Form validation for title, ingredients, and steps

* **Favorites Section**

  * Save and remove favorite recipes
  * Persistent storage per user

* **Search & Filters**

  * Search by title, ingredients, or tags
  * Filters for dietary preferences (vegetarian, gluten-free, etc.)
  * Sorting by popularity or preparation time

---

## Non‑Functional Requirements

* Responsive UI (mobile, tablet, desktop)
* Clean, modular, and commented source code
* Secure authentication and access control
* Optimized image loading and performance

---

## Technical Architecture

### Frontend

* **Next.js**

  * File-based routing
  * Server-side rendering where beneficial

* **React Context API**

  * Authentication state
  * Favorites management

* **Tailwind CSS**

  * Responsive layout
  * Dark/light theme toggle (bonus)

### Backend / Services

* **Firebase Authentication**

  * User sign-up, login, password reset

* **Firebase Firestore**

  * Users
  * Recipes
  * Favorites
  * Ratings and comments

* **Firebase Storage**

  * Recipe images
  * Image validation (size and format)
  * Optimized image delivery

---

## Programming Paradigms Used

* **Object-Oriented Programming**

  * Data models and service abstractions

* **Functional Programming**

  * Stateless React components
  * Hooks (`useState`, `useEffect`, `useContext`)

* **Reactive Programming**

  * Real-time Firestore updates

---

## Validation & Security

* Client-side form validation
* Protected routes for authenticated users
* Firestore security rules
* Input sanitization

---

## Testing Strategy

* **Unit Tests:** Vitest / Jest
* **Integration Tests:** Supertest / Mock Firebase
* **Optional E2E:** Selenium or Puppeteer

---

## Deployment & Delivery

* Deployed on **Vercel**
* Environment variables securely managed
* Shareable production link

---

## Documentation & Presentation

* Markdown documentation (`.md`)
* Installation and usage instructions
* Architecture and design decisions
* 20‑minute project presentation or OBS video

---

## Bonus Features

* Infinite scroll or pagination
* Dark / light mode toggle
* Fully responsive design
* Performance optimizations

---

## Evaluation Alignment

This project satisfies all mandatory requirements and incorporates advanced features that demonstrate:

* Modern web development practices
* Use of multiple programming paradigms
* Real‑world scalability and usability
* Clean architecture, testing, and deployment

ctrl shift p TypeScript: Restart TS Server