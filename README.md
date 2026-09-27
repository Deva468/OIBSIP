<<<<<<< HEAD
# OIBSIP
Full-stack pizza delivery platform with online ordering, pizza customization, secure authentication, Razorpay test payments, real-time order tracking, and admin inventory management.
=======
Pizza Delivery System 🍕

A full-stack pizza ordering application where users can browse and customize pizzas, manage their cart, place orders, make Razorpay test-mode payments, track orders, manage favourites, and access a user dashboard.

The application is built using React + Vite for the frontend and Node.js + Express + MongoDB for the backend.

Features
User Features
User registration and login
Email verification
Forgot and reset password
Browse pizza catalog
Search pizzas
Customize pizzas using different bases, sauces, cheeses, and vegetables
Add pizzas to cart
Manage cart items
Checkout and order placement
Razorpay test-mode payment
Order tracking
View previous orders
Add and remove favourite pizzas
User profile and settings
Offers and help pages
Admin Features
Admin authentication and protected dashboard
Manage pizza inventory
View and manage customer orders
Monitor inventory levels
Low-stock notifications
Order status management
Security Features
JWT-based authentication
Role-based access control for users and admins
Password hashing using bcrypt
Request validation
Input sanitization
Rate limiting
Protected API routes
Centralized error handling
Environment variables for sensitive configuration
Payment secrets stored only on the backend
Project Structure
pizza-delivery-system/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   ├── env.js
│   │   │   ├── nodemailer.js
│   │   │   ├── razorpay.js
│   │   │   └── socket.js
│   │   │
│   │   ├── controllers/
│   │   ├── jobs/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── seed/
│   │   ├── services/
│   │   ├── sockets/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   └── user/
│   │   ├── routes/
│   │   └── utils/
│   │
│   ├── .env.example
│   └── package.json
│
├── screenshots/
│   └── project-output.png
│
└── README.md
Getting Started
Prerequisites

Make sure the following are installed:

Node.js
npm
MongoDB or MongoDB Atlas
Git
1. Clone the Repository
git clone <your-repository-url>
cd pizza-delivery-system
2. Backend Setup
cd backend
npm install

Create a .env file based on .env.example:

cp .env.example .env

Then configure the required environment variables such as:

MongoDB connection string
JWT secret
Email/SMTP configuration
Razorpay test credentials
Admin seed credentials
Frontend client URL

Run the database seed:

npm run seed

This loads the pizza catalog data.

To create the admin account:

npm run seed:admin

Start the backend development server:

npm run dev

The backend runs on:

http://localhost:5000
3. Frontend Setup

Open another terminal:

cd frontend
npm install

Create the frontend .env file based on .env.example and configure the required frontend environment variables.

Start the frontend:

npm run dev

The frontend runs on:

https://pizza-delivery-system.vercel.app

Authentication
Regular User

A new user can register through the application and log in after completing the required verification process.

Admin

The admin account is created using the values configured in the backend .env file.

The same login page is used for both regular users and admins. After authentication, the application identifies the user's role and provides access to the appropriate dashboard.

Payments

The application integrates Razorpay in test mode for online payments.

Razorpay test credentials should be configured only in the backend .env file.

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

No real money is involved when using Razorpay test mode.

Payment credentials and other sensitive environment variables are intentionally excluded from this repository.

Order Tracking

Users can track their orders through the order tracking page.

The application uses Socket.IO to support real-time order status updates between the backend and frontend.

Inventory Management

The admin dashboard provides inventory management functionality for pizza ingredients and related items.

The system can monitor stock levels and generate low-stock notifications based on the configured threshold and notification settings.

Activity Tracking

Important user activities are recorded in MongoDB for application activity tracking.

Examples include:

User registration
Login and logout
Pizza search
Pizza viewing
Pizza customization
Add to cart
Favourite/unfavourite actions
Order placement
Payment success or failure
Profile and settings changes
Password changes

Passwords are securely hashed using bcrypt and are not stored in plain text.

Raw payment card details are not stored by this application.

Screenshots

The project output is demonstrated through screenshots of the running application.

Project Output




Tech Stack
Frontend
React 19
Vite
React Router
Axios
Tailwind CSS
Backend
Node.js
Express.js
MongoDB
Mongoose
JWT
bcrypt
Nodemailer
Socket.IO
Payments
Razorpay Test Mode
Development Tools
Git
GitHub
Visual Studio Code
Environment Variables

Sensitive configuration is stored using environment variables.

The actual .env files are not included in the repository.

Only .env.example files containing empty placeholder values are included.

Example:

MONGO_URI=
JWT_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

Never commit real API keys, passwords, database credentials, JWT secrets, or SMTP credentials to GitHub.

Security

This project follows basic application security practices including:

JWT authentication
Role-based authorization
bcrypt password hashing
Request validation
Input sanitization
Rate limiting
Protected routes
Secure environment variable handling
Backend-only storage of sensitive payment configuration
Centralized error handling
Project Status

Completed full-stack pizza delivery application developed as part of a web development internship project.

Author

Devanandh K

B.E. Computer Science and Engineering (Cyber Security)

License

This project is created for educational and internship purposes.
>>>>>>> a8b1c5e (Initial commit)
