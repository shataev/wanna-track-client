export const VERIFICATION_EMAIL_STATUS_NOT_FOUND = 'not-found'
export const VERIFICATION_EMAIL_STATUS_USER_NOT_FOUND = 'user-not-found'
export const VERIFICATION_EMAIL_STATUS_ALREADY_VERIFIED = 'already-verified'
export const VERIFICATION_EMAIL_STATUS_SUCCESS = 'success'
export const VERIFICATION_EMAIL_STATUS_ERROR = 'error'
export const VERIFICATION_EMAIL_STATUS_INVALID = 'invalid'
export const VERIFICATION_EMAIL_STATUS_EXPIRED = 'expired'

export const EMAIL_VERIFICATION_PAGE_CONFIG = {
  [VERIFICATION_EMAIL_STATUS_SUCCESS]: {
    title: 'Email verified!',
    subtitle: 'Click the button below to Sing In.'
  },
  [VERIFICATION_EMAIL_STATUS_ERROR]: {
    title: 'Something went wrong!',
    subtitle: 'Please, try to open this page later?'
  },
  [VERIFICATION_EMAIL_STATUS_NOT_FOUND]: {
    title: 'Sorry!',
    subtitle:
      'Your verification link was not found. You can generate a new verification mail by clicking the button below.'
  },
  [VERIFICATION_EMAIL_STATUS_INVALID]: {
    title: 'Sorry!',
    subtitle: 'Your verification link is invalid.'
  },
  [VERIFICATION_EMAIL_STATUS_EXPIRED]: {
    title: 'Your verification link is expired.',
    subtitle: 'You can generate a new verification mail by clicking the button below.'
  },
  [VERIFICATION_EMAIL_STATUS_ALREADY_VERIFIED]: {
    title: 'Your email is already verified.',
    subtitle: 'Click the button below to Sing In.'
  },
  [VERIFICATION_EMAIL_STATUS_USER_NOT_FOUND]: {
    title: 'Sorry!',
    subtitle: 'User with such id was not found.'
  }
}