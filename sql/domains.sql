-- Create domains table
CREATE TABLE IF NOT EXISTS domains (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    funnel_id UUID REFERENCES funnels(id) NOT NULL,
    domain VARCHAR NOT NULL UNIQUE,
    status VARCHAR DEFAULT 'pending',
    verification_records JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_domains_user_id ON domains(user_id);
CREATE INDEX IF NOT EXISTS idx_domains_funnel_id ON domains(funnel_id);

-- Create RLS policies
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;

-- Policy for select (users can only see their own domains)
CREATE POLICY "Users can view their own domains"
    ON domains FOR SELECT
    USING (auth.uid() = user_id);

-- Policy for insert (users can only create domains for themselves)
CREATE POLICY "Users can create their own domains"
    ON domains FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy for update (users can only update their own domains)
CREATE POLICY "Users can update their own domains"
    ON domains FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy for delete (users can only delete their own domains)
CREATE POLICY "Users can delete their own domains"
    ON domains FOR DELETE
    USING (auth.uid() = user_id); 