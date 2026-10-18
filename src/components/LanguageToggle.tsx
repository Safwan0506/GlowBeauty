import { useLang } from '../contexts/LanguageContext';

export default function LanguageToggle() {
  const { lang, setLang } = useLang();

  return (
    <button
      onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
      className="px-3 py-1.5 text-xs font-semibold tracking-wider uppercase border border-current rounded-full transition-all duration-300 hover:scale-105 opacity-80 hover:opacity-100"
      aria-label="Toggle language"
    >
      {lang === 'fr' ? 'EN' : 'FR'}
    </button>
  );
}
