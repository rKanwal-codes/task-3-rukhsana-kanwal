// ============================================
// DecodeLabs Internship - Project 3
// Database Integration (Express + Node's built-in SQLite)
// ============================================

const express = require('express');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// ---- Helper: generate a new unique Order ID ----
function generateOrderId() {
  const row = db.prepare(`
    SELECT OrderID FROM orders ORDER BY OrderID DESC LIMIT 1
  `).get();

  if (!row) return 'REG100000';

  const num = parseInt(row.OrderID.replace('REG', ''), 10);
  return 'REG' + (num + 1);
}

// ---- Helper: validate incoming order data ----
function validateOrder(body) {
  const errors = [];
  const requiredFields = ['Region', 'Product', 'Quantity', 'UnitPrice', 'Salesperson'];

  requiredFields.forEach(field => {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      errors.push(`Field "${field}" is required.`);
    }
  });

  if (body.Quantity !== undefined && (typeof body.Quantity !== 'number' || body.Quantity <= 0)) {
    errors.push('"Quantity" must be a positive number.');
  }

  if (body.UnitPrice !== undefined && (typeof body.UnitPrice !== 'number' || body.UnitPrice <= 0)) {
    errors.push('"UnitPrice" must be a positive number.');
  }

  const validRegions = ['East', 'West', 'North', 'South', 'Central'];
  if (body.Region !== undefined && !validRegions.includes(body.Region)) {
    errors.push(`"Region" must be one of: ${validRegions.join(', ')}`);
  }

  return errors;
}

// ============================================
// ROUTES
// ============================================

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'DecodeLabs Project 3 - Database-backed Sales Orders API is running.',
    database: 'SQLite (sales.db) via Node built-in node:sqlite',
    endpoints: {
      'GET /api/orders': 'List all orders (supports ?region=, ?product=, ?page=, ?limit=)',
      'GET /api/orders/:id': 'Get a single order by OrderID',
      'POST /api/orders': 'Create a new order (CREATE)',
      'PUT /api/orders/:id': 'Update an existing order (UPDATE)',
      'DELETE /api/orders/:id': 'Delete an order (DELETE)'
    }
  });
});

// ---- READ: list all orders (with filters & pagination) ----
app.get('/api/orders', (req, res) => {
  const { region, product, page = 1, limit = 20 } = req.query;

  let query = 'SELECT * FROM orders WHERE 1=1';
  const params = [];

  if (region) {
    query += ' AND Region = ?';
    params.push(region);
  }
  if (product) {
    query += ' AND Product = ?';
    params.push(product);
  }

  // Get total count for pagination info
  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
  const { total } = db.prepare(countQuery).get(...params);

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const offset = (pageNum - 1) * limitNum;

  query += ' LIMIT ? OFFSET ?';
  params.push(limitNum, offset);

  const rows = db.prepare(query).all(...params);

  res.status(200).json({
    total,
    page: pageNum,
    limit: limitNum,
    data: rows
  });
});

// ---- READ: get a single order ----
app.get('/api/orders/:id', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE OrderID = ?').get(req.params.id);

  if (!order) {
    return res.status(404).json({ error: `Order with ID "${req.params.id}" not found.` });
  }

  res.status(200).json(order);
});

// ---- CREATE: insert a new order ----
app.post('/api/orders', (req, res) => {
  const errors = validateOrder(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed.', details: errors });
  }

  const newOrder = {
    OrderID: generateOrderId(),
    Date: req.body.Date || new Date().toISOString().split('T')[0],
    Region: req.body.Region,
    Product: req.body.Product,
    Quantity: req.body.Quantity,
    UnitPrice: req.body.UnitPrice,
    StoreLocation: req.body.StoreLocation || 'N/A',
    CustomerType: req.body.CustomerType || 'Retail',
    Discount: req.body.Discount || 0,
    Salesperson: req.body.Salesperson,
    TotalPrice: req.body.Quantity * req.body.UnitPrice * (1 - (req.body.Discount || 0)),
    PaymentMethod: req.body.PaymentMethod || 'Cash',
    Promotion: req.body.Promotion || null,
    Returned: 0,
    CustomerName: req.body.CustomerName || 'Guest'
  };

  try {
    db.prepare(`
      INSERT INTO orders
      (OrderID, Date, Region, Product, Quantity, UnitPrice, StoreLocation,
       CustomerType, Discount, Salesperson, TotalPrice, PaymentMethod,
       Promotion, Returned, CustomerName)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newOrder.OrderID, newOrder.Date, newOrder.Region, newOrder.Product,
      newOrder.Quantity, newOrder.UnitPrice, newOrder.StoreLocation,
      newOrder.CustomerType, newOrder.Discount, newOrder.Salesperson,
      newOrder.TotalPrice, newOrder.PaymentMethod, newOrder.Promotion,
      newOrder.Returned, newOrder.CustomerName
    );

    res.status(201).json({ message: 'Order created successfully.', data: newOrder });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order.', details: err.message });
  }
});

// ---- UPDATE: modify an existing order ----
app.put('/api/orders/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM orders WHERE OrderID = ?').get(req.params.id);

  if (!existing) {
    return res.status(404).json({ error: `Order with ID "${req.params.id}" not found.` });
  }

  const updated = { ...existing, ...req.body, OrderID: existing.OrderID };

  try {
    db.prepare(`
      UPDATE orders SET
        Date = ?, Region = ?, Product = ?, Quantity = ?,
        UnitPrice = ?, StoreLocation = ?, CustomerType = ?,
        Discount = ?, Salesperson = ?, TotalPrice = ?,
        PaymentMethod = ?, Promotion = ?, Returned = ?,
        CustomerName = ?
      WHERE OrderID = ?
    `).run(
      updated.Date, updated.Region, updated.Product, updated.Quantity,
      updated.UnitPrice, updated.StoreLocation, updated.CustomerType,
      updated.Discount, updated.Salesperson, updated.TotalPrice,
      updated.PaymentMethod, updated.Promotion, updated.Returned,
      updated.CustomerName, updated.OrderID
    );

    const result = db.prepare('SELECT * FROM orders WHERE OrderID = ?').get(req.params.id);
    res.status(200).json({ message: 'Order updated successfully.', data: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order.', details: err.message });
  }
});

// ---- DELETE: remove an order ----
app.delete('/api/orders/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM orders WHERE OrderID = ?').get(req.params.id);

  if (!existing) {
    return res.status(404).json({ error: `Order with ID "${req.params.id}" not found.` });
  }

  db.prepare('DELETE FROM orders WHERE OrderID = ?').run(req.params.id);

  res.status(200).json({ message: 'Order deleted successfully.', data: existing });
});

// ============================================
// Error handlers
// ============================================
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error.' });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Connected to database: sales.db`);
});
