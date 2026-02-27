import * as csv from '@fast-csv/parse';
import { Request, Response } from 'express';
import { OrderModel } from '../models/order.model';
import { calculateTax } from '../services/tax.service';
import { OrdersFilters, OrdersResponse } from '../types/order';
import { parse } from 'csv-parse';
import { Readable } from 'stream';

export const OrdersController = {
  async create(req: Request, res: Response) {
    try {
      const { latitude, longitude, subtotal } = req.body;
      
      if (!latitude || !longitude || !subtotal) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      const sub = parseFloat(subtotal);
      
      if (isNaN(lat) || isNaN(lon) || isNaN(sub)) {
        return res.status(400).json({ error: 'Invalid number format' });
      }
      
      const { compositeRate, breakdown } = calculateTax(lat, lon);
      
      const taxAmount = sub * compositeRate;
      const totalAmount = sub + taxAmount;
      
      const order = await OrderModel.create({
        latitude: lat,
        longitude: lon,
        subtotal: sub,
        tax_amount: parseFloat(taxAmount.toFixed(2)),
        total_amount: parseFloat(totalAmount.toFixed(2)),
        composite_tax_rate: compositeRate,
        timestamp: new Date(),
        breakdown
      });
      
      res.status(201).json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  
  async list(req: Request, res: Response) {
    try {
      const filters: OrdersFilters = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        minSubtotal: req.query.minSubtotal ? parseFloat(req.query.minSubtotal as string) : undefined,
        maxSubtotal: req.query.maxSubtotal ? parseFloat(req.query.maxSubtotal as string) : undefined,
        search: req.query.search as string
      };
      
      const { data, total } = await OrderModel.findMany(filters);
      
      const response: OrdersResponse = {
        data,
        total,
        page: filters.page || 1,
        limit: filters.limit || 10,
        totalPages: Math.ceil(total / (filters.limit || 10))
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  
  async importCSV(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      const results: any[] = [];
      let errorCount = 0;
      
      // Parse CSV with fast-csv
      const stream = csv.parseString(req.file.buffer.toString(), {
        headers: true,
        ignoreEmpty: true,
        trim: true
      });
      
      for await (const row of stream) {
        try {
          const longitude = parseFloat(row.longitude || row.lon);
          const latitude = parseFloat(row.latitude || row.lat);
          const timestamp = row.timestamp ? new Date(row.timestamp) : new Date();
          const subtotal = parseFloat(row.subtotal);
          
          if (isNaN(latitude) || isNaN(longitude) || isNaN(subtotal)) {
            errorCount++;
            continue;
          }
          
          const { compositeRate, breakdown } = calculateTax(latitude, longitude);
          const taxAmount = subtotal * compositeRate;
          const totalAmount = subtotal + taxAmount;
          
          const order = await OrderModel.create({
            latitude,
            longitude,
            subtotal,
            tax_amount: parseFloat(taxAmount.toFixed(2)),
            total_amount: parseFloat(totalAmount.toFixed(2)),
            composite_tax_rate: compositeRate,
            timestamp,
            breakdown
          });
          
          results.push(order);
        } catch (err) {
          console.error('Error processing row:', err);
          errorCount++;
        }
      }
      
      res.json({
        message: 'Import completed',
        count: results.length,
        errors: errorCount,
        orders: results
      });
    } catch (error) {
      console.error('Error importing CSV:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  
  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
      }
      
      const order = await OrderModel.findById(id);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      res.json(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};