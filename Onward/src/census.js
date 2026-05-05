import fs from 'fs';
import path from 'path';
import { TMP_DIR } from './config.js';

const CENSUS_API_KEY = process.env.CENSUS_API_KEY || process.env.CENSUS_KEY || '';
const ACS_YEAR = process.env.CENSUS_ACS_YEAR || '2022';
const ACS_DATASET = `https://api.census.gov/data/${ACS_YEAR}/acs/acs5`;
const GEOCODER_URL = 'https://geocoding.geo.census.gov/geocoder/geographies/coordinates';
const CACHE_PATH = path.join(TMP_DIR, 'census-cache.json');
const CACHE_TTL_MS = Number(process.env.CENSUS_CACHE_TTL_DAYS || 30) * 24 * 60 * 60 * 1000;

const B19001_FIELDS = [
  'B19001_001E',
  'B19001_002E',
  'B19001_003E',
  'B19001_004E',
  'B19001_005E',
  'B19001_006E',
  'B19001_007E',
  'B19001_008E',
  'B19001_009E',
  'B19001_010E',
  'B19001_011E',
  'B19001_012E',
  'B19001_013E',
  'B19001_014E',
  'B19001_015E',
  'B19001_016E',
  'B19001_017E'
];

const TIER_FIELD_MAP = {
  '0_14K': ['B19001_002E', 'B19001_003E'],
  '15_24K': ['B19001_004E', 'B19001_005E'],
  '25_34K': ['B19001_006E'],
  '35_49K': ['B19001_007E', 'B19001_008E'],
  '50_74K': ['B19001_009E', 'B19001_010E', 'B19001_011E'],
  '75_99K': ['B19001_012E', 'B19001_013E'],
  '100K_PLUS': ['B19001_014E', 'B19001_015E', 'B19001_016E', 'B19001_017E']
};

let cache = { geoid: {} };

function loadCache() {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      const raw = fs.readFileSync(CACHE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        cache = parsed;
      }
    }
  } catch {
    cache = { geoid: {} };
  }
}

function saveCache() {
  try {
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
  } catch {
    // ignore cache write failures
  }
}

loadCache();

function getCachedIncome(geoid) {
  const entry = cache.geoid?.[geoid];
  if (!entry) return null;
  if (Date.now() - entry.updatedAt > CACHE_TTL_MS) return null;
  return entry.data || null;
}

function setCachedIncome(geoid, data) {
  if (!cache.geoid) cache.geoid = {};
  cache.geoid[geoid] = {
    updatedAt: Date.now(),
    data
  };
  saveCache();
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed ${res.status}: ${url}`);
  }
  return res.json();
}

async function lookupGeography(lat, lon) {
  const params = new URLSearchParams({
    x: String(lon),
    y: String(lat),
    benchmark: 'Public_AR_Current',
    vintage: 'Current_Current',
    format: 'json'
  });

  const json = await fetchJson(`${GEOCODER_URL}?${params.toString()}`);
  const tract = json?.result?.geographies?.['Census Tracts']?.[0];
  if (!tract) return null;

  return {
    state: tract.STATE?.padStart(2, '0'),
    county: tract.COUNTY?.padStart(3, '0'),
    tract: tract.TRACT?.padStart(6, '0'),
    geoid: tract.GEOID
  };
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

async function fetchIncomeForTract({ state, county, tract }) {
  if (!state || !county || !tract) return null;

  const params = new URLSearchParams({
    get: B19001_FIELDS.join(','),
    for: `tract:${tract}`,
    in: `state:${state}+county:${county}`
  });
  if (CENSUS_API_KEY) {
    params.set('key', CENSUS_API_KEY);
  }

  const data = await fetchJson(`${ACS_DATASET}?${params.toString()}`);
  if (!Array.isArray(data) || data.length < 2) return null;

  const headers = data[0];
  const row = data[1];
  const indexMap = headers.reduce((acc, field, idx) => {
    if (field) acc[field] = idx;
    return acc;
  }, {});

  const tiers = {};
  for (const [tierKey, fields] of Object.entries(TIER_FIELD_MAP)) {
    let sum = 0;
    for (const field of fields) {
      const idx = indexMap[field];
      if (idx !== undefined) {
        sum += toNumber(row[idx]);
      }
    }
    tiers[tierKey] = sum;
  }

  return tiers;
}

export async function fetchIncomeTiersForCoordinates(lat, lon) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  try {
    const geography = await lookupGeography(lat, lon);
    if (!geography?.geoid) return null;

    const cached = getCachedIncome(geography.geoid);
    if (cached) return cached;

    const tiers = await fetchIncomeForTract(geography);
    if (tiers) {
      setCachedIncome(geography.geoid, tiers);
    }
    return tiers;
  } catch (error) {
    console.warn('Census lookup failed:', error.message || error);
    return null;
  }
}
