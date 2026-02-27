const mysql = require('mysql2/promise');

async function test() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'wellness_user',
      password: 'wellness_pass',
      database: 'wellness_kits'
    });
    
    console.log('Connected to database');
    
    // Test simple query
    const [rows] = await connection.execute('SELECT * FROM orders');
    console.log('Orders found:', rows.length);
    
    // Test count query
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM orders');
    console.log('Total count:', countResult[0].total);
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
