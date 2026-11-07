import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';

describe('Password Management Logic', () => {
  it('enforces password minimum length of 8 characters', () => {
    function validateNewPassword(pw) {
      if (!pw || typeof pw !== 'string') return 'Password required';
      if (pw.length < 8) return 'New password must be at least 8 characters long';
      return null;
    }

    expect(validateNewPassword('')).toBe('Password required');
    expect(validateNewPassword('short')).toBe('New password must be at least 8 characters long');
    expect(validateNewPassword('1234567')).toBe('New password must be at least 8 characters long');
    expect(validateNewPassword('strongPassword123')).toBeNull();
  });

  it('correctly compares bcrypt password hash and generates new hash with cost 12', async () => {
    const oldPassword = 'myOldPassword123';
    const oldHash = await bcrypt.hash(oldPassword, 10);

    // Matching old password succeeds
    const matches = await bcrypt.compare(oldPassword, oldHash);
    expect(matches).toBe(true);

    // Wrong old password fails
    const wrong = await bcrypt.compare('wrongPassword', oldHash);
    expect(wrong).toBe(false);

    // Generate new hash
    const newPassword = 'myNewSecretPassword456!';
    const newHash = await bcrypt.hash(newPassword, 12);
    expect(newHash).not.toBe(oldHash);

    const newMatches = await bcrypt.compare(newPassword, newHash);
    expect(newMatches).toBe(true);
  });
});
