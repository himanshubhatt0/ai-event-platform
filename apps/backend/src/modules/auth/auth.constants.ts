export const AUTH_CONSTANTS = {
  // Validation Rules
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 6,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },

  // Error Messages
  ERRORS: {
    INVALID_EMAIL_FORMAT: 'Invalid email format',
    EMAIL_ALREADY_EXISTS: 'Email already exists',
    PASSWORD_TOO_SHORT: 'Password must be at least 6 characters long',
    NAME_REQUIRED: 'Name is required',
    INVALID_CREDENTIALS: 'Invalid email or password',
    LOGIN_FAILED: 'Login failed. Please try again.',
  },

  // Success Messages
  SUCCESS: {
    REGISTRATION_SUCCESSFUL: 'User registered successfully',
    LOGIN_SUCCESSFUL: 'Login successful',
  },
};
