import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

// database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'wellness_user',
  password: process.env.DB_PASSWORD || 'wellness_pass',
  database: process.env.DB_NAME || 'wellness_kits',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
});

const TEST_ORDERS = [
  [-78.8671866447861, 42.01246326237433, "2025-11-04 10:17:04", 120.0],
  [-76.2653141983343, 42.47899580935274, "2025-11-04 22:20:08", 120.0],
  [-73.8825612264399, 40.834113404202824, "2025-11-05 09:02:14", 25.0],
  [-73.43870366161902, 44.71699277095472, "2025-11-05 22:32:56", 120.0],
  [-73.91808726141821, 40.6715166199655, "2025-11-06 11:14:54", 50.0],
  [-73.7879348613946, 40.64889516395453, "2025-11-06 15:19:47", 25.0],
  [-73.8255711712655, 40.85309884497225, "2025-11-07 14:11:08", 45.0],
  [-73.87556634583822, 40.82069590326902, "2025-11-07 23:41:24", 50.0],
  [-73.76706484286136, 40.72223398002971, "2025-11-08 01:38:48", 50.0],
  [-73.82866188496253, 40.69570549321833, "2025-11-08 16:12:54", 120.0],
  [-73.9974074623363, 41.49859056585774, "2025-11-08 21:55:24", 50.0],
  [-73.82449274531882, 40.771317122939365, "2025-11-08 23:53:34", 50.0],
  [-73.88306635075915, 40.944601561078564, "2025-11-09 03:38:22", 45.0],
  [-73.91014003946918, 40.84472311494027, "2025-11-09 07:47:26", 120.0],
  [-74.1264930422675, 41.2568508464599, "2025-11-09 23:40:54", 50.0],
  [-73.90962213647326, 40.64186218803688, "2025-11-10 00:03:24", 50.0],
  [-73.96912637851912, 40.78835318746788, "2025-11-10 06:37:43", 25.0],
  [-73.79666815163614, 40.751873654523166, "2025-11-11 01:24:52", 25.0],
  [-73.95312581623382, 40.68439498894632, "2025-11-11 08:19:35", 120.0],
  [-73.90889516554168, 40.665307647276386, "2025-11-11 18:15:47", 50.0],
  [-73.91910843778155, 40.6671997058511, "2025-11-11 18:33:45", 120.0],
  [-73.86302947950956, 40.8456164281414, "2025-11-11 19:40:43", 45.0],
  [-73.9762524795146, 40.76493839633712, "2025-11-11 21:23:47", 120.0],
  [-73.78845233822688, 40.738034626365334, "2025-11-11 22:52:30", 50.0],
  [-78.18751358505837, 42.37118330870915, "2025-11-12 00:56:13", 50.0],
  [-73.98322428261152, 40.77943719621347, "2025-11-12 02:57:20", 50.0],
  [-73.85374680584587, 40.84410830783393, "2025-11-12 03:08:10", 50.0],
  [-73.93396858128467, 40.669076488406674, "2025-11-12 07:46:12", 25.0],
  [-74.48847224337538, 44.16413975454427, "2025-11-12 08:43:09", 108.0],
  [-73.96730648527041, 40.645285954498945, "2025-11-12 08:48:53", 120.0]
];

const NYC_ORDERS = [
  [40.7128, -74.0060, "2026-02-27 10:00:00", 100.00],  // NYC
  [40.7589, -73.9851, "2026-02-27 11:00:00", 75.50],   // Times Square
  [40.6892, -74.0445, "2026-02-27 12:00:00", 200.00],  // Brooklyn
  [40.7831, -73.9712, "2026-02-27 13:00:00", 150.00],  // Central Park
  [40.7580, -73.9855, "2026-02-27 14:00:00", 45.00]    // Midtown
];

// determine tax rate based on coordinates
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
  
  let stateRate = 0.04; // 4% NY state sales tax
  let countyRate = 0;
  let cityRate = 0;
  
  if (isNYC) {
    countyRate = 0.04; // NYC counties
    cityRate = 0.045;  // NYC city tax
  } else if (isErie) {
    countyRate = 0.0475; // Erie County
  } else if (isAlbany || isSyracuse || isRochester) {
    countyRate = 0.04; // major cities
  } else {
    countyRate = 0.03; // default upstate rate
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
    
    // check if tables exist, create if they don't
    console.log('Checking if tables exist...');
    
    const [tables] = await connection.query("SHOW TABLES LIKE 'orders'");
    if (Array.isArray(tables) && tables.length === 0) {
      console.log('Creating orders table...');
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
    } else {
      console.log('Orders table already exists');
    }
    
    const [taxTables] = await connection.query("SHOW TABLES LIKE 'tax_breakdown'");
    if (Array.isArray(taxTables) && taxTables.length === 0) {
      console.log('Creating tax_breakdown table...');
      await connection.query(`
        CREATE TABLE tax_breakdown (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_id INT NOT NULL,
          jurisdiction_type ENUM('state', 'county', 'city', 'special') NOT NULL,
          rate DECIMAL(5,4) NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        )
      `);
    } else {
      console.log('Tax_breakdown table already exists');
    }
    
    // check current order count
    const [orderCountResult] = await connection.query('SELECT COUNT(*) as count FROM orders');
    const currentCount = (orderCountResult as any)[0].count;
    console.log(`Current orders in database: ${currentCount}`);
    
    // insert test orders if they don't exist 
    console.log(`Checking ${TEST_ORDERS.length} test orders...`);
    let newOrdersAdded = 0;
    
    for (const order of TEST_ORDERS) {
      const [lon, lat, timestampStr, subtotal] = order;
      const timestamp = new Date(timestampStr as string);
      
      // check if order already exists
      const [existing] = await connection.execute(
        `SELECT id FROM orders WHERE latitude = ? AND longitude = ? AND timestamp = ? AND subtotal = ?`,
        [lat, lon, timestamp, subtotal]
      );
      
      if (Array.isArray(existing) && existing.length === 0) {
        // calc tax
        const { composite, breakdown } = getTaxRate(lat as number, lon as number);
        const taxAmount = (subtotal as number) * composite;
        const totalAmount = (subtotal as number) + taxAmount;
        
        // insert order
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
        
        // insert tax breakdown
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
        
        newOrdersAdded++;
      }
    }
    
    console.log(`Added ${newOrdersAdded} new test orders`);
    
    // insert additional NYC test orders
    console.log('Checking NYC test orders...');
    let newNycOrdersAdded = 0;
    
    for (const order of NYC_ORDERS) {
      const [lat, lon, timestampStr, subtotal] = order;
      const timestamp = new Date(timestampStr as string);
      
      // check if order already exists
      const [existing] = await connection.execute(
        `SELECT id FROM orders WHERE latitude = ? AND longitude = ? AND timestamp = ? AND subtotal = ?`,
        [lat, lon, timestamp, subtotal]
      );
      
      if (Array.isArray(existing) && existing.length === 0) {
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
        
        newNycOrdersAdded++;
      }
    }
    
    console.log(`Added ${newNycOrdersAdded} new NYC orders`);
    
    const [finalOrderCount] = await connection.query('SELECT COUNT(*) as count FROM orders');
    const [finalBreakdownCount] = await connection.query('SELECT COUNT(*) as count FROM tax_breakdown');
    
    console.log('\nDatabase seeding completed!');
    console.log(`Previous orders: ${currentCount}`);
    console.log(`New orders added: ${newOrdersAdded + newNycOrdersAdded}`);
    console.log(`Total orders now: ${(finalOrderCount as any)[0].count}`);
    console.log(`Total tax breakdown entries: ${(finalBreakdownCount as any)[0].count}`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

seedDatabase().catch(console.error);