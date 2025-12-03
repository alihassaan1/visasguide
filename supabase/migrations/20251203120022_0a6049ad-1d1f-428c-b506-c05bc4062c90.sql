-- Create developer agent conversations table
CREATE TABLE public.developer_agent_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create developer agent messages table
CREATE TABLE public.developer_agent_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.developer_agent_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create file change history for version control
CREATE TABLE public.file_change_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    file_path TEXT NOT NULL,
    original_content TEXT,
    new_content TEXT NOT NULL,
    change_description TEXT,
    applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    reverted_at TIMESTAMP WITH TIME ZONE,
    conversation_id UUID REFERENCES public.developer_agent_conversations(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.developer_agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developer_agent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_change_history ENABLE ROW LEVEL SECURITY;

-- Policies for conversations (admin only)
CREATE POLICY "Admins can manage conversations"
ON public.developer_agent_conversations
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Policies for messages (admin only)
CREATE POLICY "Admins can manage messages"
ON public.developer_agent_messages
FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.developer_agent_conversations c
    WHERE c.id = conversation_id AND has_role(auth.uid(), 'admin'::app_role)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.developer_agent_conversations c
    WHERE c.id = conversation_id AND has_role(auth.uid(), 'admin'::app_role)
));

-- Policies for file changes (admin only)
CREATE POLICY "Admins can manage file changes"
ON public.file_change_history
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes
CREATE INDEX idx_developer_messages_conversation ON public.developer_agent_messages(conversation_id);
CREATE INDEX idx_developer_messages_created ON public.developer_agent_messages(created_at);
CREATE INDEX idx_file_changes_path ON public.file_change_history(file_path);
CREATE INDEX idx_file_changes_applied ON public.file_change_history(applied_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_developer_conversations_updated_at
BEFORE UPDATE ON public.developer_agent_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();