
import React, { useState, useRef, useEffect } from 'react';
import { useClub } from '@/contexts/ClubContext';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Pin, MoreVertical } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ClubChatProps {
  clubId: string;
}

const ClubChat: React.FC<ClubChatProps> = ({ clubId }) => {
  const { 
    messages, 
    loadingMessages, 
    sendNewMessage, 
    togglePinMessage,
    isUserClubAdmin,
    isUserClubMember,
    refreshMessages
  } = useClub();
  
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAdmin = isUserClubAdmin(clubId);
  const isMember = isUserClubMember(clubId);
  
  // Sort messages by creation time (oldest first)
  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
  // Group messages by day
  const messagesByDay = sortedMessages.reduce((groups, message) => {
    const date = new Date(message.created_at).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, typeof messages>);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !user) {
      toast.error("Message cannot be empty");
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.log("Sending message:", messageText);
      
      // Direct insert using the insert method
      const { data, error } = await supabase
        .from('club_messages')
        .insert({
          club_id: clubId,
          user_id: user.id,
          content: messageText,
          is_pinned: false
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }
      
      console.log("Message sent successfully:", data);
      setMessageText('');
      
      // Refresh messages to show the new one
      await refreshMessages();
      
      toast.success("Message sent successfully");
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
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
  
  const formatMessageDate = (dateString: string) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return format(messageDate, 'MMMM d, yyyy');
    }
  };
  
  const pinnedMessages = messages.filter(message => message.is_pinned);
  
  if (!isMember) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <div>
          <h3 className="text-xl font-medium mb-2">Join this club to chat</h3>
          <p className="text-gray-400 mb-4">
            You need to be a member to view and participate in conversations.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Pinned Messages */}
      {pinnedMessages.length > 0 && (
        <div className="bg-dark-400 p-3 border-b border-dark-400">
          <h3 className="text-sm font-medium flex items-center mb-2">
            <Pin className="h-4 w-4 mr-1" />
            Pinned Messages
          </h3>
          <div className="space-y-2">
            {pinnedMessages.map(message => (
              <div 
                key={message.id} 
                className="bg-dark-300 p-2 rounded text-sm flex items-start"
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
      <ScrollArea className="flex-1 px-4">
        <div className="pt-4 pb-6 space-y-6">
          {loadingMessages ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-fitbloom-purple" />
              <p className="ml-2 text-gray-400">Loading messages...</p>
            </div>
          ) : Object.keys(messagesByDay).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <p className="mb-2">No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          ) : (
            Object.entries(messagesByDay).map(([date, dayMessages]) => (
              <div key={date} className="space-y-4">
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-dark-400"></div>
                  <span className="mx-4 flex-shrink text-xs text-gray-400 px-2">
                    {formatMessageDate(dayMessages[0].created_at)}
                  </span>
                  <div className="flex-grow border-t border-dark-400"></div>
                </div>
                
                {dayMessages.map((message, index) => {
                  // Check if this message is from the same user as the previous one
                  const isPreviousFromSameUser = index > 0 && 
                    dayMessages[index - 1].user_id === message.user_id;
                  
                  // Only show the avatar and username for the first message in a sequence
                  const showHeader = !isPreviousFromSameUser;
                  
                  return (
                    <div 
                      key={message.id} 
                      className="group flex items-start hover:bg-dark-300/30 px-2 -mx-2 py-0.5 rounded"
                    >
                      {showHeader ? (
                        <Avatar className="h-10 w-10 mr-3 mt-0.5">
                          <AvatarImage src={message.profile?.avatar_url} />
                          <AvatarFallback>
                            {message.profile?.display_name?.charAt(0) || 
                             message.profile?.username?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-10 mr-3"></div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        {showHeader && (
                          <div className="flex items-baseline mb-1">
                            <span className="font-medium mr-2">
                              {message.profile?.display_name || message.profile?.username || 'Unknown User'}
                            </span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-xs text-gray-400">
                                    {formatMessageTime(message.created_at)}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {format(new Date(message.created_at), 'PPpp')}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        )}
                        
                        <div className="flex group">
                          <p className="text-sm break-words">{message.content}</p>
                          
                          {isAdmin && !message.is_pinned && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                  >
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-dark-300 border-dark-400">
                                  <DropdownMenuItem onClick={() => handlePinMessage(message.id, true)}>
                                    <Pin className="h-4 w-4 mr-2" />
                                    Pin Message
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Message Input */}
      <form 
        onSubmit={handleSendMessage}
        className="p-4 border-t border-dark-400 bg-dark-300"
      >
        <div className="flex items-center">
          <Input
            placeholder={`Message #general`}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="bg-dark-400 border-dark-500 focus-visible:ring-fitbloom-purple"
            disabled={isSubmitting}
          />
          <Button 
            type="submit" 
            className="ml-2 bg-fitbloom-purple hover:bg-fitbloom-purple/90"
            disabled={isSubmitting || !messageText.trim()}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ClubChat;
