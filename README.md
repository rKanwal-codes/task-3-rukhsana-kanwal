# Project 3 — Database Integration
DecodeLabs Full Stack Internship | Batch 2026

A backend API connected to a **real SQLite database** (file-based, no server install needed).
Builds on Project 2's API logic but now persists data permanently in `sales.db`
instead of memory, with a proper schema, constraints, and parameterized queries
(protects against SQL Injection — see schema.sql for design notes).

## Tech Used
- Node.js
- Express.js
- SQLite — using Node's **built-in** `node:sqlite` module (no extra native package, no C++ compiler needed, works on any Windows machine with zero setup hassle)

## Folder Contents
- `schema.sql` — database table design (Primary Key, NOT NULL, CHECK constraints)
- `db.js` — sets up the database connection and creates the table
- `seed.js` — fills the database with 200 sample sales orders (run once)
- `orders_seed.json` — the sample data used by seed.js
- `server.js` — the Express API with all CRUD routes
- `package.json` — dependencies

## How to Run (Step by Step)

### 1. Make sure Node.js is installed
```
node -v
npm -v
```
If not installed, get it from https://nodejs.org (LTS version)

### 2. Open the project folder in terminal
```
cd path/to/project3
```

### 3. Install dependencies
```
npm install
```
This installs only Express (a pure JavaScript package — fast, no compiler needed).
The SQLite database support comes built into Node.js itself, so there is
nothing extra to install or configure for the database.

> Note: you need Node.js version 22 or higher for this to work
> (check with `node -v`). If your version is older, download the latest
> LTS from https://nodejs.org and reinstall.

### 4. Seed the database (run once)
```
npm run seed
```
This creates `sales.db` and loads 200 sample orders into it.
You'll see: `Seeded 200 orders into sales.db`

### 5. Start the server
```
npm start
```
You should see:
```
Server is running at http://localhost:4000
Connected to database: sales.db
```

### 6. Test the API (use Postman / Thunder Client / browser)

**Health check**
```
GET http://localhost:4000/
```

**List all orders**
```
GET http://localhost:4000/api/orders
```

**Filter + paginate**
```
GET http://localhost:4000/api/orders?region=East&page=1&limit=10
```

**Get one order**
```
GET http://localhost:4000/api/orders/REG100000
```

**Create a new order (CREATE)**
```
POST http://localhost:4000/api/orders
Content-Type: application/json

{
  "Region": "West",
  "Product": "Monitor",
  "Quantity": 3,
  "UnitPrice": 150,
  "Salesperson": "Sara",
  "CustomerName": "Cust 9999"
}
```

**Update an order (UPDATE)**
```
PUT http://localhost:4000/api/orders/REG100000
Content-Type: application/json

{ "Quantity": 20 }
```

**Delete an order (DELETE)**
```
DELETE http://localhost:4000/api/orders/REG100000
```

## Database Schema (Pillar 1: The Blueprint)
See `schema.sql` for full detail. Summary:

| Column | Type | Constraint |
|---|---|---|
| OrderID | TEXT | PRIMARY KEY |
| Region | TEXT | NOT NULL, CHECK (valid region) |
| Product | TEXT | NOT NULL |
| Quantity | INTEGER | NOT NULL, CHECK (> 0) |
| UnitPrice | REAL | NOT NULL, CHECK (> 0) |
| Salesperson | TEXT | NOT NULL |
| TotalPrice | REAL | NOT NULL |
| ...other fields | TEXT/REAL | optional |

## Security Note
All queries use **parameterized queries** (`?` placeholders with `.run()`/`.get()`/`.all()`),
never raw string concatenation — this prevents SQL Injection attacks, exactly as
covered in the training material.

## Resetting the Database
To start fresh, delete `sales.db` and run `npm run seed` again.

## CRUD → HTTP → SQL Mapping
| Operation | HTTP Method | SQL Command |
|---|---|---|
| Create | POST | INSERT |
| Read | GET | SELECT |
| Update | PUT | UPDATE |
| Delete | DELETE | DELETE |
