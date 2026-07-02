export const WEATHER_OPTIONS = [
  { value: "晴れ", emoji: "☀️" },
  { value: "晴れ時々曇り", emoji: "🌤️" },
  { value: "曇り", emoji: "☁️" },
  { value: "雨", emoji: "🌧️" },
  { value: "雪", emoji: "❄️" },
  { value: "霧", emoji: "🌫️" },
];

export function weatherEmoji(w: string) {
  return WEATHER_OPTIONS.find((o) => o.value === w)?.emoji ?? "🌈";
}
