import pool from '../config/database';

async function migrate() {
  console.log('Running database migrations...');
  
  try {
    // Create orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
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
    console.log('Orders table created');

    // Create tax_breakdown table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tax_breakdown (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        jurisdiction_type ENUM('state', 'county', 'city', 'special') NOT NULL,
        rate DECIMAL(5,4) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);
    console.log('Tax breakdown table created');

    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

migrate();