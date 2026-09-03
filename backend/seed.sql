-- Seed data for Expense Voucher System

-- Note: Passwords below are just simple md5 hashes or plain strings for testing.
-- In a real application, you would use bcrypt hashes.
-- For this assignment, we will assume the backend just compares these or hashes them.
-- Let's use simple mock passwords that we can easily check.
-- We will just insert plain text 'password123' for simplicity since this is an assignment,
-- but the backend will check it directly for mock purposes (or you can update the backend to use bcrypt).

INSERT INTO users (name, email, password_hash, role) VALUES
('Alice Employee', 'employee@test.com', 'password123', 'employee'),
('Bob Director', 'director@test.com', 'password123', 'director'),
('Charlie Accounts', 'accounts@test.com', 'password123', 'accounts')
ON CONFLICT (email) DO NOTHING;
