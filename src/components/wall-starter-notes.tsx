import type { Locale } from "@/lib/i18n";
import { inlineCopy } from "@/lib/inline-copy";

const notes = [
  ["किसी की बात ध्यान से सुनना भी एक सुंदर उपहार है।", "Listening with care is a beautiful gift."],
  ["आपकी छोटी-सी दयालुता किसी का दिन बदल सकती है।", "A small kindness from you can change someone's day."],
  ["आज किसी को बताइए कि वे अकेले नहीं हैं।", "Let someone know today that they are not alone."],
] as const;

export function WallStarterNotes({ locale }: { locale: Locale }) {
  return <div className="wall-starter-notes" aria-label={inlineCopy(locale, "साझा करने के लिए शुरुआती विचार", "Starter thoughts to share")}>
    <p className="wall-starter-label">{inlineCopy(locale, "साझा करने के लिए कुछ शुरुआती विचार", "A few starter thoughts to share")}</p>
    {notes.map(([hi, en]) => <blockquote className="wall-starter-note" key={en}>{inlineCopy(locale, hi, en)}</blockquote>)}
  </div>;
}
