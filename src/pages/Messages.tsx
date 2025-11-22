import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { ArrowLeft, Send, Home, Search, CalendarClock, MessageSquare, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface Conversation {
  id: string;
  booking_id: string;
  provider_id?: string;
  customer_id?: string;
  last_message?: string;
  updated_at: string;
  unread_count?: number;
  other_user_name?: string;
  other_user_avatar?: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_profile_id: string;
  content: string;
  created_at: string;
  sender?: {
    full_name: string;
    avatar_url?: string;
  };
}

const Messages = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      subscribeToMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      // Get user's profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_user_id', user?.id)
        .single();

      if (!profile) return;

      // Load conversations
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          messages(content, created_at),
          customer:customer_profiles!customer_id(profile_id(full_name, avatar_url)),
          provider:provider_profiles!provider_id(profile_id(full_name, avatar_url), business_name)
        `)
        .or(`customer_id.eq.${profile.id},provider_id.eq.${profile.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Process conversations to show the other user's info
      const processedConversations = data?.map((conv: any) => ({
        ...conv,
        other_user_name: conv.customer_id === profile.id 
          ? (conv.provider?.business_name || conv.provider?.profile_id?.full_name)
          : conv.customer?.profile_id?.full_name,
        other_user_avatar: conv.customer_id === profile.id
          ? conv.provider?.profile_id?.avatar_url
          : conv.customer?.profile_id?.avatar_url,
        last_message: conv.messages?.[0]?.content || 'No messages yet',
      })) || [];

      setConversations(processedConversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_profile_id(full_name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const subscribeToMessages = (conversationId: string) => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      // Get user's profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_user_id', user.id)
        .single();

      if (!profile) return;

      const { error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: selectedConversation,
            sender_profile_id: profile.id,
            content: newMessage.trim(),
          },
        ]);

      if (error) throw error;

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // If viewing a specific conversation
  if (selectedConversation) {
    const conversation = conversations.find(c => c.id === selectedConversation);
    
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-card border-b border-border">
          <div className="flex items-center gap-3 p-4">
            <button 
              onClick={() => setSelectedConversation(null)}
              className="p-2 -ml-2 hover:bg-muted rounded-full"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                {conversation?.other_user_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="font-semibold">{conversation?.other_user_name}</h1>
                <p className="text-xs text-muted-foreground">Active now</p>
              </div>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => {
            const isOwn = message.sender_profile_id === user?.id;
            return (
              <div
                key={message.id}
                className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0 flex items-center justify-center text-xs font-semibold">
                  {message.sender?.full_name?.charAt(0).toUpperCase()}
                </div>
                <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      isOwn
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-muted rounded-tl-sm'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {formatTime(message.created_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="sticky bottom-0 bg-card border-t border-border p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              className="flex-1 h-12 rounded-full"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Conversations List
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">Messages</h1>
        </div>
      </header>

      {/* Conversations */}
      <div className="divide-y divide-border">
        {loading ? (
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <MessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
            <p className="text-muted-foreground mb-6">
              When you book a service, you'll be able to chat with your provider here.
            </p>
            <Button asChild>
              <Link to="/book">Book a Service</Link>
            </Button>
          </div>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation.id)}
              className="w-full flex items-center gap-3 p-4 hover:bg-muted transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">
                {conversation.other_user_name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold truncate">{conversation.other_user_name}</h3>
                  <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                    {formatTime(conversation.updated_at)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.last_message}
                </p>
              </div>
              {conversation.unread_count && conversation.unread_count > 0 && (
                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold flex-shrink-0">
                  {conversation.unread_count}
                </div>
              )}
            </button>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex items-center justify-around h-16">
          <Link to="/home" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground">
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </Link>
          <Link
            to="/services"
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <Search className="w-6 h-6" />
            <span className="text-xs">Search</span>
          </Link>
          <Link
            to="/book"
            className="flex flex-col items-center gap-1 -mt-6"
          >
            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <CalendarClock className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-xs font-medium text-primary">Book</span>
          </Link>
          <Link
            to="/messages"
            className="flex flex-col items-center gap-1 text-primary"
          >
            <MessageSquare className="w-6 h-6" />
            <span className="text-xs font-medium">Messages</span>
          </Link>
          <Link
            to="/profile"
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Messages;