export type Language = 'en' | 'fa';

export interface User {
  username: string;
  postalCode: string; // 6 digits, no 0, unique
  joinedAt: number;
  lastPublicPost: number | null; // Timestamp
  lastPrivatePost: number | null; // Timestamp
}

export interface Letter {
  id: string;
  content: string;
  senderCode: string;
  recipientCode: string | null; // null if public
  timestamp: number;
  type: 'public' | 'private';
  isAnonymous: boolean;
  replyToId?: string; // If this is a private reply to a public letter
}

export interface Translation {
  welcome: string;
  registerTitle: string;
  registerBtn: string;
  usernamePlaceholder: string;
  postalCodeLabel: string;
  publicSection: string;
  privateSection: string;
  writeLetter: string;
  send: string;
  cancel: string;
  cooldownMessage: string;
  anonymous: string;
  sincerely: string;
  to: string;
  from: string;
  placeholderPublic: string;
  placeholderPrivate: string;
  recipientPlaceholder: string;
  inboxEmpty: string;
  publicEmpty: string;
  language: string;
  copyCode: string;
  copied: string;
  errorToxicity: string;
  moderating: string;
  reply: string;
}