
import React, { useRef, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, MessageSquare } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ClubMessage } from '@/types/club';
import { useAuth } from '@/hooks/useAuth';
import { useClub } from '@/contexts/ClubContext';
import { cn } from '@/lib/utils';

interface ClubChatProps {
  channel?: {
    id: string;
    name: string;
    description?: string;
    type: string;
  };
  onBack?: () => void;
  clubId?: string;
}

const ClubChat = ({ channel, onBack, clubId }: ClubChatProps) => {
  const { user } = useAuth();
  const { messages, sendNewMessage, refreshMessages, loadingMessages } = useClub();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const renderMessageGroup = (messages: ClubMessage[], index: number) => {
    const message = messages[0];
    const isCurrentUser = message.user_id === user?.id;

    return (
      <div 
        key={index}
        className={cn(
          "flex flex-col mb-4",
          isCurrentUser ? "items-end" : "items-start"
        )}
      >
        {/* User info for non-current user */}
        {!isCurrentUser && message.profile && (
          <div className="flex items-center mb-1 ml-12">
            <span className="text-sm font-medium text-muted-foreground">
              {message.profile.display_name || message.profile.username || 'Unknown User'}
            </span>
          </div>
        )}
        
        <div className="flex items-end gap-2">
          {!isCurrentUser && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.profile?.avatar_url} />
              <AvatarFallback>
                {message.profile?.display_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          )}
          
          <div className={cn(
            "flex flex-col gap-1",
            isCurrentUser ? "items-end" : "items-start"
          )}>
            {messages.map((msg, i) => (
              <div 
                key={msg.id}
                className={cn(
                  "px-4 py-2 rounded-2xl max-w-[85%] break-words",
                  isCurrentUser 
                    ? "bg-primary text-primary-foreground rounded"
                    : "bg-muted",
                  i === 0 && "rounded-t-2xl",
                  i === messages.length - 1 && "rounded-b-2xl",
                  messages.length === 1 && "rounded-2xl"
                )}
              >
                <p className="text-sm">{msg.content}</p>
                <span className="text-[10px] opacity-70">
                  {formatTime(msg.created_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (!channel && !clubId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <MessageSquare className="h-16 w-16 mb-2" />
        <p>Select a channel to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {channel && (
        <div className="flex items-center p-4 border-b bg-card">
          {onBack && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h3 className="font-semibold text-lg">{channel.name}</h3>
            {channel.description && (
              <p className="text-sm text-muted-foreground">{channel.description}</p>
            )}
          </div>
        </div>
      )}

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
          // Group messages by user and render them together
          messages.reduce<ClubMessage[][]>((groups, message) => {
            const lastGroup = groups[groups.length - 1];
            
            if (lastGroup && 
                lastGroup[0].user_id === message.user_id &&
                new Date(message.created_at).getTime() - 
                new Date(lastGroup[lastGroup.length - 1].created_at).getTime() < 300000) {
              lastGroup.push(message);
            } else {
              groups.push([message]);
            }
            
            return groups;
          }, []).map((group, index) => renderMessageGroup(group, index))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="p-4 border-t bg-card flex gap-2 items-center"
      >
        <Input
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={sending || !user}
          className="flex-1 rounded-full"
        />
        <Button 
          type="submit" 
          size="icon"
          disabled={!message.trim() || sending || !user}
          className="rounded-full"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ClubChat;
