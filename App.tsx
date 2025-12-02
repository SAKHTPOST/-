import React, { useState, useEffect, useRef } from 'react';
import { User, Letter, Language } from './types';
import { TRANSLATIONS, MAX_CHARS } from './constants';
import { registerUser, getUser, getPublicLetters, getPrivateLetters, sendLetter, generatePostalCode } from './services/postalService';
import { checkContentSafety } from './services/geminiService';
import { LetterCard } from './components/LetterCard';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<'public' | 'private' | 'compose'>('public');
  const [registrationName, setRegistrationName] = useState('');
  
  // Compose State
  const [composeContent, setComposeContent] = useState('');
  const [composeRecipient, setComposeRecipient] = useState('');
  const [composeType, setComposeType] = useState<'public' | 'private'>('public');
  const [isThinking, setIsThinking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Feeds
  const [publicFeed, setPublicFeed] = useState<Letter[]>([]);
  const [inbox, setInbox] = useState<Letter[]>([]);
  const [copied, setCopied] = useState(false);

  // Refs for auto-scroll or focus
  const topRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'fa';
  const headingClass = lang === 'en' ? 'font-heading-en' : 'font-heading-fa';
  const bodyClass = lang === 'en' ? 'font-body-en' : 'font-body-fa';

  useEffect(() => {
    // Initial Load
    const existingUser = getUser();
    if (existingUser) {
      setUser(existingUser);
    }
    refreshFeeds(existingUser?.postalCode);
  }, []);

  const refreshFeeds = (postalCode?: string) => {
    setPublicFeed(getPublicLetters());
    if (postalCode) {
      setInbox(getPrivateLetters(postalCode));
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationName.trim()) return;
    const newUser = registerUser(registrationName);
    setUser(newUser);
    refreshFeeds(newUser.postalCode);
  };

  const handleLanguageToggle = () => {
    setLang(prev => prev === 'en' ? 'fa' : 'en');
  };

  const handleCopyCode = () => {
    if (user) {
      navigator.clipboard.writeText(user.postalCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReply = (originalLetter: Letter) => {
    setComposeType('private');
    setComposeRecipient(originalLetter.senderCode);
    setComposeContent('');
    setActiveTab('compose');
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!user) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    // Basic Validation
    if (!composeContent.trim()) return;
    if (composeType === 'private' && composeRecipient.length !== 6) {
      setErrorMsg("Recipient code must be 6 digits.");
      return;
    }

    setIsThinking(true);

    // 1. Safety Check with Gemini
    const isSafe = await checkContentSafety(composeContent);
    
    if (!isSafe) {
      setIsThinking(false);
      setErrorMsg(t.errorToxicity);
      return;
    }

    // 2. Process Letter
    const newLetter: Letter = {
      id: generatePostalCode() + Date.now().toString(), // Simple ID
      content: composeContent,
      senderCode: user.postalCode,
      recipientCode: composeType === 'private' ? composeRecipient : null,
      timestamp: Date.now(),
      type: composeType,
      isAnonymous: composeType === 'public'
    };

    const result = sendLetter(newLetter, user);

    setIsThinking(false);

    if (result.success) {
      setSuccessMsg("Letter sent successfully.");
      setComposeContent('');
      setComposeRecipient('');
      // Force user update to reflect new cooldown
      setUser({ ...user }); 
      refreshFeeds(user.postalCode);
      setTimeout(() => {
        setSuccessMsg(null);
        setActiveTab(composeType === 'public' ? 'public' : 'private');
      }, 1500);
    } else {
      const cooldownMsg = t.cooldownMessage;
      // result.message contains "X hours"
      const timeRemaining = result.message || '';
      // Format: "Your postal service is on cooldown. You can send again in [X hours]."
      const fullMsg = lang === 'en' 
        ? `${cooldownMsg} You can send again in ${timeRemaining}.`
        : `${cooldownMsg} دوباره می‌توانید ارسال کنید در ${timeRemaining}.`;
        
      setErrorMsg(fullMsg);
    }
  };

  // --- RENDERING ---

  if (!user) {
    // Registration Screen
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${bodyClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="absolute top-4 right-4 z-10">
          <button onClick={handleLanguageToggle} className="text-sm underline text-ink-600 hover:text-ink-900">
            {lang === 'en' ? 'Farsi (فارسی)' : 'English'}
          </button>
        </div>
        
        <div className="max-w-md w-full bg-paper-100 p-10 shadow-xl border border-paper-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-stamp-blue via-transparent to-stamp-red opacity-50"></div>
          
          <h1 className={`text-4xl text-center mb-2 text-ink-900 ${headingClass}`}>Post Box</h1>
          <p className="text-center text-ink-600 mb-8 italic">{t.welcome}</p>
          
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-sm uppercase tracking-widest text-ink-400 mb-2">{t.usernamePlaceholder}</label>
              <input
                type="text"
                value={registrationName}
                onChange={(e) => setRegistrationName(e.target.value)}
                className="w-full bg-transparent border-b-2 border-ink-400 py-2 text-xl focus:outline-none focus:border-ink-900 transition-colors"
                placeholder="..."
                autoFocus
              />
            </div>
            <button 
              type="submit"
              className={`w-full bg-ink-900 text-paper-100 py-3 mt-4 hover:bg-ink-800 transition-all ${headingClass}`}
            >
              {t.registerBtn}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main App
  return (
    <div className={`min-h-screen flex flex-col ${bodyClass}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div ref={topRef} />
      
      {/* Header / Nav */}
      <header className="sticky top-0 z-50 bg-paper-100/95 backdrop-blur-sm border-b border-paper-300 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="text-2xl font-bold font-heading-en text-ink-900">Post Box</div>
          </div>
          <div className="flex gap-4 text-sm">
             <button onClick={handleLanguageToggle} className="hover:underline opacity-60">
                {lang === 'en' ? 'FA' : 'EN'}
             </button>
             <div className="flex items-center gap-2 bg-paper-300 px-3 py-1 rounded-full text-xs">
                <span className="opacity-70">{t.postalCodeLabel}:</span>
                <span className="font-mono font-bold">{user.postalCode}</span>
                <button onClick={handleCopyCode} className="ml-1 opacity-50 hover:opacity-100">
                  {copied ? '✓' : '❐'}
                </button>
             </div>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="max-w-3xl mx-auto px-4 mt-2 flex gap-6 overflow-x-auto no-scrollbar">
          {(['public', 'private', 'compose'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setErrorMsg(null); setSuccessMsg(null); }}
              className={`
                pb-3 px-2 text-sm uppercase tracking-widest transition-all whitespace-nowrap
                ${activeTab === tab 
                  ? 'border-b-2 border-ink-900 text-ink-900 font-bold' 
                  : 'text-ink-400 hover:text-ink-600'}
                ${headingClass}
              `}
            >
              {tab === 'public' && t.publicSection}
              {tab === 'private' && t.privateSection}
              {tab === 'compose' && t.writeLetter}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl mx-auto w-full p-4 md:p-6 pb-20">
        
        {activeTab === 'public' && (
          <div className="animate-fade-in space-y-8">
            {publicFeed.length === 0 ? (
              <div className="text-center py-20 opacity-50 italic">{t.publicEmpty}</div>
            ) : (
              publicFeed.map(letter => (
                <LetterCard 
                  key={letter.id} 
                  letter={letter} 
                  t={t} 
                  lang={lang} 
                  onReply={handleReply} 
                  viewerCode={user.postalCode}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'private' && (
           <div className="animate-fade-in space-y-8">
             {inbox.length === 0 ? (
               <div className="text-center py-20 opacity-50 italic">{t.inboxEmpty}</div>
             ) : (
               inbox.map(letter => (
                <LetterCard 
                  key={letter.id} 
                  letter={letter} 
                  t={t} 
                  lang={lang} 
                  viewerCode={user.postalCode}
                />
               ))
             )}
           </div>
        )}

        {activeTab === 'compose' && (
          <div className="animate-slide-up max-w-2xl mx-auto bg-paper-100 p-6 md:p-10 shadow-lg border border-paper-300">
             
             {/* Type Selector inside Compose */}
             <div className="flex gap-4 mb-6 justify-center">
               <button 
                onClick={() => setComposeType('public')}
                className={`px-4 py-2 text-xs uppercase tracking-wider border rounded-full transition-colors ${composeType === 'public' ? 'bg-ink-900 text-paper-100 border-ink-900' : 'border-ink-400 text-ink-400'}`}
               >
                 {t.publicSection}
               </button>
               <button 
                onClick={() => setComposeType('private')}
                className={`px-4 py-2 text-xs uppercase tracking-wider border rounded-full transition-colors ${composeType === 'private' ? 'bg-ink-900 text-paper-100 border-ink-900' : 'border-ink-400 text-ink-400'}`}
               >
                 {t.privateSection}
               </button>
             </div>

             {composeType === 'private' && (
               <div className="mb-6">
                 <label className="block text-xs uppercase tracking-widest text-ink-400 mb-2">{t.recipientPlaceholder}</label>
                 <input
                  type="text"
                  maxLength={6}
                  value={composeRecipient}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setComposeRecipient(val);
                  }}
                  className="w-full bg-paper-200 border-b border-ink-400 p-2 font-mono text-lg focus:outline-none focus:bg-paper-300 transition-colors"
                  placeholder="123456"
                 />
               </div>
             )}

             <div className="mb-6">
               <textarea
                 value={composeContent}
                 onChange={(e) => setComposeContent(e.target.value.slice(0, MAX_CHARS))}
                 rows={10}
                 className={`w-full bg-transparent border-none resize-none focus:outline-none text-lg leading-relaxed ${bodyClass}`}
                 placeholder={composeType === 'public' ? t.placeholderPublic : t.placeholderPrivate}
               />
               <div className="text-right text-xs text-ink-400 mt-2">
                 {composeContent.length} / {MAX_CHARS}
               </div>
             </div>

             {/* Error / Status Messages */}
             {errorMsg && (
               <div className="mb-4 p-3 bg-red-50 text-red-800 text-sm border-l-2 border-red-800">
                 {errorMsg}
               </div>
             )}
             {successMsg && (
               <div className="mb-4 p-3 bg-green-50 text-green-800 text-sm border-l-2 border-green-800">
                 {successMsg}
               </div>
             )}

             <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-ink-400/20">
               <button 
                 onClick={() => {
                   setComposeContent('');
                   setActiveTab('public');
                 }}
                 className="text-sm text-ink-600 hover:text-ink-900 underline decoration-dotted"
               >
                 {t.cancel}
               </button>
               <button 
                 onClick={handleSend}
                 disabled={isThinking || !composeContent.trim()}
                 className={`
                    px-8 py-3 bg-ink-900 text-paper-100 text-sm uppercase tracking-widest shadow-lg
                    hover:bg-ink-800 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all ${headingClass}
                 `}
               >
                 {isThinking ? t.moderating : t.send}
               </button>
             </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;