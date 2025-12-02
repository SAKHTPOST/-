import { Translation, Language } from './types';

export const TRANSLATIONS: Record<Language, Translation> = {
  en: {
    welcome: "Welcome to Post Box! Register to begin:",
    registerTitle: "Register for your Postal Code",
    registerBtn: "Register",
    usernamePlaceholder: "Enter your username...",
    postalCodeLabel: "Your Postal Code",
    publicSection: "Anonymous Letters",
    privateSection: "Private Letters",
    writeLetter: "Write a Letter",
    send: "Send Letter",
    cancel: "Discard",
    cooldownMessage: "Your postal service is on cooldown.",
    anonymous: "Anonymous",
    sincerely: "Sincerely,",
    to: "Dear",
    from: "From",
    placeholderPublic: "Share a thought with the world (max 500 chars)...",
    placeholderPrivate: "Write a private message...",
    recipientPlaceholder: "Recipient Postal Code (6 digits)",
    inboxEmpty: "Your mailbox is empty.",
    publicEmpty: "No public letters yet.",
    language: "Language",
    copyCode: "Copy Code",
    copied: "Copied!",
    errorToxicity: "This letter contains content that cannot be delivered.",
    moderating: "Reviewing content...",
    reply: "Reply Privately"
  },
  fa: {
    welcome: "به صندوق پست خوش آمدید! برای شروع ثبت نام کنید:",
    registerTitle: "ثبت نام برای دریافت کد پستی",
    registerBtn: "ثبت نام",
    usernamePlaceholder: "نام کاربری خود را وارد کنید...",
    postalCodeLabel: "کد پستی شما",
    publicSection: "نامه‌های بی‌نشانی",
    privateSection: "نامه‌های خصوصی",
    writeLetter: "نوشتن نامه",
    send: "ارسال نامه",
    cancel: "لغو",
    cooldownMessage: "سرویس پستی شما در حال استراحت است.",
    anonymous: "بی‌نشان",
    sincerely: "ارادتمند،",
    to: "به",
    from: "از طرف",
    placeholderPublic: "فکری را با جهان به اشتراک بگذارید (حداکثر ۵۰۰ کاراکتر)...",
    placeholderPrivate: "پیام خصوصی بنویسید...",
    recipientPlaceholder: "کد پستی گیرنده (۶ رقم)",
    inboxEmpty: "صندوق پستی شما خالی است.",
    publicEmpty: "هنوز نامه عمومی ارسال نشده است.",
    language: "زبان",
    copyCode: "کپی کد",
    copied: "کپی شد!",
    errorToxicity: "این نامه حاوی محتوایی است که قابل ارسال نیست.",
    moderating: "در حال بررسی محتوا...",
    reply: "پاسخ خصوصی"
  }
};

export const MAX_CHARS = 500;
export const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 Hours