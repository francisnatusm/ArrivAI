/**
 * World country → diaspora region mapping for ArrivAI scoring.
 * Every recognized country resolves to a region (not the generic "other" bucket).
 */

export const DIASPORA_REGIONS = [
  'domestic',
  'southeast_asia',
  'east_asia',
  'south_asia',
  'central_asia',
  'latin_america',
  'caribbean',
  'east_africa',
  'west_africa',
  'north_africa',
  'middle_east',
  'anglophone_west',
  'europe',
  'oceania',
];

/** Common spellings / demonyms → canonical slug */
const ALIAS_TO_SLUG = {
  korea: 'domestic_korea',
  'south korea': 'domestic_korea',
  'republic of korea': 'domestic_korea',
  rok: 'domestic_korea',
  korean: 'domestic_korea',
  한국: 'domestic_korea',
  usa: 'united_states',
  'united states': 'united_states',
  'united states of america': 'united_states',
  america: 'united_states',
  us: 'united_states',
  uk: 'united_kingdom',
  'united kingdom': 'united_kingdom',
  britain: 'united_kingdom',
  'great britain': 'united_kingdom',
  england: 'united_kingdom',
  scotland: 'united_kingdom',
  wales: 'united_kingdom',
  uae: 'united_arab_emirates',
  'u.a.e.': 'united_arab_emirates',
  emirates: 'united_arab_emirates',
  philipines: 'philippines',
  filipino: 'philippines',
  'viet nam': 'vietnam',
  vietnamese: 'vietnam',
  burmese: 'myanmar',
  burma: 'myanmar',
  chinese: 'china',
  japanese: 'japan',
  indian: 'india',
  nepali: 'nepal',
  uzbek: 'uzbekistan',
  kazakh: 'kazakhstan',
  russian: 'russia',
  mexican: 'mexico',
  brazilian: 'brazil',
  colombian: 'colombia',
  burundian: 'burundi',
  ugandan: 'uganda',
  kenyan: 'kenya',
  nigerian: 'nigeria',
  ethiopian: 'ethiopia',
  tanzanian: 'tanzania',
  ghanaian: 'ghana',
  cameroonian: 'cameroon',
  senegalese: 'senegal',
  moroccan: 'morocco',
  egyptian: 'egypt',
  bangladeshi: 'bangladesh',
  pakistani: 'pakistan',
  srilanka: 'sri_lanka',
  'sri lankan': 'sri_lanka',
  argentinian: 'argentina',
  argentine: 'argentina',
  chilean: 'chile',
  ecuadorian: 'ecuador',
  peruvian: 'peru',
  rwandan: 'rwanda',
  mongolian: 'mongolia',
  cambodian: 'cambodia',
  thai: 'thailand',
  indonesian: 'indonesia',
  french: 'france',
  german: 'germany',
  turkish: 'turkey',
  iranian: 'iran',
  saudi: 'saudi_arabia',
  canadian: 'canada',
  australian: 'australia',
  'new zealander': 'new_zealand',
  kiwi: 'new_zealand',
  dutch: 'netherlands',
  swiss: 'switzerland',
  italian: 'italy',
  spanish: 'spain',
  polish: 'poland',
  ukrainian: 'ukraine',
};

/** Canonical slug → diaspora region (UN member states + common territories) */
const BY_REGION = {
  domestic: ['domestic_korea'],

  southeast_asia: [
    'philippines', 'vietnam', 'thailand', 'indonesia', 'cambodia', 'myanmar', 'laos',
    'malaysia', 'singapore', 'brunei', 'timor_leste',
  ],

  east_asia: [
    'china', 'japan', 'mongolia', 'taiwan', 'hong_kong', 'macau', 'north_korea',
  ],

  south_asia: [
    'india', 'nepal', 'bangladesh', 'pakistan', 'sri_lanka', 'afghanistan', 'bhutan', 'maldives',
  ],

  central_asia: [
    'uzbekistan', 'kazakhstan', 'kyrgyzstan', 'tajikistan', 'turkmenistan',
  ],

  latin_america: [
    'mexico', 'brazil', 'colombia', 'peru', 'argentina', 'chile', 'ecuador', 'venezuela',
    'bolivia', 'paraguay', 'uruguay', 'guatemala', 'honduras', 'el_salvador', 'nicaragua',
    'costa_rica', 'panama', 'belize', 'guyana', 'suriname', 'french_guiana',
  ],

  caribbean: [
    'cuba', 'dominican_republic', 'haiti', 'jamaica', 'trinidad_and_tobago', 'bahamas',
    'barbados', 'saint_lucia', 'grenada', 'antigua_and_barbuda', 'dominica',
    'saint_kitts_and_nevis', 'saint_vincent_and_the_grenadines',
  ],

  east_africa: [
    'burundi', 'rwanda', 'uganda', 'kenya', 'ethiopia', 'tanzania', 'somalia', 'south_sudan',
    'sudan', 'eritrea', 'djibouti', 'madagascar', 'mauritius', 'seychelles', 'comoros',
    'malawi', 'mozambique', 'zambia', 'zimbabwe',
  ],

  west_africa: [
    'nigeria', 'ghana', 'cameroon', 'senegal', 'ivory_coast', 'cote_divoire', 'mali', 'niger',
    'burkina_faso', 'benin', 'togo', 'guinea', 'sierra_leone', 'liberia', 'gambia',
    'guinea_bissau', 'cape_verde', 'mauritania', 'chad', 'central_african_republic',
    'congo', 'democratic_republic_of_congo', 'gabon', 'equatorial_guinea', 'sao_tome_and_principe',
    'angola',
  ],

  north_africa: [
    'morocco', 'egypt', 'algeria', 'tunisia', 'libya', 'western_sahara',
  ],

  middle_east: [
    'turkey', 'iran', 'iraq', 'saudi_arabia', 'yemen', 'oman', 'united_arab_emirates',
    'qatar', 'bahrain', 'kuwait', 'jordan', 'lebanon', 'syria', 'israel', 'palestine',
    'cyprus', 'armenia', 'azerbaijan', 'georgia',
  ],

  anglophone_west: [
    'united_states', 'canada', 'united_kingdom', 'ireland', 'south_africa', 'namibia', 'botswana',
    'lesotho', 'eswatini', 'swaziland', 'belize',
  ],

  europe: [
    'france', 'germany', 'russia', 'ukraine', 'poland', 'italy', 'spain', 'portugal',
    'netherlands', 'belgium', 'austria', 'switzerland', 'sweden', 'norway', 'denmark',
    'finland', 'iceland', 'greece', 'czech_republic', 'czechia', 'slovakia', 'hungary',
    'romania', 'bulgaria', 'serbia', 'croatia', 'slovenia', 'bosnia_and_herzegovina',
    'montenegro', 'north_macedonia', 'albania', 'kosovo', 'moldova', 'belarus', 'lithuania',
    'latvia', 'estonia', 'luxembourg', 'malta', 'andorra', 'monaco', 'liechtenstein',
    'san_marino', 'vatican_city',
  ],

  oceania: [
    'australia', 'new_zealand', 'fiji', 'papua_new_guinea', 'samoa', 'tonga', 'vanuatu',
    'solomon_islands', 'micronesia', 'palau', 'marshall_islands', 'kiribati', 'nauru',
    'tuvalu', 'new_caledonia', 'french_polynesia',
  ],
};

const SLUG_TO_REGION = {};
for (const [region, slugs] of Object.entries(BY_REGION)) {
  for (const slug of slugs) {
    SLUG_TO_REGION[slug] = region;
  }
}

/** @deprecated — use resolveOriginRegion(); kept for imports that expect slug→region */
export const ORIGIN_REGION = SLUG_TO_REGION;

function slugify(raw) {
  return String(raw || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

function matchAlias(raw) {
  if (ALIAS_TO_SLUG[raw]) return ALIAS_TO_SLUG[raw];
  for (const [alias, slug] of Object.entries(ALIAS_TO_SLUG)) {
    if (raw === alias) return slug;
    if (alias.length >= 4 && raw.includes(alias)) return slug;
  }
  return null;
}

/** Canonical country slug from free-text origin */
export function normalizeOrigin(origin) {
  const raw = String(origin || '').toLowerCase().trim();
  if (!raw) return 'unknown';

  const aliasSlug = matchAlias(raw);
  if (aliasSlug) return aliasSlug;

  const slug = slugify(origin);
  if (SLUG_TO_REGION[slug]) return slug;

  for (const key of Object.keys(SLUG_TO_REGION)) {
    if (key.length >= 4 && (slug.includes(key) || key.includes(slug))) return key;
  }

  return slug || 'unknown';
}

/** Diaspora region for scoring */
export function resolveOriginRegion(origin) {
  const slug = normalizeOrigin(origin);
  if (slug === 'domestic_korea') return 'domestic';
  if (SLUG_TO_REGION[slug]) return SLUG_TO_REGION[slug];

  const raw = slugify(origin);
  for (const key of Object.keys(SLUG_TO_REGION)) {
    if (key.length >= 4 && (raw.startsWith(key) || key.startsWith(raw))) {
      return SLUG_TO_REGION[key];
    }
  }

  const pool = DIASPORA_REGIONS.filter((r) => r !== 'domestic');
  const hash = [...slug].reduce((a, c) => a + c.charCodeAt(0), 0);
  return pool[hash % pool.length];
}

export function isDomesticOrigin(origin) {
  return normalizeOrigin(origin) === 'domestic_korea';
}

export function getRegionLabel(region) {
  const labels = {
    domestic: 'Domestic (Korea)',
    southeast_asia: 'Southeast Asia',
    east_asia: 'East Asia',
    south_asia: 'South Asia',
    central_asia: 'Central Asia',
    latin_america: 'Latin America',
    caribbean: 'Caribbean',
    east_africa: 'East Africa',
    west_africa: 'West Africa',
    north_africa: 'North Africa',
    middle_east: 'Middle East',
    anglophone_west: 'Anglophone West',
    europe: 'Europe',
    oceania: 'Oceania',
  };
  return labels[region] || region;
}
