
import React, { useRef, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, MessageSquare } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ClubMessage, ClubChannel } from '@/types/club';
import { useAuth } from '@/hooks/useAuth';
import { useClub } from '@/contexts/ClubContext';

interface ClubChatProps {
  channel?: {
    id: string;
    name: string;
    description?: string;
    type: string;
  };
  messages?: ClubMessage[];
  onBack?: () => void;
  onSendMessage?: (message: string) => void;
  sendingMessage?: boolean;
  clubId?: string; // Add clubId prop to support both usage patterns
}

const ClubChat = ({ 
  channel, 
  messages: propMessages, 
  onBack, 
  onSendMessage,
  sendingMessage: propSendingMessage,
  clubId 
}: ClubChatProps) => {
  const { user } = useAuth();
  const { messages: contextMessages, sendNewMessage, refreshMessages, loadingMessages } = useClub();
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [activeChannel, setActiveChannel] = useState<ClubChannel | null>(null);
  const { channels } = useClub();
  
  // Initialize with either prop messages or context messages
  const displayMessages = propMessages || contextMessages;
  const isLoading = loadingMessages && !propMessages;
  const isSending = propSendingMessage !== undefined ? propSendingMessage : sendingMessage;

  // If clubId is provided, use it to select a default channel
  useEffect(() => {
    if (clubId && channels.length > 0 && !channel) {
      const defaultChannel = channels.find(c => c.is_default) || channels[0];
      setActiveChannel(defaultChannel);
    }
  }, [clubId, channels, channel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isSending) {
      if (onSendMessage) {
        // Use the provided onSendMessage callback
        onSendMessage(message);
        setMessage('');
      } else if (activeChannel) {
        // Use context method
        try {
          setSendingMessage(true);
          await sendNewMessage({
            club_id: clubId,
            channel_id: activeChannel.id,
            content: message
          });
          setMessage('');
          refreshMessages();
        } catch (error) {
          console.error('Error sending message:', error);
        } finally {
          setSendingMessage(false);
        }
      }
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages]);

  // Format time
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };

  const currentChannel = channel || activeChannel;

  if (!currentChannel && !clubId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <MessageSquare className="h-16 w-16 mb-2" />
        <p>Select a channel</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {currentChannel && (
        <div className="flex items-center p-4 border-b">
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
          <h3 className="font-semibold text-lg">{currentChannel.name}</h3>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : displayMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageSquare className="h-16 w-16 mb-2" />
            <p>No messages yet</p>
            <p className="text-sm">Be the first to send a message!</p>
          </div>
        ) : (
          displayMessages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] ${
                  msg.user_id === user?.id 
                    ? 'bg-primary text-primary-foreground rounded-tl-lg rounded-tr-lg rounded-bl-lg' 
                    : 'bg-muted rounded-tr-lg rounded-tl-lg rounded-br-lg'
                } p-3`}
              >
                {msg.user_id !== user?.id && msg.profile && (
                  <div className="flex items-center mb-1">
                    <Avatar className="h-5 w-5 mr-2">
                      <AvatarImage src={msg.profile.avatar_url} />
                      <AvatarFallback>
                        {msg.profile.display_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium">
                      {msg.profile.display_name || 'Unknown User'}
                    </p>
                  </div>
                )}
                <p className="mb-1">{msg.content}</p>
                <p className="text-xs opacity-70 text-right">
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSending}
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!message.trim() || isSending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ClubChat;
