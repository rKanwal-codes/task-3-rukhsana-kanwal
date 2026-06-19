// ============================================
// db.js - Database connection & schema setup
// Uses Node's BUILT-IN SQLite module (node:sqlite)
// No native package install / C++ compiler needed!
// ============================================

const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'sales.db');
const db = new DatabaseSync(DB_FILE);

// Run the schema (creates the table if it doesn't already exist)
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);

module.exports = db;
