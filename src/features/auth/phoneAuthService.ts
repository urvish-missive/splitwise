import { UserProfile } from '@/types';
import { normalizePhone } from '@/lib/utils';
import {
  getUserProfileFromFirestore,
  saveUserProfileToFirestore
} from '@/features/api/firestoreService';

const PIN_STORAGE_PREFIX = 'splitwise_pin_';

/**
 * Authenticates or registers a user using Phone Number + 4-digit PIN.
 */
export async function loginOrRegisterWithPhoneAndPin(
  rawPhone: string,
  pin: string,
  providedName?: string
): Promise<UserProfile> {
  const cleanPhone = rawPhone.trim();
  const digits = normalizePhone(cleanPhone);

  if (!digits || digits.length < 10) {
    throw new Error('Please enter a valid 10-digit phone number');
  }

  const cleanPin = pin.trim();
  if (!cleanPin || cleanPin.length !== 4 || !/^\d{4}$/.test(cleanPin)) {
    throw new Error('PIN must be exactly 4 digits (e.g. 1234)');
  }

  const userId = `usr_${digits}`;

  // 1. Check if user profile exists in Cloud Firestore or local storage
  let existingProfile: UserProfile | null = await getUserProfileFromFirestore(userId);

  if (!existingProfile) {
    const localPin = localStorage.getItem(`${PIN_STORAGE_PREFIX}${digits}`);
    if (localPin) {
      existingProfile = {
        id: userId,
        name: providedName?.trim() || `User ${digits.slice(-4)}`,
        phone: cleanPhone,
        pin: localPin,
        defaultCurrency: 'INR',
        createdAt: new Date().toISOString()
      };
    }
  }

  // 2. If user exists and has a PIN, verify PIN
  if (existingProfile && existingProfile.pin) {
    if (existingProfile.pin !== cleanPin) {
      throw new Error('Incorrect 4-digit PIN. Please try again.');
    }

    // PIN matched! Update name if user provided a new name
    const finalProfile: UserProfile = {
      ...existingProfile,
      name: providedName?.trim() || existingProfile.name || `User ${digits.slice(-4)}`,
      phone: cleanPhone
    };

    localStorage.setItem(`${PIN_STORAGE_PREFIX}${digits}`, cleanPin);
    await saveUserProfileToFirestore(finalProfile);
    return finalProfile;
  }

  // 3. New User or First Time setting PIN for this phone number
  const finalName = providedName?.trim() || `User ${digits.slice(-4)}`;
  const newProfile: UserProfile = {
    id: userId,
    name: finalName,
    phone: cleanPhone,
    pin: cleanPin,
    email: `${digits}@splitwise.local`,
    defaultCurrency: 'INR',
    createdAt: new Date().toISOString()
  };

  localStorage.setItem(`${PIN_STORAGE_PREFIX}${digits}`, cleanPin);
  await saveUserProfileToFirestore(newProfile);
  return newProfile;
}
