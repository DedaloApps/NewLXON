// src/app/(dashboard)/content-hub/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { HeaderPremium } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/toaster";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Grid,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Clock,
  Edit,
  Trash2,
  Copy,
  Send,
  Loader2,
  Plus,
  Search,
  MoreVertical,
  Eye,
  CheckCircle2,
  Image as ImageIcon,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Sparkles,
  PlusCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";

interface Post {
  id: string;
  title: string;
  caption?: string;
  type: string;
  status: string;
  image?: string;
  mediaUrls: string[];
  date: string;
  time: string;
  platform: string;
  hashtags: string[];
  scheduledAt?: string;
}

type Platform = "instagram" | "facebook" | "linkedin" | "twitter";

export default function ContentHubPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const [view, setView] = useState<"posts" | "calendar">("posts");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "scheduled" | "draft" | "published"
  >("all");
  const [previewPlatform, setPreviewPlatform] = useState<Platform>("instagram");

  // Estados para criar post
  const [creating, setCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [postType, setPostType] = useState("educational");
  const [topic, setTopic] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");

  // Estados para editor inline
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editedCaption, setEditedCaption] = useState("");

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      console.log("📥 Carregando posts...");
      const response = await fetch("/api/posts/list");

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${data.posts?.length || 0} posts recebidos`);

        // Debug detalhado dos primeiros 3 posts
        if (data.posts && data.posts.length > 0) {
          data.posts.slice(0, 3).forEach((post: any, index: number) => {
            console.log(`🔍 Post ${index + 1}:`, {
              id: post.id,
              title: post.title,
              hasImage: !!post.image,
              imageUrl: post.image?.substring(0, 100) + "...",
            });
          });
        }

        setPosts(data.posts || []);
      } else {
        console.error("❌ Erro ao carregar posts:", response.status);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar posts:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!topic.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insere um tópico para o post",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);

    try {
      const response = await axios.post("/api/posts/create-with-visual-agent", {
        type: postType,
        topic: topic.trim(),
        customPrompt: customPrompt.trim() || undefined,
        businessContext: {
          niche: "Automaticamente detetado do onboarding",
        },
      });

      // ✅ SOLUÇÃO: Apenas recarregar todos os posts da BD
      await loadPosts(); // <-- Isto já traz o novo post

      setIsDialogOpen(false);

      // Limpar form
      setTopic("");
      setCustomPrompt("");
      setPostType("educational");

      toast({
        title: "Post criado com IA! 🎉",
        description: "Imagem profissional gerada e caption otimizada.",
      });
    } catch (error: any) {
      console.error("Erro ao criar post:", error);
      toast({
        title: "Erro ao criar post",
        description:
          error.response?.data?.error || "Tenta novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const startEditing = (post: Post) => {
    setEditingPost(post.id);
    setEditedCaption(post.caption || post.title || "");
    setSelectedPost(post);
  };

  const saveEdit = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: editedCaption }),
      });

      if (response.ok) {
        toast({
          title: "Caption atualizada! ✅",
          description: "As alterações foram guardadas com sucesso.",
        });

        setPosts(
          posts.map((p) =>
            p.id === postId ? { ...p, caption: editedCaption } : p
          )
        );

        setEditingPost(null);
      } else {
        throw new Error("Erro ao atualizar");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a caption.",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingPost(null);
    setEditedCaption("");
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Post eliminado! 🗑️",
          description: "O post foi removido com sucesso.",
        });

        // Remover post da lista
        setPosts(posts.filter((p) => p.id !== postId));

        // Se estava selecionado, remover seleção
        if (selectedPost?.id === postId) {
          setSelectedPost(null);
        }
      } else {
        const data = await response.json();
        throw new Error(data.error || "Erro ao eliminar");
      }
    } catch (error: any) {
      console.error("Erro ao eliminar post:", error);
      toast({
        title: "Erro ao eliminar",
        description: error.message || "Não foi possível eliminar o post.",
        variant: "destructive",
      });
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.caption?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || post.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    scheduled: posts.filter((p) => p.status === "SCHEDULED").length,
    drafts: posts.filter((p) => p.status === "DRAFT").length,
    published: posts.filter((p) => p.status === "PUBLISHED").length,
  };

  const handlePublish = (post: Post) => {
    toast({
      title: "A publicar...",
      description: `Post a ser publicado no ${post.platform}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderPremium
        pageTitle="Content Hub"
        userName={session?.user?.name || "User"}
        userEmail={session?.user?.email || undefined}
        userAvatar={session?.user?.image || undefined}
        notificationCount={stats.scheduled}
      />

      {/* Subheader */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Pesquisar posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
              >
                Todos ({posts.length})
              </Button>
              <Button
                variant={filterStatus === "scheduled" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("scheduled")}
              >
                Agendados ({stats.scheduled})
              </Button>
              <Button
                variant={filterStatus === "draft" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("draft")}
              >
                Rascunhos ({stats.drafts})
              </Button>
              <Button
                variant={filterStatus === "published" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("published")}
              >
                Publicados ({stats.published})
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={view === "calendar" ? "default" : "outline"}
                size="sm"
                onClick={() => setView(view === "posts" ? "calendar" : "posts")}
                className="gap-2"
              >
                {view === "posts" ? (
                  <>
                    <Calendar className="w-4 h-4" />
                    Calendário
                  </>
                ) : (
                  <>
                    <Grid className="w-4 h-4" />
                    Posts
                  </>
                )}
              </Button>

              {/* BOTÃO CRIAR POST COM MODAL */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Criar Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      Criar Novo Post com IA
                    </DialogTitle>
                    <DialogDescription>
                      A IA vai criar um post completo com imagem e texto
                      otimizado
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    {/* Tipo de Post */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Tipo de Post
                      </label>
                      <Select value={postType} onValueChange={setPostType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="educational">
                            📚 Educativo - Ensina algo valioso
                          </SelectItem>
                          <SelectItem value="viral">
                            🔥 Viral - Entretenimento/Relatable
                          </SelectItem>
                          <SelectItem value="sales">
                            💰 Vendas - Converte em clientes
                          </SelectItem>
                          <SelectItem value="engagement">
                            💬 Engagement - Gera conversa
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tópico */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Sobre o que queres criar?
                      </label>
                      <Input
                        placeholder="Ex: Como aumentar produtividade..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                      />
                    </div>

                    {/* Prompt Customizado (Opcional) */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Instruções adicionais (opcional)
                      </label>
                      <Textarea
                        placeholder="Ex: Foca em empreendedores, usa tom casual..."
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-900">
                      <p className="font-semibold mb-1">A IA vai criar:</p>
                      <ul className="space-y-1 ml-4">
                        <li>✓ Hook impactante</li>
                        <li>✓ Caption completa com storytelling</li>
                        <li>✓ Hashtags estratégicas</li>
                        <li>✓ Call-to-action otimizado</li>
                        <li>✓ Imagem gerada por IA</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleCreatePost}
                      disabled={creating || !topic.trim()}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {creating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />A
                          criar...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Criar Post
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : view === "calendar" ? (
        <CalendarView posts={filteredPosts} onSelectPost={setSelectedPost} />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Posts */}
            <div className="lg:col-span-2 space-y-4">
              {filteredPosts.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Instagram className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhum post encontrado
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Começa a criar o teu primeiro post agora
                    </p>
                    <Button
                      onClick={() => setIsDialogOpen(true)}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Criar Primeiro Post
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onSelect={setSelectedPost}
                    isSelected={selectedPost?.id === post.id}
                    onPublish={handlePublish}
                    onDelete={handleDeletePost} // ✅ Adicionar esta linha
                    editingPost={editingPost}
                    editedCaption={editedCaption}
                    setEditedCaption={setEditedCaption}
                    startEditing={startEditing}
                    saveEdit={saveEdit}
                    cancelEdit={cancelEdit}
                  />
                ))
              )}
            </div>

            {/* Preview Multi-Plataforma */}
            <div className="lg:sticky lg:top-24 h-fit">
              {selectedPost ? (
                <MultiPlatformPreview
                  post={selectedPost}
                  platform={previewPlatform}
                  onPlatformChange={setPreviewPlatform}
                  onClose={() => setSelectedPost(null)}
                />
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Eye className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">
                      Seleciona um post para ver a preview
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
}

// Post Card
function PostCard({
  post,
  onSelect,
  isSelected,
  onPublish,
  onDelete, // ✅ Adicionar esta linha
  editingPost,
  editedCaption,
  setEditedCaption,
  startEditing,
  saveEdit,
  cancelEdit,
}: any) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "PUBLISHED":
        return "bg-green-100 text-green-700 border-green-200";
      case "DRAFT":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? "ring-2 ring-blue-500 shadow-lg" : ""
      }`}
      onClick={() => onSelect(post)}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
            {post.image ? (
              <img
      src={post.image}
      alt={post.title}
      className="w-full h-full object-cover"
      onError={(e) => {
        console.error("❌ Erro ao carregar imagem:", {
          postId: post.id,
          imageUrl: post.image,
        });
        // Esconder imagem quebrada e mostrar placeholder
        e.currentTarget.style.display = "none";
        const parent = e.currentTarget.parentElement;
        if (parent) {
          parent.innerHTML = `
            <div class="w-full h-full flex items-center justify-center">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
          `;
        }
      }}
    />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
            )}
            {post.mediaUrls?.length > 1 && (
              <Badge className="absolute bottom-1 right-1 text-xs">
                +{post.mediaUrls.length - 1}
              </Badge>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-gray-900 line-clamp-1">
                {post.title}
              </h3>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPublish(post);
                  }}
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Publicar</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(post);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar Caption
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        alert("Duplicar post");
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          confirm(
                            "Tens a certeza que queres eliminar este post? Esta ação não pode ser revertida."
                          )
                        ) {
                          onDelete(post.id); // ✅ Chamar função de delete
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {editingPost === post.id ? (
              <div className="space-y-2 mb-3">
                <Textarea
                  value={editedCaption}
                  onChange={(e) => setEditedCaption(e.target.value)}
                  className="min-h-[100px] text-sm"
                  placeholder="Escreve a tua caption aqui..."
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      saveEdit(post.id);
                    }}
                    className="flex-1"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Guardar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelEdit();
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <p
                className="text-sm text-gray-600 line-clamp-2 mb-3 cursor-text hover:bg-gray-50 p-2 rounded transition-colors"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  startEditing(post);
                }}
                title="Duplo clique para editar"
              >
                {post.caption || post.title}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getStatusColor(post.status)}>
                {post.status === "SCHEDULED" && "📅 Agendado"}
                {post.status === "PUBLISHED" && "✅ Publicado"}
                {post.status === "DRAFT" && "📝 Rascunho"}
              </Badge>

              {post.date && post.time && (
                <Badge variant="outline" className="gap-1">
                  <Clock className="w-3 h-3" />
                  {post.date} • {post.time}
                </Badge>
              )}

              <Badge variant="outline" className="gap-1">
                <Instagram className="w-3 h-3" />
                Instagram
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 📅 CALENDAR VIEW
function CalendarView({
  posts,
  onSelectPost,
}: {
  posts: Post[];
  onSelectPost: (post: Post) => void;
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({ date: prevMonthDay, isCurrentMonth: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  };

  const getPostsForDay = (date: Date) => {
    return posts.filter((post) => {
      if (!post.scheduledAt && !post.date) return false;
      const postDate = post.scheduledAt
        ? new Date(post.scheduledAt)
        : new Date(post.date);
      return (
        postDate.getDate() === date.getDate() &&
        postDate.getMonth() === date.getMonth() &&
        postDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const days = getDaysInMonth();
  const monthName = currentDate.toLocaleDateString("pt-PT", {
    month: "long",
    year: "numeric",
  });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDayPosts = selectedDate ? getPostsForDay(selectedDate) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl capitalize">
                  {monthName}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Hoje
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousMonth}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={goToNextMonth}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-7 gap-2 mb-2">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-semibold text-gray-600 py-2"
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                  const dayPosts = getPostsForDay(day.date);
                  const isToday = day.date.getTime() === today.getTime();
                  const isSelected =
                    selectedDate &&
                    day.date.getTime() === selectedDate.getTime();
                  const isPast = day.date < today;

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(day.date)}
                      className={`
                        min-h-[80px] p-2 rounded-lg border-2 transition-all text-left
                        ${
                          !day.isCurrentMonth
                            ? "bg-gray-50 text-gray-400"
                            : "bg-white"
                        }
                        ${
                          isToday
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200"
                        }
                        ${isSelected ? "ring-2 ring-blue-500" : ""}
                        ${isPast && day.isCurrentMonth ? "opacity-60" : ""}
                        hover:border-blue-300 hover:shadow-md
                      `}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-sm font-semibold ${
                            isToday ? "text-blue-600" : ""
                          }`}
                        >
                          {day.date.getDate()}
                        </span>
                        {dayPosts.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="text-xs h-5 px-1"
                          >
                            {dayPosts.length}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1">
                        {dayPosts.slice(0, 2).map((post, idx) => (
                          <div
                            key={idx}
                            className={`text-xs p-1 rounded truncate ${
                              post.status === "SCHEDULED"
                                ? "bg-blue-100 text-blue-700"
                                : post.status === "PUBLISHED"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {post.time} •{" "}
                            {post.platform === "instagram" ? "📸" : "💙"}
                          </div>
                        ))}
                        {dayPosts.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayPosts.length - 2} mais
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-500" />
              <span>Hoje</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-100" />
              <span>Agendado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100" />
              <span>Publicado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-100" />
              <span>Rascunho</span>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 h-fit">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-lg">
                {selectedDate ? (
                  <>
                    Posts de {selectedDate.getDate()}/
                    {selectedDate.getMonth() + 1}
                  </>
                ) : (
                  "Seleciona um dia"
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {selectedDate ? (
                selectedDayPosts.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDayPosts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => onSelectPost(post)}
                        className="p-3 border rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          {post.image ? (
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-16 h-16 rounded object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant={
                                  post.status === "SCHEDULED"
                                    ? "default"
                                    : post.status === "PUBLISHED"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {post.status === "SCHEDULED" && "📅"}
                                {post.status === "PUBLISHED" && "✅"}
                                {post.status === "DRAFT" && "📝"}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {post.time}
                              </span>
                            </div>
                            <h4 className="font-semibold text-sm line-clamp-1">
                              {post.title}
                            </h4>
                            <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                              {post.caption}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500">
                      Nenhum post agendado para este dia
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => alert("Criar post para este dia")}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agendar Post
                    </Button>
                  </div>
                )
              ) : (
                <div className="py-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">
                    Clica num dia do calendário para ver os posts agendados
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Multi-Platform Preview
function MultiPlatformPreview({
  post,
  platform,
  onPlatformChange,
  onClose,
}: {
  post: Post;
  platform: Platform;
  onPlatformChange: (platform: Platform) => void;
  onClose: () => void;
}) {
  const platforms = [
    {
      id: "instagram" as Platform,
      icon: Instagram,
      name: "Instagram",
      color: "text-pink-600",
    },
    {
      id: "facebook" as Platform,
      icon: Facebook,
      name: "Facebook",
      color: "text-blue-600",
    },
    {
      id: "linkedin" as Platform,
      icon: Linkedin,
      name: "LinkedIn",
      color: "text-blue-700",
    },
    {
      id: "twitter" as Platform,
      icon: Twitter,
      name: "X",
      color: "text-gray-900",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Preview</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-4">
          {platforms.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => onPlatformChange(p.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                  platform === p.id
                    ? "bg-blue-50 ring-2 ring-blue-500"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    platform === p.id ? p.color : "text-gray-400"
                  }`}
                />
                <span className="text-xs font-medium">{p.name}</span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {platform === "instagram" && <InstagramPreview post={post} />}
        {platform === "facebook" && <FacebookPreview post={post} />}
        {platform === "linkedin" && <LinkedInPreview post={post} />}
        {platform === "twitter" && <TwitterPreview post={post} />}
      </CardContent>
    </Card>
  );
}

// Instagram Preview
function InstagramPreview({ post }: { post: Post }) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 p-3 border-b">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400" />
        <div className="flex-1">
          <div className="font-semibold text-sm">seu_perfil</div>
          <div className="text-xs text-gray-500">Lisboa, Portugal</div>
        </div>
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </div>
      <div className="aspect-square bg-gray-100">
        {post.image ? (
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Instagram className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <Heart className="w-6 h-6" />
            <MessageCircle className="w-6 h-6" />
            <Send className="w-6 h-6" />
          </div>
          <Bookmark className="w-6 h-6" />
        </div>
        <div className="text-sm font-semibold">1,234 gostos</div>
        <div className="text-sm">
          <span className="font-semibold">seu_perfil</span>{" "}
          {post.caption || post.title}
        </div>
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="text-sm text-blue-600">
            {post.hashtags.map((tag) => `${tag}`).join(" ")}
          </div>
        )}
        <div className="text-xs text-gray-500">
          {post.scheduledAt
            ? new Date(post.scheduledAt).toLocaleDateString("pt-PT")
            : "Agora"}
        </div>
      </div>
    </div>
  );
}

// Facebook Preview
function FacebookPreview({ post }: { post: Post }) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
      <div className="p-3 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500" />
          <div className="flex-1">
            <div className="font-semibold text-sm">Seu Nome</div>
            <div className="text-xs text-gray-500">
              {post.scheduledAt
                ? new Date(post.scheduledAt).toLocaleDateString("pt-PT")
                : "Agora"}{" "}
              • 🌍
            </div>
          </div>
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </div>
        <div className="mt-3 text-sm">{post.caption || post.title}</div>
      </div>
      {post.image && (
        <div className="aspect-video bg-gray-100">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-3 flex items-center justify-around border-t">
        <Button variant="ghost" size="sm" className="gap-2">
          <Heart className="w-4 h-4" /> Gosto
        </Button>
        <Button variant="ghost" size="sm" className="gap-2">
          <MessageCircle className="w-4 h-4" /> Comentar
        </Button>
        <Button variant="ghost" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" /> Partilhar
        </Button>
      </div>
    </div>
  );
}

// LinkedIn Preview
function LinkedInPreview({ post }: { post: Post }) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
      <div className="p-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-blue-700" />
          <div className="flex-1">
            <div className="font-semibold text-sm">Seu Nome</div>
            <div className="text-xs text-gray-500">Cargo • Empresa</div>
            <div className="text-xs text-gray-500">
              {post.scheduledAt
                ? new Date(post.scheduledAt).toLocaleDateString("pt-PT")
                : "Agora"}{" "}
              • 🌍
            </div>
          </div>
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </div>
        <div className="text-sm mb-3">{post.caption || post.title}</div>
      </div>
      {post.image && (
        <div className="aspect-video bg-gray-100">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-3 flex items-center justify-around border-t">
        <Button variant="ghost" size="sm" className="gap-2">
          <Heart className="w-4 h-4" /> Gosto
        </Button>
        <Button variant="ghost" size="sm" className="gap-2">
          <MessageCircle className="w-4 h-4" /> Comentar
        </Button>
        <Button variant="ghost" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" /> Partilhar
        </Button>
      </div>
    </div>
  );
}

// Twitter/X Preview
function TwitterPreview({ post }: { post: Post }) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
      <div className="p-3">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-900 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-1">
              <span className="font-bold text-sm">Seu Nome</span>
              <span className="text-gray-500 text-sm">@seuperfil</span>
              <span className="text-gray-500 text-sm">·</span>
              <span className="text-gray-500 text-sm">
                {post.scheduledAt
                  ? new Date(post.scheduledAt).toLocaleDateString("pt-PT")
                  : "agora"}
              </span>
            </div>
            <div className="text-sm mb-3">{post.caption || post.title}</div>
            {post.image && (
              <div className="rounded-xl overflow-hidden border mb-3">
                <img src={post.image} alt={post.title} className="w-full" />
              </div>
            )}
            <div className="flex items-center justify-around text-gray-500">
              <button className="flex items-center gap-2 hover:text-sky-500">
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs">23</span>
              </button>
              <button className="flex items-center gap-2 hover:text-green-500">
                <Share2 className="w-4 h-4" />
                <span className="text-xs">12</span>
              </button>
              <button className="flex items-center gap-2 hover:text-pink-500">
                <Heart className="w-4 h-4" />
                <span className="text-xs">234</span>
              </button>
              <button className="hover:text-sky-500">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
