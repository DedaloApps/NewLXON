// src/app/(dashboard)/content-hub/page.tsx
"use client";

import { useState } from 'react';
import { Calendar as CalendarIcon, Grid, Instagram, Clock, TrendingUp, Eye, Edit, Trash2, Copy, Send, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ContentHubPage() {
  const [view, setView] = useState<'calendar' | 'grid'>('calendar');
  const [selectedPost, setSelectedPost] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Content Hub</h1>
              <p className="text-sm text-gray-500">Gere, planeie e publique o teu conteúdo</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Button
                  variant={view === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('calendar')}
                  className="gap-2"
                >
                  <CalendarIcon className="w-4 h-4" />
                  Calendário
                </Button>
                <Button
                  variant={view === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('grid')}
                  className="gap-2"
                >
                  <Grid className="w-4 h-4" />
                  Grelha
                </Button>
              </div>
              
              <Button className="gap-2">
                <Send className="w-4 h-4" />
                Criar Novo Post
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {view === 'calendar' ? (
              <CalendarView onSelectPost={setSelectedPost} />
            ) : (
              <GridView onSelectPost={setSelectedPost} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {selectedPost ? (
              <PostPreview post={selectedPost} onClose={() => setSelectedPost(null)} />
            ) : (
              <QuickStats />
            )}
            
            <UpcomingPosts />
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente do Calendário
function CalendarView({ onSelectPost }: { onSelectPost: (post: any) => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Mock data
  const posts = [
    {
      id: 1,
      date: '2025-01-15',
      time: '09:00',
      type: 'post',
      status: 'scheduled',
      title: '5 Erros no Treino',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
      platform: 'instagram'
    },
    {
      id: 2,
      date: '2025-01-16',
      time: '13:00',
      type: 'reel',
      status: 'scheduled',
      title: 'Treino de 10min',
      image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
      platform: 'instagram'
    },
    // Adicionar mais posts...
  ];

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Dias do mês anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, posts: [] });
    }
    
    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayPosts = posts.filter(p => p.date === dateStr);
      days.push({ date: day, posts: dayPosts });
    }

    return days;
  };

  const days = getDaysInMonth();
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {currentDate.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
            >
              ←
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Hoje
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
            >
              →
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {/* Headers dos dias */}
          {weekDays.map(day => (
            <div key={day} className="bg-gray-50 p-2 text-center text-xs font-semibold text-gray-600">
              {day}
            </div>
          ))}
          
          {/* Dias do mês */}
          {days.map((day, index) => (
            <div
              key={index}
              className={`bg-white p-2 min-h-[120px] ${
                day.date ? 'cursor-pointer hover:bg-gray-50' : 'bg-gray-50'
              }`}
            >
              {day.date && (
                <>
                  <div className="text-sm font-medium mb-2">{day.date}</div>
                  <div className="space-y-1">
                    {day.posts.map(post => (
                      <div
                        key={post.id}
                        onClick={() => onSelectPost(post)}
                        className="text-xs p-1.5 rounded bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200 transition-colors"
                      >
                        <div className="flex items-center gap-1 mb-0.5">
                          <Clock className="w-3 h-3" />
                          {post.time}
                        </div>
                        <div className="font-medium truncate">{post.title}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente da Vista em Grelha
function GridView({ onSelectPost }: { onSelectPost: (post: any) => void }) {
  const posts = [
    {
      id: 1,
      title: '5 Erros no Treino',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
      status: 'scheduled',
      date: '2025-01-15',
      time: '09:00',
      type: 'educational',
      engagement: 'Alto'
    },
    {
      id: 2,
      title: 'Quando decides treinar...',
      image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
      status: 'scheduled',
      date: '2025-01-16',
      time: '18:00',
      type: 'viral',
      engagement: 'Alto'
    },
    // Mais posts...
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Todos os Posts</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">12 Agendados</Badge>
            <Badge variant="outline">3 Rascunhos</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {posts.map(post => (
            <div
              key={post.id}
              onClick={() => onSelectPost(post)}
              className="group cursor-pointer"
            >
              <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-sm font-medium">{post.title}</p>
                  </div>
                </div>
                <Badge className="absolute top-2 right-2">
                  {post.status === 'scheduled' ? '📅 Agendado' : '📝 Rascunho'}
                </Badge>
              </div>
              <div className="text-xs text-gray-500">
                {post.date} • {post.time}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Preview do Post (Mockup Instagram)
function PostPreview({ post, onClose }: { post: any; onClose: () => void }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Preview do Post</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Instagram Mockup */}
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
          {/* Header do Instagram */}
          <div className="flex items-center gap-3 p-3 border-b">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400" />
            <div className="flex-1">
              <div className="font-semibold text-sm">teu_perfil</div>
              <div className="text-xs text-gray-500">Lisboa, Portugal</div>
            </div>
            <div className="text-2xl">...</div>
          </div>

          {/* Imagem */}
          <div className="aspect-square bg-gray-100">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Ações */}
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <div className="text-2xl">❤️</div>
                <div className="text-2xl">💬</div>
                <div className="text-2xl">📤</div>
              </div>
              <div className="text-2xl">🔖</div>
            </div>

            <div className="text-sm font-semibold">1,234 gostos</div>
            
            <div className="text-sm">
              <span className="font-semibold">teu_perfil</span> {post.title}
            </div>

            <div className="text-xs text-gray-500">HÁ 2 HORAS</div>
          </div>
        </div>

        {/* Ações */}
        <div className="mt-4 space-y-2">
          <Button className="w-full gap-2">
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

// Estatísticas Rápidas
function QuickStats() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Estatísticas Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Posts Agendados</span>
          <span className="text-2xl font-bold">12</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Rascunhos</span>
          <span className="text-2xl font-bold">3</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Publicados (30d)</span>
          <span className="text-2xl font-bold">24</span>
        </div>
        <div className="pt-3 border-t">
          <div className="flex items-center gap-2 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">+15% engagement este mês</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Posts Próximos
function UpcomingPosts() {
  const upcoming = [
    { title: '5 Erros no Treino', time: 'Hoje às 09:00', platform: 'instagram' },
    { title: 'Receita Fit', time: 'Amanhã às 13:00', platform: 'instagram' },
    { title: 'Motivação', time: '16 Jan às 18:00', platform: 'instagram' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Próximas Publicações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcoming.map((post, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
              <Instagram className="w-5 h-5 text-pink-600" />
              <div className="flex-1">
                <div className="text-sm font-medium">{post.title}</div>
                <div className="text-xs text-gray-500">{post.time}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="best">Melhores Posts</TabsTrigger>
            <TabsTrigger value="insights">Insights IA</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Métricas principais */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">Alcance Médio</div>
                <div className="text-2xl font-bold text-blue-600">5.2K</div>
                <div className="text-xs text-green-600">+15% vs. mês passado</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-600">Engagement Rate</div>
                <div className="text-2xl font-bold text-purple-600">4.8%</div>
                <div className="text-xs text-green-600">+0.5% vs. mês passado</div>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <div className="text-sm text-gray-600">Novos Seguidores</div>
                <div className="text-2xl font-bold text-pink-600">+342</div>
                <div className="text-xs text-green-600">Este mês</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="text-sm text-gray-600">Taxa de Saves</div>
                <div className="text-2xl font-bold text-orange-600">12%</div>
                <div className="text-xs text-green-600">Muito bom!</div>
              </div>
            </div>

            {/* Gráfico de engagement */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-3">Engagement por Dia da Semana</h4>
              <div className="space-y-2">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, index) => {
                  const value = [75, 82, 68, 90, 85, 45, 38][index];
                  return (
                    <div key={day} className="flex items-center gap-3">
                      <div className="w-12 text-sm text-gray-600">{day}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-6 rounded-full flex items-center justify-end px-2 text-xs font-medium text-white"
                          style={{ width: `${value}%` }}
                        >
                          {value}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="best" className="space-y-4">
            <div className="space-y-3">
              {[
                { title: 'Treino de 10min', likes: 1234, comments: 89, saves: 234 },
                { title: '5 Erros Comuns', likes: 987, comments: 67, saves: 189 },
                { title: 'Receita Fit', likes: 876, comments: 45, saves: 156 },
              ].map((post, i) => (
                <div key={i} className="p-4 border rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{post.title}</h4>
                    <Badge>Top {i + 1}</Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>❤️ {post.likes}</span>
                    <span>💬 {post.comments}</span>
                    <span>🔖 {post.saves}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600">
                <h4 className="font-semibold text-blue-900 mb-1">✨ Posts Educativos performam melhor</h4>
                <p className="text-sm text-blue-800">
                  Os teus posts educativos têm +35% mais saves que a média. Cria mais conteúdo deste tipo!
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-600">
                <h4 className="font-semibold text-purple-900 mb-1">⏰ Melhor hora: 18h-20h</h4>
                <p className="text-sm text-purple-800">
                  Os teus seguidores estão mais ativos entre as 18h-20h. Agenda posts para este horário!
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-600">
                <h4 className="font-semibold text-green-900 mb-1">📈 Crescimento consistente</h4>
                <p className="text-sm text-green-800">
                  Estás a crescer 12% ao mês. Mantém a frequência de 4-5 posts/semana!
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// =====================================================
// BEST TIME TO POST - IA sugere melhor hora
// =====================================================
function BestTimeToPost() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Melhores Horários
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-green-900">🔥 Prime Time</span>
              <Badge className="bg-green-600">85% engagement</Badge>
            </div>
            <div className="text-sm text-green-800">
              Segunda, Quarta, Sexta: 18h-20h
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-blue-900">👍 Bom</span>
              <Badge className="bg-blue-600">65% engagement</Badge>
            </div>
            <div className="text-sm text-blue-800">
              Terça, Quinta: 13h-14h
            </div>
          </div>

          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-orange-900">⚠️ Evitar</span>
              <Badge className="bg-orange-600">35% engagement</Badge>
            </div>
            <div className="text-sm text-orange-800">
              Fim de semana: 22h-08h
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// CONTENT SUGGESTIONS - IA sugere novos posts
// =====================================================
function ContentSuggestions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          Sugestões da IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[
            {
              title: 'Tendência: Treinos rápidos',
              reason: 'Em alta no teu nicho (+127%)',
              action: 'Criar agora',
            },
            {
              title: '5 Mitos sobre proteína',
              reason: 'Muito engagement em posts similares',
              action: 'Gerar post',
            },
            {
              title: 'Cliente transformação',
              reason: 'Ainda não partilhaste este mês',
              action: 'Adicionar',
            },
          ].map((suggestion, i) => (
            <div
              key={i}
              className="p-3 border rounded-lg hover:border-purple-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-1">
                <h4 className="font-semibold text-sm">{suggestion.title}</h4>
                <Badge variant="outline" className="text-xs">
                  {suggestion.action}
                </Badge>
              </div>
              <p className="text-xs text-gray-600">{suggestion.reason}</p>
            </div>
          ))}
        </div>

        <Button className="w-full mt-4 gap-2">
          <Sparkles className="w-4 h-4" />
          Ver Mais Sugestões
        </Button>
      </CardContent>
    </Card>
  );
}

// =====================================================
// COMPETITOR ANALYSIS - Analisa concorrentes
// =====================================================
function CompetitorAnalysis() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Concorrentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-400" />
              <div>
                <div className="font-semibold">@concorrente_1</div>
                <div className="text-xs text-gray-500">15K seguidores</div>
              </div>
            </div>
            <div className="text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Engagement Rate:</span>
                <span className="font-semibold">6.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Frequência:</span>
                <span className="font-semibold">7x/semana</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-600">
            <h4 className="font-semibold text-blue-900 text-sm mb-1">
              💡 Oportunidade
            </h4>
            <p className="text-xs text-blue-800">
              Os concorrentes postam menos às quartas. Aproveita esta janela!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// HASHTAG GENERATOR - Gera hashtags estratégicas
// =====================================================
function HashtagGenerator() {
  const [topic, setTopic] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);

  const generateHashtags = () => {
    // Mock - em produção chamar API
    setHashtags([
      '#fitness', '#gym', '#workout', '#treino', '#saúde',
      '#fitnessmotivation', '#personaltrainer', '#fitpt',
      '#fitnessportugal', '#lisboafitness'
    ]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          # Gerador de Hashtags
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Tema do post..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
          <Button onClick={generateHashtags} className="w-full">
            Gerar Hashtags
          </Button>

          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag, i) => (
                <Badge key={i} variant="outline" className="cursor-pointer hover:bg-blue-50">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}