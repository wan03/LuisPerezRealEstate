-- Chat Architecture Migration

-- 1. Chat Rooms
CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    name TEXT, -- Optional, for group chats
    metadata JSONB DEFAULT '{}'::jsonb -- For context like transaction_id
);

-- 2. Chat Participants
CREATE TABLE chat_participants (
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- 'owner', 'member'
    last_read_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (room_id, user_id)
);

-- 3. Chat Messages
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id), -- Nullable for system messages?
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    is_read BOOLEAN DEFAULT false -- Simplistic read receipt
);

-- Indexes for performance
CREATE INDEX idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- RLS Policies

-- Enable RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat Rooms Policies
-- Users can view rooms they are participants in
CREATE POLICY "Users can view their rooms" ON chat_rooms
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_participants
            WHERE chat_participants.room_id = chat_rooms.id
            AND chat_participants.user_id = auth.uid()
        )
    );

-- Chat Participants Policies
-- Users can view participants in their rooms
CREATE POLICY "Users can view participants in their rooms" ON chat_participants
    FOR SELECT USING (
        room_id IN (
            SELECT room_id FROM chat_participants WHERE user_id = auth.uid()
        )
    );

-- Chat Messages Policies
-- Users can view messages in their rooms
CREATE POLICY "Users can view messages in their rooms" ON chat_messages
    FOR SELECT USING (
        room_id IN (
            SELECT room_id FROM chat_participants WHERE user_id = auth.uid()
        )
    );

-- Users can insert messages in their rooms
CREATE POLICY "Users can insert messages in their rooms" ON chat_messages
    FOR INSERT WITH CHECK (
        room_id IN (
            SELECT room_id FROM chat_participants WHERE user_id = auth.uid()
        )
    );
