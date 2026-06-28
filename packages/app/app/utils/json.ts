export const unescapeProperties = (feature: {
  properties?: Record<string, any>;
}) => {
  if (!feature.properties) return;
  for (const key of Object.keys(feature.properties)) {
    let value = feature.properties[key];
    try {
      value = JSON.parse(value);
    } catch {}
    feature.properties[key] = value;
  }
};
