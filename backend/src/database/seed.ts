import pool from '../config/database';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';

async function seedDatabase() {
  console.log('\U0001f331 Seeding database...');
  
  // Create tables first
  await createTables();
  
  // Seed tax rates (from your research)
  await seedTaxRates();
  
  // Seed test orders from CSV
  await seedOrders();
  
  console.log('\u2705 Database seeded successfully!');
  process.exit(0);
}

async function createTables() {
  // Your CREATE TABLE statements here
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (...);
    CREATE TABLE IF NOT EXISTS tax_breakdown (...);
  `);
}

async function seedTaxRates() {
  // Insert NY tax rates
  const rates = [
    { type: 'state', name: 'New York State', rate: 0.04 },
    { type: 'county', name: 'New York County', rate: 0.04, boundary: '...' },
    // ... add all your tax rates
  ];
  
  for (const rate of rates) {
    await pool.query(
      'INSERT INTO tax_rates (jurisdiction_type, name, rate) VALUES (?, ?, ?)',
      [rate.type, rate.name, rate.rate]
    );
  }
}

async function seedOrders() {
  // Read your CSV and insert orders
  const csvPath = path.join(__dirname, '../../../BetterMe Test-Input.csv');
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  
  // Parse and insert as you do in import
  // ... (similar to your import logic)
}

seedDatabase();