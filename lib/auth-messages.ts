/** Friendly text for the `?error=` codes the Google callback redirects with. */
const GOOGLE_ERRORS: Record<string, string> = {
  google_unavailable: 'Google sign-in is not set up on the server yet.',
  google_denied: 'Google sign-in was cancelled.',
  google_state: 'That sign-in link expired. Please try again.',
  google_unverified: 'Your Google email is not verified.',
  google_failed: 'Google sign-in failed. Please try again.',
}

export function authErrorMessage(code: string | string[] | undefined): string {
  return typeof code === 'string' ? GOOGLE_ERRORS[code] ?? '' : ''
}
