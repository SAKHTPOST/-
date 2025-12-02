import React from 'react';
import { Letter, Translation } from '../types';

interface LetterCardProps {
  letter: Letter;
  t: Translation;
  lang: 'en' | 'fa';
  onReply?: (letter: Letter) => void;
  viewerCode?: string;
}

export const LetterCard: React.FC<LetterCardProps> = ({ letter, t, lang, onReply, viewerCode }) => {
  const isRTL = lang === 'fa';
  const date = new Date(letter.timestamp).toLocaleDateString(lang === 'en' ? 'en-US' : 'fa-IR', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const fontClass = lang === 'en' ? 'font-body-en' : 'font-body-fa';
  const headingClass = lang === 'en' ? 'font-heading-en' : 'font-heading-fa';

  const isSentByMe = viewerCode === letter.senderCode;

  return (
    <div className={`
      relative bg-paper-100 p-6 md:p-8 mb-6 shadow-md border-t border-b border-paper-300
      transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1
      max-w-2xl mx-auto w-full
    `} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Stamp/Postmark Decoration */}
      <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} opacity-80 pointer-events-none select-none`}>
        <div className="w-16 h-16 border-2 border-dashed border-stamp-red rounded-full flex items-center justify-center rotate-[-12deg]">
           <span className={`text-[10px] font-bold text-stamp-red ${headingClass} text-center leading-tight`}>
             POST BOX<br/>{date}
           </span>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6 opacity-70 text-sm tracking-widest uppercase text-ink-600">
        {letter.type === 'public' ? (
          <span>{t.anonymous}</span>
        ) : (
          <span>
             {isSentByMe ? `${t.to} ${letter.recipientCode}` : `${t.from} ${letter.senderCode}`}
          </span>
        )}
      </div>

      {/* Content */}
      <div className={`mb-8 text-lg md:text-xl leading-relaxed text-ink-900 ${fontClass}`}>
         <p>{letter.content}</p>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end border-t border-ink-400/20 pt-4">
        <div className={`${headingClass} text-ink-800`}>
          {t.sincerely} <br/>
          <span className="italic">
            {letter.type === 'public' || letter.isAnonymous ? t.anonymous : letter.senderCode}
          </span>
        </div>

        {/* Reply Button (Only for public letters viewed by others) */}
        {letter.type === 'public' && onReply && !isSentByMe && (
          <button 
            onClick={() => onReply(letter)}
            className={`
              text-xs uppercase tracking-widest border border-ink-400 px-4 py-2 
              hover:bg-ink-800 hover:text-paper-100 transition-colors
              ${headingClass}
            `}
          >
            {t.reply}
          </button>
        )}
      </div>
    </div>
  );
};