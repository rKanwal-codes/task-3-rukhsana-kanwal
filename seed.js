// ============================================
// seed.js - Populate sales.db with sample data
// Run once with: npm run seed
// ============================================

const db = require('./db');
const fs = require('fs');
const path = require('path');

const seedData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'orders_seed.json'), 'utf-8')
);

const insert = db.prepare(`
  INSERT OR IGNORE INTO orders
  (OrderID, Date, Region, Product, Quantity, UnitPrice, StoreLocation,
   CustomerType, Discount, Salesperson, TotalPrice, PaymentMethod,
   Promotion, Returned, CustomerName)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let count = 0;
for (const row of seedData) {
  insert.run(
    row.OrderID,
    row.Date,
    row.Region,
    row.Product,
    row.Quantity,
    row.UnitPrice,
    row.StoreLocation,
    row.CustomerType,
    row.Discount,
    row.Salesperson,
    row.TotalPrice,
    row.PaymentMethod,
    row.Promotion,
    row.Returned,
    row.CustomerName
  );
  count++;
}

console.log(`Seeded ${count} orders into sales.db`);
