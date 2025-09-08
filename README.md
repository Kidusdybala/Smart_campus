# Smart Campus Management System

A comprehensive web-based platform designed to streamline campus operations and enhance the student experience through integrated digital services including attendance tracking, food ordering, parking management, and academic scheduling.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Overview

The Smart Campus Management System is a full-stack web application that provides a unified platform for managing various campus activities. The system supports multiple user roles (students, staff, administrators, and cafeteria staff) and offers a seamless experience across different devices.

## Features

### Core Functionality

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control
  - Secure password hashing

- **Attendance Management**
  - QR code-based check-in/check-out
  - Real-time attendance tracking
  - Attendance statistics and reporting

- **Food Ordering System**
  - Digital menu management
  - Real-time order placement and tracking
  - Wallet-based payment integration
  - Order status notifications

- **Parking Management**
  - Parking spot reservation system
  - Real-time availability tracking
  - Automated payment processing

- **Academic Scheduling**
  - Class schedule management
  - Campus status monitoring
  - Real-time notifications

- **Payment Integration**
  - Chapa payment gateway integration
  - Wallet balance management
  - Transaction history

### User Experience Features

- **Responsive Design**
  - Mobile-first approach
  - Cross-device compatibility
  - Intuitive user interface

- **Real-time Notifications**
  - Order status updates
  - Payment confirmations
  - System announcements

- **Personalized Dashboard**
  - Role-specific interfaces
  - Quick access to frequently used features
  - Personalized recommendations

## Technology Stack

### Frontend
- **React 18** - Modern JavaScript library for building user interfaces
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **React Router** - Client-side routing
- **Sonner** - Toast notifications
- **Lucide React** - Icon library

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token for authentication
- **bcryptjs** - Password hashing
- **Socket.IO** - Real-time communication

### External Services
- **Chapa Payment Gateway** - Payment processing
- **MongoDB Atlas** - Cloud database hosting

## Architecture

The application follows a modern full-stack architecture with clear separation of concerns:

```
smart-campus/
├── frontend/          # React TypeScript application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── api/           # API client and utilities
│   │   └── lib/           # Utility functions
│   ├── public/            # Static assets
│   └── package.json
├── backend/           # Node.js Express server
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API route handlers
│   ├── middleware/        # Authentication and validation
│   ├── utils/             # Helper functions
│   └── package.json
├── ml_service/        # Python ML service (optional)
└── README.md
```

### API Architecture

The backend follows RESTful API design principles with the following structure:

- **Authentication Routes** (`/api/auth`)
  - POST `/login` - User login
  - POST `/register` - User registration
  - GET `/profile` - Get user profile

- **Food Management** (`/api/food`)
  - GET `/menu` - Get food menu
  - POST `/order` - Place food order
  - GET `/orders` - Get user orders

- **Parking Management** (`/api/parking`)
  - GET `/` - Get parking slots
  - POST `/reserve/:slot` - Reserve parking spot

- **Payment Processing** (`/api/payment`)
  - GET `/wallet` - Get wallet balance
  - POST `/topup` - Top up wallet
  - POST `/food-order/:orderId` - Pay for food order

## Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (version 18.0.0 or higher)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git** (for version control)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd smart-campus
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Environment Configuration

Create environment files for both backend and frontend (see Configuration section below).

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/smartcampus

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=5001

# Payment Gateway Configuration
CHAPA_SECRET_KEY=your-chapa-secret-key
CHAPA_PUBLIC_KEY=your-chapa-public-key
CHAPA_BASE_URL=https://api.chapa.co/v1

# Frontend Configuration
FRONTEND_URL=http://localhost:5173
BASE_URL=http://localhost:5001

# Optional: ML Service Configuration
ML_SERVICE_URL=http://localhost:5002
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE=http://localhost:5001/api
```

## Database Setup

### Using MongoDB Atlas (Recommended)

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update the `MONGO_URI` in your backend `.env` file

### Using Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Update `MONGO_URI` to `mongodb://localhost:27017/smartcampus`

### Database Seeding

The application includes a seed script to populate the database with sample data:

```bash
cd backend
node seed.js
```

This will create:
- Sample users (student, staff, admin, cafeteria)
- Food menu items
- Parking slots
- Sample schedules

## Running the Application

### Development Mode

1. **Start the Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```
   The server will start on `http://localhost:5001`

2. **Start the Frontend Application:**
   ```bash
   cd frontend
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

### Production Mode

1. **Build the Frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start the Backend:**
   ```bash
   cd backend
   npm start
   ```

## API Documentation

### Authentication Endpoints

#### POST /api/auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "student@university.edu",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "User Name",
    "email": "user@university.edu",
    "role": "student"
  }
}
```

#### POST /api/auth/register
Register a new user account.

### Food Management Endpoints

#### GET /api/food/menu
Get the current food menu.

#### POST /api/food/order
Place a new food order.

**Request Body:**
```json
{
  "items": [
    {
      "food": "food-id",
      "quantity": 2
    }
  ]
}
```

#### GET /api/food/orders
Get user's order history.

### Payment Endpoints

#### GET /api/payment/wallet
Get user's wallet balance.

#### POST /api/payment/topup
Initialize wallet top-up.

#### POST /api/payment/food-order/:orderId
Pay for a food order.

## User Roles

### Student
- Access to personal dashboard
- QR code attendance tracking
- Food ordering and payment
- Parking reservation
- View grades and schedule
- Wallet management

### Staff
- All student features
- Grade management
- Class scheduling
- Student attendance monitoring

### Administrator
- Full system access
- User management
- System configuration
- Analytics and reporting

### Cafeteria Staff
- Food menu management
- Order processing and status updates
- Inventory management

## Development

### Code Structure

```
frontend/src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, inputs, etc.)
│   ├── auth/           # Authentication components
│   ├── food/           # Food ordering components
│   ├── parking/        # Parking management components
│   └── ...
├── pages/              # Page-level components
├── api/                # API client and utilities
├── hooks/              # Custom React hooks
└── lib/                # Utility functions and configurations

backend/
├── models/             # MongoDB data models
├── routes/             # API route handlers
├── middleware/         # Authentication and validation middleware
├── utils/              # Helper functions
└── index.js            # Main application entry point
```

### Development Scripts

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

#### Backend
```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
```

### Code Quality

The project maintains high code quality standards:

- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for git hooks (if configured)

## Testing

### Running Tests

```bash
# Frontend tests
cd frontend
npm test

# Backend tests (when implemented)
cd backend
npm test
```

### Test Coverage

The application includes comprehensive test coverage for:
- Component rendering and interactions
- API integration
- Authentication flows
- Payment processing
- Error handling

## Deployment

### Environment Setup

1. **Production Environment Variables:**
   - Set `NODE_ENV=production`
   - Configure production database URL
   - Set secure JWT secret
   - Configure production payment gateway keys

2. **Build Optimization:**
   ```bash
   cd frontend
   npm run build
   ```

3. **Server Configuration:**
   - Configure reverse proxy (nginx/apache)
   - Set up SSL certificates
   - Configure environment-specific settings

### Docker Deployment (Optional)

```dockerfile
# Dockerfile for backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5001
CMD ["npm", "start"]
```

## Contributing

We welcome contributions to the Smart Campus Management System. Please follow these guidelines:

### Development Workflow

1. **Fork the Repository**
2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make Changes**
4. **Run Tests**
5. **Commit Changes**
   ```bash
   git commit -m "Add: Brief description of changes"
   ```
6. **Push to Branch**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create Pull Request**

### Code Standards

- Follow TypeScript best practices
- Use meaningful variable and function names
- Write comprehensive comments for complex logic
- Ensure all tests pass before submitting
- Follow the existing code style and structure

### Commit Message Format

```
type: Brief description of changes

Detailed explanation of what was changed and why
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## License

This project is licensed under the ISC License. See the LICENSE file for details.

## Support

For support and questions:

- **Documentation:** Check the `/docs` directory for detailed guides
- **Issues:** Use GitHub Issues for bug reports and feature requests
- **Discussions:** Use GitHub Discussions for general questions

### Troubleshooting

**Common Issues:**

1. **Database Connection Issues**
   - Verify MongoDB connection string
   - Check network connectivity
   - Ensure MongoDB service is running

2. **Authentication Problems**
   - Verify JWT secret is set
   - Check token expiration
   - Ensure proper user roles

3. **Payment Integration Issues**
   - Verify Chapa API keys
   - Check webhook configurations
   - Review payment gateway logs

### System Requirements

- **Minimum Node.js Version:** 18.0.0
- **Recommended RAM:** 4GB
- **Storage:** 500MB for application and database
- **Network:** Stable internet connection for payment processing

---

**Smart Campus Management System** - Streamlining campus operations through innovative technology solutions.