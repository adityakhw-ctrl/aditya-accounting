import { createContext, useContext, useState, type ReactNode } from "react";

export type Lang = "en" | "hi";

type Dict = Record<string, string>;

const en: Dict = {
  "nav.home": "Home",
  "nav.why": "Why Us",
  "nav.process": "Process",
  "nav.features": "Features",
  "nav.about": "About",
  "nav.contact": "Contact",
  "nav.cta": "Get Started",

  "hero.badge": "AI-Powered Accounting",
  "hero.title": "Smart Accounting. Powered by AI.",
  "hero.subtitle":
    "Professional accounting services with modern technology, automation and accuracy.",
  "hero.cta1": "Get Started",
  "hero.cta2": "Contact Us",
  "hero.stat1": "Accuracy",
  "hero.stat2": "AI Assisted",
  "hero.stat3": "Support",

  "why.title": "Why Choose Us",
  "why.subtitle": "Everything a modern business needs from its accountant.",
  "why.1.t": "Accurate Accounting",
  "why.1.d": "Precise books you can trust, verified with AI-assisted checks.",
  "why.2.t": "AI Assisted Workflow",
  "why.2.d": "Automation removes repetitive work so nothing gets missed.",
  "why.3.t": "Fast Response",
  "why.3.d": "Quick turnaround and responsive communication, always.",
  "why.4.t": "Secure Data",
  "why.4.d": "Bank-grade encryption and strict confidentiality by default.",
  "why.5.t": "Professional Support",
  "why.5.d": "Guidance from experienced accountants whenever you need it.",

  "process.title": "Our Process",
  "process.subtitle": "A clear, simple workflow from start to finish.",
  "process.1.t": "Collect Documents",
  "process.1.d": "Share your bills, invoices and statements securely.",
  "process.2.t": "Process Accounting",
  "process.2.d": "We record and reconcile using AI-assisted tools.",
  "process.3.t": "Review",
  "process.3.d": "Every entry is reviewed by our expert accountants.",
  "process.4.t": "Deliver Reports",
  "process.4.d": "Get clean, timely reports for smarter decisions.",

  "features.title": "Features",
  "features.subtitle": "Modern accounting, built for growing businesses.",
  "features.1.t": "Digital Accounting",
  "features.1.d": "Fully paperless workflow accessible anywhere.",
  "features.2.t": "Monthly Reports",
  "features.2.d": "Clear P&L, cash flow and summary reports every month.",
  "features.3.t": "Secure Document Management",
  "features.3.d": "Encrypted storage with organized, searchable records.",
  "features.4.t": "AI Ready Platform",
  "features.4.d": "Built on automation-first tools for the future of finance.",

  "about.title": "About Aditya Accounting",
  "about.body":
    "Aditya Accounting helps business owners, traders, shop owners, small businesses and startups keep their finances organised, accurate and audit-ready. We combine seasoned accounting expertise with AI-powered tools to deliver a service that is fast, precise and refreshingly simple.",
  "about.point1": "Trusted by small businesses & startups",
  "about.point2": "AI-first, human-reviewed",
  "about.point3": "Confidential and secure",

  "contact.title": "Get in Touch",
  "contact.subtitle": "Tell us about your business — we'll take it from here.",
  "contact.name": "Your Name",
  "contact.email": "Email Address",
  "contact.phone": "Phone",
  "contact.message": "How can we help?",
  "contact.send": "Send Message",
  "contact.sent": "Thanks! We'll get back to you shortly.",

  "footer.tag": "Smart Accounting. Powered by AI.",
  "footer.services": "Services",
  "footer.company": "Company",
  "footer.legal": "Legal",
  "footer.accounting": "Accounting",
  "footer.soon": "Coming soon",
  "footer.gst": "GST",
  "footer.tds": "TDS",
  "footer.itr": "ITR",
  "footer.payroll": "Payroll",
  "footer.registration": "Business Registration",
  "footer.aiauto": "AI Automation",
  "footer.rights": "All rights reserved.",
  "footer.privacy": "Privacy",
  "footer.terms": "Terms",
};

const hi: Dict = {
  "nav.home": "होम",
  "nav.why": "क्यों चुनें",
  "nav.process": "प्रक्रिया",
  "nav.features": "विशेषताएँ",
  "nav.about": "हमारे बारे में",
  "nav.contact": "संपर्क",
  "nav.cta": "शुरू करें",

  "hero.badge": "एआई-संचालित अकाउंटिंग",
  "hero.title": "स्मार्ट अकाउंटिंग। एआई से संचालित।",
  "hero.subtitle":
    "आधुनिक तकनीक, ऑटोमेशन और सटीकता के साथ पेशेवर अकाउंटिंग सेवाएँ।",
  "hero.cta1": "शुरू करें",
  "hero.cta2": "संपर्क करें",
  "hero.stat1": "सटीकता",
  "hero.stat2": "एआई सहायक",
  "hero.stat3": "सहायता",

  "why.title": "हमें क्यों चुनें",
  "why.subtitle": "आधुनिक व्यवसाय को अपने अकाउंटेंट से जो चाहिए, सब कुछ।",
  "why.1.t": "सटीक अकाउंटिंग",
  "why.1.d": "एआई-सहायक जाँच के साथ भरोसेमंद खाते।",
  "why.2.t": "एआई सहायक वर्कफ़्लो",
  "why.2.d": "ऑटोमेशन दोहराव वाला काम हटाता है, कुछ भी छूटता नहीं।",
  "why.3.t": "त्वरित प्रतिक्रिया",
  "why.3.d": "तेज़ जवाब और सक्रिय संवाद, हमेशा।",
  "why.4.t": "सुरक्षित डेटा",
  "why.4.d": "बैंक-स्तरीय एन्क्रिप्शन और पूर्ण गोपनीयता।",
  "why.5.t": "पेशेवर सहायता",
  "why.5.d": "अनुभवी अकाउंटेंट्स से मार्गदर्शन, जब भी ज़रूरत हो।",

  "process.title": "हमारी प्रक्रिया",
  "process.subtitle": "शुरू से अंत तक एक स्पष्ट और सरल वर्कफ़्लो।",
  "process.1.t": "दस्तावेज़ इकट्ठा करें",
  "process.1.d": "अपने बिल, इनवॉइस और स्टेटमेंट सुरक्षित रूप से भेजें।",
  "process.2.t": "अकाउंटिंग प्रोसेस",
  "process.2.d": "हम एआई-सहायक टूल से रिकॉर्ड और मिलान करते हैं।",
  "process.3.t": "समीक्षा",
  "process.3.d": "हर एंट्री हमारे विशेषज्ञ अकाउंटेंट्स द्वारा जाँची जाती है।",
  "process.4.t": "रिपोर्ट डिलीवर करें",
  "process.4.d": "समय पर, साफ़ और सटीक रिपोर्ट पाएँ।",

  "features.title": "विशेषताएँ",
  "features.subtitle": "बढ़ते व्यवसायों के लिए आधुनिक अकाउंटिंग।",
  "features.1.t": "डिजिटल अकाउंटिंग",
  "features.1.d": "पूरी तरह पेपरलेस वर्कफ़्लो, कहीं से भी सुलभ।",
  "features.2.t": "मासिक रिपोर्ट",
  "features.2.d": "साफ़ P&L, कैश फ्लो और सारांश हर महीने।",
  "features.3.t": "सुरक्षित दस्तावेज़ प्रबंधन",
  "features.3.d": "एन्क्रिप्टेड स्टोरेज और व्यवस्थित रिकॉर्ड।",
  "features.4.t": "एआई तैयार प्लेटफ़ॉर्म",
  "features.4.d": "ऑटोमेशन-फर्स्ट टूल्स पर बना भविष्य का प्लेटफ़ॉर्म।",

  "about.title": "आदित्य अकाउंटिंग के बारे में",
  "about.body":
    "आदित्य अकाउंटिंग व्यापारियों, दुकानदारों, छोटे व्यवसायों और स्टार्टअप्स को अपनी वित्तीय व्यवस्था सटीक, संगठित और ऑडिट-रेडी रखने में मदद करता है। हम अनुभवी अकाउंटिंग विशेषज्ञता को एआई-संचालित टूल्स से जोड़ते हैं।",
  "about.point1": "छोटे व्यवसायों और स्टार्टअप्स का भरोसा",
  "about.point2": "एआई-फर्स्ट, मानव-समीक्षित",
  "about.point3": "गोपनीय और सुरक्षित",

  "contact.title": "संपर्क करें",
  "contact.subtitle": "अपने व्यवसाय के बारे में बताएँ — बाकी हम संभालेंगे।",
  "contact.name": "आपका नाम",
  "contact.email": "ईमेल पता",
  "contact.phone": "फ़ोन",
  "contact.message": "हम कैसे मदद कर सकते हैं?",
  "contact.send": "संदेश भेजें",
  "contact.sent": "धन्यवाद! हम जल्द ही संपर्क करेंगे।",

  "footer.tag": "स्मार्ट अकाउंटिंग। एआई से संचालित।",
  "footer.services": "सेवाएँ",
  "footer.company": "कंपनी",
  "footer.legal": "कानूनी",
  "footer.accounting": "अकाउंटिंग",
  "footer.soon": "जल्द आ रहा है",
  "footer.gst": "जीएसटी",
  "footer.tds": "टीडीएस",
  "footer.itr": "आईटीआर",
  "footer.payroll": "पेरोल",
  "footer.registration": "व्यवसाय पंजीकरण",
  "footer.aiauto": "एआई ऑटोमेशन",
  "footer.rights": "सर्वाधिकार सुरक्षित।",
  "footer.privacy": "गोपनीयता",
  "footer.terms": "शर्तें",
};

const dicts: Record<Lang, Dict> = { en, hi };

const I18nContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: string) => string;
}>({ lang: "en", setLang: () => {}, t: (k) => k });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const t = (k: string) => dicts[lang][k] ?? k;
  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
