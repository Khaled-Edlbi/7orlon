import type { DictionaryKey, Locale } from "@/lib/i18n";

/**
 * How the Site copy editor lays the dictionary out: one group per place on the
 * site, each line with a name the studio will recognise. The names are
 * interface copy, so every one carries both languages.
 */
type Label = Record<Locale, string>;

export type ContentField = {
  key: DictionaryKey;
  label: Label;
  /** A paragraph rather than a line: edited in a textarea. */
  long?: boolean;
};

export type ContentSection = {
  id: string;
  title: Label;
  fields: ContentField[];
};

export const CONTENT_SECTIONS: ContentSection[] = [
  {
    id: "frame",
    title: { en: "Header and footer", ar: "الترويسة والتذييل" },
    fields: [
      { key: "brand", label: { en: "Brand name", ar: "اسم العلامة" } },
      { key: "navCollection", label: { en: "Menu — collection", ar: "القائمة — المجموعة" } },
      { key: "navArtist", label: { en: "Menu — artist", ar: "القائمة — الفنانة" } },
      { key: "footer", label: { en: "Footer line", ar: "سطر التذييل" } },
    ],
  },
  {
    id: "hero",
    title: { en: "Landing hero", ar: "واجهة الصفحة الرئيسية" },
    fields: [
      { key: "kicker", label: { en: "Small line above the headline", ar: "السطر الصغير فوق العنوان" } },
      { key: "heroA", label: { en: "Headline — first part", ar: "العنوان — الجزء الأول" } },
      { key: "heroB", label: { en: "Headline — painted part", ar: "العنوان — الجزء المرسوم" } },
      { key: "heroSub", label: { en: "Introduction", ar: "المقدّمة" }, long: true },
      { key: "ctaPrimary", label: { en: "Main button", ar: "الزر الرئيسي" } },
      { key: "heroBadge", label: { en: "Badge on the picture", ar: "الشارة على الصورة" } },
    ],
  },
  {
    id: "stats",
    title: { en: "Hero figures", ar: "أرقام الواجهة" },
    fields: [
      { key: "stat1", label: { en: "First figure", ar: "الرقم الأول" } },
      { key: "stat1l", label: { en: "First figure — caption", ar: "الرقم الأول — الوصف" } },
      { key: "stat2", label: { en: "Second figure", ar: "الرقم الثاني" } },
      { key: "stat2l", label: { en: "Second figure — caption", ar: "الرقم الثاني — الوصف" } },
      { key: "stat3", label: { en: "Third figure", ar: "الرقم الثالث" } },
      { key: "stat3l", label: { en: "Third figure — caption", ar: "الرقم الثالث — الوصف" } },
    ],
  },
  {
    id: "collection",
    title: { en: "Collection and index", ar: "المجموعة والفهرس" },
    fields: [
      { key: "showKicker", label: { en: "Showcase — heading", ar: "العرض — العنوان" } },
      { key: "indexTitle", label: { en: "Index — heading", ar: "الفهرس — العنوان" } },
      { key: "works", label: { en: "Word after the count (“12 works”)", ar: "الكلمة بعد العدد («١٢ عملاً»)" } },
      { key: "of", label: { en: "Word between counts (“1 of 12”)", ar: "الكلمة بين العددين («١ من ١٢»)" } },
      { key: "details", label: { en: "Details link", ar: "رابط التفاصيل" } },
      { key: "hint", label: { en: "Keyboard hint", ar: "تلميح لوحة المفاتيح" } },
      { key: "inStock", label: { en: "Status — available", ar: "الحالة — متاحة" } },
      { key: "soldOut", label: { en: "Status — sold", ar: "الحالة — مُباعة" } },
      { key: "buy", label: { en: "Acquire button", ar: "زر الاقتناء" } },
      { key: "sold", label: { en: "Acquire button — when sold", ar: "زر الاقتناء — عند البيع" } },
      { key: "enquire", label: { en: "Enquire button", ar: "زر الاستفسار" } },
      { key: "noImage", label: { en: "When a work has no photograph", ar: "عند غياب صورة العمل" } },
      { key: "previous", label: { en: "Previous", ar: "السابقة" } },
      { key: "next", label: { en: "Next", ar: "التالية" } },
    ],
  },
  {
    id: "work",
    title: { en: "A work’s page", ar: "صفحة العمل" },
    fields: [
      { key: "back", label: { en: "Back to the collection", ar: "العودة إلى المجموعة" } },
      { key: "backHome", label: { en: "Back button", ar: "زر الرجوع" } },
      { key: "specs", label: { en: "Specifications — heading", ar: "المواصفات — العنوان" } },
      { key: "medium", label: { en: "Row — medium", ar: "السطر — الخامة" } },
      { key: "size", label: { en: "Row — size", ar: "السطر — المقاس" } },
      { key: "year", label: { en: "Row — year", ar: "السطر — السنة" } },
      { key: "edition", label: { en: "Row — edition", ar: "السطر — الإصدار" } },
      { key: "editionV", label: { en: "Edition — text", ar: "الإصدار — النص" } },
      { key: "signature", label: { en: "Row — signature", ar: "السطر — التوقيع" } },
      { key: "signatureV", label: { en: "Signature — text", ar: "التوقيع — النص" } },
      { key: "frame", label: { en: "Row — frame", ar: "السطر — الإطار" } },
      { key: "frameV", label: { en: "Frame — text", ar: "الإطار — النص" } },
      { key: "shipping", label: { en: "Row — shipping", ar: "السطر — الشحن" } },
      { key: "shippingV", label: { en: "Shipping — text", ar: "الشحن — النص" } },
      { key: "certificate", label: { en: "Row — certificate", ar: "السطر — الشهادة" } },
      { key: "certificateV", label: { en: "Certificate — text", ar: "الشهادة — النص" } },
      { key: "fullscreen", label: { en: "Full-screen button", ar: "زر ملء الشاشة" } },
      { key: "zoomHint", label: { en: "Full-screen hint", ar: "تلميح ملء الشاشة" } },
      { key: "prevImage", label: { en: "Previous picture (arrow label)", ar: "الصورة السابقة (تسمية السهم)" } },
      { key: "nextImage", label: { en: "Next picture (arrow label)", ar: "الصورة التالية (تسمية السهم)" } },
      { key: "imageN", label: { en: "Word before a picture’s number", ar: "الكلمة قبل رقم الصورة" } },
    ],
  },
  {
    id: "artist",
    title: { en: "Artist page", ar: "صفحة الفنانة" },
    fields: [
      { key: "aKicker", label: { en: "Small line above the name", ar: "السطر الصغير فوق الاسم" } },
      { key: "aName", label: { en: "Name — first part", ar: "الاسم — الجزء الأول" } },
      { key: "aNameB", label: { en: "Name — painted part", ar: "الاسم — الجزء المرسوم" } },
      { key: "aIntro", label: { en: "Introduction", ar: "المقدّمة" }, long: true },
      { key: "aEmail", label: { en: "Email button", ar: "زر البريد" } },
      { key: "aStatementH", label: { en: "Statement — heading", ar: "البيان — العنوان" } },
      { key: "aStatement1", label: { en: "Statement — text", ar: "البيان — النص" }, long: true },
      { key: "aProcessH", label: { en: "Process — heading", ar: "الأسلوب — العنوان" } },
      { key: "aProcess", label: { en: "Process — text", ar: "الأسلوب — النص" }, long: true },
      { key: "aStudio", label: { en: "Studio — small line", ar: "الاستوديو — السطر الصغير" } },
      { key: "aMilestonesH", label: { en: "Milestones — heading", ar: "المحطات — العنوان" } },
    ],
  },
  {
    id: "enquiry",
    title: { en: "Enquiry form", ar: "نموذج الاستفسار" },
    fields: [
      { key: "enquiryTitle", label: { en: "Heading", ar: "العنوان" } },
      { key: "enquiryName", label: { en: "Field — name", ar: "الحقل — الاسم" } },
      { key: "enquiryEmail", label: { en: "Field — email", ar: "الحقل — البريد" } },
      { key: "enquiryMessage", label: { en: "Field — message", ar: "الحقل — الرسالة" } },
      { key: "enquiryMessagePlaceholder", label: { en: "Message — example text", ar: "الرسالة — نص المثال" } },
      { key: "enquiryConsent", label: { en: "Consent line", ar: "سطر الموافقة" } },
      { key: "enquirySend", label: { en: "Send button", ar: "زر الإرسال" } },
      { key: "enquirySending", label: { en: "Send button — while sending", ar: "زر الإرسال — أثناء الإرسال" } },
      { key: "enquirySent", label: { en: "After sending", ar: "بعد الإرسال" } },
      { key: "enquiryUndo", label: { en: "Undo", ar: "تراجع" } },
      { key: "enquiryCancel", label: { en: "Cancel", ar: "إلغاء" } },
      { key: "enquiryDuplicate", label: { en: "Already enquired", ar: "استفسار مكرّر" } },
    ],
  },
  {
    id: "system",
    title: { en: "Loading and errors", ar: "التحميل والأخطاء" },
    fields: [
      { key: "loading", label: { en: "Loading", ar: "التحميل" } },
      { key: "errorTitle", label: { en: "Error — heading", ar: "الخطأ — العنوان" } },
      { key: "errorRetry", label: { en: "Error — retry button", ar: "الخطأ — زر الإعادة" } },
      { key: "notFound", label: { en: "Work not found", ar: "العمل غير موجود" } },
    ],
  },
];
