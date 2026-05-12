export const LANGS = ['ru', 'en'] as const;
export type Lang = (typeof LANGS)[number];

const isLang = (v: unknown): v is Lang =>
  typeof v === 'string' && (LANGS as readonly string[]).includes(v);

export const getInitialLang = (): Lang => {
  const saved = localStorage['lang'];
  if (isLang(saved)) return saved;

  const nav = navigator.language?.toLowerCase() ?? '';
  for (const lang of LANGS) {
    if (nav.startsWith(lang)) return lang;
  }
  return 'en';
};
