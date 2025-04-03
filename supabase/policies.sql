-- Enable Row Level Security
ALTER TABLE funnels ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting funnels
CREATE POLICY "Users can create their own funnels"
ON funnels FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policy for selecting funnels
CREATE POLICY "Users can view their own funnels"
ON funnels FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Create policy for updating funnels
CREATE POLICY "Users can update their own funnels"
ON funnels FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policy for deleting funnels
CREATE POLICY "Users can delete their own funnels"
ON funnels FOR DELETE 
TO authenticated
USING (auth.uid() = user_id); 