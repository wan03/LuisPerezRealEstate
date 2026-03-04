-- Update the analytic trigger to use the dynamic agent_id from the chat_threads table
CREATE OR REPLACE FUNCTION trigger_update_analytics()
RETURNS trigger AS $$
DECLARE
    v_agent_id uuid;
BEGIN
    -- Determine agent_id by looking up chat_threads directly associated with the client
    SELECT agent_id INTO v_agent_id
    FROM chat_threads
    WHERE client_id = NEW.client_id AND agent_id IS NOT NULL
    LIMIT 1;

    IF v_agent_id IS NOT NULL THEN
        PERFORM update_agent_analytics(v_agent_id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
