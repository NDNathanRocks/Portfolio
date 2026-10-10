export type Greeting = {
  lang: string;
  text: string;
  locale: string;
  font: string;
  rtl?: boolean;
  scale?: number;
};

const latin = "var(--font-bricolage), sans-serif";
const cjk = (stack: string) => `var(--font-bricolage), ${stack}, sans-serif`;

export const greetings: Greeting[] = [
  { lang: "English", text: "Hello", locale: "en", font: latin },
  { lang: "Hindi", text: "नमस्ते", locale: "hi", font: "var(--font-deva), sans-serif" },
  { lang: "Arabic", text: "مرحبا", locale: "ar", font: "var(--font-arab), sans-serif", rtl: true },
  { lang: "French", text: "Bonjour", locale: "fr", font: latin },
  { lang: "Chinese", text: "你好", locale: "zh-Hans", font: cjk('"PingFang SC","Microsoft YaHei","Noto Sans SC"') },
  { lang: "Spanish", text: "Hola", locale: "es", font: latin },
  { lang: "Punjabi", text: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ", locale: "pa", font: "var(--font-guru), sans-serif", scale: 0.62 },
  { lang: "Korean", text: "안녕하세요", locale: "ko", font: cjk('"Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR"'), scale: 0.8 },
  { lang: "Nepali", text: "नमस्कार", locale: "ne", font: "var(--font-deva), sans-serif" },
  { lang: "Konkani", text: "देव बरें दिस दिवं", locale: "kok", font: "var(--font-deva), sans-serif", scale: 0.5 },
  { lang: "Japanese", text: "こんにちは", locale: "ja", font: cjk('"Hiragino Sans","Yu Gothic","Noto Sans JP"'), scale: 0.8 },
  { lang: "Gujarati", text: "નમસ્તે", locale: "gu", font: "var(--font-guj), sans-serif" },
  { lang: "Portuguese", text: "Olá", locale: "pt", font: latin },
  { lang: "Bengali", text: "নমস্কার", locale: "bn", font: "var(--font-beng), sans-serif" },
  { lang: "Russian", text: "Привет", locale: "ru", font: latin },
  { lang: "German", text: "Hallo", locale: "de", font: latin },
  { lang: "Tamil", text: "வணக்கம்", locale: "ta", font: "var(--font-tamil), sans-serif", scale: 0.85 },
  { lang: "Urdu", text: "السلام علیکم", locale: "ur", font: "var(--font-arab), sans-serif", rtl: true, scale: 0.7 },
  { lang: "Italian", text: "Ciao", locale: "it", font: latin },
  { lang: "Turkish", text: "Merhaba", locale: "tr", font: latin },
  { lang: "Swahili", text: "Jambo", locale: "sw", font: latin },
  { lang: "Vietnamese", text: "Xin chào", locale: "vi", font: latin },
  { lang: "Thai", text: "สวัสดี", locale: "th", font: "var(--font-thai), sans-serif" },
  { lang: "Indonesian", text: "Halo", locale: "id", font: latin },
  { lang: "Greek", text: "Γειά σου", locale: "el", font: latin },
  { lang: "Tagalog", text: "Kumusta", locale: "tl", font: latin },
];
