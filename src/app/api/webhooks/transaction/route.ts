import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize a Supabase admin client to bypass RLS for webhook processing
// Note: Requires SUPABASE_SERVICE_ROLE_KEY to be set in environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
    try {
        // Validate Webhook Secret if set (recommended for production)
        const secret = process.env.SUPABASE_WEBHOOK_SECRET;
        if (secret) {
            const authHeader = req.headers.get('authorization');
            const expectedAuth = `Bearer ${secret}`;

            // Use constant-time comparison to prevent timing attacks
            const a = Buffer.from(authHeader || '');
            const b = Buffer.from(expectedAuth);

            if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        const payload = await req.json();

        // Ensure this is an UPDATE event on transactions
        if (payload.type !== 'UPDATE' || payload.table !== 'transactions') {
            return NextResponse.json({ message: 'Ignored: not a transaction update' });
        }

        const oldRecord = payload.old_record;
        const newRecord = payload.record;

        // Check if status actually changed
        if (oldRecord.status === newRecord.status) {
            return NextResponse.json({ message: 'Ignored: status is unchanged' });
        }

        const newStatus = newRecord.status;

        // 1. Fetch the relevant email template
        const { data: template, error: templateError } = await supabaseAdmin
            .from('email_templates')
            .select('*')
            .eq('status_trigger', newStatus)
            .eq('is_active', true)
            .maybeSingle();

        if (templateError || !template) {
            console.log(`No active email template found for status: ${newStatus}`);
            return NextResponse.json({ message: 'No template found' });
        }

        // 2. Fetch the client profile
        const { data: clientProfile, error: clientError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', newRecord.client_id)
            .maybeSingle();

        if (clientError || !clientProfile) {
            console.error('Failed to fetch client profile', clientError);
            return NextResponse.json({ error: 'Client profile not found' }, { status: 400 });
        }

        // Additional info like property address might be in the record or linked listing
        const propertyAddress = newRecord.property_address || newRecord.address || 'your property';

        // 3. Compile the template
        let compiledSubject = template.subject
            .replace(/{{client_name}}/g, clientProfile.full_name || 'Client')
            .replace(/{{property_address}}/g, propertyAddress)
            .replace(/{{new_status}}/g, newStatus);

        let compiledBody = template.body_html
            .replace(/{{client_name}}/g, clientProfile.full_name || 'Client')
            .replace(/{{property_address}}/g, propertyAddress)
            .replace(/{{new_status}}/g, newStatus);

        // 4. Send email using Nodemailer
        // E.g., using Microsoft Office 365 or similar standard SMTP
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.office365.com',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true', // false for TLS (587)
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Normally, we'd also CC the agent. Let's find the agent from chat_threads
        const { data: chatThread } = await supabaseAdmin
            .from('chat_threads')
            .select('agent_id, loan_officer_id')
            .eq('client_id', newRecord.client_id)
            .limit(1)
            .maybeSingle();

        const ccEmails: string[] = [];

        if (chatThread) {
            if (chatThread.agent_id) {
                const { data: agentData } = await supabaseAdmin.auth.admin.getUserById(chatThread.agent_id);
                if (agentData?.user?.email) ccEmails.push(agentData.user.email);
            }
            if (chatThread.loan_officer_id) {
                const { data: loData } = await supabaseAdmin.auth.admin.getUserById(chatThread.loan_officer_id);
                if (loData?.user?.email) ccEmails.push(loData.user.email);
            }
        }

        // We also need the client's email, which is stored in auth.users
        const { data: clientAuthData, error: authError } = await supabaseAdmin.auth.admin.getUserById(newRecord.client_id);

        if (authError || !clientAuthData?.user?.email) {
            console.error('Failed to fetch client email', authError);
            return NextResponse.json({ error: 'Client email not found' }, { status: 400 });
        }

        const clientEmail = clientAuthData.user.email;

        // Send the mail
        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: clientEmail,
            cc: ccEmails.length > 0 ? ccEmails : undefined,
            subject: compiledSubject,
            html: compiledBody,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true, message: 'Email sent successfully' });
    } catch (error: any) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
