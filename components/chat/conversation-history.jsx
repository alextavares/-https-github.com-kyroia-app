"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
export default function ConversationHistory({ currentConversationId, onSelectConversation, onNewConversation }) {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");
    const loadConversations = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/conversations");
            if (response.ok) {
                const data = await response.json();
                // A API retorna um array diretamente, não um objeto com propriedade conversations
                const conversationsArray = Array.isArray(data) ? data : (data.conversations || []);
                setConversations(conversationsArray.map((conv) => (Object.assign(Object.assign({}, conv), { createdAt: new Date(conv.createdAt), updatedAt: new Date(conv.updatedAt) }))));
            }
        }
        catch (error) {
            console.error("Error loading conversations:", error);
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        loadConversations();
    }, [loadConversations]);
    const deleteConversation = async (conversationId) => {
        if (!confirm("Tem certeza que deseja deletar esta conversa?"))
            return;
        try {
            const response = await fetch(`/api/conversations/${conversationId}`, {
                method: "DELETE"
            });
            if (response.ok) {
                setConversations(prev => prev.filter(conv => conv.id !== conversationId));
                if (currentConversationId === conversationId) {
                    onNewConversation();
                }
            }
        }
        catch (error) {
            console.error("Error deleting conversation:", error);
        }
    };
    const startRenaming = (conv) => {
        setEditingId(conv.id);
        setEditingTitle(conv.title);
    };
    const cancelRenaming = () => {
        setEditingId(null);
        setEditingTitle("");
    };
    const saveRenaming = async (conversationId) => {
        if (!editingTitle.trim()) {
            cancelRenaming();
            return;
        }
        try {
            const response = await fetch(`/api/conversations/${conversationId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ title: editingTitle })
            });
            if (response.ok) {
                setConversations(prev => prev.map(conv => conv.id === conversationId
                    ? Object.assign(Object.assign({}, conv), { title: editingTitle }) : conv));
                cancelRenaming();
            }
        }
        catch (error) {
            console.error("Error renaming conversation:", error);
        }
    };
    const groupConversationsByDate = (conversations) => {
        const groups = {};
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        conversations.forEach(conv => {
            let key;
            const convDate = conv.createdAt;
            if (convDate.toDateString() === today.toDateString()) {
                key = "Hoje";
            }
            else if (convDate.toDateString() === yesterday.toDateString()) {
                key = "Ontem";
            }
            else if (convDate > lastWeek) {
                key = "Últimos 7 dias";
            }
            else {
                key = "Mais antigos";
            }
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(conv);
        });
        return groups;
    };
    const groupedConversations = groupConversationsByDate(conversations);
    return (<div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <Button onClick={onNewConversation} className="w-full" variant="outline">
          + Nova Conversa
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {loading ? (<div className="text-center text-muted-foreground">
              Carregando conversas...
            </div>) : conversations.length === 0 ? (<div className="text-center text-muted-foreground">
              Nenhuma conversa ainda
            </div>) : (Object.entries(groupedConversations).map(([dateGroup, convs]) => (<div key={dateGroup}>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  {dateGroup}
                </h3>
                <div className="space-y-1">
                  {convs.map(conv => (<div key={conv.id} className={`
                        p-3 rounded-lg cursor-pointer transition-colors group
                        ${currentConversationId === conv.id
                    ? 'bg-accent'
                    : 'hover:bg-accent/50'}
                      `} onClick={() => editingId !== conv.id && onSelectConversation(conv.id)}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 mr-2">
                          {editingId === conv.id ? (<Input value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            saveRenaming(conv.id);
                        }
                        else if (e.key === "Escape") {
                            cancelRenaming();
                        }
                    }} onClick={(e) => e.stopPropagation()} className="text-sm h-6 px-1" autoFocus/>) : (<p className="text-sm font-medium line-clamp-1" onDoubleClick={() => startRenaming(conv)}>
                              {conv.title}
                            </p>)}
                          <p className="text-xs text-muted-foreground mt-1">
                            {conv.modelUsed} • {format(conv.updatedAt, "HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {editingId === conv.id ? (<>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => {
                        e.stopPropagation();
                        saveRenaming(conv.id);
                    }}>
                                ✓
                              </Button>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => {
                        e.stopPropagation();
                        cancelRenaming();
                    }}>
                                ✕
                              </Button>
                            </>) : (<>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => {
                        e.stopPropagation();
                        startRenaming(conv);
                    }}>
                                ✏️
                              </Button>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                    }}>
                                🗑️
                              </Button>
                            </>)}
                        </div>
                      </div>
                    </div>))}
                </div>
              </div>)))}
        </div>
      </ScrollArea>
    </div>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udmVyc2F0aW9uLWhpc3RvcnkuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY29udmVyc2F0aW9uLWhpc3RvcnkudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQTtBQUVaLE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxNQUFNLE9BQU8sQ0FBQTtBQUN4RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFDL0MsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBQzdDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUN4RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBQ2pDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQTtBQWdCdEMsTUFBTSxDQUFDLE9BQU8sVUFBVSxtQkFBbUIsQ0FBQyxFQUMxQyxxQkFBcUIsRUFDckIsb0JBQW9CLEVBQ3BCLGlCQUFpQixFQUNRO0lBQ3pCLE1BQU0sQ0FBQyxhQUFhLEVBQUUsZ0JBQWdCLENBQUMsR0FBRyxRQUFRLENBQWlCLEVBQUUsQ0FBQyxDQUFBO0lBQ3RFLE1BQU0sQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQzdDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLEdBQUcsUUFBUSxDQUFnQixJQUFJLENBQUMsQ0FBQTtJQUMvRCxNQUFNLENBQUMsWUFBWSxFQUFFLGVBQWUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUVwRCxNQUFNLGlCQUFpQixHQUFHLFdBQVcsQ0FBQyxLQUFLLElBQUksRUFBRTtRQUMvQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDaEIsSUFBSSxDQUFDO1lBQ0gsTUFBTSxRQUFRLEdBQUcsTUFBTSxLQUFLLENBQUMsb0JBQW9C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