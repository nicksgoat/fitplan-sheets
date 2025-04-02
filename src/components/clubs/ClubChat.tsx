
import React, { useState, useRef, useEffect } from 'react';
import { useClub } from '@/contexts/ClubContext';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, MessageSquare, Pin, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface ClubChatProps {
  clubId: string;
}

const ClubChat: React.FC<ClubChatProps> = ({ clubId }) => {
  const { 
    messages, 
    loadingMessages, 
    sendNewMessage, 
    togglePinMessage,
    isUserClubAdmin
  } = useClub();
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAdmin = isUserClubAdmin(clubId);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !user) return;
    
    try {
      setIsSubmitting(true);
      await sendNewMessage(messageText);
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePinMessage = async (messageId: string, isPinned: boolean) => {
    try {
      await togglePinMessage(messageId, isPinned);
    } catch (error) {
      console.error('Error pinning/unpinning message:', error);
    }
  };
  
  const formatMessageTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch (e) {
      return "Unknown time";
    }
  };
  
  const pinnedMessages = messages.filter(message => message.isPinned);
  const regularMessages = messages.filter(message => !message.isPinned);
  
  return (
    <div className="flex flex-col h-[600px]">
      {/* Pinned Messages */}
      {pinnedMessages.length > 0 && (
        <div className="bg-dark-300 p-3 border-b border-dark-400">
          <h3 className="text-sm font-medium flex items-center mb-2">
            <Pin className="h-4 w-4 mr-1" />
            Pinned Messages
          </h3>
          <div className="space-y-2">
            {pinnedMessages.map(message => (
              <div 
                key={message.id} 
                className="bg-dark-200 p-2 rounded text-sm flex items-start"
              >
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src={message.profile?.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {message.profile?.display_name?.charAt(0) || 
                     message.profile?.username?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-xs">
                      {message.profile?.display_name || message.profile?.username || 'Unknown User'}
                    </span>
                    {isAdmin && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-5 w-5 p-0"
                        onClick={() => handlePinMessage(message.id, false)}
                      >
                        <Pin className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <p>{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingMessages ? (
          [...Array(5)].map((_, index) => (
            <div key={index} className="flex items-start space-x-2">
              <Skeleton className="h-8 w-8 rounded-full bg-dark-300" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32 bg-dark-300" />
                <Skeleton className="h-10 w-60 bg-dark-300 rounded-lg" />
              </div>
            </div>
          ))
        ) : regularMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageSquare className="h-12 w-12 mb-4" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {regularMessages.map(message => (
              <div 
                key={message.id} 
                className={`flex items-start ${message.userId === user?.id ? 'justify-end' : ''}`}
              >
                {message.userId !== user?.id && (
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={message.profile?.avatar_url} />
                    <AvatarFallback>
                      {message.profile?.display_name?.charAt(0) || 
                       message.profile?.username?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[70%] ${message.userId === user?.id ? 'order-1' : 'order-2'}`}>
                  {message.userId !== user?.id && (
                    <div className="flex items-center mb-1">
                      <span className="text-sm font-medium">
                        {message.profile?.display_name || message.profile?.username || 'Unknown User'}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        {formatMessageTime(message.createdAt)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex group">
                    <div 
                      className={`rounded-lg p-3 ${
                        message.userId === user?.id 
                          ? 'bg-fitbloom-purple/90 text-white' 
                          : 'bg-dark-300'
                      }`}
                    >
                      <p>{message.content}</p>
                    </div>
                    
                    {isAdmin && message.userId !== user?.id && !message.isPinned && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 ml-1"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-dark-200 border-dark-300">
                            <DropdownMenuItem onClick={() => handlePinMessage(message.id, true)}>
                              <Pin className="h-4 w-4 mr-2" />
                              Pin Message
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                  
                  {message.userId === user?.id && (
                    <div className="flex justify-end">
                      <span className="text-xs text-gray-400 mt-1">
                        {formatMessageTime(message.createdAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Message Input */}
      <form 
        onSubmit={handleSendMessage}
        className="p-4 border-t border-dark-300 bg-dark-300"
      >
        <div className="flex items-center">
          <Input
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="bg-dark-200 border-dark-400"
          />
          <Button 
            type="submit" 
            className="ml-2 bg-fitbloom-purple hover:bg-fitbloom-purple/90"
            disabled={isSubmitting || !messageText.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ClubChat;
