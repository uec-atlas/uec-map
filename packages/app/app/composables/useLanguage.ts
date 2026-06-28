type Language = "ja" | "en";
export const useLanguage = () => {
  const language = useState<Language>("lang", () => "ja");
  const setLanguage = (lang: Language) => {
    language.value = lang;
  };

  return { language, setLanguage };
};
