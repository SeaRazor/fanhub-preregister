-- Create registrations table
CREATE TABLE registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE NULL,
    verification_token VARCHAR(255) UNIQUE,
    verification_expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_registrations_email ON registrations(email);
CREATE INDEX idx_registrations_created_at ON registrations(created_at);
CREATE INDEX idx_registrations_is_verified ON registrations(is_verified);

-- Enable Row Level Security (RLS)
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (optional - allows public read/write for this use case)
-- You can adjust these policies based on your security requirements
CREATE POLICY "Allow public read" ON registrations FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON registrations FOR UPDATE USING (true);

-- Optional: Create a function to automatically set verified_at when is_verified is set to true
CREATE OR REPLACE FUNCTION update_verified_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_verified = true AND OLD.is_verified = false THEN
        NEW.verified_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update verified_at
CREATE TRIGGER trigger_update_verified_at
    BEFORE UPDATE ON registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_verified_at();

-- Create stats table for tracking metrics
CREATE TABLE stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    total_registrations INTEGER DEFAULT 0,
    verified_registrations INTEGER DEFAULT 0,
    pending_registrations INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial stats row
INSERT INTO stats (total_registrations, verified_registrations, pending_registrations)
VALUES (0, 0, 0);

-- Function to update stats after registration insert
CREATE OR REPLACE FUNCTION update_stats_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE stats SET
        total_registrations = total_registrations + 1,
        pending_registrations = CASE 
            WHEN NEW.is_verified = false THEN pending_registrations + 1 
            ELSE pending_registrations 
        END,
        verified_registrations = CASE 
            WHEN NEW.is_verified = true THEN verified_registrations + 1 
            ELSE verified_registrations 
        END,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update stats after verification
CREATE OR REPLACE FUNCTION update_stats_on_verification()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_verified = true AND OLD.is_verified = false THEN
        UPDATE stats SET
            verified_registrations = verified_registrations + 1,
            pending_registrations = pending_registrations - 1,
            updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for stats updates
CREATE TRIGGER trigger_update_stats_on_insert
    AFTER INSERT ON registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_stats_on_insert();

CREATE TRIGGER trigger_update_stats_on_verification
    AFTER UPDATE OF is_verified ON registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_stats_on_verification();