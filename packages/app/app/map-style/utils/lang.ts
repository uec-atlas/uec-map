export function withLanguageSuffixFactory(language: string) {
  return (base: string) => (language === "en" ? `${base}:en` : base);
}
