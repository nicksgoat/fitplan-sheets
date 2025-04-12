
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { SendIcon } from 'lucide-react';
import { format } from 'date-fns';
import { safelyGetProfile } from '@/utils/profileUtils';

interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  created_at: string;
  is_pinned: boolean;
  profile?: {
    id: string;
    display_name?: string;
    avatar_url?: string;
  };
}

interface EventChatBoxProps {
  eventId?: string;
  channelId?: string;
}

const EventChatBox: React.FC<EventChatBoxProps> = ({ eventId, channelId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages when component mounts or channelId changes
  useEffect(() => {
    if (channelId) {
      loadMessages();

      // Subscribe to new messages
      const channel = supabase
        .channel(`channel-${channelId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'club_channel_messages',
            filter: `channel_id=eq.${channelId}`
          },
          (payload) => {
            if (payload.new) {
              fetchMessageWithProfile(payload.new.id);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [channelId]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessageWithProfile = async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from('club_channel_messages')
        .select('*, profile:user_id(*)')
        .eq('id', messageId)
        .single();

      if (error) throw error;
      if (data) {
        // Process message before adding it to state
        const processedMessage: Message = {
          id: data.id,
          channel_id: data.channel_id,
          user_id: data.user_id,
          content: data.content,
          created_at: data.created_at,
          is_pinned: data.is_pinned,
          profile: safelyGetProfile(data.profile, data.user_id)
        };
        setMessages(prev => [...prev, processedMessage]);
      }
    } catch (error) {
      console.error('Error fetching new message:', error);
    }
  };

  const loadMessages = async () => {
    if (!channelId) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('club_channel_messages')
        .select('*, profile:user_id(*)')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Process messages before setting state
      const processedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        channel_id: msg.channel_id,
        user_id: msg.user_id,
        content: msg.content,
        created_at: msg.created_at,
        is_pinned: msg.is_pinned,
        profile: safelyGetProfile(msg.profile, msg.user_id)
      }));
      
      setMessages(processedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load chat messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !channelId || !user) return;

    try {
      setSending(true);

      const { data, error } = await supabase
        .from('club_channel_messages')
        .insert({
          channel_id: channelId,
          user_id: user.id,
          content: messageText.trim(),
          is_pinned: false
        })
        .select()
        .single();

      if (error) throw error;
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatMessageTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };

  return (
    <div className="flex flex-col h-full bg-background border rounded-md">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-10 w-1/2 ml-auto" />
            <Skeleton className="h-10 w-2/3" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
            <p>No messages yet</p>
            <p className="text-sm">Be the first to send a message!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-2 ${
                message.user_id === user?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.user_id !== user?.id && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.profile?.avatar_url || ''} />
                  <AvatarFallback>
                    {(message.profile?.display_name?.[0] || 'U').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={`rounded-lg px-3 py-2 max-w-[80%] ${
                  message.user_id === user?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.user_id !== user?.id && (
                  <p className="text-xs font-semibold mb-1">
                    {message.profile?.display_name || 'Unknown User'}
                  </p>
                )}
                <p className="text-sm break-words">{message.content}</p>
                <p className="text-xs opacity-70 text-right mt-1">
                  {formatMessageTime(message.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form 
        onSubmit={handleSendMessage}
        className="border-t p-4 flex items-center gap-2"
      >
        <Input
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          disabled={sending || !user}
          className="flex-1"
        />
        <Button 
          type="submit" 
          size="icon"
          disabled={!messageText.trim() || sending || !user}
        >
          {sending ? (
            <span className="animate-spin">◌</span>
          ) : (
            <SendIcon className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
};

export default EventChatBox;
