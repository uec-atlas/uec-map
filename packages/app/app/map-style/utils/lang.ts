import type { ExpressionSpecification } from "maplibre-gl";

export function withLanguageSuffixFactory(language: string) {
  return (base: string) => (language === "en" ? `${base}:en` : base);
}

function getAltLanguage(language: string) {
  return language === "en" ? "ja" : "en";
}

export function nameField(language: string) {
  return [
    "coalesce",
    ["get", language, ["get", "name"]],
    ["get", getAltLanguage(language), ["get", "name"]],
  ] as const satisfies ExpressionSpecification;
}

export function altNameField(language: string) {
  return [
    "to-string",
    [
      "coalesce",
      ["at", 0, ["get", language, ["get", "alternateName"]]],
      [
        "at",
        0,
        ["array", ["get", getAltLanguage(language), ["get", "alternateName"]]],
      ],
    ],
  ] as const satisfies ExpressionSpecification;
}
