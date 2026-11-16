import type { Locale } from "@/lib/format";

export type { Locale };

export const LOCALES = ["en", "ar"] as const;

export const DEFAULT_LOCALE: Locale = "en";

export function dirOf(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

/**
 * Interface copy. Painting titles, meta and descriptions are content and live
 * in the database (`data/db.json`); everything here is chrome.
 *
 * These are the *defaults*. The studio can rewrite any line from the admin desk
 * (Site copy); those overrides are stored in the database and laid over this
 * dictionary by `useT()`. See `features/content`.
 */
const en = {
  brand: "7orlon",
  navCollection: "Collection",
  navArtist: "Artist",

  kicker: "Original paintings · 2024–2025",
  heroA: "Paintings that hold",
  heroB: "the light.",
  heroSub:
    "A small studio collection of original works — soft colour, slow mornings, and surfaces that change with the hour. Each piece is one of one.",
  ctaPrimary: "View the collection",
  heroBadge: "New works this month",

  stat1: "32",
  stat1l: "Original works",
  stat2: "1 / 1",
  stat2l: "Every piece unique",
  stat3: "14",
  stat3l: "Countries shipped to",

  inStock: "Available",
  soldOut: "Sold",
  buy: "Acquire this work",
  sold: "Sold — enquire for similar",
  enquire: "Enquire",

  hint: "Use ← → to browse",
  footer: "© 2026 7orlon · Original paintings, shipped worldwide",
  of: "of",
  indexTitle: "All works",
  works: "works",
  showKicker: "The collection",
  details: "Details",
  back: "Back to the collection",
  noImage: "A photograph of this work is on its way.",

  medium: "Medium",
  size: "Size",
  year: "Year",
  edition: "Edition",
  editionV: "Unique original, 1 of 1",
  signature: "Signature",
  signatureV: "Signed and dated on the reverse",
  frame: "Frame",
  frameV: "Unframed · framing available on request",
  shipping: "Shipping",
  shippingV: "Insured, worldwide, 5–7 working days",
  certificate: "Certificate",
  certificateV: "Certificate of authenticity included",

  previous: "Previous",
  next: "Next",
  fullscreen: "Full screen",
  prevImage: "Previous picture",
  nextImage: "Next picture",
  imageN: "Picture",
  zoomHint: "Click or scroll to zoom · drag to pan · Esc to close",
  specs: "Specifications",
  backHome: "Back",

  aKicker: "The artist",
  aName: "Noor",
  aNameB: "Haddad",
  aIntro:
    "Painter of quiet mornings and coastal light. Noor works from a small courtyard studio, in oil, acrylic and watercolour, making one-of-one paintings for homes that like to keep the windows open.",
  aEmail: "Email",
  aStatementH: "Statement",
  aStatement1:
    "I paint the hour when light is still deciding what to do. The subjects are ordinary — a tiled floor, two pears, linen folded on a chair — but I am after the moment they become luminous. Colour is kept soft so the light can do the talking.",
  aProcessH: "Process",
  aProcess:
    "Most works begin as small watercolour notes made on site, often with seawater. The larger paintings are built slowly in thin layers, leaving the drawing visible at the edges; nothing is varnished until it has lived in the studio for a season.",
  aStudio: "Studio",
  aMilestonesH: "Milestones",

  // Enquiry form
  enquiryTitle: "Enquire about this work",
  enquiryName: "Your name",
  enquiryEmail: "Email",
  enquiryMessage: "Message",
  enquiryMessagePlaceholder: "I would like to know more about this painting…",
  enquirySend: "Send enquiry",
  enquirySending: "Sending…",
  enquirySent: "Enquiry sent — the studio will reply within two days.",
  enquiryUndo: "Undo",
  enquiryDuplicate: "You have already enquired about this work.",
  enquiryCancel: "Cancel",
  enquiryConsent: "The studio may email me about similar works.",

  // View in your room (AR)
  wallView: "View in your room",
  wallIntro:
    "Your phone’s camera shows this work in your own room, at the size it really is — on a wall, the floor, a table, wherever you point.",
  wallStep1: "Stand two or three steps back from where it should go.",
  wallStep2:
    "Point the phone there and move slowly until the work appears, then tap to place it.",
  wallStep3:
    "Walk up to it, step back, look from the side. It stays its real size.",
  wallStart: "Open the camera",
  wallPreparing: "Getting ready…",
  wallUnsupported:
    "This needs a phone or tablet: Chrome on Android, or Safari on an iPhone or iPad. Open this page there to see the work in your room.",
  wallFailed:
    "The camera view did not open. Allow this site to use the camera, then try again.",
  wallSearching: "Move the phone slowly across a wall or the floor.",
  wallAim: "Tap to place it here.",
  wallMove: "Move it",
  wallDone: "Done",
  wallClose: "Close",

  loading: "Loading the collection…",
  errorTitle: "Something came unstuck.",
  errorRetry: "Try again",
  notFound: "That work is not in this collection.",
};

/** Every language ships the same set of keys; English is the reference. */
export type DictionaryKey = keyof typeof en;
export type Dictionary = Record<DictionaryKey, string>;

export const DICTIONARY_KEYS = Object.keys(en) as DictionaryKey[];

const ar: Dictionary = {
  brand: "حورلون",
  navCollection: "المجموعة",
  navArtist: "الفنانة",

  kicker: "لوحات أصلية · ٢٠٢٤–٢٠٢٥",
  heroA: "لوحاتٌ تحتفظ",
  heroB: "بالضوء.",
  heroSub:
    "مجموعة صغيرة من الأعمال الأصلية — ألوانٌ ناعمة، وصباحاتٌ بطيئة، وأسطحٌ تتبدّل مع الساعة. كل قطعة واحدةٌ من واحدة.",
  ctaPrimary: "استعرض المجموعة",
  heroBadge: "أعمال جديدة هذا الشهر",

  stat1: "٣٢",
  stat1l: "عملاً أصلياً",
  stat2: "١ / ١",
  stat2l: "كل قطعة فريدة",
  stat3: "١٤",
  stat3l: "دولةً شُحن إليها",

  inStock: "متاحة",
  soldOut: "مُباعة",
  buy: "اقتنِ هذا العمل",
  sold: "مُباعة — استفسر عن أعمال مشابهة",
  enquire: "استفسار",

  hint: "استخدم ← → للتصفّح",
  footer: "© ٢٠٢٦ حورلون · لوحات أصلية تُشحن إلى العالم",
  of: "من",
  indexTitle: "كل الأعمال",
  works: "عملاً",
  showKicker: "المجموعة",
  details: "التفاصيل",
  back: "العودة إلى المجموعة",
  noImage: "صورة هذا العمل في الطريق.",

  medium: "الخامة",
  size: "المقاس",
  year: "السنة",
  edition: "الإصدار",
  editionV: "عمل أصلي فريد، ١ من ١",
  signature: "التوقيع",
  signatureV: "موقّعة ومؤرّخة على الظهر",
  frame: "الإطار",
  frameV: "بدون إطار · التأطير متاح عند الطلب",
  shipping: "الشحن",
  shippingV: "مؤمَّن، إلى كل العالم، ٥–٧ أيام عمل",
  certificate: "الشهادة",
  certificateV: "تتضمن شهادة أصالة",

  previous: "السابقة",
  next: "التالية",
  fullscreen: "ملء الشاشة",
  prevImage: "الصورة السابقة",
  nextImage: "الصورة التالية",
  imageN: "صورة",
  zoomHint: "انقر أو مرّر للتكبير · اسحب للتحريك · Esc للإغلاق",
  specs: "المواصفات",
  backHome: "رجوع",

  aKicker: "الفنانة",
  aName: "نور",
  aNameB: "حدّاد",
  aIntro:
    "رسّامةُ الصباحات الهادئة وضوء الساحل. تعمل نور من استوديو صغير في فناء، بالزيت والأكريليك والألوان المائية، لتصنع لوحاتٍ فريدة لبيوتٍ تحبّ أن تبقي نوافذها مفتوحة.",
  aEmail: "البريد",
  aStatementH: "البيان الفني",
  aStatement1:
    "أرسم الساعة التي لا يزال الضوء فيها يقرّر ما سيفعل. الموضوعات عادية — أرضيةٌ مبلّطة، إجّاصتان، كتّانٌ مطويّ على كرسي — لكنني أبحث عن اللحظة التي تصير فيها مضيئة. أُبقي اللون ناعماً ليتكلّم الضوء.",
  aProcessH: "الأسلوب",
  aProcess:
    "تبدأ معظم الأعمال كملاحظاتٍ مائية صغيرة تُرسم في المكان، غالباً بماء البحر. أما اللوحات الكبيرة فتُبنى ببطء بطبقاتٍ رقيقة تُترك فيها الرسمة ظاهرةً عند الحواف؛ ولا يُلمَّع أيّ عمل قبل أن يعيش موسماً في الاستوديو.",
  aStudio: "الاستوديو",
  aMilestonesH: "محطات",

  enquiryTitle: "استفسر عن هذا العمل",
  enquiryName: "الاسم",
  enquiryEmail: "البريد الإلكتروني",
  enquiryMessage: "الرسالة",
  enquiryMessagePlaceholder: "أودّ معرفة المزيد عن هذه اللوحة…",
  enquirySend: "أرسل الاستفسار",
  enquirySending: "جارٍ الإرسال…",
  enquirySent: "أُرسل الاستفسار — سيردّ الاستوديو خلال يومين.",
  enquiryUndo: "تراجع",
  enquiryDuplicate: "لقد استفسرت عن هذا العمل من قبل.",
  enquiryCancel: "إلغاء",
  enquiryConsent: "يمكن للاستوديو مراسلتي بشأن أعمال مشابهة.",

  wallView: "شاهدها في غرفتك",
  wallIntro:
    "كاميرا هاتفك تُريك هذا العمل في غرفتك أنت، بحجمه الحقيقي — على جدار أو على الأرض أو على طاولة، حيثما توجّه الهاتف.",
  wallStep1: "قف على بُعد خطوتين أو ثلاث من المكان الذي تريده.",
  wallStep2: "وجّه الهاتف نحوه وحرّكه ببطء حتى يظهر العمل، ثم انقر لوضعه.",
  wallStep3: "اقترب منه، ابتعد، انظر إليه من الجانب. يبقى بحجمه الحقيقي.",
  wallStart: "افتح الكاميرا",
  wallPreparing: "جارٍ التحضير…",
  wallUnsupported:
    "يحتاج هذا إلى هاتف أو جهاز لوحي: كروم على أندرويد، أو سفاري على آيفون أو آيباد. افتح هذه الصفحة هناك لترى العمل في غرفتك.",
  wallFailed:
    "لم تُفتح الكاميرا. اسمح لهذا الموقع باستخدام الكاميرا ثم أعد المحاولة.",
  wallSearching: "حرّك الهاتف ببطء على امتداد جدار أو على الأرض.",
  wallAim: "انقر لوضعها هنا.",
  wallMove: "انقلها",
  wallDone: "تمّ",
  wallClose: "إغلاق",

  loading: "جارٍ تحميل المجموعة…",
  errorTitle: "حدث خطأٌ ما.",
  errorRetry: "أعد المحاولة",
  notFound: "هذا العمل ليس ضمن هذه المجموعة.",
};

export const T: Record<Locale, Dictionary> = { en, ar };

export function t(locale: Locale): Dictionary {
  return T[locale];
}

// --- the studio desk ---------------------------------------------------------

/**
 * Interface copy for `/admin`. Kept apart from the dictionary above because
 * that one is what the Site copy editor lists and lets the studio rewrite; the
 * desk's own labels are not something the desk should be able to edit.
 */
const adminEn = {
  deskName: "Studio desk",
  navOverview: "Overview",
  navPaintings: "Paintings",
  navHero: "Hero wall",
  navArtist: "Artist",
  navContent: "Site copy",
  navEnquiries: "Enquiries",
  viewSite: "View the site",
  signOut: "Sign out",

  loginTitleA: "Come",
  loginTitleB: "in.",
  loginSub: "This side of the gallery is for the studio.",
  password: "Password",
  signIn: "Sign in",
  signingIn: "Signing in…",
  loginWrong: "That password is not right.",
  loginLocked: "Too many attempts. Try again in a few minutes.",
  loginUnconfigured:
    "The desk is not set up yet. Add ADMIN_PASSWORD and ADMIN_SESSION_SECRET to .env, then restart the server.",

  save: "Save changes",
  saving: "Saving…",
  saved: "Saved",
  cancel: "Cancel",
  delete: "Delete",
  confirmDelete: "Yes, delete",
  edit: "Edit",
  remove: "Remove",
  moveUp: "Move up",
  moveDown: "Move down",
  english: "English",
  arabic: "Arabic",
  reset: "Use default",
  errorGeneric: "That did not save. Check the fields and try again.",

  imageUpload: "Upload a photograph",
  imageReplace: "Replace",
  imageUploading: "Uploading…",
  imageHint: "JPEG, PNG, WebP or GIF, up to 8 MB.",
  imageEmpty: "No photograph yet",
  imagesAdd: "Add photographs",
  imagesHint:
    "The first photograph is the cover. Visitors swap between the rest with the arrows.",
  imageCover: "Cover",
  moveEarlier: "Move earlier",
  moveLater: "Move later",

  dashKicker: "Overview",
  dashTitleA: "The wall,",
  dashTitleB: "today.",
  dashWorks: "Works",
  dashAvailable: "Available",
  dashSold: "Sold",
  dashEnquiries: "Enquiries",
  dashValue: "Value on the wall",
  dashPlates: "By plate",
  dashRecent: "Latest enquiries",
  dashNoEnquiries: "No one has written yet.",
  dashSeeAll: "See all",
  dashMissingPhotos: "Without a photograph",

  pKicker: "The collection",
  pTitle: "Paintings",
  pAdd: "Add a painting",
  pEmpty: "The wall is empty. Add the first painting.",
  pNewTitle: "A new painting",
  pEditTitle: "Edit painting",
  pBack: "All paintings",
  pPhotograph: "Photograph",
  pSlug: "Address",
  pSlugHint:
    "The end of the link: /works/… Lowercase letters, numbers and hyphens.",
  pPrice: "Price (USD)",
  pPlate: "Plate",
  pAvailability: "On the wall",
  pAvailabilityHint: "Untick when the work is sold.",
  pTitleField: "Title",
  pMedium: "Medium",
  pSize: "Size",
  pYear: "Year",
  pDescription: "Description",
  pCreate: "Add to the collection",
  pView: "View on the site",
  pSlugTaken: "Another painting already uses this address.",
  pPriceInvalid: "Enter a price like 2400 or 2400.50.",
  pTitleRequired: "A title is required in both languages.",
  pSlugInvalid: "Use lowercase letters, numbers and hyphens only.",
  pWidthCm: "Real width (cm)",
  pHeightCm: "Real height (cm)",
  pRealSizeHint:
    "The measured size of the work itself. It is what “View in your room” scales the picture to; leave both empty and that button is not offered.",
  pRealSizeInvalid:
    "Enter both sides in centimetres, like 90 and 120 — or leave both empty.",

  hKicker: "Landing page",
  hTitle: "Hero wall",
  hSub: "The pictures that take turns behind the headline, in this order.",
  hAdd: "Add a picture",
  hAlt: "Description of the picture",
  hEmpty: "No pictures yet.",

  arKicker: "The studio",
  arTitle: "Artist",
  arPortrait: "Portrait",
  arContact: "Contact and links",
  arEmail: "Email",
  arStudio: "Studio photographs",
  arCaption: "Caption",
  arAddPhoto: "Add a photograph",
  arMilestones: "Milestones",
  arYear: "Year",
  arText: "Text",
  arAddMilestone: "Add a milestone",
  arCopyNote:
    "The name, introduction, statement and process text are edited under Site copy.",

  cKicker: "Words",
  cTitle: "Site copy",
  cSub: "Every line of text on the site, in both languages. Empty a line to return it to its default.",
  cChanged: "Rewritten",

  eKicker: "Inbox",
  eTitle: "Enquiries",
  eEmpty: "No one has written yet.",
  eReply: "Reply",
  eAbout: "About",
  eGoneWork: "a work no longer in the collection",
};

type AdminDictionary = Record<keyof typeof adminEn, string>;

const adminAr: AdminDictionary = {
  deskName: "مكتب الاستوديو",
  navOverview: "نظرة عامة",
  navPaintings: "اللوحات",
  navHero: "جدار الواجهة",
  navArtist: "الفنانة",
  navContent: "نصوص الموقع",
  navEnquiries: "الاستفسارات",
  viewSite: "عرض الموقع",
  signOut: "تسجيل الخروج",

  loginTitleA: "تفضّل",
  loginTitleB: "بالدخول.",
  loginSub: "هذا الجانب من المعرض خاصٌّ بالاستوديو.",
  password: "كلمة المرور",
  signIn: "دخول",
  signingIn: "جارٍ الدخول…",
  loginWrong: "كلمة المرور غير صحيحة.",
  loginLocked: "محاولات كثيرة. أعد المحاولة بعد دقائق.",
  loginUnconfigured:
    "المكتب غير مُعدّ بعد. أضف ADMIN_PASSWORD و ADMIN_SESSION_SECRET إلى ملف .env ثم أعد تشغيل الخادم.",

  save: "حفظ التغييرات",
  saving: "جارٍ الحفظ…",
  saved: "تمّ الحفظ",
  cancel: "إلغاء",
  delete: "حذف",
  confirmDelete: "نعم، احذف",
  edit: "تعديل",
  remove: "إزالة",
  moveUp: "تحريك للأعلى",
  moveDown: "تحريك للأسفل",
  english: "الإنجليزية",
  arabic: "العربية",
  reset: "النص الافتراضي",
  errorGeneric: "لم يتمّ الحفظ. راجع الحقول وأعد المحاولة.",

  imageUpload: "ارفع صورة",
  imageReplace: "استبدال",
  imageUploading: "جارٍ الرفع…",
  imageHint: "JPEG أو PNG أو WebP أو GIF، حتى ٨ ميغابايت.",
  imageEmpty: "لا توجد صورة بعد",
  imagesAdd: "أضف صوراً",
  imagesHint: "الصورة الأولى هي الغلاف. يتنقّل الزائر بين البقية بالأسهم.",
  imageCover: "الغلاف",
  moveEarlier: "تقديم",
  moveLater: "تأخير",

  dashKicker: "نظرة عامة",
  dashTitleA: "الجدار،",
  dashTitleB: "اليوم.",
  dashWorks: "الأعمال",
  dashAvailable: "متاحة",
  dashSold: "مُباعة",
  dashEnquiries: "الاستفسارات",
  dashValue: "قيمة المعروض",
  dashPlates: "بحسب اللون",
  dashRecent: "أحدث الاستفسارات",
  dashNoEnquiries: "لم يكتب أحدٌ بعد.",
  dashSeeAll: "عرض الكل",
  dashMissingPhotos: "بلا صورة",

  pKicker: "المجموعة",
  pTitle: "اللوحات",
  pAdd: "أضف لوحة",
  pEmpty: "الجدار فارغ. أضف أول لوحة.",
  pNewTitle: "لوحة جديدة",
  pEditTitle: "تعديل اللوحة",
  pBack: "كل اللوحات",
  pPhotograph: "الصورة",
  pSlug: "عنوان الرابط",
  pSlugHint: "نهاية الرابط بعد /works/ — أحرف إنجليزية صغيرة وأرقام وشرطات.",
  pPrice: "السعر (بالدولار)",
  pPlate: "اللون",
  pAvailability: "على الجدار",
  pAvailabilityHint: "أزل العلامة عند بيع العمل.",
  pTitleField: "العنوان",
  pMedium: "الخامة",
  pSize: "المقاس",
  pYear: "السنة",
  pDescription: "الوصف",
  pCreate: "أضف إلى المجموعة",
  pView: "عرض في الموقع",
  pSlugTaken: "هناك لوحة أخرى تستخدم هذا العنوان.",
  pPriceInvalid: "أدخل سعراً مثل 2400 أو 2400.50.",
  pTitleRequired: "العنوان مطلوب باللغتين.",
  pSlugInvalid: "استخدم أحرفاً إنجليزية صغيرة وأرقاماً وشرطات فقط.",
  pWidthCm: "العرض الحقيقي (سم)",
  pHeightCm: "الارتفاع الحقيقي (سم)",
  pRealSizeHint:
    "المقاس الفعلي للعمل نفسه. به تُعرض اللوحة بحجمها الحقيقي في «شاهدها في غرفتك»؛ اترك الحقلين فارغين فلا يظهر ذلك الزر.",
  pRealSizeInvalid:
    "أدخل الضلعين بالسنتيمتر، مثل 90 و 120 — أو اترك الحقلين فارغين.",

  hKicker: "الصفحة الرئيسية",
  hTitle: "جدار الواجهة",
  hSub: "الصور التي تتناوب خلف العنوان، بهذا الترتيب.",
  hAdd: "أضف صورة",
  hAlt: "وصف الصورة",
  hEmpty: "لا توجد صور بعد.",

  arKicker: "الاستوديو",
  arTitle: "الفنانة",
  arPortrait: "الصورة الشخصية",
  arContact: "التواصل والروابط",
  arEmail: "البريد الإلكتروني",
  arStudio: "صور الاستوديو",
  arCaption: "التعليق",
  arAddPhoto: "أضف صورة",
  arMilestones: "المحطات",
  arYear: "السنة",
  arText: "النص",
  arAddMilestone: "أضف محطة",
  arCopyNote:
    "الاسم والمقدّمة والبيان الفني ونص الأسلوب تُعدَّل من صفحة نصوص الموقع.",

  cKicker: "الكلمات",
  cTitle: "نصوص الموقع",
  cSub: "كل سطرٍ من نصوص الموقع، باللغتين. أفرغ السطر ليعود إلى نصّه الافتراضي.",
  cChanged: "مُعدَّل",

  eKicker: "الوارد",
  eTitle: "الاستفسارات",
  eEmpty: "لم يكتب أحدٌ بعد.",
  eReply: "ردّ",
  eAbout: "بخصوص",
  eGoneWork: "عملٌ لم يعد ضمن المجموعة",
};

export type { AdminDictionary };

export const ADMIN_T: Record<Locale, AdminDictionary> = {
  en: adminEn,
  ar: adminAr,
};
