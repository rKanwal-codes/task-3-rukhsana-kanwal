-- ============================================
-- DecodeLabs Project 3: Database Schema
-- Database: SQLite (sales.db)
-- ============================================

-- Orders table: stores every sales transaction record.
-- OrderID is the Primary Key -> uniquely identifies each row (no duplicates).
CREATE TABLE IF NOT EXISTS orders (
  OrderID        TEXT PRIMARY KEY,
  Date           TEXT NOT NULL,
  Region         TEXT NOT NULL CHECK (Region IN ('East','West','North','South','Central')),
  Product        TEXT NOT NULL,
  Quantity       INTEGER NOT NULL CHECK (Quantity > 0),
  UnitPrice      REAL NOT NULL CHECK (UnitPrice > 0),
  StoreLocation  TEXT,
  CustomerType   TEXT,
  Discount       REAL DEFAULT 0,
  Salesperson    TEXT NOT NULL,
  TotalPrice     REAL NOT NULL,
  PaymentMethod  TEXT,
  Promotion      TEXT,
  Returned       INTEGER DEFAULT 0,
  CustomerName   TEXT
);

-- Notes on design choices (Pillar 1: The Blueprint):
-- 1. PRIMARY KEY (OrderID)   -> guarantees every order is unique.
-- 2. NOT NULL constraints    -> critical fields can never be empty.
-- 3. CHECK constraints       -> enforces valid data at the database level
--                              (Region must be a real region, Quantity/UnitPrice must be positive).
-- 4. This is a single-table design for Project 3's scope. In a larger system,
--    Salesperson and Region could be split into their own tables linked
--    via Foreign Keys (One-to-Many relationship), as shown in the training PDF.
