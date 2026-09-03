-- Database Schema for Expense Voucher Management System (SQLite)

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('employee', 'director', 'accounts')),
    signature_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vouchers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voucher_number VARCHAR(100) UNIQUE NOT NULL,
    voucher_date DATE NOT NULL,
    expense_date DATE NOT NULL,
    department VARCHAR(100) NOT NULL,
    expense_title VARCHAR(255) NOT NULL,
    expense_category VARCHAR(100) NOT NULL,
    expense_description TEXT,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    employee_id INTEGER REFERENCES users(id),
    status VARCHAR(50) NOT NULL CHECK (status IN ('Draft', 'Submitted', 'Pending Approval', 'Approved', 'Rejected')),
    rejection_reason TEXT,
    approval_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
