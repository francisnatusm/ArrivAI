/**
 * Comprehensive Korea city list — metros, provincial capitals, and major 시 (city) units.
 * Saramin loc_cd uses province/metro bucket per city (sub-region codes vary on Saramin).
 */

const SARAMIN = {
  seoul: '101000',
  busan: '102000',
  daegu: '103000',
  gwangju: '104000',
  gangwon: '105000',
  daejeon: '106000',
  ulsan: '107000',
  incheon: '108000',
  gyeonggi: '109000',
  gyeongnam: '110000',
  gyeongbuk: '111000',
  jeonnam: '112000',
  jeonbuk: '113000',
  chungnam: '114000',
  chungbuk: '115000',
  sejong: '116000',
  jeju: '117000',
};

function m(pop, tier, overrides = {}) {
  const t = {
    1: { jobDemand: 90, costOfLiving: 85, communityPresence: 92, trend30d: 75 },
    2: { jobDemand: 72, costOfLiving: 62, communityPresence: 68, trend30d: 62 },
    3: { jobDemand: 58, costOfLiving: 48, communityPresence: 52, trend30d: 55 },
    4: { jobDemand: 45, costOfLiving: 40, communityPresence: 38, trend30d: 48 },
    5: { jobDemand: 35, costOfLiving: 35, communityPresence: 28, trend30d: 42 },
  }[tier];
  const scale = Math.min(12, Math.round(Math.log10(Math.max(pop, 50000)) * 4));
  return {
    jobDemand: Math.min(100, t.jobDemand + scale * 0.5 + (overrides.jobDemand || 0)),
    costOfLiving: Math.min(95, t.costOfLiving + scale * 0.3 + (overrides.costOfLiving || 0)),
    communityPresence: Math.min(100, t.communityPresence + scale * 0.4 + (overrides.communityPresence || 0)),
    trend30d: Math.min(100, t.trend30d + scale * 0.3 + (overrides.trend30d || 0)),
  };
}

/** @type {Array<{id:string,name:string,region:string,lat:number,lng:number,population:number,saramin:string,baseline:object}>} */
const RAW = [
  // Metropolitan & special
  { id: 'seoul', name: 'Seoul', region: 'Metropolitan', lat: 37.5665, lng: 126.978, population: 9700000, saramin: SARAMIN.seoul, baseline: m(9700000, 1) },
  { id: 'busan', name: 'Busan', region: 'Metropolitan', lat: 35.1796, lng: 129.0756, population: 3400000, saramin: SARAMIN.busan, baseline: m(3400000, 1, { costOfLiving: -25 }) },
  { id: 'incheon', name: 'Incheon', region: 'Metropolitan', lat: 37.4563, lng: 126.7052, population: 2950000, saramin: SARAMIN.incheon, baseline: m(2950000, 1, { costOfLiving: -12 }) },
  { id: 'daegu', name: 'Daegu', region: 'Metropolitan', lat: 35.8714, lng: 128.6014, population: 2430000, saramin: SARAMIN.daegu, baseline: m(2430000, 1, { costOfLiving: -30 }) },
  { id: 'daejeon', name: 'Daejeon', region: 'Metropolitan', lat: 36.3504, lng: 127.3845, population: 1470000, saramin: SARAMIN.daejeon, baseline: m(1470000, 2, { jobDemand: 8, trend30d: 10 }) },
  { id: 'gwangju', name: 'Gwangju', region: 'Metropolitan', lat: 35.1595, lng: 126.8526, population: 1460000, saramin: SARAMIN.gwangju, baseline: m(1460000, 2) },
  { id: 'ulsan', name: 'Ulsan', region: 'Metropolitan', lat: 35.5384, lng: 129.3114, population: 1140000, saramin: SARAMIN.ulsan, baseline: m(1140000, 2, { jobDemand: 5 }) },
  { id: 'sejong', name: 'Sejong', region: 'Metropolitan', lat: 36.4800, lng: 127.2890, population: 380000, saramin: SARAMIN.sejong, baseline: m(380000, 3, { jobDemand: 12, trend30d: 15 }) },

  // Gyeonggi
  { id: 'suwon', name: 'Suwon', region: 'Gyeonggi', lat: 37.2636, lng: 127.0286, population: 1240000, saramin: SARAMIN.gyeonggi, baseline: m(1240000, 2, { jobDemand: 10 }) },
  { id: 'seongnam', name: 'Seongnam', region: 'Gyeonggi', lat: 37.4449, lng: 127.1389, population: 948000, saramin: SARAMIN.gyeonggi, baseline: m(948000, 2, { jobDemand: 8 }) },
  { id: 'goyang', name: 'Goyang', region: 'Gyeonggi', lat: 37.6584, lng: 126.8320, population: 1065000, saramin: SARAMIN.gyeonggi, baseline: m(1065000, 2) },
  { id: 'yongin', name: 'Yongin', region: 'Gyeonggi', lat: 37.2411, lng: 127.1776, population: 1081000, saramin: SARAMIN.gyeonggi, baseline: m(1081000, 2) },
  { id: 'bucheon', name: 'Bucheon', region: 'Gyeonggi', lat: 37.5034, lng: 126.7660, population: 843000, saramin: SARAMIN.gyeonggi, baseline: m(843000, 2) },
  { id: 'ansan', name: 'Ansan', region: 'Gyeonggi', lat: 37.3219, lng: 126.8309, population: 747000, saramin: SARAMIN.gyeonggi, baseline: m(747000, 2, { communityPresence: 8 }) },
  { id: 'anyang', name: 'Anyang', region: 'Gyeonggi', lat: 37.3943, lng: 126.9568, population: 581000, saramin: SARAMIN.gyeonggi, baseline: m(581000, 3) },
  { id: 'namyangju', name: 'Namyangju', region: 'Gyeonggi', lat: 37.6360, lng: 127.2165, population: 732000, saramin: SARAMIN.gyeonggi, baseline: m(732000, 3) },
  { id: 'hwaseong', name: 'Hwaseong', region: 'Gyeonggi', lat: 37.1995, lng: 126.8310, population: 930000, saramin: SARAMIN.gyeonggi, baseline: m(930000, 3, { jobDemand: 6 }) },
  { id: 'pyeongtaek', name: 'Pyeongtaek', region: 'Gyeonggi', lat: 36.9920, lng: 127.1129, population: 518000, saramin: SARAMIN.gyeonggi, baseline: m(518000, 3, { jobDemand: 5 }) },
  { id: 'siheung', name: 'Siheung', region: 'Gyeonggi', lat: 37.3800, lng: 126.8029, population: 480000, saramin: SARAMIN.gyeonggi, baseline: m(480000, 3) },
  { id: 'uijeongbu', name: 'Uijeongbu', region: 'Gyeonggi', lat: 37.7480, lng: 127.0380, population: 478000, saramin: SARAMIN.gyeonggi, baseline: m(478000, 3) },
  { id: 'gimpo', name: 'Gimpo', region: 'Gyeonggi', lat: 37.6150, lng: 126.7155, population: 493000, saramin: SARAMIN.gyeonggi, baseline: m(493000, 3, { jobDemand: 4 }) },
  { id: 'gwangmyeong', name: 'Gwangmyeong', region: 'Gyeonggi', lat: 37.4786, lng: 126.8644, population: 308000, saramin: SARAMIN.gyeonggi, baseline: m(308000, 3) },
  { id: 'gunpo', name: 'Gunpo', region: 'Gyeonggi', lat: 37.3616, lng: 126.9352, population: 283000, saramin: SARAMIN.gyeonggi, baseline: m(283000, 4) },
  { id: 'icheon', name: 'Icheon', region: 'Gyeonggi', lat: 37.2720, lng: 127.4350, population: 220000, saramin: SARAMIN.gyeonggi, baseline: m(220000, 4) },
  { id: 'yangju', name: 'Yangju', region: 'Gyeonggi', lat: 37.7850, lng: 127.0450, population: 248000, saramin: SARAMIN.gyeonggi, baseline: m(248000, 4) },
  { id: 'guri', name: 'Guri', region: 'Gyeonggi', lat: 37.5940, lng: 127.1290, population: 194000, saramin: SARAMIN.gyeonggi, baseline: m(194000, 4) },
  { id: 'hanam', name: 'Hanam', region: 'Gyeonggi', lat: 37.5390, lng: 127.2050, population: 163000, saramin: SARAMIN.gyeonggi, baseline: m(163000, 4) },
  { id: 'paju', name: 'Paju', region: 'Gyeonggi', lat: 37.7600, lng: 126.7800, population: 456000, saramin: SARAMIN.gyeonggi, baseline: m(456000, 3) },
  { id: 'osan', name: 'Osan', region: 'Gyeonggi', lat: 37.1490, lng: 127.0770, population: 236000, saramin: SARAMIN.gyeonggi, baseline: m(236000, 4) },
  { id: 'uiwang', name: 'Uiwang', region: 'Gyeonggi', lat: 37.3440, lng: 126.9680, population: 165000, saramin: SARAMIN.gyeonggi, baseline: m(165000, 4) },
  { id: 'anseong', name: 'Anseong', region: 'Gyeonggi', lat: 37.0080, lng: 127.2790, population: 188000, saramin: SARAMIN.gyeonggi, baseline: m(188000, 4) },
  { id: 'gwacheon', name: 'Gwacheon', region: 'Gyeonggi', lat: 37.4290, lng: 126.9890, population: 82000, saramin: SARAMIN.gyeonggi, baseline: m(82000, 4, { costOfLiving: 10 }) },
  { id: 'gwangju_gg', name: 'Gwangju (Gyeonggi)', region: 'Gyeonggi', lat: 37.4290, lng: 127.2550, population: 370000, saramin: SARAMIN.gyeonggi, baseline: m(370000, 4) },
  { id: 'yeoju', name: 'Yeoju', region: 'Gyeonggi', lat: 37.2980, lng: 127.6370, population: 112000, saramin: SARAMIN.gyeonggi, baseline: m(112000, 5) },
  { id: 'pocheon', name: 'Pocheon', region: 'Gyeonggi', lat: 37.8940, lng: 127.2000, population: 162000, saramin: SARAMIN.gyeonggi, baseline: m(162000, 5) },
  { id: 'dongducheon', name: 'Dongducheon', region: 'Gyeonggi', lat: 37.9030, lng: 127.0600, population: 82000, saramin: SARAMIN.gyeonggi, baseline: m(82000, 5) },

  // Gangwon
  { id: 'chuncheon', name: 'Chuncheon', region: 'Gangwon', lat: 37.8813, lng: 127.7298, population: 281000, saramin: SARAMIN.gangwon, baseline: m(281000, 4) },
  { id: 'wonju', name: 'Wonju', region: 'Gangwon', lat: 37.3420, lng: 127.9200, population: 348000, saramin: SARAMIN.gangwon, baseline: m(348000, 4) },
  { id: 'gangneung', name: 'Gangneung', region: 'Gangwon', lat: 37.7519, lng: 128.8760, population: 214000, saramin: SARAMIN.gangwon, baseline: m(214000, 4) },
  { id: 'donghae', name: 'Donghae', region: 'Gangwon', lat: 37.5240, lng: 129.1140, population: 91000, saramin: SARAMIN.gangwon, baseline: m(91000, 5) },
  { id: 'sokcho', name: 'Sokcho', region: 'Gangwon', lat: 38.2070, lng: 128.5920, population: 82000, saramin: SARAMIN.gangwon, baseline: m(82000, 5, { communityPresence: 5 }) },
  { id: 'samcheok', name: 'Samcheok', region: 'Gangwon', lat: 37.4500, lng: 129.1650, population: 69000, saramin: SARAMIN.gangwon, baseline: m(69000, 5) },
  { id: 'taebaek', name: 'Taebaek', region: 'Gangwon', lat: 37.1640, lng: 128.9850, population: 43000, saramin: SARAMIN.gangwon, baseline: m(43000, 5) },

  // Chungcheong
  { id: 'cheongju', name: 'Cheongju', region: 'Chungcheong', lat: 36.6420, lng: 127.4890, population: 850000, saramin: SARAMIN.chungbuk, baseline: m(850000, 2) },
  { id: 'chungju', name: 'Chungju', region: 'Chungcheong', lat: 36.9910, lng: 127.9260, population: 214000, saramin: SARAMIN.chungbuk, baseline: m(214000, 4) },
  { id: 'jecheon', name: 'Jecheon', region: 'Chungcheong', lat: 37.1320, lng: 128.2110, population: 135000, saramin: SARAMIN.chungbuk, baseline: m(135000, 5) },
  { id: 'cheonan', name: 'Cheonan', region: 'Chungcheong', lat: 36.8150, lng: 127.1130, population: 658000, saramin: SARAMIN.chungnam, baseline: m(658000, 3, { jobDemand: 5 }) },
  { id: 'asan', name: 'Asan', region: 'Chungcheong', lat: 36.7900, lng: 127.0020, population: 328000, saramin: SARAMIN.chungnam, baseline: m(328000, 3) },
  { id: 'seosan', name: 'Seosan', region: 'Chungcheong', lat: 36.7810, lng: 126.4500, population: 175000, saramin: SARAMIN.chungnam, baseline: m(175000, 4) },
  { id: 'nonsan', name: 'Nonsan', region: 'Chungcheong', lat: 36.1870, lng: 127.0980, population: 124000, saramin: SARAMIN.chungnam, baseline: m(124000, 5) },
  { id: 'gongju', name: 'Gongju', region: 'Chungcheong', lat: 36.4460, lng: 127.1190, population: 105000, saramin: SARAMIN.chungnam, baseline: m(105000, 5) },
  { id: 'boryeong', name: 'Boryeong', region: 'Chungcheong', lat: 36.3330, lng: 126.6130, population: 101000, saramin: SARAMIN.chungnam, baseline: m(101000, 5) },

  // Jeolla
  { id: 'jeonju', name: 'Jeonju', region: 'Jeolla', lat: 35.8242, lng: 127.1480, population: 658000, saramin: SARAMIN.jeonbuk, baseline: m(658000, 3) },
  { id: 'iksan', name: 'Iksan', region: 'Jeolla', lat: 35.9480, lng: 126.9570, population: 286000, saramin: SARAMIN.jeonbuk, baseline: m(286000, 4) },
  { id: 'gunsan', name: 'Gunsan', region: 'Jeolla', lat: 35.9670, lng: 126.7360, population: 277000, saramin: SARAMIN.jeonbuk, baseline: m(277000, 4) },
  { id: 'jeongeup', name: 'Jeongeup', region: 'Jeolla', lat: 35.6000, lng: 126.8560, population: 115000, saramin: SARAMIN.jeonbuk, baseline: m(115000, 5) },
  { id: 'namwon', name: 'Namwon', region: 'Jeolla', lat: 35.4160, lng: 127.3900, population: 84000, saramin: SARAMIN.jeonbuk, baseline: m(84000, 5) },
  { id: 'yeosu', name: 'Yeosu', region: 'Jeolla', lat: 34.7604, lng: 127.6622, population: 281000, saramin: SARAMIN.jeonnam, baseline: m(281000, 4) },
  { id: 'mokpo', name: 'Mokpo', region: 'Jeolla', lat: 34.8118, lng: 126.3922, population: 237000, saramin: SARAMIN.jeonnam, baseline: m(237000, 4) },
  { id: 'suncheon', name: 'Suncheon', region: 'Jeolla', lat: 34.9506, lng: 127.4872, population: 279000, saramin: SARAMIN.jeonnam, baseline: m(279000, 4) },
  { id: 'gwangyang', name: 'Gwangyang', region: 'Jeolla', lat: 34.9400, lng: 127.6950, population: 154000, saramin: SARAMIN.jeonnam, baseline: m(154000, 4, { jobDemand: 6 }) },
  { id: 'naju', name: 'Naju', region: 'Jeolla', lat: 35.0160, lng: 126.7100, population: 118000, saramin: SARAMIN.jeonnam, baseline: m(118000, 5) },

  // Gyeongsang
  { id: 'pohang', name: 'Pohang', region: 'Gyeongsang', lat: 36.0190, lng: 129.3435, population: 509000, saramin: SARAMIN.gyeongbuk, baseline: m(509000, 3) },
  { id: 'gyeongju', name: 'Gyeongju', region: 'Gyeongsang', lat: 35.8562, lng: 129.2247, population: 264000, saramin: SARAMIN.gyeongbuk, baseline: m(264000, 4) },
  { id: 'gimcheon', name: 'Gimcheon', region: 'Gyeongsang', lat: 36.1200, lng: 128.1200, population: 144000, saramin: SARAMIN.gyeongbuk, baseline: m(144000, 5) },
  { id: 'andong', name: 'Andong', region: 'Gyeongsang', lat: 36.5680, lng: 128.7290, population: 162000, saramin: SARAMIN.gyeongbuk, baseline: m(162000, 5) },
  { id: 'gumi', name: 'Gumi', region: 'Gyeongsang', lat: 36.1130, lng: 128.3360, population: 417000, saramin: SARAMIN.gyeongbuk, baseline: m(417000, 3, { jobDemand: 8 }) },
  { id: 'yeongju', name: 'Yeongju', region: 'Gyeongsang', lat: 36.8060, lng: 128.6240, population: 108000, saramin: SARAMIN.gyeongbuk, baseline: m(108000, 5) },
  { id: 'sangju', name: 'Sangju', region: 'Gyeongsang', lat: 36.4150, lng: 128.1600, population: 96000, saramin: SARAMIN.gyeongbuk, baseline: m(96000, 5) },
  { id: 'changwon', name: 'Changwon', region: 'Gyeongsang', lat: 35.2280, lng: 128.6810, population: 1036000, saramin: SARAMIN.gyeongnam, baseline: m(1036000, 2) },
  { id: 'jinju', name: 'Jinju', region: 'Gyeongsang', lat: 35.1800, lng: 128.1070, population: 341000, saramin: SARAMIN.gyeongnam, baseline: m(341000, 4) },
  { id: 'geoje', name: 'Geoje', region: 'Gyeongsang', lat: 34.8800, lng: 128.6210, population: 245000, saramin: SARAMIN.gyeongnam, baseline: m(245000, 4, { jobDemand: 6 }) },
  { id: 'yangsan', name: 'Yangsan', region: 'Gyeongsang', lat: 35.3350, lng: 129.0370, population: 360000, saramin: SARAMIN.gyeongnam, baseline: m(360000, 3) },
  { id: 'gimhae', name: 'Gimhae', region: 'Gyeongsang', lat: 35.2340, lng: 128.8890, population: 541000, saramin: SARAMIN.gyeongnam, baseline: m(541000, 3, { jobDemand: 4 }) },
  { id: 'tongyeong', name: 'Tongyeong', region: 'Gyeongsang', lat: 34.8540, lng: 128.4330, population: 127000, saramin: SARAMIN.gyeongnam, baseline: m(127000, 5) },
  { id: 'miryang', name: 'Miryang', region: 'Gyeongsang', lat: 35.5030, lng: 128.7460, population: 103000, saramin: SARAMIN.gyeongnam, baseline: m(103000, 5) },
  { id: 'sacheon', name: 'Sacheon', region: 'Gyeongsang', lat: 35.0040, lng: 128.0640, population: 114000, saramin: SARAMIN.gyeongnam, baseline: m(114000, 5) },

  // Jeju
  { id: 'jeju', name: 'Jeju City', region: 'Jeju', lat: 33.4996, lng: 126.5312, population: 490000, saramin: SARAMIN.jeju, baseline: m(490000, 3, { communityPresence: -5 }) },
  { id: 'seogwipo', name: 'Seogwipo', region: 'Jeju', lat: 33.2541, lng: 126.5600, population: 185000, saramin: SARAMIN.jeju, baseline: m(185000, 4, { communityPresence: -8 }) },
];

export const KOREA_CITIES = RAW.map(({ id, name, region, lat, lng, population }) => ({
  id, name, region, lat, lng, population,
}));

export const CITY_BASELINE = Object.fromEntries(
  RAW.map((c) => [c.id, c.baseline]),
);

export const SARAMIN_CODES = Object.fromEntries(
  RAW.map((c) => [c.id, c.saramin]),
);

export const REGION_ORDER = [
  'Metropolitan',
  'Gyeonggi',
  'Gangwon',
  'Chungcheong',
  'Jeolla',
  'Gyeongsang',
  'Jeju',
];

export function getCityCode(city) {
  return SARAMIN_CODES[String(city).toLowerCase()] || SARAMIN.seoul;
}

export function getCityBaseline(cityId) {
  return CITY_BASELINE[cityId] || CITY_BASELINE.seoul;
}

export function getCityById(id) {
  return KOREA_CITIES.find((c) => c.id === id);
}

import {
  normalizeOrigin,
  isDomesticOrigin,
  resolveOriginRegion,
  getRegionLabel,
  ORIGIN_REGION,
} from './countryRegions.js';

export {
  normalizeOrigin,
  isDomesticOrigin,
  resolveOriginRegion,
  getRegionLabel,
  ORIGIN_REGION,
};

const REGION_CITY_DIASPORA = {
  southeast_asia: { ansan: 72, incheon: 62, seoul: 58, hwaseong: 55, busan: 48, suwon: 42, daegu: 40 },
  east_asia: { seoul: 55, incheon: 48, busan: 42, suwon: 40, changwon: 38 },
  south_asia: { seoul: 52, incheon: 48, ansan: 45, busan: 38, suwon: 36 },
  central_asia: { incheon: 50, seoul: 45, suwon: 38, busan: 32 },
  latin_america: { seoul: 58, incheon: 52, busan: 48, ansan: 45, sokcho: 55, gangneung: 52 },
  caribbean: { seoul: 52, incheon: 46, busan: 44, ansan: 42, sokcho: 48 },
  east_africa: { seoul: 42, incheon: 36, busan: 30, daegu: 32, sokcho: 26 },
  west_africa: { seoul: 48, incheon: 42, busan: 38, daegu: 34 },
  north_africa: { seoul: 40, incheon: 34, busan: 30 },
  middle_east: { seoul: 44, incheon: 38, busan: 34, ulsan: 30, ansan: 32, daegu: 28 },
  anglophone_west: { seoul: 50, busan: 45, jeju: 48, incheon: 46, seongnam: 42 },
  europe: { seoul: 46, busan: 40, jeju: 42, incheon: 38, daejeon: 36 },
  oceania: { seoul: 48, incheon: 42, busan: 44, jeju: 52, seogwipo: 48 },
};

/** Country-specific diaspora hubs — 0–100 fit score per city */
const ORIGIN_CITY_DIASPORA = {
  philippines: { ansan: 92, incheon: 78, seoul: 72, busan: 58, suwon: 55, daejeon: 42 },
  vietnam: { hwaseong: 88, ansan: 85, incheon: 70, seoul: 65, busan: 52, gimpo: 72 },
  china: { seoul: 68, incheon: 58, suwon: 52, busan: 45, daegu: 38 },
  colombia: { seoul: 62, incheon: 55, busan: 50, ansan: 48, sokcho: 58, gangneung: 55 },
  burundi: { seoul: 48, incheon: 38, busan: 32, sokcho: 28, daegu: 30, ansan: 22 },
  uganda: { seoul: 55, incheon: 48, busan: 42 },
  united_states: { seoul: 52, busan: 48, jeju: 55, incheon: 46 },
  canada: { seoul: 48, incheon: 42, busan: 40, seongnam: 38 },
  united_kingdom: { seoul: 50, busan: 44, jeju: 46 },
  india: { seoul: 58, incheon: 52, busan: 40, ansan: 45 },
  nepal: { seoul: 50, incheon: 45, ansan: 42, busan: 35 },
  turkey: { seoul: 46, incheon: 40, busan: 36, ulsan: 32 },
  australia: { seoul: 50, busan: 46, jeju: 54, incheon: 44 },
};

function regionalDiasporaFallback(region, cityId, countrySlug) {
  const table = REGION_CITY_DIASPORA[region];
  if (table?.[cityId] != null) return table[cityId];
  const anchor = table?.seoul ?? 42;
  const hash = [...`${countrySlug}:${cityId}`].reduce((a, c) => a + c.charCodeAt(0), 0);
  return Math.min(88, Math.max(18, Math.round(anchor * 0.72 + (hash % 22))));
}

/** How well a city supports migrants from this origin (0–100). Domestic profiles score flat/low. */
export function getDiasporaFit(origin, cityId) {
  if (isDomesticOrigin(origin)) return 15;

  const country = normalizeOrigin(origin);
  const countryFit = ORIGIN_CITY_DIASPORA[country]?.[cityId];
  if (countryFit != null) return countryFit;

  const region = resolveOriginRegion(origin);
  const regionFit = REGION_CITY_DIASPORA[region]?.[cityId];
  if (regionFit != null) return regionFit;

  return regionalDiasporaFallback(region, cityId, country);
}

/** @deprecated use getDiasporaFit — kept for callers expecting additive boost */
export function getOriginCommunityBoost(origin, cityId) {
  return Math.round(getDiasporaFit(origin, cityId) * 0.35);
}
