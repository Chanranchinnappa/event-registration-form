-- CREATE DATABASE event_registration;

-- Connect to database
\c event_registration;

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    session_date VARCHAR(50) DEFAULT 'January 23 to 25, 2026',
    session_time VARCHAR(50) DEFAULT '11AM',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_email ON registrations(email);
CREATE INDEX idx_registered_at ON registrations(registered_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_registrations_updated_at 
    BEFORE UPDATE ON registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO registrations (full_name, email, ip_address) VALUES
('Sharmila Sharma', 'sharmila@example.com', '192.168.1.1'),
('John Doe', 'john@example.com', '192.168.1.2'),
('Jane Smith', 'jane@example.com', '192.168.1.3')
ON CONFLICT (email) DO NOTHING;

-- Grant permissions (if needed)
GRANT ALL PRIVILEGES ON TABLE registrations TO postgres;
GRANT USAGE, SELECT ON SEQUENCE registrations_id_seq TO postgres;

-- Display table structure
\d registrations;

-- Show sample data
SELECT * FROM registrations LIMIT 5;
