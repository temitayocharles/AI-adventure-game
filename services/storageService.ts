
import { UserProfile, AvatarColors } from '../types';
import { INITIAL_USER } from './mockData';

const STORAGE_KEY = 'wha_user_data_v2'; // Bumped version for schema change

export const loadUser = (): UserProfile => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      
      // Migration: Ensure avatar config exists and has model
      if (parsed.avatarColors && !parsed.avatarConfig) {
        parsed.avatarConfig = {
          model: 'human',
          colors: parsed.avatarColors as AvatarColors,
          hairStyle: 'normal',
          accessory: 'none'
        };
        delete parsed.avatarColors;
      }
      
      if (parsed.avatarConfig && !parsed.avatarConfig.model) {
        parsed.avatarConfig.model = 'human';
      }
      
      // Migration: Ensure stats object exists
      if (!parsed.stats) {
        parsed.stats = INITIAL_USER.stats;
      }
      // Migration: Ensure settings object exists
      if (!parsed.settings) {
        parsed.settings = INITIAL_USER.settings;
      }
      
      // Ensure theme exists
      if (!parsed.theme) {
        parsed.theme = 'dark';
      }

      return parsed;
    }
    return INITIAL_USER;
  } catch (e) {
    console.error("Failed to load user data", e);
    return INITIAL_USER;
  }
};

export const saveUser = (user: UserProfile): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.error("Failed to save user data", e);
  }
};
