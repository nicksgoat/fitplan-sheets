import React, { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, MessageSquare } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ClubMessage } from '@/types/club';
import { useAuth } from '@/hooks/useAuth';

interface ClubChatProps {
  channel: {
    id: string;
    name: string;
    description?: string;
    type: string;
  };
  messages: ClubMessage[];
  onBack: () => void;
  onSendMessage: (message: string) => void;
  sendingMessage: boolean;
}

const ClubChat = ({ 
  channel, 
  messages, 
  onBack, 
  onSendMessage,
  sendingMessage 
}: ClubChatProps) => {
  const { user } = useAuth();
  const [message, setMessage] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !sendingMessage) {
      onSendMessage(message);
      setMessage('');
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Format time
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 border-b">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h3 className="font-semibold text-lg">{channel.name}</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageSquare className="h-16 w-16 mb-2" />
            <p>No messages yet</p>
            <p className="text-sm">Be the first to send a message!</p>
          </div>
        ) : (
          messages.map((msg) => (
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
            disabled={sendingMessage}
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!message.trim() || sendingMessage}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ClubChat;
