-- Profiles table with bilingual and role info
CREATE TYPE user_role AS ENUM ('client', 'agent', 'loan_officer');

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role user_role DEFAULT 'client',
    is_bilingual BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listings table with CDD and Zoning info
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    price NUMERIC NOT NULL,
    cdd_fee NUMERIC DEFAULT 0,
    flood_zone TEXT,
    zoning_type TEXT, -- e.g., 'Residential', 'Vacant Land'
    video_url TEXT,
    school_data JSONB, -- { rating: 8, name: 'GreatSchool High' }
    is_vacant_land BOOLEAN DEFAULT false,
    has_septic BOOLEAN DEFAULT false,
    has_well BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Threads (Triad)
CREATE TABLE chat_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES profiles(id),
    agent_id UUID REFERENCES profiles(id),
    loan_officer_id UUID REFERENCES profiles(id),
    listing_id UUID REFERENCES listings(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages with Spanish translation support
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES chat_threads(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id),
    content TEXT NOT NULL,
    content_es TEXT, -- Spanish translation
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Milestones (Pizza Tracker)
CREATE TYPE milestone_status AS ENUM ('pending', 'active', 'completed');

CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES profiles(id),
    title TEXT NOT NULL,
    status milestone_status DEFAULT 'pending',
    "order" INTEGER NOT NULL, -- To maintain sequence
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES

-- Profiles: Users can view their own profile, agents/LOs can view profiles of clients they are working with.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

-- Listings: Publicly readable for now, or limited to authenticated.
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public listings read access" ON listings FOR SELECT TO authenticated USING (true);

-- Chat Threads: Only participants can see the thread.
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view threads" ON chat_threads FOR SELECT USING (
    auth.uid() = client_id OR auth.uid() = agent_id OR auth.uid() = loan_officer_id
);

-- Messages: Participants of the thread can see messages.
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view messages" ON messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM chat_threads 
        WHERE id = messages.thread_id 
        AND (client_id = auth.uid() OR agent_id = auth.uid() OR loan_officer_id = auth.uid())
    )
);

CREATE POLICY "Participants can insert messages" ON messages FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM chat_threads 
        WHERE id = messages.thread_id 
        AND (client_id = auth.uid() OR agent_id = auth.uid() OR loan_officer_id = auth.uid())
    )
);

-- Milestones: Client can view their own milestones, Agent/LO can view/update their clients' milestones.
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Client can view own milestones" ON milestones FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "Agent can view client milestones" ON milestones FOR ALL USING (
    EXISTS (
        SELECT 1 FROM chat_threads 
        WHERE client_id = milestones.client_id 
        AND agent_id = auth.uid()
    )
);
CREATE POLICY "LO can view client milestones" ON milestones FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM chat_threads 
        WHERE client_id = milestones.client_id 
        AND loan_officer_id = auth.uid()
    )
);
