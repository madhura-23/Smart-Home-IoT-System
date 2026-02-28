const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

// Generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user.id, role: user.role }, 
    JWT_SECRET, 
    { expiresIn: JWT_EXPIRES_IN }
  );
  
  const refreshToken = jwt.sign(
    { userId: user.id }, 
    JWT_SECRET, 
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
  
  return { accessToken, refreshToken };
};

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: { 
          code: 'MISSING_FIELDS', 
          message: 'All fields are required' 
        }
      });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { 
          code: 'USER_EXISTS', 
          message: 'User with this email already exists' 
        }
      });
    }
    
    // Create user
    const user = await User.create({
      email,
      passwordHash: password,
      firstName,
      lastName
    });
    
    // Generate tokens
    const tokens = generateTokens(user);
    
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: 3600
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { 
          code: 'MISSING_FIELDS', 
          message: 'Email and password are required' 
        }
      });
    }
    
    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { 
          code: 'INVALID_CREDENTIALS', 
          message: 'Invalid email or password' 
        }
      });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: { 
          code: 'INVALID_CREDENTIALS', 
          message: 'Invalid email or password' 
        }
      });
    }
    
    // Update last login
    await user.update({ lastLogin: new Date() });
    
    // Generate tokens
    const tokens = generateTokens(user);
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: 3600
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { 
          code: 'USER_NOT_FOUND', 
          message: 'User not found' 
        }
      });
    }
    
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// Logout (optional - mainly for frontend)
exports.logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Successfully logged out'
  });
};
