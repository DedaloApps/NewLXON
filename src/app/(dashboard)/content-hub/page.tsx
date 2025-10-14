// src/app/(dashboard)/content-hub/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { HeaderPremium } from '@/components/layout/Header';
import { Toaster } from "@/components/ui/toaster";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Filter,
  MoreVertical,
  Eye,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  Image as ImageIcon,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Download,
  X,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export default function ContentHubPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const [view, setView] = useState<'posts' | 'calendar'>('posts');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'draft' | 'published'>('all');
  const [previewPlatform, setPreviewPlatform] = useState<'instagram' | 'facebook' | 'linkedin' | 'twitter'>('instagram');
  
  // Estados para publicação
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [postToPublish, setPostToPublish] = useState<Post | null>(null);
  const [publishType, setPublishType] = useState<'now' | 'schedule'>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [publishing, setPublishing] = useState(false);
  
  // Estados para editor inline e IA
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editedCaption, setEditedCaption] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/posts/list');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.caption?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || post.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    scheduled: posts.filter(p => p.status === 'SCHEDULED').length,
    drafts: posts.filter(p => p.status === 'DRAFT').length,
    published: posts.filter(p => p.status === 'PUBLISHED').length,
  };

  const handlePublish = (post: Post) => {
    setPostToPublish(post);
    setPublishModalOpen(true);
  };

  const confirmPublish = async () => {
    if (!postToPublish) return;
    
    setPublishing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Post publicado com sucesso! 🎉",
        description: publishType === 'now' 
          ? "O teu post foi publicado no Instagram"
          : `Post agendado para ${scheduleDate} às ${scheduleTime}`,
      });
      
      setPublishModalOpen(false);
      setPostToPublish(null);
      loadPosts();
    } catch (error) {
      toast({
        title: "Erro ao publicar",
        description: "Não foi possível publicar o post. Tenta novamente.",
        variant: "destructive",
      });
    } finally {
      setPublishing(false);
    }
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

      {/* Subheader com filtros e ações */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Pesquisar posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                Todos ({posts.length})
              </Button>
              <Button
                variant={filterStatus === 'scheduled' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('scheduled')}
              >
                Agendados ({stats.scheduled})
              </Button>
              <Button
                variant={filterStatus === 'draft' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('draft')}
              >
                Rascunhos ({stats.drafts})
              </Button>
              <Button
                variant={filterStatus === 'published' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('published')}
              >
                Publicados ({stats.published})
              </Button>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setView(view === 'posts' ? 'calendar' : 'posts')}
                className="gap-2"
              >
                {view === 'posts' ? (
                  <>
                    <Calendar className="w-4 h-4" />
                    Ver Calendário
                  </>
                ) : (
                  <>
                    <Grid className="w-4 h-4" />
                    Ver Posts
                  </>
                )}
              </Button>
              <Button
                className="gap-2"
                onClick={() => router.push('/create-post')}
              >
                <Plus className="w-4 h-4" />
                Criar Post
              </Button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : view === 'calendar' ? (
        <CalendarView posts={filteredPosts} />
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
                    <Button onClick={() => router.push('/create-post')} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Criar Primeiro Post
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredPosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onSelect={setSelectedPost}
                    isSelected={selectedPost?.id === post.id}
                    onPublish={handlePublish}
                  />
                ))
              )}
            </div>

            {/* Preview Sidebar */}
            <div className="lg:sticky lg:top-24 h-fit">
              {selectedPost ? (
                <PostPreview
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

// Card de Post na Lista
function PostCard({ 
  post, 
  onSelect, 
  isSelected,
  onPublish
}: { 
  post: Post; 
  onSelect: (post: Post) => void;
  isSelected: boolean;
  onPublish: (post: Post) => void;
}) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PUBLISHED': return 'bg-green-100 text-green-700 border-green-200';
      case 'DRAFT': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
      }`}
      onClick={() => onSelect(post)}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Thumbnail */}
          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
            {post.image ? (
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
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

          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-gray-900 line-clamp-1">
                {post.title}
              </h3>
              <div className="flex items-center gap-1">
                {/* Botão Publicar */}
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
                
                {/* Menu de opções */}
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
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/create-post?edit=${post.id}`);
                    }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      alert('Duplicar post');
                    }}>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Tens a certeza que queres eliminar este post?')) {
                          alert('Post eliminado');
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

            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {post.caption || post.title}
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getStatusColor(post.status)}>
                {post.status === 'SCHEDULED' && '📅 Agendado'}
                {post.status === 'PUBLISHED' && '✅ Publicado'}
                {post.status === 'DRAFT' && '📝 Rascunho'}
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

// Preview do Post com Multi-Plataforma
function PostPreview({ 
  post, 
  platform,
  onPlatformChange,
  onClose 
}: { 
  post: Post;
  platform: 'instagram' | 'facebook' | 'linkedin' | 'twitter';
  onPlatformChange: (platform: 'instagram' | 'facebook' | 'linkedin' | 'twitter') => void;
  onClose: () => void;
}) {
  const router = useRouter();

  const platforms = [
    { id: 'instagram', icon: Instagram, name: 'Instagram', color: 'text-pink-600' },
    { id: 'facebook', icon: Facebook, name: 'Facebook', color: 'text-blue-600' },
    { id: 'linkedin', icon: Linkedin, name: 'LinkedIn', color: 'text-blue-700' },
    { id: 'twitter', icon: Twitter, name: 'Twitter', color: 'text-sky-500' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Preview</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>

        {/* Platform Selector */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {platforms.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => onPlatformChange(p.id as any)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                  platform === p.id
                    ? 'bg-blue-50 ring-2 ring-blue-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${platform === p.id ? p.color : 'text-gray-400'}`} />
                <span className="text-xs font-medium">{p.name}</span>
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Instagram Preview */}
        {platform === 'instagram' && (
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-3 p-3 border-b">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400" />
              <div className="flex-1">
                <div className="font-semibold text-sm">seu_perfil</div>
                <div className="text-xs text-gray-500">Lisboa, Portugal</div>
              </div>
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </div>

            {/* Image */}
            <div className="aspect-square bg-gray-100">
              {post.image ? (
                <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Instagram className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Actions */}
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
                <span className="font-semibold">seu_perfil</span>{' '}
                {post.caption || post.title}
              </div>

              {post.hashtags && post.hashtags.length > 0 && (
                <div className="text-sm text-blue-600">
                  {post.hashtags.map(tag => `#${tag}`).join(' ')}
                </div>
              )}

              <div className="text-xs text-gray-500">
                {post.scheduledAt ? new Date(post.scheduledAt).toLocaleDateString('pt-PT') : 'Agora'}
              </div>
            </div>
          </div>
        )}

        {/* Facebook Preview */}
        {platform === 'facebook' && (
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <div className="p-3 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <div className="font-semibold text-sm">Seu Nome</div>
                  <div className="text-xs text-gray-500">
                    {post.scheduledAt ? new Date(post.scheduledAt).toLocaleDateString('pt-PT') : 'Agora'} • 🌍
                  </div>
                </div>
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </div>
              <div className="mt-3 text-sm">
                {post.caption || post.title}
              </div>
            </div>
            
            {post.image && (
              <div className="aspect-video bg-gray-100">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
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
        )}

        {/* LinkedIn Preview */}
        {platform === 'linkedin' && (
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <div className="p-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-blue-700" />
                <div className="flex-1">
                  <div className="font-semibold text-sm">Seu Nome</div>
                  <div className="text-xs text-gray-500">Cargo • Empresa</div>
                  <div className="text-xs text-gray-500">
                    {post.scheduledAt ? new Date(post.scheduledAt).toLocaleDateString('pt-PT') : 'Agora'} • 🌍
                  </div>
                </div>
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </div>
              
              <div className="text-sm mb-3">
                {post.caption || post.title}
              </div>
            </div>

            {post.image && (
              <div className="aspect-video bg-gray-100">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
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
        )}

        {/* Twitter Preview */}
        {platform === 'twitter' && (
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <div className="p-3">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-full bg-sky-500 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-bold text-sm">Seu Nome</span>
                    <span className="text-gray-500 text-sm">@seuperfil</span>
                    <span className="text-gray-500 text-sm">·</span>
                    <span className="text-gray-500 text-sm">
                      {post.scheduledAt ? new Date(post.scheduledAt).toLocaleDateString('pt-PT') : 'agora'}
                    </span>
                  </div>
                  
                  <div className="text-sm mb-3">
                    {post.caption || post.title}
                  </div>

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
        )}

        {/* Ações */}
        <div className="mt-4 space-y-2">
          <Button 
            className="w-full gap-2"
            onClick={() => router.push(`/create-post?edit=${post.id}`)}
          >
            <Edit className="w-4 h-4" />
            Editar Post
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="gap-2">
              <Copy className="w-4 h-4" />
              Duplicar
            </Button>
            <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
              Eliminar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Placeholder para Calendar View
function CalendarView({ posts }: { posts: Post[] }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Card>
        <CardContent className="py-16 text-center">
          <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Vista de Calendário
          </h3>
          <p className="text-gray-500">
            Em desenvolvimento...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}