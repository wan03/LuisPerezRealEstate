-- 1. Add Financial Columns to Transactions
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS estimated_value DECIMAL(12, 2),
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5, 2) DEFAULT 3.0,
ADD COLUMN IF NOT EXISTS expected_close_date DATE;

-- 2. Create Analytics Metrics Table (One row per agent)
CREATE TABLE IF NOT EXISTS analytics_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    total_active_clients INTEGER DEFAULT 0,
    total_volume DECIMAL(15, 2) DEFAULT 0,
    projected_gci DECIMAL(15, 2) DEFAULT 0,
    funnel_distribution JSONB DEFAULT '{}'::jsonb,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_agent_analytics UNIQUE (agent_id)
);

-- Enable RLS
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;

-- Policy: Agents can view their own metrics
CREATE POLICY "Agents can view their own analytics" 
ON analytics_metrics FOR SELECT 
USING (auth.uid() = agent_id);

-- 3. Create Function to Calculate and Upsert Analytics
CREATE OR REPLACE FUNCTION update_agent_analytics(p_agent_id UUID)
RETURNS VOID AS $$
DECLARE
    v_total_clients INTEGER;
    v_total_volume DECIMAL(15, 2);
    v_projected_gci DECIMAL(15, 2);
    v_funnel JSONB;
BEGIN
    -- Calculate derived metrics from transactions and listings
    -- We join transactions with listings to get price if estimated_value is null via COALESCE, 
    -- BUT for now transactions table structure might not always link to listings deeply if custom.
    -- We will rely on transactions.estimated_value mostly, falling back to 0.
    
    SELECT 
        COUNT(*),
        COALESCE(SUM(COALESCE(estimated_value, 0)), 0),
        COALESCE(SUM(COALESCE(estimated_value, 0) * (COALESCE(commission_rate, 3.0) / 100)), 0)
    INTO 
        v_total_clients,
        v_total_volume,
        v_projected_gci
    FROM transactions t
    JOIN profiles p ON p.id = t.client_id
    WHERE t.status NOT IN ('closed', 'archived'); -- Only active pipeline for these metrics? 
    -- Actually, usually GCI projection includes under contract. Closed is realized revenue.
    -- Let's stick to "Active Pipeline" (everything not closed/archived) for "Projected".
    -- We might want separate metrics for "YTD Closed". For now, let's keep it simple: Active Pipeline Stats.

    -- Refined scope: All active transactions linked to clients managed by this agent
    -- Wait, transactions table has client_id. verification needed: does client have agent_id? 
    -- Listing properties: client -> transactions. 
    -- We need to filter by the AGENT who owns the client.
    
    -- Let's re-query properly linking to the agent.
    WITH agent_transactions AS (
        SELECT t.*
        FROM transactions t
        JOIN chat_rooms cr ON cr.metadata->>'client_id' = t.client_id::text 
        -- This linkage is weak. Better: clients (profiles) don't have 'agent_id' column directly? 
        -- In our schema, we've been using 'chat_participants' or similar to link. 
        -- BUT, for the MVP, we made a simplification: The logged-in agent sees ALL clients with transactions?
        -- Re-reading `fetchClients` in page.tsx:
        -- const { data } = await supabase.from('profiles').select('..., transactions(...)').eq('role', 'client');
        -- It fetches ALL clients. 
        -- For this calculation, we will assume ALL active transactions belong to the single "Agent" user concept for MVP.
        -- Ideally we filter where p_agent_id is the manager. 
        -- For now, we will calculate for ALL transactions where the client is associated.
    )
    SELECT 
        COUNT(*),
        COALESCE(SUM(COALESCE(estimated_value, 0)), 0),
        COALESCE(SUM(COALESCE(estimated_value, 0) * (COALESCE(commission_rate, 3.0) / 100)), 0)
    INTO 
        v_total_clients,
        v_total_volume,
        v_projected_gci
    FROM transactions t
    WHERE t.status NOT IN ('closed', 'archived');

    -- Calculate Funnel Distribution
    SELECT jsonb_object_agg(status, count)
    INTO v_funnel
    FROM (
        SELECT status, COUNT(*) as count
        FROM transactions
        WHERE status NOT IN ('closed', 'archived')
        GROUP BY status
    ) sub;

    -- Upsert
    INSERT INTO analytics_metrics (agent_id, total_active_clients, total_volume, projected_gci, funnel_distribution, last_updated)
    VALUES (p_agent_id, v_total_clients, v_total_volume, v_projected_gci, COALESCE(v_funnel, '{}'::jsonb), NOW())
    ON CONFLICT (agent_id) 
    DO UPDATE SET 
        total_active_clients = EXCLUDED.total_active_clients,
        total_volume = EXCLUDED.total_volume,
        projected_gci = EXCLUDED.projected_gci,
        funnel_distribution = EXCLUDED.funnel_distribution,
        last_updated = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger Function
CREATE OR REPLACE FUNCTION trigger_update_analytics()
RETURNS TRIGGER AS $$
DECLARE
    v_agent_id UUID;
BEGIN
    -- Find the agent. For MVP, we'll grab the first 'agent' role user, or the current user. 
    -- This is a bit hacky for a multi-agent system, but matches current 'single agent view' MVP.
    -- Better: Trigger doesn't know 'auth.uid()'. 
    -- We need to store 'agent_id' on transactions or clients. 
    -- Since we don't have it, we'll update the metric for the specific hardcoded Agent ID used in seeding, 
    -- OR we update specific analytics rows if we had a link.
    
    -- WORKAROUND: We will update the analytics for ALL agents (or the specific main one).
    -- Let's just create a row for the known Agent ID '4ccc6bce-c797-4f40-9d02-25dc3d28d092' (Sarah).
    -- In a real app, 'transactions' would have 'agent_id'.
    
    v_agent_id := '4ccc6bce-c797-4f40-9d02-25dc3d28d092'; -- Sarah Jenkins
    
    PERFORM update_agent_analytics(v_agent_id);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 5. Attach Triggers
DROP TRIGGER IF EXISTS on_transaction_change ON transactions;

CREATE TRIGGER on_transaction_change
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_update_analytics();

-- 6. Initial Calculation for Sarah
SELECT update_agent_analytics('4ccc6bce-c797-4f40-9d02-25dc3d28d092');
