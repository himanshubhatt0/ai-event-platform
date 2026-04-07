export const ORGANIZATION_CONSTANTS = {
  VALIDATION: {
    ORG_NAME_MAX_LENGTH: 100,
  },

  ERRORS: {
    NAME_REQUIRED: 'Organization name is required',
    NAME_TOO_LONG: 'Organization name must not exceed 100 characters',
    INVALID_ORG_ID: 'Organization id is required',
    INVALID_USER_ID: 'User id is required',
    ORGANIZATION_NOT_FOUND: 'Organization not found',
    ORGANIZATION_NAME_ALREADY_EXISTS: 'Organization name already exists',
    USER_NOT_FOUND: 'User not found',
    ASSIGN_USER_FAILED: 'Failed to assign user to organization',
    FETCH_USERS_FAILED: 'Failed to fetch organization users',
    CREATE_ORGANIZATION_FAILED: 'Failed to create organization',
  },
};
