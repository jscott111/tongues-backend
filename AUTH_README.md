# Authentication System

This document describes the authentication system implemented for the Scribe backend.

## Overview

The authentication system uses JWT (JSON Web Tokens) for stateless authentication. Users can register, login, and access protected routes using JWT tokens.

## Features

- User registration with email validation
- Secure password hashing using bcrypt
- JWT-based authentication
- Token refresh mechanism
- Protected routes and WebSocket connections
- User profile management

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST `/api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST `/api/auth/refresh`
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/api/auth/logout`
Logout user (client-side token removal).

**Headers:** `Authorization: Bearer <accessToken>`

#### GET `/api/auth/me`
Get current user profile.

**Headers:** `Authorization: Bearer <accessToken>`

#### PUT `/api/auth/profile`
Update user profile.

**Headers:** `Authorization: Bearer <accessToken>`

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

## Protected Routes

The following routes now require authentication:

- `GET /api/websocket-status` - WebSocket status with user info
- `GET /api/languages` - Get supported languages
- `POST /api/translate` - Translate text

## WebSocket Authentication

WebSocket connections are also authenticated. Clients must provide a valid JWT token when connecting:

```javascript
const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

## Environment Variables

Add the following to your `.env` file:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Password Requirements

- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number

## Token Expiration

- Access tokens: 24 hours
- Refresh tokens: 7 days

## Security Features

- Passwords are hashed using bcrypt with 12 salt rounds
- JWT tokens include issuer and audience claims
- User sessions are tracked in WebSocket connections
- Input validation using express-validator
- CORS configuration for secure cross-origin requests

## Usage in Frontend

### Storing Tokens
Store tokens securely (e.g., in httpOnly cookies or secure storage):

```javascript
// Store tokens after login
localStorage.setItem('accessToken', response.tokens.accessToken);
localStorage.setItem('refreshToken', response.tokens.refreshToken);
```

### Making Authenticated Requests
Include the access token in the Authorization header:

```javascript
const response = await fetch('/api/translate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    text: 'Hello world',
    from: 'en',
    to: 'es'
  })
});
```

### WebSocket Authentication
```javascript
const socket = io('http://localhost:3001', {
  auth: {
    token: localStorage.getItem('accessToken')
  }
});
```

## Database

Currently using in-memory storage for demo purposes. In production, integrate with a proper database like MongoDB, PostgreSQL, or MySQL.

## Error Codes

- `MISSING_TOKEN` - No authorization token provided
- `INVALID_TOKEN` - Invalid or expired token
- `USER_NOT_FOUND` - User not found or deactivated
- `USER_EXISTS` - User with email already exists
- `INVALID_CREDENTIALS` - Invalid email or password
- `EMAIL_TAKEN` - Email already taken by another user
- `MISSING_REFRESH_TOKEN` - No refresh token provided
- `INVALID_REFRESH_TOKEN` - Invalid refresh token
