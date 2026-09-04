import type {
  AppNotification,
  AuditLog,
  Collection,
  Company,
  DebtType,
  Employee,
  PaymentType,
  Territory,
} from "./types";

/** Deterministic PRNG so SSR and client render identical demo data. */
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const rnd = makeRng(20260904);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)]!;
const between = (a: number, b: number) => a + rnd() * (b - a);

/** Kampaniya boshlanish sanasi */
export const CAMPAIGN_START = new Date("2026-08-01T00:00:00");
/** Tizim uchun "bugun" */
export const TODAY = new Date("2026-09-04T17:40:00");

export const territories: Territory[] = [
  { id: "t01", name: "Jizzax shahri", type: "shahar" },
  { id: "t02", name: "Arnasoy tumani", type: "tuman" },
  { id: "t03", name: "Baxmal tumani", type: "tuman" },
  { id: "t04", name: "Do'stlik tumani", type: "tuman" },
  { id: "t05", name: "Forish tumani", type: "tuman" },
  { id: "t06", name: "G'allaorol tumani", type: "tuman" },
  { id: "t07", name: "Mirzacho'l tumani", type: "tuman" },
  { id: "t08", name: "Paxtakor tumani", type: "tuman" },
  { id: "t09", name: "Sharof Rashidov tumani", type: "tuman" },
  { id: "t10", name: "Yangiobod tumani", type: "tuman" },
  { id: "t11", name: "Zafarobod tumani", type: "tuman" },
  { id: "t12", name: "Zarbdor tumani", type: "tuman" },
  { id: "t13", name: "Zomin tumani", type: "tuman" },
];

const FIRST = [
  "Akmal",
  "Bekzod",
  "Jasur",
  "Dilshod",
  "Nodira",
  "Sardor",
  "Ulug'bek",
  "Farrux",
  "Shahnoza",
  "Rustam",
  "Otabek",
  "Zilola",
  "Ilhom",
  "Kamola",
  "Sanjar",
  "Bobur",
  "Nurbek",
  "Gulnora",
  "Anvar",
  "Mirjalol",
  "Xurshid",
  "Aziza",
  "Temur",
  "Shohrux",
  "Aybek",
  "Malika",
];
const LAST = [
  "Aliyev",
  "Karimov",
  "Xasanov",
  "Ergashev",
  "Toshev",
  "Rahimov",
  "Yo'ldoshev",
  "Sattorov",
  "Nazarov",
  "Qodirov",
  "Sharipov",
  "Umarov",
  "Islomov",
  "Jo'rayev",
  "Mahmudov",
  "Bekmurodov",
  "Xolmatov",
  "Turdiyev",
  "Ochilov",
  "Saidov",
  "Normatov",
  "Abdullayev",
  "G'aniyev",
  "Raxmonov",
  "Sobirov",
  "Xudoyberdiyev",
];

function femaleName(n: string) {
  return ["Nodira", "Shahnoza", "Zilola", "Kamola", "Gulnora", "Aziza", "Malika"].includes(n);
}

export const SECTORS: Sector[] = ["elektr", "gaz"];

export const employees: Employee[] = [];
SECTORS.forEach((sector, si) => {
  territories.forEach((t, ti) => {
    for (let k = 0; k < 2; k++) {
      const idx = ti * 2 + k;
      const nameIdx = idx + si * 7;
      const first = FIRST[nameIdx % FIRST.length]!;
      let last = LAST[(nameIdx * 3 + 1) % LAST.length]!;
      if (femaleName(first)) last = last.replace(/ov$/, "ova").replace(/ev$/, "eva");
      employees.push({
        id: `${sector === "gaz" ? "g" : "e"}${String(idx + 1).padStart(2, "0")}`,
        full_name: `${last} ${first}`,
        short_name: `${first.slice(0, 1)}. ${last}`,
        phone: `+998 ${pick(["90", "91", "93", "94", "97", "99"])} ${Math.floor(between(200, 999))}-${Math.floor(between(10, 99))}-${Math.floor(between(10, 99))}`,
        email: `${last.toLowerCase().replace(/[^a-z]/g, "")}.${idx + 1}@${sector === "gaz" ? "gaz" : "energiya"}.uz`,
        role: "masul",
        position: k === 0 ? "Yetakchi mutaxassis" : "Bosh mutaxassis",
        territory_id: t.id,
        sector,
        status: "faol",
        created_at: "2026-07-25T09:00:00",
      });
    }
  });
});

export const employeesOf = (sector: Sector) => employees.filter((e) => e.sector === sector);

export const adminUser: Employee = {
  id: "u00",
  full_name: "Abduvaliyev Alisher",
  short_name: "A. Abduvaliyev",
  phone: "+998 90 100-10-10",
  email: "admin@energiya.uz",
  role: "super_admin",
  position: "Viloyat boshqarmasi rahbari",
  territory_id: "t01",
  status: "faol",
  created_at: "2026-07-20T09:00:00",
};

export const supervisorUser: Employee = {
  id: "u01",
  full_name: "Nazarov Otabek",
  short_name: "O. Nazarov",
  phone: "+998 90 200-20-20",
  email: "nazorat@energiya.uz",
  role: "nazoratchi",
  position: "Monitoring bo'limi boshlig'i",
  territory_id: "t01",
  status: "faol",
  created_at: "2026-07-20T09:00:00",
};

const NAME_A = [
  "OQ OLTIN",
  "JIZZAX TEXTILE",
  "SIRDARYO AGRO",
  "ZOMIN SANOAT",
  "GRAND BUILD",
  "NUR ENERGY",
  "ORIENT FOOD",
  "BARAKA SAVDO",
  "ZAFAR PLAST",
  "YASHIL VODIY",
  "MEGA PROFIL",
  "ISTIQBOL BIZNES",
  "SHARQ METALL",
  "OSIYO GRANIT",
  "TEMIR YO'L SERVIS",
  "PAXTA KLASTER",
  "UNIVERSAL LOGISTIC",
  "ALTIN DON",
  "MARMAR STONE",
  "SUV OMBORI QURILISH",
  "ZARBDOR AQS",
  "BAXMAL MEVA",
  "FORISH KON",
  "ARNASOY BALIQ",
  "YANGI HAYOT",
  "GLOBAL PACK",
  "AGRO KIMYO",
  "MIRZACHO'L SUT",
  "PAXTAKOR YOG'",
  "DO'STLIK QURILISH",
];
const NAME_B = [
  "MCHJ",
  "MCHJ",
  "MCHJ",
  "XK",
  "AJ",
  "QK",
  "MCHJ QK",
];
const SUFFIX = [
  "SERVIS",
  "GROUP",
  "TRADE",
  "INVEST",
  "PROM",
  "SANOAT",
  "EXPORT",
  "PLYUS",
  "MAX",
  "PREMIUM",
];

const STREETS = [
  "Mustaqillik ko'chasi",
  "A. Navoiy ko'chasi",
  "Sh. Rashidov ko'chasi",
  "Amir Temur shoh ko'chasi",
  "Bunyodkor ko'chasi",
  "Yoshlik ko'chasi",
  "Do'stlik ko'chasi",
  "Sanoat ko'chasi",
];

export const companies: Company[] = [];
let cIdx = 0;
territories.forEach((t) => {
  const count = t.id === "t01" ? 8 : Math.round(between(4, 6));
  for (let i = 0; i < count; i++) {
    cIdx++;
    const base = NAME_A[(cIdx * 7) % NAME_A.length];
    const withSuffix = rnd() > 0.55 ? ` ${pick(SUFFIX)}` : "";
    const debt_type: DebtType = rnd() > 0.63 ? "umidsiz" : "harakatdagi";
    const initial = Math.round(between(85, 1650)) * 1_000_000;
    const emps = employees.filter((e) => e.territory_id === t.id);
    const first = FIRST[(cIdx * 5) % FIRST.length];
    const last = LAST[(cIdx * 11) % LAST.length];
    companies.push({
      id: `c${String(cIdx).padStart(3, "0")}`,
      name: `"${base}${withSuffix}" ${pick(NAME_B)}`,
      stir: "0",
      director_name: `${last} ${first}`,
      phone: `+998 ${pick(["72", "90", "91", "93"])} ${Math.floor(between(200, 999))}-${Math.floor(between(10, 99))}-${Math.floor(between(10, 99))}`,
      address: `${t.name}, ${pick(STREETS)}, ${Math.floor(between(1, 120))}-uy`,
      territory_id: t.id,
      responsible_employee_id: emps[i % 2]!.id,
      debt_type,
      initial_debt: initial,
      created_at: "2026-07-28T10:00:00",
      updated_at: "2026-08-01T10:00:00",
    });
  }
});

const PAYMENT_TYPES: PaymentType[] = [
  "pul_kochirish",
  "pul_kochirish",
  "naqd",
  "ozaro_hisob",
  "sud_qarori",
  "boshqa",
];
const COMMENTS = [
  "Kelishuv asosida qisman to'lov amalga oshirildi",
  "Bank orqali pul o'tkazildi",
  "Kafolat xati asosida to'lov",
  "Sud qarori ijrosi bo'yicha undirildi",
  "Rahbariyat bilan uchrashuv natijasida",
  "Grafik asosida navbatdagi to'lov",
  "O'zaro hisob-kitob dalolatnomasi bo'yicha",
  "Qisman naqd to'lov qabul qilindi",
];

export const collections: Collection[] = [];
let colIdx = 0;
companies.forEach((c) => {
  const isHopeless = c.debt_type === "umidsiz";
  const n = isHopeless ? Math.floor(between(0, 3)) : Math.floor(between(1, 7));
  let collected = 0;
  const cap = c.initial_debt * (isHopeless ? between(0.02, 0.18) : between(0.1, 0.85));
  for (let i = 0; i < n; i++) {
    const remainingCap = cap - collected;
    if (remainingCap < 1_000_000) break;
    const amount =
      Math.round((remainingCap * between(0.25, 0.85)) / 1_000_000) * 1_000_000 || 1_000_000;
    collected += amount;
    const dayOffset = Math.floor(between(0, 34));
    const d = new Date(CAMPAIGN_START);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(Math.floor(between(9, 18)), Math.floor(between(0, 59)), 0, 0);
    colIdx++;
    collections.push({
      id: `col${String(colIdx).padStart(4, "0")}`,
      company_id: c.id,
      employee_id: c.responsible_employee_id,
      amount,
      collection_date: d.toISOString(),
      payment_type: PAYMENT_TYPES[colIdx % PAYMENT_TYPES.length]!,
      comment: COMMENTS[colIdx % COMMENTS.length]!,
      document_url: colIdx % 3 === 0 ? "#" : null,
      document_name: colIdx % 3 === 0 ? `tolov-${colIdx}.pdf` : null,
      created_at: d.toISOString(),
      created_by: c.responsible_employee_id,
    });
  }
});

// Bugungi undirishlar (yaqin vaqtlar) — dashboard "So'nggi undirishlar" uchun
for (let i = 0; i < 14; i++) {
  const c = companies[(i * 7 + 3) % companies.length]!;
  const d = new Date(TODAY);
  d.setMinutes(d.getMinutes() - (5 + i * 37));
  colIdx++;
  collections.push({
    id: `col${String(colIdx).padStart(4, "0")}`,
    company_id: c.id,
    employee_id: c.responsible_employee_id,
    amount: Math.round(between(5, 60)) * 1_000_000,
    collection_date: d.toISOString(),
    payment_type: PAYMENT_TYPES[i % PAYMENT_TYPES.length]!,
    comment: COMMENTS[(i + 2) % COMMENTS.length]!,
    document_url: i % 2 === 0 ? "#" : null,
    document_name: i % 2 === 0 ? `dalolatnoma-${i}.pdf` : null,
    created_at: d.toISOString(),
    created_by: c.responsible_employee_id,
  });
}

collections.sort(
  (a, b) => new Date(b.collection_date).getTime() - new Date(a.collection_date).getTime(),
);

export const initialAuditLogs: AuditLog[] = collections.slice(0, 12).map((c, i) => ({
  id: `a${i}`,
  user_id: c.created_by,
  action: "yaratildi",
  entity_type: "collections",
  entity_id: c.id,
  old_data: null,
  new_data: JSON.stringify({ amount: c.amount, company_id: c.company_id }),
  created_at: c.created_at,
}));

export const initialNotifications: AppNotification[] = [
  {
    id: "n1",
    title: "Yangi undirish kiritildi",
    body: `${companies[3]!.name} bo'yicha to'lov qayd etildi.`,
    created_at: new Date(TODAY.getTime() - 6 * 60000).toISOString(),
    read: false,
    link: `/debtors/${companies[3]!.id}`,
  },
  {
    id: "n2",
    title: "Qarzdorlik to'liq undirildi",
    body: `${companies[11]!.name} bo'yicha qarzdorlik yopildi.`,
    created_at: new Date(TODAY.getTime() - 55 * 60000).toISOString(),
    read: false,
    link: `/debtors/${companies[11]!.id}`,
  },
  {
    id: "n3",
    title: "Yangi korxona biriktirildi",
    body: `${companies[20]!.name} mas'ul xodimga biriktirildi.`,
    created_at: new Date(TODAY.getTime() - 4 * 3600000).toISOString(),
    read: true,
    link: `/debtors/${companies[20]!.id}`,
  },
  {
    id: "n4",
    title: "Ma'lumot o'zgartirildi",
    body: "Zomin tumani bo'yicha boshlang'ich qarzdorlik ma'lumotlari yangilandi.",
    created_at: new Date(TODAY.getTime() - 26 * 3600000).toISOString(),
    read: true,
    link: "/territories/t13",
  },
];
