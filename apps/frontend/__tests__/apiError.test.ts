import { extractApiErrorMessage } from '@/utils/apiError';

describe('extractApiErrorMessage', () => {
  it('returns backend message when present', () => {
    const error = {
      response: {
        data: {
          message: 'Invalid email or password',
          statusCode: 400,
        },
      },
    };

    expect(extractApiErrorMessage(error, 'Fallback')).toBe('Invalid email or password');
  });

  it('joins array validation messages', () => {
    const error = {
      response: {
        data: {
          message: ['email must be valid', 'password must be longer than 6'],
        },
      },
    };

    expect(extractApiErrorMessage(error, 'Fallback')).toBe(
      'email must be valid, password must be longer than 6',
    );
  });

  it('falls back to Error.message when backend message is missing', () => {
    const error = new Error('Network Error');

    expect(extractApiErrorMessage(error, 'Fallback')).toBe('Network Error');
  });

  it('uses fallback when nothing useful exists', () => {
    expect(extractApiErrorMessage({}, 'Fallback')).toBe('Fallback');
  });
});
