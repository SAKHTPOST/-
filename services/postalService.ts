import { User, Letter } from '../types';
import { COOLDOWN_MS } from '../constants';

// Keys for persistence
const STORAGE_KEY_LETTERS = 'postbox_letters';
const STORAGE_KEY_USERS = 'postbox_users_db';
const STORAGE_KEY_CURRENT_USER = 'postbox_user';

// Initialize Mock Data from Storage or Seed
const loadLetters = (): Letter[] => {
  const stored = localStorage.getItem(STORAGE_KEY_LETTERS);
  if (stored) return JSON.parse(stored);

  // Seed Data if empty
  const SEED_TIMESTAMP = Date.now() - 100000;
  return [
    {
      id: 'seed-1',
      content: "To whoever reads this: The stars look different tonight. I hope you find what you are looking for.",
      senderCode: '123456',
      recipientCode: null,
      timestamp: SEED_TIMESTAMP,
      type: 'public',
      isAnonymous: true
    },
    {
      id: 'seed-2',
      content: "The rain hasn't stopped for three days. It feels like the sky is trying to wash the slate clean.",
      senderCode: '987654',
      recipientCode: null,
      timestamp: SEED_TIMESTAMP + 5000,
      type: 'public',
      isAnonymous: true
    }
  ];
};

const loadUsers = (): User[] => {
  const stored = localStorage.getItem(STORAGE_KEY_USERS);
  return stored ? JSON.parse(stored) : [];
};

let MOCK_LETTERS: Letter[] = loadLetters();
let MOCK_USERS: User[] = loadUsers();

const saveState = () => {
  localStorage.setItem(STORAGE_KEY_LETTERS, JSON.stringify(MOCK_LETTERS));
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(MOCK_USERS));
};

export const generatePostalCode = (): string => {
  // Generate 6 digits, 1-9 only, unique (no repeats within code)
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  let code = '';
  const tempDigits = [...digits];
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * tempDigits.length);
    code += tempDigits[randomIndex];
    tempDigits.splice(randomIndex, 1);
  }
  return code;
};

export const registerUser = (username: string): User => {
  // Check if user already exists in local storage
  const stored = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
  if (stored) {
    return JSON.parse(stored);
  }

  const user: User = {
    username,
    postalCode: generatePostalCode(),
    joinedAt: Date.now(),
    lastPublicPost: null,
    lastPrivatePost: null
  };

  MOCK_USERS.push(user);
  localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
  saveState();
  return user;
};

export const getUser = (): User | null => {
  const stored = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
  return stored ? JSON.parse(stored) : null;
};

export const updateUser = (user: User) => {
  localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
  // Update mock db
  const idx = MOCK_USERS.findIndex(u => u.postalCode === user.postalCode);
  if (idx >= 0) {
    MOCK_USERS[idx] = user;
  } else {
    MOCK_USERS.push(user);
  }
  saveState();
};

export const getPublicLetters = (): Letter[] => {
  return MOCK_LETTERS.filter(l => l.type === 'public').sort((a, b) => b.timestamp - a.timestamp);
};

export const getPrivateLetters = (userCode: string): Letter[] => {
  return MOCK_LETTERS.filter(l => l.recipientCode === userCode).sort((a, b) => b.timestamp - a.timestamp);
};

export const sendLetter = (letter: Letter, user: User): { success: boolean, message?: string } => {
  const now = Date.now();

  if (letter.type === 'public') {
    if (user.lastPublicPost && (now - user.lastPublicPost < COOLDOWN_MS)) {
      const remainingMs = COOLDOWN_MS - (now - user.lastPublicPost);
      const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
      return { success: false, message: `${remainingHours} hours` };
    }
    user.lastPublicPost = now;
  } else {
    if (user.lastPrivatePost && (now - user.lastPrivatePost < COOLDOWN_MS)) {
      const remainingMs = COOLDOWN_MS - (now - user.lastPrivatePost);
      const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
      return { success: false, message: `${remainingHours} hours` };
    }
    user.lastPrivatePost = now;
  }

  MOCK_LETTERS.unshift(letter);
  updateUser(user);
  saveState();
  return { success: true };
};