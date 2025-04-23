
import React, { useRef, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useAuth } from '@/hooks/useAuth';
import { useClub } from '@/contexts/ClubContext';
import { cn } from '@/lib/utils';

interface ClubChatProps {
  clubId: string;
  channel?: {
    id: string;
    name: string;
    description?: string;
    type: string;
  };
}

const ClubChat: React.FC<ClubChatProps> = ({ clubId, channel }) => {
  const { user } = useAuth();
  const { messages, sendNewMessage, refreshMessages, loadingMessages } = useClub();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (channel?.id) {
      refreshMessages();
    }
  }, [channel?.id, refreshMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !sending && channel) {
      try {
        setSending(true);
        await sendNewMessage({
          club_id: clubId,
          channel_id: channel.id,
          content: message
        });
        setMessage('');
        refreshMessages();
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setSending(false);
      }
    }
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };

  if (!channel) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <MessageSquare className="h-16 w-16 mb-2" />
        <p>Select a channel to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex items-center p-4 border-b">
        <div>
          <h3 className="font-semibold text-lg">{channel.name}</h3>
          {channel.description && (
            <p className="text-sm text-muted-foreground">{channel.description}</p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingMessages ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageSquare className="h-16 w-16 mb-2" />
            <p>No messages yet</p>
            <p className="text-sm">Be the first to send a message!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex items-start gap-2",
                msg.user_id === user?.id ? "justify-end" : "justify-start"
              )}
            >
              {msg.user_id !== user?.id && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={msg.profile?.avatar_url || ''} />
                  <AvatarFallback>
                    {(msg.profile?.display_name?.[0] || 'U').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={cn(
                  "rounded-lg px-3 py-2 max-w-[80%]",
                  msg.user_id === user?.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {msg.user_id !== user?.id && msg.profile && (
                  <p className="text-xs font-semibold mb-1">
                    {msg.profile.display_name || 'Unknown User'}
                  </p>
                )}
                <p className="text-sm break-words">{msg.content}</p>
                <p className="text-xs opacity-70 text-right mt-1">
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form 
        onSubmit={handleSubmit}
        className="border-t p-4 flex items-center gap-2"
      >
        <Input
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={sending || !user}
          className="flex-1"
        />
        <Button 
          type="submit" 
          size="icon"
          disabled={!message.trim() || sending || !user}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ClubChat;
