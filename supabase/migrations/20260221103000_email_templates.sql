-- Create the email templates table
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status_trigger TEXT NOT NULL UNIQUE, -- e.g., 'under_contract', 'inspection', 'closed'
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for email templates" ON email_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admins can modify templates" ON email_templates FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role IN ('agent', 'loan_officer') -- Assuming agent/LO have admin rights
    )
);

-- Webhook to call Edge Function or API Route on Transaction Status Change.
-- We will implement the webhook manually via Supabase dashboard or SQL, but using Next.js API Route for the handler.

-- Insert default realistic templates
INSERT INTO email_templates (name, status_trigger, subject, body_html) VALUES
(
    'Offer Accepted',
    'offer_accepted',
    'Congratulations! Your offer was accepted for {{property_address}}',
    '<div style="font-family: sans-serif; color: #333;"><h2>Congratulations {{client_name}}!</h2><p>Great news! Your offer for <strong>{{property_address}}</strong> has been accepted.</p><p>We are very excited to move forward. The next step is the inspection period.</p><p>We will be in touch shortly with the next steps.</p><br><p>Best regards,<br>Your Real Estate Team</p></div>'
),
(
    'Under Contract',
    'under_contract',
    'Update: You are officially Under Contract for {{property_address}}',
    '<div style="font-family: sans-serif; color: #333;"><h2>Hello {{client_name}},</h2><p>You are now officially under contract for <strong>{{property_address}}</strong>.</p><p>Please review your dashboard to check for any new documents that require your signature or review.</p><p>Next up: The appraisal and continued loan processing.</p><br><p>Best regards,<br>Your Real Estate Team</p></div>'
),
(
    'Inspection Period',
    'inspection',
    'Action Required: Home Inspection for {{property_address}}',
    '<div style="font-family: sans-serif; color: #333;"><h2>Hello {{client_name}},</h2><p>We have entered the inspection period for <strong>{{property_address}}</strong>.</p><p>It is crucial that we schedule a licensed home inspector right away. We will coordinate dates with you shortly.</p><br><p>Best regards,<br>Your Real Estate Team</p></div>'
),
(
    'Cleared to Close',
    'cleared_to_close',
    'Great News! Cleared to Close on {{property_address}}',
    '<div style="font-family: sans-serif; color: #333;"><h2>Amazing News {{client_name}}!</h2><p>We are officially <strong>Cleared to Close</strong> on <strong>{{property_address}}</strong>!</p><p>The title company will be reaching out to schedule your final signing appointment. Please ensure you have your funds arranged as discussed.</p><br><p>We are almost there!</p><p>Your Real Estate Team</p></div>'
),
(
    'Closed',
    'closed',
    'Congratulations! {{property_address}} is officially CLOSE!',
    '<div style="font-family: sans-serif; color: #333;"><h2>Congratulations {{client_name}}!</h2><p>We did it! <strong>{{property_address}}</strong> is officially closed.</p><p>It has been a pleasure working with you. Enjoy your new home!</p><br><p>Best regards,<br>Your Real Estate Team</p></div>'
);
