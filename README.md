# Stock Analytics Dashboard - Backend

A robust Node.js API service that powers the Stock Analytics Dashboard, providing secure authentication, stock data processing, and user preference management.

## 🚀 Features

- **User Authentication**: Secure signup, login, and session management
- **Stock Data API**: Fetch and process historical stock data
- **Search Functionality**: Stock symbol and company search
- **Data Caching**: Optimize performance with in-memory caching
- **User Preferences**: Store and retrieve user-specific settings
- **Dashboard Configurations**: Save user's favorite stock combinations
- **Profile Management**: Update user profiles and security settings
- **Rate Limiting**: Protect APIs from abuse
- **Error Handling**: Comprehensive error handling and reporting

## 🔍 Advanced Features

1. **Intelligent Caching**: Optimizes stock data requests
2. **Request Rate Limiting**: Prevents API abuse
3. **Security Enhancements**: Protected routes and secure headers
4. **Mock Data Generation**: Fallback for when API limits are reached
5. **Efficient Data Processing**: Optimized stock data transformation
6. **Custom Error Handling**: Detailed error responses
7. **MongoDB Indexing**: Optimized database queries
8. **JWT Authentication**: Secure user sessions
9. **Data Validation**: Input validation on all endpoints

## 🔧 Technologies

- **Node.js**: Runtime environment
- **Express**: Web application framework
- **MongoDB**: NoSQL database for data storage
- **Mongoose**: MongoDB object modeling
- **JWT**: Token-based authentication
- **Yahoo Finance API**: Stock data source
- **bcrypt**: Password hashing
- **Node-cache**: In-memory caching
- **Helmet**: Security headers
- **Compression**: Response compression

## 🛠️ Setup and Installation

### Prerequisites

- Node.js 16.x or higher
- MongoDB instance (local or cloud)

### Installation Steps

1. Clone the repository:

git clone https://github.com/Abishek0612/stock-analytics-dashboard-api.git

2. Install dependencies:
   npm install

3. Create a `.env` file in the root directory:
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/stock-analytics
   JWT_SECRET,
   JWT_EXPIRES_IN,
   NODE_ENV=development,

4. Start the development server:

npm run start (or) npm run dev

<!-- below is the API Documentation for reference -->

## 📚 API Documentation

### Authentication

- `POST /api/auth/signup`: Create new user account
- `POST /api/auth/login`: Authenticate user
- `GET /api/auth/me`: Get current user profile

### Stock Data

- `GET /api/stocks/data`: Get historical stock data
- `GET /api/stocks/search`: Search for stocks
- `GET /api/stocks/quote/:symbol`: Get real-time stock quote

### User Settings

- `PATCH /api/users/favorites`: Update user's favorite stocks
- `POST /api/users/dashboard-configs`: Save dashboard configuration
- `GET /api/users/dashboard-configs`: Get all user's dashboard configurations
- `DELETE /api/users/dashboard-configs/:configId`: Delete specific configuration
- `PATCH /api/users/profile`: Update user profile
- `PATCH /api/users/change-password`: Change user password
- `PATCH /api/users/profile-photo`: Update profile photo
- `PATCH /api/users/settings`: Update user settings
- `GET /api/users/settings`: Get user settings
