import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env') });

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'wellness_user',
  password: process.env.DB_PASSWORD || 'wellness_pass',
  database: process.env.DB_NAME || 'wellness_kits',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true // Allow multiple SQL statements
});

// Tax rates data for New York State
const TAX_RATES = {
  // State base rate
  state: 0.04, // 4% NY state sales tax

  // County rates (additional)
  counties: {
    'New York': 0.04,      // Manhattan
    'Kings': 0.04,         // Brooklyn
    'Queens': 0.04,        // Queens
    'Bronx': 0.04,         // Bronx
    'Richmond': 0.04,      // Staten Island
    'Erie': 0.0475,        // Buffalo area
    'Monroe': 0.04,        // Rochester
    'Onondaga': 0.04,      // Syracuse
    'Albany': 0.04,        // Albany
    'Suffolk': 0.04,       // Long Island
    'Nassau': 0.04,        // Long Island
    'Westchester': 0.04,   // Westchester
    'Rockland': 0.04,      // Rockland
    'Orange': 0.04,        // Orange
    'Dutchess': 0.04,      // Dutchess
    'Ulster': 0.04,        // Ulster
    'Sullivan': 0.04,      // Sullivan
    'Broome': 0.04,        // Binghamton
    'Niagara': 0.04,       // Niagara Falls
    'Oneida': 0.04,        // Utica
    'Saratoga': 0.03,      // Saratoga Springs
    'Rensselaer': 0.04,    // Troy
    'Schenectady': 0.04,   // Schenectady
    'Tompkins': 0.03,      // Ithaca
    'Chemung': 0.04,       // Elmira
    'Steuben': 0.03,       // Corning
    'Chautauqua': 0.04,    // Jamestown
    'Oswego': 0.03,        // Oswego
    'Jefferson': 0.03,     // Watertown
    'St. Lawrence': 0.03,  // Potsdam
    'Franklin': 0.03,      // Malone
    'Clinton': 0.03,       // Plattsburgh
    'Essex': 0.03,         // Lake Placid
    'Hamilton': 0.03,      // Hamilton County
    'Warren': 0.03,        // Lake George
    'Washington': 0.03,    // Washington County
    'Fulton': 0.03,        // Gloversville
    'Montgomery': 0.03,    // Amsterdam
    'Otsego': 0.03,        // Cooperstown
    'Delaware': 0.03,      // Delaware County
    'Greene': 0.03,        // Catskill
    'Columbia': 0.03,      // Hudson
    'Putnam': 0.03,        // Putnam County
    'Orleans': 0.03,       // Orleans County
    'Genesee': 0.03,       // Batavia
    'Wyoming': 0.03,       // Wyoming County
    'Livingston': 0.03,    // Livingston County
    'Ontario': 0.03,       // Canandaigua
    'Yates': 0.03,         // Yates County
    'Seneca': 0.03,        // Seneca County
    'Cayuga': 0.03,        // Auburn
    'Cortland': 0.03,      // Cortland
    'Madison': 0.03,       // Madison County
    'Chenango': 0.03,      // Norwich
    'Tioga': 0.03,         // Owego
    'Schuyler': 0.03,      // Schuyler County
    'Wayne': 0.03,         // Wayne County
    'Lewis': 0.03,         // Lewis County
    'Herkimer': 0.03,      // Herkimer
    'Allegany': 0.03,      // Allegany County
    'Cattaraugus': 0.03    // Olean
  },

  // City rates (additional for NYC)
  city: {
    'New York City': 0.045 // 4.5% NYC additional tax
  }
};

// Test orders from the drone_map.html data
const TEST_ORDERS = [
  [-78.8671866447861, 42.01246326237433, "2025-11-04 10:17:04.915257248", 120.0],
  [-76.2653141983343, 42.47899580935274, "2025-11-04 22:20:08.135761513", 120.0],
  [-73.8825612264399, 40.834113404202824, "2025-11-05 09:02:14.699513608", 25.0],
  [-73.43870366161902, 44.71699277095472, "2025-11-05 22:32:56.886229408", 120.0],
  [-73.91808726141821, 40.6715166199655, "2025-11-06 11:14:54.189824343", 50.0],
  [-73.7879348613946, 40.64889516395453, "2025-11-06 15:19:47.970997872", 25.0],
  [-73.8255711712655, 40.85309884497225, "2025-11-07 14:11:08.334241884", 45.0],
  [-73.87556634583822, 40.82069590326902, "2025-11-07 23:41:24.107196676", 50.0],
  [-73.76706484286136, 40.72223398002971, "2025-11-08 01:38:48.792179167", 50.0],
  [-73.82866188496253, 40.69570549321833, "2025-11-08 16:12:54.764607173", 120.0],
  [-73.9974074623363, 41.49859056585774, "2025-11-08 21:55:24.865118342", 50.0],
  [-73.82449274531882, 40.771317122939365, "2025-11-08 23:53:34.810841054", 50.0],
  [-73.88306635075915, 40.944601561078564, "2025-11-09 03:38:22.031799503", 45.0],
  [-73.91014003946918, 40.84472311494027, "2025-11-09 07:47:26.276724014", 120.0],
  [-74.1264930422675, 41.2568508464599, "2025-11-09 23:40:54.724580990", 50.0],
  [-73.90962213647326, 40.64186218803688, "2025-11-10 00:03:24.799041401", 50.0],
  [-73.96912637851912, 40.78835318746788, "2025-11-10 06:37:43.664466330", 25.0],
  [-73.79666815163614, 40.751873654523166, "2025-11-11 01:24:52.180064822", 25.0],
  [-73.95312581623382, 40.68439498894632, "2025-11-11 08:19:35.106856471", 120.0],
  [-73.90889516554168, 40.665307647276386, "2025-11-11 18:15:47.013619684", 50.0],
  [-73.91910843778155, 40.6671997058511, "2025-11-11 18:33:45.288054025", 120.0],
  [-73.86302947950956, 40.8456164281414, "2025-11-11 19:40:43.579696205", 45.0],
  [-73.9762524795146, 40.76493839633712, "2025-11-11 21:23:47.151624461", 120.0],
  [-73.78845233822688, 40.738034626365334, "2025-11-11 22:52:30.462098985", 50.0],
  [-78.18751358505837, 42.37118330870915, "2025-11-12 00:56:13.802692401", 50.0],
  [-73.98322428261152, 40.77943719621347, "2025-11-12 02:57:20.386158487", 50.0],
  [-73.85374680584587, 40.84410830783393, "2025-11-12 03:08:10.475138764", 50.0],
  [-73.93396858128467, 40.669076488406674, "2025-11-12 07:46:12.616764582", 25.0],
  [-74.48847224337538, 44.16413975454427, "2025-11-12 08:43:09.380905595", 108.0],
  [-73.96730648527041, 40.645285954498945, "2025-11-12 08:48:53.583557754", 120.0]
];

// Helper function to determine tax rate based on coordinates
function getTaxRate(lat: number, lon: number): { composite: number; breakdown: any } {
  // NYC area (Manhattan, Brooklyn, Queens, Bronx, Staten Island)
  const isNYC = (lat >= 40.5 && lat <= 40.9 && lon >= -74.05 && lon <= -73.7);
  
  // Buffalo/Erie County area
  const isErie = (lat >= 42.8 && lat <= 43.1 && lon >= -78.9 && lon <= -78.7);
  
  // Albany area
  const isAlbany = (lat >= 42.6 && lat <= 42.8 && lon >= -73.9 && lon <= -73.7);
  
  // Syracuse area
  const isSyracuse = (lat >= 43.0 && lat <= 43.1 && lon >= -76.2 && lon <= -76.1);
  
  // Rochester area
  const isRochester = (lat >= 43.1 && lat <= 43.2 && lon >= -77.7 && lon <= -77.5);
  
  let stateRate = TAX_RATES.state;
  let countyRate = 0;
  let cityRate = 0;
  
  if (isNYC) {
    countyRate = 0.04; // NYC counties
    cityRate = 0.045;  // NYC city tax
  } else if (isErie) {
    countyRate = 0.0475; // Erie County
  } else if (isAlbany) {
    countyRate = 0.04; // Albany County
  } else if (isSyracuse) {
    countyRate = 0.04; // Onondaga County
  } else if (isRochester) {
    countyRate = 0.04; // Monroe County
  } else {
    // Default upstate rate
    countyRate = 0.03;
  }
  
  const composite = stateRate + countyRate + cityRate;
  
  return {
    composite: parseFloat(composite.toFixed(4)),
    breakdown: {
      state_rate: stateRate,
      county_rate: countyRate,
      city_rate: cityRate,
      special_rates: 0
    }
  };
}

async function seedDatabase() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Starting database seed...');
    
    // Drop existing tables if they exist (clean slate)
    console.log('Dropping existing tables...');
    await connection.query('DROP TABLE IF EXISTS tax_breakdown');
    await connection.query('DROP TABLE IF EXISTS orders');
    
    // Create tables
    console.log('Creating tables...');
    
    await connection.query(`
      CREATE TABLE orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        latitude DECIMAL(10,8) NOT NULL,
        longitude DECIMAL(11,8) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        tax_amount DECIMAL(10,2) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        composite_tax_rate DECIMAL(5,4) NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await connection.query(`
      CREATE TABLE tax_breakdown (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        jurisdiction_type ENUM('state', 'county', 'city', 'special') NOT NULL,
        rate DECIMAL(5,4) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Tables created successfully');
    
    // Insert test orders
    console.log(`Seeding ${TEST_ORDERS.length} test orders...`);
    
    for (const order of TEST_ORDERS) {
      const [lon, lat, timestampStr, subtotal] = order;
      const timestamp = new Date(timestampStr);
      
      // Calculate tax
      const { composite, breakdown } = getTaxRate(lat as number, lon as number);
      const taxAmount = (subtotal as number) * composite;
      const totalAmount = (subtotal as number) + taxAmount;
      
      // Insert order
      const [result] = await connection.execute(
        `INSERT INTO orders 
         (latitude, longitude, subtotal, tax_amount, total_amount, composite_tax_rate, timestamp) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          lat,
          lon,
          subtotal,
          parseFloat(taxAmount.toFixed(2)),
          parseFloat(totalAmount.toFixed(2)),
          composite,
          timestamp
        ]
      );
      
      const orderId = (result as any).insertId;
      
      // Insert tax breakdown
      const breakdownEntries = [
        { type: 'state', rate: breakdown.state_rate },
        { type: 'county', rate: breakdown.county_rate },
        { type: 'city', rate: breakdown.city_rate },
        { type: 'special', rate: breakdown.special_rates }
      ].filter(entry => entry.rate > 0);
      
      for (const entry of breakdownEntries) {
        await connection.execute(
          `INSERT INTO tax_breakdown (order_id, jurisdiction_type, rate) VALUES (?, ?, ?)`,
          [orderId, entry.type, entry.rate]
        );
      }
    }
    
    console.log(`Seeded ${TEST_ORDERS.length} orders successfully`);
    
    // Insert some additional test orders with NYC coordinates
    console.log('Seeding additional NYC test orders...');
    
    const nycOrders = [
      [40.7128, -74.0060, "2026-02-27 10:00:00", 100.00],  // NYC
      [40.7589, -73.9851, "2026-02-27 11:00:00", 75.50],   // Times Square
      [40.6892, -74.0445, "2026-02-27 12:00:00", 200.00],  // Brooklyn
      [40.7831, -73.9712, "2026-02-27 13:00:00", 150.00],  // Central Park
      [40.7580, -73.9855, "2026-02-27 14:00:00", 45.00],   // Midtown
    ];
    
    for (const order of nycOrders) {
      const [lat, lon, timestampStr, subtotal] = order;
      const timestamp = new Date(timestampStr as string);
      
      const { composite, breakdown } = getTaxRate(lat as number, lon as number);
      const taxAmount = (subtotal as number) * composite;
      const totalAmount = (subtotal as number) + taxAmount;
      
      const [result] = await connection.execute(
        `INSERT INTO orders 
         (latitude, longitude, subtotal, tax_amount, total_amount, composite_tax_rate, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          lat,
          lon,
          subtotal,
          parseFloat(taxAmount.toFixed(2)),
          parseFloat(totalAmount.toFixed(2)),
          composite,
          timestamp
        ]
      );
      
      const orderId = (result as any).insertId;
      
      const breakdownEntries = [
        { type: 'state', rate: breakdown.state_rate },
        { type: 'county', rate: breakdown.county_rate },
        { type: 'city', rate: breakdown.city_rate }
      ].filter(entry => entry.rate > 0);
      
      for (const entry of breakdownEntries) {
        await connection.execute(
          `INSERT INTO tax_breakdown (order_id, jurisdiction_type, rate) VALUES (?, ?, ?)`,
          [orderId, entry.type, entry.rate]
        );
      }
    }
    
    console.log(`Seeded ${nycOrders.length} additional NYC orders`);
    
    // Verify the data
    const [orderCount] = await connection.query('SELECT COUNT(*) as count FROM orders');
    const [breakdownCount] = await connection.query('SELECT COUNT(*) as count FROM tax_breakdown');
    
    console.log('\nDatabase summary:');
    console.log(`   Orders: ${(orderCount as any)[0].count}`);
    console.log(`   Tax breakdown entries: ${(breakdownCount as any)[0].count}`);
    
    console.log('\nDatabase seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

// Run the seed function
seedDatabase().catch(console.error);