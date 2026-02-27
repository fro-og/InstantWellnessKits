import pool from '../config/database';
import { Order, TaxBreakdown, OrdersFilters } from '../types/order';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

interface OrderRow extends RowDataPacket {
  id: number;
  latitude: number;
  longitude: number;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  composite_tax_rate: number;
  timestamp: Date;
}

interface TaxBreakdownRow extends RowDataPacket {
  jurisdiction_type: string;
  rate: number;
}

interface CountResult extends RowDataPacket {
  total: number;
}

export const OrderModel = {
  async create(orderData: {
    latitude: number;
    longitude: number;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    composite_tax_rate: number;
    timestamp: Date;
    breakdown: TaxBreakdown;
  }): Promise<Order> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Insert order
      const [orderResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO orders 
         (latitude, longitude, subtotal, tax_amount, total_amount, composite_tax_rate, timestamp) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderData.latitude,
          orderData.longitude,
          orderData.subtotal,
          orderData.tax_amount,
          orderData.total_amount,
          orderData.composite_tax_rate,
          orderData.timestamp
        ]
      );
      
      const orderId = orderResult.insertId;
      
      // Insert tax breakdown
      const breakdownEntries = [
        { type: 'state', rate: orderData.breakdown.state_rate },
        { type: 'county', rate: orderData.breakdown.county_rate },
        { type: 'city', rate: orderData.breakdown.city_rate },
        { type: 'special', rate: orderData.breakdown.special_rates }
      ].filter(entry => entry.rate > 0);
      
      for (const entry of breakdownEntries) {
        await connection.execute(
          `INSERT INTO tax_breakdown (order_id, jurisdiction_type, rate) VALUES (?, ?, ?)`,
          [orderId, entry.type, entry.rate]
        );
      }
      
      await connection.commit();
      
      return {
        id: orderId,
        ...orderData,
        timestamp: orderData.timestamp.toISOString(),
        breakdown: orderData.breakdown
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
  
  async findMany(filters: OrdersFilters): Promise<{ data: Order[]; total: number }> {
    const { page = 1, limit = 10, startDate, endDate, minSubtotal, maxSubtotal, search } = filters;
    const offset = (page - 1) * limit;
    
    console.log('Filters:', { page, limit, offset, startDate, endDate, minSubtotal, maxSubtotal, search });
    
    // Build WHERE clause and parameters
    let whereConditions: string[] = [];
    const queryParams: any[] = [];
    
    if (startDate) {
      whereConditions.push('DATE(timestamp) >= ?');
      queryParams.push(startDate);
    }
    if (endDate) {
      whereConditions.push('DATE(timestamp) <= ?');
      queryParams.push(endDate);
    }
    if (minSubtotal !== undefined && !isNaN(minSubtotal)) {
      whereConditions.push('subtotal >= ?');
      queryParams.push(minSubtotal);
    }
    if (maxSubtotal !== undefined && !isNaN(maxSubtotal)) {
      whereConditions.push('subtotal <= ?');
      queryParams.push(maxSubtotal);
    }
    if (search) {
      whereConditions.push('id = ?');
      queryParams.push(parseInt(search) || 0);
    }
    
    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM orders ${whereClause}`;
    console.log('Count query:', countQuery);
    console.log('Count params:', queryParams);
    
    const [countResult] = await pool.query<CountResult[]>(countQuery, queryParams);
    const total = countResult[0].total;
    
    // Get paginated orders
    const orderParams = [...queryParams, limit, offset];
    const orderQuery = `SELECT * FROM orders ${whereClause} ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
    console.log('Order query:', orderQuery);
    console.log('Order params:', orderParams);
    
    const [orders] = await pool.query<OrderRow[]>(orderQuery, orderParams);
    console.log('Orders found:', orders.length);
    
    // Get breakdowns for each order
    const ordersWithBreakdown: Order[] = await Promise.all(
      orders.map(async (order) => {
        const [breakdownRows] = await pool.query<TaxBreakdownRow[]>(
          `SELECT jurisdiction_type, rate FROM tax_breakdown WHERE order_id = ?`,
          [order.id]
        );
        
        const breakdown: TaxBreakdown = {
          state_rate: 0,
          county_rate: 0,
          city_rate: 0,
          special_rates: 0
        };
        
        breakdownRows.forEach(row => {
          switch (row.jurisdiction_type) {
            case 'state': breakdown.state_rate = row.rate; break;
            case 'county': breakdown.county_rate = row.rate; break;
            case 'city': breakdown.city_rate = row.rate; break;
            case 'special': breakdown.special_rates = row.rate; break;
          }
        });

        return {
          id: order.id,
          latitude: parseFloat(order.latitude as unknown as string), 
          longitude: parseFloat(order.longitude as unknown as string),
          subtotal: parseFloat(order.subtotal as unknown as string),
          tax_amount: parseFloat(order.tax_amount as unknown as string),
          total_amount: parseFloat(order.total_amount as unknown as string),
          composite_tax_rate: parseFloat(order.composite_tax_rate as unknown as string),
          timestamp: new Date(order.timestamp).toISOString(),
          breakdown
        };
      })
    );
    
    return { data: ordersWithBreakdown, total };
  },
  
  async findById(id: number): Promise<Order | null> {
    const [orders] = await pool.execute<OrderRow[]>(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );
    
    if (orders.length === 0) return null;
    
    const order = orders[0];
    
    const [breakdownRows] = await pool.execute<TaxBreakdownRow[]>(
      'SELECT jurisdiction_type, rate FROM tax_breakdown WHERE order_id = ?',
      [id]
    );
    
    const breakdown: TaxBreakdown = {
      state_rate: 0,
      county_rate: 0,
      city_rate: 0,
      special_rates: 0
    };
    
    breakdownRows.forEach(row => {
      switch (row.jurisdiction_type) {
        case 'state': breakdown.state_rate = row.rate; break;
        case 'county': breakdown.county_rate = row.rate; break;
        case 'city': breakdown.city_rate = row.rate; break;
        case 'special': breakdown.special_rates = row.rate; break;
      }
    });
    
    return {
      id: order.id,
      latitude: order.latitude,
      longitude: order.longitude,
      subtotal: order.subtotal,
      tax_amount: order.tax_amount,
      total_amount: order.total_amount,
      composite_tax_rate: order.composite_tax_rate,
      timestamp: order.timestamp.toISOString(),
      breakdown
    };
  }
};