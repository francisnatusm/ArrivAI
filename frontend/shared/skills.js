/**
 * Skill catalog — every skill affects job demand & Korean requirement per city.
 */
import { normalizeOrigin, resolveOriginRegion } from './countryRegions.js';

const LEVEL = { none: 0, basic: 1, intermediate: 2, fluent: 3 };

export const SKILL_CATALOG = [
  // Technology
  { id: 'software engineering', label: 'Software Engineering', category: 'Technology', koreanNeed: 'intermediate',
    cities: { seoul: 12, seongnam: 10, suwon: 8, daejeon: 9, yongin: 7, goyang: 6, busan: 4, incheon: 5 } },
  { id: 'data science', label: 'Data Science / AI', category: 'Technology', koreanNeed: 'intermediate',
    cities: { seoul: 11, seongnam: 9, daejeon: 8, suwon: 7, yongin: 6, busan: 3 } },
  { id: 'robotics', label: 'Robotics / Automation', category: 'Technology', koreanNeed: 'intermediate',
    cities: { daejeon: 12, suwon: 10, changwon: 9, gumi: 9, seongnam: 8, pohang: 6, incheon: 5, ulsan: 5 } },
  { id: 'cybersecurity', label: 'Cybersecurity', category: 'Technology', koreanNeed: 'fluent',
    cities: { seoul: 10, seongnam: 8, daejeon: 6, suwon: 5 } },
  { id: 'it support', label: 'IT Support / Helpdesk', category: 'Technology', koreanNeed: 'intermediate',
    cities: { seoul: 8, incheon: 7, busan: 6, daegu: 5, daejeon: 5, suwon: 5 } },
  { id: 'web development', label: 'Web Development', category: 'Technology', koreanNeed: 'basic',
    cities: { seoul: 10, busan: 5, daejeon: 6, jeju: 4, seogwipo: 3 } },

  // Engineering
  { id: 'mechanical engineering', label: 'Mechanical Engineering', category: 'Engineering', koreanNeed: 'intermediate',
    cities: { ulsan: 10, changwon: 9, pohang: 8, gumi: 8, busan: 6, incheon: 5 } },
  { id: 'electrical engineering', label: 'Electrical Engineering', category: 'Engineering', koreanNeed: 'intermediate',
    cities: { gumi: 10, changwon: 8, suwon: 7, daejeon: 7, ulsan: 6 } },
  { id: 'civil engineering', label: 'Civil Engineering', category: 'Engineering', koreanNeed: 'fluent',
    cities: { seoul: 7, incheon: 6, busan: 5, sejong: 6, hwaseong: 5 } },

  // Healthcare
  { id: 'nursing', label: 'Nursing', category: 'Healthcare', koreanNeed: 'fluent',
    cities: { seoul: 6, busan: 8, daegu: 7, incheon: 6, gwangju: 5, cheongju: 5, jeonju: 4 } },
  { id: 'caregiving', label: 'Caregiving / Elder Care', category: 'Healthcare', koreanNeed: 'basic',
    cities: { seoul: 8, incheon: 7, busan: 6, daegu: 5, gwangju: 4, jeonju: 4 } },
  { id: 'pharmacy', label: 'Pharmacy', category: 'Healthcare', koreanNeed: 'fluent',
    cities: { seoul: 8, busan: 5, daegu: 4, incheon: 4 } },

  // Education
  { id: 'teaching english', label: 'Teaching English', category: 'Education', koreanNeed: 'basic',
    cities: { seoul: 8, busan: 10, jeju: 9, seogwipo: 8, gwangju: 6, daegu: 5, chuncheon: 5 } },
  { id: 'university teaching', label: 'University Teaching', category: 'Education', koreanNeed: 'fluent',
    cities: { seoul: 10, daejeon: 8, gwangju: 6, daegu: 5, jeonju: 5 } },
  { id: 'childcare', label: 'Childcare / Kindergarten', category: 'Education', koreanNeed: 'intermediate',
    cities: { seoul: 7, seongnam: 6, yongin: 6, goyang: 5, busan: 4 } },

  // Manufacturing & trades
  { id: 'manufacturing', label: 'Manufacturing / Factory', category: 'Manufacturing', koreanNeed: 'basic',
    cities: { ulsan: 12, changwon: 10, gumi: 10, pohang: 8, busan: 7, incheon: 6, daegu: 5, geoje: 7 } },
  { id: 'automotive', label: 'Automotive Industry', category: 'Manufacturing', koreanNeed: 'intermediate',
    cities: { ulsan: 10, changwon: 9, gwangmyeong: 6, incheon: 5 } },
  { id: 'electronics assembly', label: 'Electronics Assembly', category: 'Manufacturing', koreanNeed: 'basic',
    cities: { gumi: 10, changwon: 8, incheon: 7, ansan: 6, hwaseong: 6 } },
  { id: 'welding', label: 'Welding / Metalwork', category: 'Manufacturing', koreanNeed: 'basic',
    cities: { ulsan: 9, pohang: 8, changwon: 7, geoje: 6, busan: 5 } },
  { id: 'construction', label: 'Construction', category: 'Trades', koreanNeed: 'basic',
    cities: { seoul: 7, incheon: 6, busan: 6, hwaseong: 7, paju: 5, sejong: 6 } },

  // Hospitality & services
  { id: 'hospitality', label: 'Hospitality / Hotels', category: 'Hospitality', koreanNeed: 'intermediate',
    cities: { jeju: 12, seogwipo: 10, busan: 8, seoul: 7, gangneung: 7, sokcho: 6, yeosu: 5 } },
  { id: 'chef', label: 'Chef / Culinary', category: 'Hospitality', koreanNeed: 'intermediate',
    cities: { seoul: 9, busan: 7, jeju: 6, incheon: 5 } },
  { id: 'tourism', label: 'Tourism / Travel', category: 'Hospitality', koreanNeed: 'intermediate',
    cities: { jeju: 11, seogwipo: 9, busan: 7, gangneung: 6, sokcho: 6, seoul: 5 } },

  // Logistics
  { id: 'logistics', label: 'Logistics / Supply Chain', category: 'Logistics', koreanNeed: 'basic',
    cities: { incheon: 12, pyeongtaek: 10, busan: 8, gimpo: 7, gimhae: 7, cheonan: 6, ulsan: 5 } },
  { id: 'warehouse', label: 'Warehouse Operations', category: 'Logistics', koreanNeed: 'basic',
    cities: { incheon: 10, pyeongtaek: 9, hwaseong: 6, busan: 5 } },
  { id: 'delivery driving', label: 'Delivery / Driving', category: 'Logistics', koreanNeed: 'basic',
    cities: { seoul: 8, incheon: 7, busan: 6, daegu: 5, gwangju: 4 } },

  // Agriculture & food
  { id: 'agriculture', label: 'Agriculture / Farming', category: 'Agriculture', koreanNeed: 'basic',
    cities: { jeonju: 6, namwon: 5, iksan: 5, chuncheon: 4, taebaek: 4 } },
  { id: 'fishing', label: 'Fishing / Seafood', category: 'Agriculture', koreanNeed: 'basic',
    cities: { busan: 8, mokpo: 7, yeosu: 7, tongyeong: 6, jeju: 5 } },

  // Business & creative
  { id: 'accounting', label: 'Accounting / Finance', category: 'Business', koreanNeed: 'fluent',
    cities: { seoul: 10, busan: 5, incheon: 5, daejeon: 4 } },
  { id: 'marketing', label: 'Marketing / Sales', category: 'Business', koreanNeed: 'fluent',
    cities: { seoul: 9, busan: 5, incheon: 4 } },
  { id: 'translation', label: 'Translation / Interpretation', category: 'Creative', koreanNeed: 'fluent',
    cities: { seoul: 10, busan: 4, incheon: 5 } },
  { id: 'graphic design', label: 'Graphic / UX Design', category: 'Creative', koreanNeed: 'intermediate',
    cities: { seoul: 9, busan: 4, daejeon: 4 } },
  { id: 'content creation', label: 'Content Creation / Media', category: 'Creative', koreanNeed: 'fluent',
    cities: { seoul: 8, busan: 3 } },

  // Other common migrant paths
  { id: 'beauty cosmetics', label: 'Beauty / Cosmetics', category: 'Services', koreanNeed: 'intermediate',
    cities: { seoul: 8, busan: 5, incheon: 4, gwangju: 3 } },
  { id: 'cleaning services', label: 'Cleaning Services', category: 'Services', koreanNeed: 'basic',
    cities: { seoul: 7, incheon: 6, busan: 5, daegu: 4 } },
  { id: 'retail', label: 'Retail / Shop Assistant', category: 'Services', koreanNeed: 'intermediate',
    cities: { seoul: 7, busan: 5, incheon: 5, daegu: 4, gwangju: 4 } },
];

const FUZZY_PATTERNS = [
  [/robot|automation|mechatronic/i, 'robotics'],
  [/software|developer|programmer|backend|frontend|full.?stack/i, 'software engineering'],
  [/data scien|machine learning|\bai\b|ml engineer/i, 'data science'],
  [/nurs/i, 'nursing'],
  [/care.?giv|elder/i, 'caregiving'],
  [/teach.*english|esl|tefl/i, 'teaching english'],
  [/manufactur|factory|production line/i, 'manufacturing'],
  [/hotel|hospitality/i, 'hospitality'],
  [/logistic|supply chain/i, 'logistics'],
  [/warehouse/i, 'warehouse'],
  [/construct|builder/i, 'construction'],
  [/weld/i, 'welding'],
  [/chef|cook|culinary/i, 'chef'],
  [/tour/i, 'tourism'],
  [/account/i, 'accounting'],
  [/market|sales/i, 'marketing'],
  [/translat|interpret/i, 'translation'],
  [/design|ux|ui/i, 'graphic design'],
  [/drive|delivery/i, 'delivery driving'],
  [/farm|agri/i, 'agriculture'],
  [/fish|seafood/i, 'fishing'],
  [/auto(?!mation)/i, 'automotive'],
  [/cyber|security/i, 'cybersecurity'],
  [/it support|helpdesk|help desk/i, 'it support'],
  [/web dev/i, 'web development'],
  [/mechanic/i, 'mechanical engineering'],
  [/electri/i, 'electrical engineering'],
  [/beauty|cosmetic|makeup/i, 'beauty cosmetics'],
  [/clean/i, 'cleaning services'],
  [/retail|shop assistant/i, 'retail'],
  [/childcare|kindergarten/i, 'childcare'],
  [/pharma/i, 'pharmacy'],
];

const catalogById = Object.fromEntries(SKILL_CATALOG.map((s) => [s.id, s]));

export function resolveSkill(raw) {
  const key = String(raw || '').toLowerCase().trim();
  if (catalogById[key]) return catalogById[key];

  for (const [pattern, id] of FUZZY_PATTERNS) {
    if (pattern.test(key) && catalogById[id]) {
      return { ...catalogById[id], matchedFrom: key };
    }
  }

  // Unknown custom skill: moderate Korean need, slight Seoul lean
  return {
    id: key,
    label: raw,
    category: 'Custom',
    koreanNeed: 'intermediate',
    cities: { seoul: 5, incheon: 3, busan: 3 },
    custom: true,
  };
}

/** Job demand boost for skill + city */
export function getSkillJobBoost(skill, cityId) {
  const profile = resolveSkill(skill);
  return profile.cities?.[cityId] ?? 0;
}

/** 0.4–1.12 multiplier — Korean vs skill requirement; fluent above need gets a small bonus */
export function getKoreanSkillFit(skill, koreanLevel) {
  const profile = resolveSkill(skill);
  const need = LEVEL[profile.koreanNeed] ?? 2;
  const have = LEVEL[String(koreanLevel || 'none').toLowerCase()] ?? 0;
  if (have >= need) {
    return Math.min(1.12, 1 + (have - need) * 0.06);
  }
  if (need === 0) return 1;
  return 0.4 + (have / need) * 0.6;
}

/** Extra IRS penalty when Korean is below what the skill requires (0–15 pts) */
export function getLanguageGapPenalty(skill, koreanLevel) {
  const profile = resolveSkill(skill);
  const need = LEVEL[profile.koreanNeed] ?? 2;
  const have = LEVEL[String(koreanLevel || 'none').toLowerCase()] ?? 0;
  if (have >= need) return 0;
  return (need - have) * 5;
}

export const SKILL_CATEGORIES = [...new Set(SKILL_CATALOG.map((s) => s.category))];

/** Origin + skill category synergy (extra job demand in migrant corridors) */
const ORIGIN_CATEGORY_JOB = {
  domestic_korea: { Technology: 8, Engineering: 6, Business: 5, Creative: 4 },
  philippines: { Healthcare: 10, Manufacturing: 5, Hospitality: 4, Services: 4 },
  vietnam: { Manufacturing: 8, Technology: 5, Agriculture: 5, Logistics: 4 },
  china: { Manufacturing: 6, Technology: 5, Hospitality: 4 },
  colombia: { Hospitality: 6, Technology: 5, Creative: 4, Services: 4 },
  burundi: { Agriculture: 4, Services: 3, Technology: 2 },
  uganda: { Healthcare: 4, Education: 3 },
  nepal: { Manufacturing: 5, Construction: 5, Hospitality: 3 },
  uzbekistan: { Manufacturing: 6, Construction: 5 },
  mongolia: { Construction: 6, Manufacturing: 5, Hospitality: 3 },
  india: { Technology: 6, Healthcare: 4 },
  bangladesh: { Manufacturing: 6, Construction: 5 },
  united_states: { Education: 5, Technology: 4, Creative: 4 },
  canada: { Technology: 4, Education: 4, Healthcare: 3 },
  united_kingdom: { Education: 4, Creative: 4, Technology: 3 },
  australia: { Education: 4, Hospitality: 3, Healthcare: 3 },
  japan: { Hospitality: 4, Technology: 3 },
  turkey: { Manufacturing: 4, Construction: 4, Hospitality: 3 },
  nigeria: { Technology: 3, Services: 3 },
  kenya: { Technology: 2, Services: 3 },
};

const REGION_CATEGORY_JOB = {
  southeast_asia: { Manufacturing: 4, Healthcare: 3, Technology: 2 },
  south_asia: { Technology: 3, Manufacturing: 3 },
  latin_america: { Hospitality: 4, Services: 3, Technology: 2 },
  caribbean: { Hospitality: 4, Services: 3 },
  east_africa: { Agriculture: 3, Services: 2, Technology: 2 },
  west_africa: { Construction: 3, Services: 2 },
  north_africa: { Services: 3, Hospitality: 2 },
  middle_east: { Engineering: 3, Construction: 3, Technology: 2 },
  central_asia: { Construction: 4, Manufacturing: 3 },
  anglophone_west: { Technology: 3, Education: 3, Creative: 2 },
  europe: { Technology: 3, Engineering: 3, Creative: 2 },
  oceania: { Education: 3, Hospitality: 3, Healthcare: 2 },
  east_asia: { Technology: 3, Manufacturing: 3 },
};

export function getOriginJobBoost(origin, skill, cityId) {
  const country = normalizeOrigin(origin);
  const { category } = resolveSkill(skill);
  let boost = ORIGIN_CATEGORY_JOB[country]?.[category];

  if (boost == null) {
    const region = resolveOriginRegion(origin);
    if (REGION_CATEGORY_JOB[region]?.[category]) {
      boost = REGION_CATEGORY_JOB[region][category];
    }
  }

  if (!boost || !cityId) return boost ?? 0;

  const localSkill = getSkillJobBoost(skill, cityId);
  if (localSkill >= 8) return boost + 4;
  if (localSkill >= 5) return boost + 2;
  if (localSkill >= 2) return boost + 1;
  return Math.max(0, boost - 2);
}
