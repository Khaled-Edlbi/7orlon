import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env first.");
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

type Plate = "mint" | "blush" | "butter" | "leaf" | "jade";

type Seed = {
  slug: string;
  plate: Plate;
  /** Whole dollars; stored as cents. */
  price: number;
  inStock: boolean;
  image?: { url: string; width: number; height: number };
  en: { title: string; meta: string; description: string };
  ar: { title: string; meta: string; description: string };
};

const PAINTINGS: Seed[] = [
  {
    slug: "morning-in-the-courtyard",
    plate: "blush",
    price: 2400,
    inStock: true,
    image: { url: "/images/p1.webp", width: 731, height: 1104 },
    en: {
      title: "Morning in the Courtyard",
      meta: "Oil on linen · 90 × 120 cm · 2025",
      description:
        "Pale light crossing a tiled floor, a jasmine vine caught mid-bloom. Painted over three mornings in the artist’s own courtyard, the surface is thin and luminous, left visible at the edges.",
    },
    ar: {
      title: "صباحٌ في الفناء",
      meta: "زيت على كتّان · ٩٠ × ١٢٠ سم · ٢٠٢٥",
      description:
        "ضوءٌ شاحب يعبر أرضيةً مبلّطة، وغصن ياسمين في منتصف تفتّحه. رُسمت خلال ثلاثة صباحات في فناء الفنانة، بطبقات رقيقة مضيئة تُركت مكشوفةً عند الحواف.",
    },
  },
  {
    slug: "rosewater",
    plate: "mint",
    price: 1150,
    inStock: true,
    image: { url: "/images/p2.webp", width: 754, height: 1104 },
    en: {
      title: "Rosewater",
      meta: "Acrylic on canvas · 60 × 80 cm · 2024",
      description:
        "A still life reduced to three shapes and a pour of pink. The glass is suggested rather than drawn; everything depends on where the light decides to stop.",
    },
    ar: {
      title: "ماء الورد",
      meta: "أكريليك على قماش · ٦٠ × ٨٠ سم · ٢٠٢٤",
      description:
        "طبيعة صامتة اختُزلت إلى ثلاثة أشكال وانسكابٍ من الوردي. الزجاج مُلمَّح إليه لا مرسوم، وكل شيء يتوقف على المكان الذي يقرّر فيه الضوء أن يتوقف.",
    },
  },
  {
    slug: "sea-glass",
    plate: "butter",
    price: 680,
    inStock: false,
    image: { url: "/images/p3.webp", width: 738, height: 1120 },
    en: {
      title: "Sea Glass",
      meta: "Watercolour on cotton · 40 × 50 cm · 2024",
      description:
        "Small, quick and salt-stained — a study made on the shore at Tyre. The blues were mixed with seawater, which is why they granulate the way they do.",
    },
    ar: {
      title: "زجاج البحر",
      meta: "ألوان مائية على قطن · ٤٠ × ٥٠ سم · ٢٠٢٤",
      description:
        "صغيرةٌ وسريعة ومطبوعةٌ بالملح — دراسة أُنجزت على شاطئ صور. مُزجت درجات الأزرق بماء البحر، ولهذا تتحبّب بهذه الطريقة.",
    },
  },
  {
    slug: "lemon-light",
    plate: "leaf",
    price: 1900,
    inStock: true,
    image: { url: "/images/p4.webp", width: 1104, height: 750 },
    en: {
      title: "Lemon Light",
      meta: "Oil on panel · 70 × 70 cm · 2025",
      description:
        "Afternoon through a kitchen curtain. The yellow is one pigment, unmixed, laid down once and never touched again.",
    },
    ar: {
      title: "ضوء الليمون",
      meta: "زيت على لوح · ٧٠ × ٧٠ سم · ٢٠٢٥",
      description:
        "عصرٌ يتسلّل عبر ستارة المطبخ. الأصفر صبغةٌ واحدة، غير ممزوجة، وُضعت مرةً واحدة ولم تُلمس بعدها.",
    },
  },
  {
    slug: "meadow-late",
    plate: "jade",
    price: 3200,
    inStock: true,
    image: { url: "/images/p5.webp", width: 999, height: 1104 },
    en: {
      title: "Meadow, Late",
      meta: "Mixed media on linen · 100 × 140 cm · 2025",
      description:
        "The largest work in the series. Grasses drawn in graphite beneath the paint still show through, a quiet map of the field before colour arrived.",
    },
    ar: {
      title: "المرج في وقتٍ متأخر",
      meta: "وسائط مختلطة على كتّان · ١٠٠ × ١٤٠ سم · ٢٠٢٥",
      description:
        "أكبر أعمال السلسلة. الأعشاب المرسومة بالغرافيت تحت الطلاء ما تزال ظاهرة، خريطةٌ هادئة للحقل قبل أن يصله اللون.",
    },
  },
  {
    slug: "peony-unfolding",
    plate: "blush",
    price: 950,
    inStock: true,
    image: { url: "/images/p6.webp", width: 311, height: 432 },
    en: {
      title: "Peony, Unfolding",
      meta: "Oil on canvas · 50 × 60 cm · 2025",
      description:
        "A single bloom at the moment it gives up holding itself together.",
    },
    ar: {
      title: "فاوانيا تتفتّح",
      meta: "زيت على قماش · ٥٠ × ٦٠ سم · ٢٠٢٥",
      description: "زهرةٌ واحدة في اللحظة التي تتخلّى فيها عن تماسكها.",
    },
  },
  {
    slug: "blue-hour-byblos",
    plate: "mint",
    price: 1400,
    inStock: true,
    en: {
      title: "Blue Hour, Byblos",
      meta: "Acrylic on linen · 80 × 80 cm · 2024",
      description: "The harbour after sunset, when every wall borrows the sky.",
    },
    ar: {
      title: "الساعة الزرقاء، جبيل",
      meta: "أكريليك على كتّان · ٨٠ × ٨٠ سم · ٢٠٢٤",
      description: "المرفأ بعد الغروب، حين تستعير كلُّ الجدران لونَ السماء.",
    },
  },
  {
    slug: "two-pears",
    plate: "butter",
    price: 720,
    inStock: false,
    en: {
      title: "Two Pears",
      meta: "Oil on panel · 30 × 40 cm · 2024",
      description: "Painted in one sitting; the fruit was eaten afterwards.",
    },
    ar: {
      title: "إجّاصتان",
      meta: "زيت على لوح · ٣٠ × ٤٠ سم · ٢٠٢٤",
      description: "رُسمت في جلسةٍ واحدة، ثم أُكلت الثمرتان بعدها.",
    },
  },
  {
    slug: "fig-leaves",
    plate: "leaf",
    price: 2100,
    inStock: true,
    en: {
      title: "Fig Leaves",
      meta: "Oil on linen · 90 × 90 cm · 2025",
      description: "Green on green — the shade under the tree at midday.",
    },
    ar: {
      title: "أوراق التين",
      meta: "زيت على كتّان · ٩٠ × ٩٠ سم · ٢٠٢٥",
      description: "أخضرٌ على أخضر — ظلُّ الشجرة في منتصف النهار.",
    },
  },
  {
    slug: "small-weather",
    plate: "jade",
    price: 560,
    inStock: true,
    en: {
      title: "Small Weather",
      meta: "Watercolour on cotton · 30 × 40 cm · 2025",
      description: "A cloud study kept from a wet week in March.",
    },
    ar: {
      title: "طقسٌ صغير",
      meta: "ألوان مائية على قطن · ٣٠ × ٤٠ سم · ٢٠٢٥",
      description: "دراسةٌ للغيوم احتُفظ بها من أسبوعٍ ماطر في آذار.",
    },
  },
  {
    slug: "linen-folded",
    plate: "blush",
    price: 1750,
    inStock: true,
    en: {
      title: "Linen, Folded",
      meta: "Oil on canvas · 70 × 90 cm · 2024",
      description: "White on white, the whole painting a study of one shadow.",
    },
    ar: {
      title: "كتّانٌ مطويّ",
      meta: "زيت على قماش · ٧٠ × ٩٠ سم · ٢٠٢٤",
      description: "أبيضٌ على أبيض، واللوحة كلّها دراسةٌ لظلٍّ واحد.",
    },
  },
  {
    slug: "night-swim",
    plate: "mint",
    price: 2800,
    inStock: true,
    en: {
      title: "Night Swim",
      meta: "Mixed media on linen · 100 × 120 cm · 2025",
      description:
        "The largest of the sea works; the surface still smells faintly of wax.",
    },
    ar: {
      title: "سباحةٌ ليلية",
      meta: "وسائط مختلطة على كتّان · ١٠٠ × ١٢٠ سم · ٢٠٢٥",
      description: "أكبر أعمال البحر؛ ما يزال سطحها يفوح برائحة الشمع الخفيفة.",
    },
  },
];

const HERO_SLIDES = [
  {
    position: 0,
    imageUrl: "/images/hero-painting.webp",
    imageWidth: 500,
    imageHeight: 500,
    altEn: "A pale courtyard interior in morning light",
    altAr: "فناءٌ شاحب في ضوء الصباح",
  },
  {
    position: 1,
    imageUrl: "/images/hero-2.webp",
    imageWidth: 1040,
    imageHeight: 1040,
    altEn: "Soft blooms against a warm ground",
    altAr: "أزهارٌ ناعمة على أرضيةٍ دافئة",
  },
  {
    position: 2,
    imageUrl: "/images/hero-3.webp",
    imageWidth: 1040,
    imageHeight: 1040,
    altEn: "A coastal study in blue and sand",
    altAr: "دراسةٌ ساحلية بالأزرق ولون الرمل",
  },
];

const STUDIO_PHOTOS = [
  {
    position: 0,
    imageUrl: "/images/studio-1.webp",
    imageWidth: 838,
    imageHeight: 559,
    captionEn: "The courtyard bench, where the watercolours dry",
    captionAr: "مقعد الفناء، حيث تجفّ الألوان المائية",
  },
  {
    position: 1,
    imageUrl: "/images/studio-2.webp",
    imageWidth: 629,
    imageHeight: 838,
    captionEn: "Brushes kept in the order they are reached for",
    captionAr: "الفراشي مرتّبة بحسب ترتيب استعمالها",
  },
  {
    position: 2,
    imageUrl: "/images/studio-3.webp",
    imageWidth: 838,
    imageHeight: 559,
    captionEn: "A morning’s palette, before it is scraped back",
    captionAr: "لوحة ألوان صباحية، قبل أن تُكشط",
  },
];

const MILESTONES = [
  {
    year: 2025,
    textEn: "Solo show “Paintings that hold the light”, Beirut",
    textAr: "معرض فردي «لوحاتٌ تحتفظ بالضوء»، بيروت",
  },
  {
    year: 2024,
    textEn: "Residency at the Byblos coastal studio",
    textAr: "إقامة فنية في استوديو جبيل الساحلي",
  },
  {
    year: 2023,
    textEn: "Group exhibition, Dubai Design Week",
    textAr: "معرض جماعي، أسبوع دبي للتصميم",
  },
  {
    year: 2021,
    textEn: "Graduated in Fine Arts, Lebanese University",
    textAr: "تخرّجت في الفنون الجميلة، الجامعة اللبنانية",
  },
];

async function main() {
  // Idempotent: run it as often as you like.
  await db.enquiry.deleteMany();
  await db.paintingTranslation.deleteMany();
  await db.painting.deleteMany();
  await db.heroSlide.deleteMany();
  await db.milestone.deleteMany();
  await db.studioPhoto.deleteMany();
  await db.artistProfile.deleteMany();

  for (const [index, p] of PAINTINGS.entries()) {
    await db.painting.create({
      data: {
        slug: p.slug,
        position: index,
        plate: p.plate,
        priceCents: BigInt(p.price) * 100n,
        inStock: p.inStock,
        imageUrl: p.image?.url ?? null,
        imageWidth: p.image?.width ?? null,
        imageHeight: p.image?.height ?? null,
        translations: {
          create: [
            { locale: "en", ...p.en },
            { locale: "ar", ...p.ar },
          ],
        },
      },
    });
  }

  await db.heroSlide.createMany({ data: HERO_SLIDES });

  await db.artistProfile.create({
    data: {
      id: "default",
      portraitUrl: "/images/artist-portrait.webp",
      portraitWidth: 595,
      portraitHeight: 648,
      email: "hello@ateliernoor.example",
      instagramUrl: "https://instagram.com",
      pinterestUrl: "https://pinterest.com",
      behanceUrl: "https://behance.net",
      studioPhotos: { create: STUDIO_PHOTOS },
      milestones: { create: MILESTONES },
    },
  });

  console.log(
    `Seeded ${PAINTINGS.length} paintings, ${HERO_SLIDES.length} hero slides and the studio profile.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
