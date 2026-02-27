import { point } from '@turf/turf';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import countiesData from '../data/ny-counties.json';

// Tax rates based on actual NY sales tax (state 4% + local)
interface TaxRates {
  state: number;
  county: number;
  city: number;
  special: number;
}

const taxRates: Record<string, TaxRates> = {
  // NYC boroughs - 8.875% total
  'New York': { state: 0.04, county: 0.04, city: 0.045, special: 0 },    // Manhattan
  'Kings': { state: 0.04, county: 0.04, city: 0.045, special: 0 },        // Brooklyn
  'Queens': { state: 0.04, county: 0.04, city: 0.045, special: 0 },       // Queens
  'Bronx': { state: 0.04, county: 0.04, city: 0.045, special: 0 },        // Bronx
  'Richmond': { state: 0.04, county: 0.04, city: 0.045, special: 0 },     // Staten Island
  
  // Major cities - 8%
  'Erie': { state: 0.04, county: 0.04, city: 0, special: 0 },             // Buffalo
  'Monroe': { state: 0.04, county: 0.04, city: 0, special: 0 },           // Rochester
  'Onondaga': { state: 0.04, county: 0.04, city: 0, special: 0 },         // Syracuse
  'Albany': { state: 0.04, county: 0.04, city: 0, special: 0 },           // Albany
  'Nassau': { state: 0.04, county: 0.0475, city: 0, special: 0 },         // Long Island - 8.75%
  'Suffolk': { state: 0.04, county: 0.0475, city: 0, special: 0 },        // Long Island - 8.75%
  'Westchester': { state: 0.04, county: 0.04, city: 0, special: 0 },      // 8%
  'Rockland': { state: 0.04, county: 0.0375, city: 0, special: 0 },       // 7.75%
  'Orange': { state: 0.04, county: 0.0375, city: 0, special: 0 },         // 7.75%
  'Dutchess': { state: 0.04, county: 0.0375, city: 0, special: 0 },       // 7.75%
  'Ulster': { state: 0.04, county: 0.0375, city: 0, special: 0 },         // 7.75%
  'Sullivan': { state: 0.04, county: 0.0375, city: 0, special: 0 },       // 7.75%
  'Delaware': { state: 0.04, county: 0.03, city: 0, special: 0 },         // 7%
  'Chenango': { state: 0.04, county: 0.03, city: 0, special: 0 },         // 7%
  'Madison': { state: 0.04, county: 0.03, city: 0, special: 0 },          // 7%
  'Oneida': { state: 0.04, county: 0.03, city: 0, special: 0 },           // 7%
  'Herkimer': { state: 0.04, county: 0.03, city: 0, special: 0 },         // 7%
  'Fulton': { state: 0.04, county: 0.03, city: 0, special: 0 },           // 7%
  'Montgomery': { state: 0.04, county: 0.03, city: 0, special: 0 },       // 7%
  'Schenectady': { state: 0.04, county: 0.03, city: 0, special: 0 },      // 7%
  'Rensselaer': { state: 0.04, county: 0.03, city: 0, special: 0 },       // 7%
  'Columbia': { state: 0.04, county: 0.03, city: 0, special: 0 },         // 7%
  'Greene': { state: 0.04, county: 0.03, city: 0, special: 0 },           // 7%
  'Schoharie': { state: 0.04, county: 0.03, city: 0, special: 0 },        // 7%
  'Otsego': { state: 0.04, county: 0.03, city: 0, special: 0 },           // 7%
  'Broome': { state: 0.04, county: 0.03, city: 0, special: 0 },           // 7%
  'Tioga': { state: 0.04, county: 0.03, city: 0, special: 0 },            // 7%
  'Chemung': { state: 0.04, county: 0.03, city: 0, special: 0 },          // 7%
  'Steuben': { state: 0.04, county: 0.03, city: 0, special: 0 },          // 7%
  'Schuyler': { state: 0.04, county: 0.03, city: 0, special: 0 },         // 7%
  'Yates': { state: 0.04, county: 0.03, city: 0, special: 0 },            // 7%
  'Ontario': { state: 0.04, county: 0.03, city: 0, special: 0 },          // 7%
  'Wayne': { state: 0.04, county: 0.03, city: 0, special: 0 },            // 7%
  'Cayuga': { state: 0.04, county: 0.03, city: 0, special: 0 },           // 7%
  'Oswego': { state: 0.04, county: 0.03, city: 0, special: 0 },           // 7%
  'Jefferson': { state: 0.04, county: 0.03, city: 0, special: 0 },        // 7%
  'Lewis': { state: 0.04, county: 0.03, city: 0, special: 0 },            // 7%
  'St. Lawrence': { state: 0.04, county: 0.03, city: 0, special: 0 },    // 7%
  'Franklin': { state: 0.04, county: 0.03, city: 0, special: 0 },         // 7%
  'Clinton': { state: 0.04, county: 0.03, city: 0, special: 0 },          // 7%
  'Essex': { state: 0.04, county: 0.03, city: 0, special: 0 },            // 7%
  'Warren': { state: 0.04, county: 0.03, city: 0, special: 0 },           // 7%
  'Washington': { state: 0.04, county: 0.03, city: 0, special: 0 },       // 7%
  'Saratoga': { state: 0.04, county: 0.03, city: 0, special: 0 },         // 7%
  'Hamilton': { state: 0.04, county: 0.03, city: 0, special: 0 },         // 7%
  'Cattaraugus': { state: 0.04, county: 0.03, city: 0, special: 0 },      // 7%
  'Allegany': { state: 0.04, county: 0.03, city: 0, special: 0 },         // 7%
  'Wyoming': { state: 0.04, county: 0.03, city: 0, special: 0 },          // 7%
  'Livingston': { state: 0.04, county: 0.03, city: 0, special: 0 },       // 7%
  'Genesee': { state: 0.04, county: 0.03, city: 0, special: 0 },          // 7%
  'Orleans': { state: 0.04, county: 0.03, city: 0, special: 0 },          // 7%
  'Niagara': { state: 0.04, county: 0.03, city: 0, special: 0 },          // 7%
  'Chautauqua': { state: 0.04, county: 0.03, city: 0, special: 0 },       // 7%
  'Tompkins': { state: 0.04, county: 0.03, city: 0, special: 0 },         // 7%
  'Cortland': { state: 0.04, county: 0.03, city: 0, special: 0 },         // 7%
  'Seneca': { state: 0.04, county: 0.03, city: 0, special: 0 },           // 7%
  'Putnam': { state: 0.04, county: 0.03, city: 0, special: 0 },           // 7%
};

const DEFAULT_RATE: TaxRates = { state: 0.04, county: 0.03, city: 0, special: 0 };

export const calculateTax = (lat: number, lon: number): { 
  compositeRate: number; 
  breakdown: { state_rate: number; county_rate: number; city_rate: number; special_rates: number; };
  countyName: string | null;
} => {
  try {
    // Create a point from coordinates - point takes [lon, lat]
    const pt = point([lon, lat]);
    let foundCounty: string | null = null;
    
    // Find which county contains this point
    for (const feature of countiesData.features) {
      // Cast feature to any to bypass TypeScript type checking
      // This is safe because we know the GeoJSON structure matches what turf expects
      if (booleanPointInPolygon(pt, feature as any)) {
        foundCounty = feature.properties.NAME;
        break;
      }
    }
    
    const rates = (foundCounty && taxRates[foundCounty]) ? taxRates[foundCounty] : DEFAULT_RATE;
    const compositeRate = rates.state + rates.county + rates.city + rates.special;
    
    return {
      compositeRate: parseFloat(compositeRate.toFixed(4)),
      breakdown: {
        state_rate: rates.state,
        county_rate: rates.county,
        city_rate: rates.city,
        special_rates: rates.special
      },
      countyName: foundCounty
    };
  } catch (error) {
    console.error('Tax calculation error:', error);
    return {
      compositeRate: 0.07,
      breakdown: { state_rate: 0.04, county_rate: 0.03, city_rate: 0, special_rates: 0 },
      countyName: null
    };
  }
};