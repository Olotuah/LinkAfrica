import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '30d' });
};

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    console.log('Register request received:', req.body);
    
    const { username, email, password, displayName } = req.body;

    // Basic validation
    if (!username || !email || !password || !displayName) {
      return res.status(400).json({
        error: 'All fields are required'
      });
    }

    // Create mock user for now
    const mockUser = {
      id: Date.now(),
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      displayName: displayName.trim(),
      bio: '',
      avatarUrl: '',
      isPro: false,
      theme: 'purple',
      createdAt: new Date()
    };

    const token = generateToken(mockUser.id);

    console.log('User created successfully:', mockUser);

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: mockUser
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Failed to create account. Please try again.'
    });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Mock login - accept any credentials for now
    const mockUser = {
      id: Date.now(),
      username: 'testuser',
      email: email.toLowerCase(),
      displayName: 'Test User',
      bio: 'Welcome to LinkAfrika!',
      avatarUrl: '',
      isPro: false,
      theme: 'purple',
      lastLoginAt: new Date()
    };

    const token = generateToken(mockUser.id);

    console.log('User logged in successfully:', mockUser);

    res.json({
      message: 'Login successful!',
      token,
      user: mockUser
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed. Please try again.'
    });
  }
});

export default router;