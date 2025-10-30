'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MessageSquare, ArrowLeft, Send, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Conversation, Message } from '@/types';
import Image from 'next/image';

export default function MessagesPage() {
  // Ref pentru auto-scroll la ultimul mesaj
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch('/api/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh navbar when conversations are loaded (only once)
  useEffect(() => {
    if (!loading && conversations.length >= 0) {
      // Trigger navbar refresh by dispatching a custom event
      window.dispatchEvent(new CustomEvent('messagesViewed'));
    }
  }, [loading]); // Removed conversations.length to prevent excessive triggers

  // Messages are now included in conversation data, no need for separate fetch

  const refreshChat = useCallback(async (conversationId: string) => {
    try {
      const res = await fetch(`/api/messages?conversationId=${conversationId}`);
      const messages = await res.json();
      setCurrentMessages(messages);

      // Marchează ca citit
      await fetch(`/api/conversations/${conversationId}/read`, { method: 'POST' });
    } catch (error) {
      console.error('Refresh chat failed:', error);
    }
  }, []);

  // Handle new messages from Service Worker
  useEffect(() => {
    const handleNewMessage = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { conversationId } = customEvent.detail;

      console.log('📨 New message received for conversation:', conversationId);

      // Refresh conversations list for counters
      fetchConversations();

      // If we're in the chat for this conversation, refresh messages
      if (selectedConversation?._id === conversationId) {
        refreshChat(conversationId);
      }
    };

    window.addEventListener('newMessage', handleNewMessage);
    return () => window.removeEventListener('newMessage', handleNewMessage);
  }, [selectedConversation?._id]); // Simplified dependencies

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }

    fetchConversations();
  }, [session, status, router]); // Removed fetchConversations dependency

  // Refresh conversations when window regains focus (optional, minimal polling)
  useEffect(() => {
    const handleFocus = () => {
      if (session?.user?.id) {
        fetchConversations();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [session?.user?.id]); // Removed fetchConversations dependency

  // Mark conversation as read when messages are loaded (not just selected)
  useEffect(() => {
    if (selectedConversation && currentMessages.length > 0) {
      console.log('👀 Messages visible, marking conversation as read:', selectedConversation._id);
      fetch('/api/conversations/' + selectedConversation._id + '/read', {
        method: 'POST',
      }).then(() => {
        // Update local state to reflect read status
        setConversations(prev =>
          prev.map(conv =>
            conv._id === selectedConversation._id
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        );
        // Trigger navbar update
        window.dispatchEvent(new CustomEvent('messagesViewed'));
      }).catch(error => {
        console.error('Error marking conversation as read:', error);
      });
    }
  }, [selectedConversation?._id, currentMessages.length]); // Only when messages are actually loaded

  // Open chat modal and always fetch fresh messages
  useEffect(() => {
    if (selectedConversation) {
      console.log('💬 Opening chat for conversation:', selectedConversation._id);

      // Always fetch fresh messages when opening chat
      fetch(`/api/messages?conversationId=${selectedConversation._id}`)
        .then(res => res.json())
        .then(messages => {
          console.log('📨 Fresh messages loaded:', messages.length);
          setCurrentMessages(messages);
        })
        .catch(error => {
          console.error('Error loading messages:', error);
          setCurrentMessages([]);
        });

      setShowChatModal(true);
    }
  }, [selectedConversation?._id]); // Only depend on conversation ID

  // Auto-scroll la ultimul mesaj DOAR la deschiderea modalului
  useEffect(() => {
    if (showChatModal) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [showChatModal]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [currentMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversation._id,
          content: newMessage.trim(),
        }),
      });

      if (response.ok) {
        const message = await response.json();
        setNewMessage('');

        toast({
          title: "Mesaj trimis",
          description: "Mesajul tău a fost trimis cu succes!",
        });

        // Update conversation with new message
        setConversations(prev =>
          prev.map(conv =>
            conv._id === selectedConversation._id
              ? {
                  ...conv,
                  messages: [...(conv.messages || []), message],
                  lastMessage: message,
                  updatedAt: new Date(),
                  messageCount: (conv.messageCount || 0) + 1
                }
              : conv
          )
        );

        // Update currentMessages for instant display
        setCurrentMessages(prev => [...prev, message]);
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Eroare",
          description: errorData.message || "Eroare la trimiterea mesajului",
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Eroare la trimiterea mesajului",
      });
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!conversationToDelete) return;

    try {
      const response = await fetch(`/api/conversations/${conversationToDelete._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setConversations(prev => prev.filter(c => c._id !== conversationToDelete._id));
        if (selectedConversation?._id === conversationToDelete._id) {
          setSelectedConversation(null);
          setCurrentMessages([]);
          setShowChatModal(false);
        }
        toast({
          title: "Succes",
          description: "Conversația a fost ștearsă",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Eroare",
          description: "Eroare la ștergerea conversației",
        });
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Eroare la ștergerea conversației",
      });
    } finally {
      setShowDeleteDialog(false);
      setConversationToDelete(null);
    }
  };

  const handleCloseChatModal = () => {
    setShowChatModal(false);
    setSelectedConversation(null);
    setCurrentMessages([]);
    setNewMessage('');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Se încarcă mesajele...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Înapoi
              </Button>
              <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Mesaje ({conversations.length})
              </h1>
            </div>
          </div>
        </div>

      <div className="container mx-auto px-4 py-6">
        {/* Inbox View - Always show cards */}
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-0">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 p-12 text-center">
                  <MessageSquare className="w-24 h-24 text-muted-foreground mb-6" />
                  <h3 className="text-2xl font-semibold text-foreground mb-3">Niciun mesaj</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Nu ai primit încă niciun mesaj. Când cineva îți scrie din paginile proprietăților tale,
                    mesajele vor apărea aici.
                  </p>
                  <Button onClick={() => router.push('/profile')} variant="outline">
                    Vezi proprietățile tale
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation._id}
                      className="p-6 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-start gap-4">
                        <Image
                          src={conversation.propertyImage || "/placeholder-image.jpg"}
                          alt={conversation.propertyTitle}
                          width={80}
                          height={80}
                          className="w-20 h-20 rounded-lg object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-foreground text-lg truncate">
                              {conversation.propertyTitle}
                            </h4>
                            <div className="flex items-center gap-2 ml-4">
                              {conversation.unreadCount > 0 && (
                                <span className="bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full font-medium">
                                  {conversation.unreadCount} nou
                                </span>
                              )}
                              <span className="text-sm text-muted-foreground whitespace-nowrap">
                                {new Date(conversation.updatedAt).toLocaleDateString('ro-RO', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                          <p className={`mb-2 ${conversation.lastMessage ? 'text-muted-foreground' : 'text-destructive font-medium'}`}>
                            <span className="font-medium text-foreground">
                              {conversation.lastMessage?.senderId === session.user.id ? 'Tu: ' : ''}
                            </span>
                            {conversation.lastMessage?.content || 'Mesaj nou'}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{conversation.messageCount || 1} mesaje</span>
                            <span>•</span>
                            <span>Mesajele se șterg automat după 30 de zile</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat Modal */}
      <Dialog open={showChatModal} onOpenChange={handleCloseChatModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedConversation && (
                <>
                  <Image
                    src={selectedConversation.propertyImage || "/placeholder-image.jpg"}
                    alt={selectedConversation.propertyTitle}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{selectedConversation.propertyTitle}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedConversation.participants.length} participanți
                    </p>
                  </div>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col h-96">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messagesEndRef}>
              {(currentMessages.length === 0) ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Niciun mesaj</h3>
                  <p className="text-muted-foreground">
                    Aceasta este o conversație nouă. Scrie primul mesaj pentru a începe conversația.
                  </p>
                </div>
              ) : (
                <>
                  {currentMessages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${message.senderId === session.user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === session.user.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === session.user.id
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        }`}>
                          {new Date(message.createdAt).toLocaleTimeString('ro-RO', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={scrollRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="relative">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Scrie un mesaj..."
                  className="resize-none pr-12"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.trim()}
                  size="sm"
                  className="absolute right-3 top-4 h-9 w-9 p-0"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {/* Eliminat mesajul "Se trimite mesajul..." */}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>

      {/* Delete Conversation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Ștergere conversație
            </DialogTitle>
            <DialogDescription className="text-base">
              Sunteți sigur că doriți să ştergeți conversația despre &quot;{conversationToDelete?.propertyTitle}&quot;?
              Această acțiune nu poate fi anulată și va şterge toate mesajele.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="w-full sm:w-auto"
            >
              Anulează
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConversation}
              className="w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Șterge conversația
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}