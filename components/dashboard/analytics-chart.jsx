"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Activity } from "lucide-react";
export function AnalyticsChart({ data }) {
    const { overview, chartData, recentActivity, modelUsage } = data;
    // Simple bar chart representation
    const maxMessages = Math.max(...chartData.map(d => d.messages), 1);
    const maxTokens = Math.max(...chartData.map(d => d.tokens), 1);
    return (<div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Mensagens</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalMessages}</div>
            <p className="text-xs text-muted-foreground">
              Todas as mensagens enviadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversas Criadas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalConversations}</div>
            <p className="text-xs text-muted-foreground">
              Total de conversas iniciadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Utilizados</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalTokens.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {overview.totalCost.toFixed(4)}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Messages Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Uso Diário - Mensagens</CardTitle>
            <CardDescription>Mensagens enviadas por dia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {chartData.slice(-7).map((day, index) => (<div key={day.date} className="flex items-center">
                  <div className="w-20 text-sm">
                    {new Date(day.date).toLocaleDateString('pt-BR', {
                month: 'short',
                day: 'numeric'
            })}
                  </div>
                  <div className="flex-1 mx-3">
                    <div className="bg-primary h-2 rounded-full" style={{
                width: `${Math.max((day.messages / maxMessages) * 100, 2)}%`
            }}/>
                  </div>
                  <div className="w-12 text-sm text-right">{day.messages}</div>
                </div>))}
            </div>
          </CardContent>
        </Card>

        {/* Model Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Uso por Modelo</CardTitle>
            <CardDescription>Distribuição de uso dos modelos de IA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {modelUsage.map((model, index) => (<div key={model.model} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{model.model}</Badge>
                  </div>
                  <div className="text-sm">
                    {model.count} mensagens
                  </div>
                </div>))}
              {modelUsage.length === 0 && (<p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum uso registrado nos últimos 30 dias
                </p>)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>Suas conversas mais recentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((conversation) => (<div key={conversation.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <div>
                  <p className="font-medium">{conversation.title || 'Conversa sem título'}</p>
                  <p className="text-sm text-muted-foreground">
                    {conversation._count.messages} mensagens
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{conversation.modelUsed || 'Modelo não especificado'}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(conversation.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>))}
            {recentActivity.length === 0 && (<p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma conversa encontrada
              </p>)}
          </div>
        </CardContent>
      </Card>
    </div>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5hbHl0aWNzLWNoYXJ0LmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuYWx5dGljcy1jaGFydC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBO0FBRVosT0FBTyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsZUFBZSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQTtBQUNoRyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFDN0MsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE1BQU0sY0FBYyxDQUFBO0FBaUM5RCxNQUFNLFVBQVUsY0FBYyxDQUFDLEVBQUUsSUFBSSxFQUF1QjtJQUMxRCxNQUFNLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLEdBQUcsSUFBSSxDQUFBO0lBRWhFLGtDQUFrQztJQUNsQyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUNsRSxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUU5RCxPQUFPLENBQ0wsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FDeEI7TUFBQSxDQUFDLG9CQUFvQixDQUNyQjtNQUFBLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQywwQ0FBMEMsQ0FDdkQ7UUFBQSxDQUFDLElBQUksQ0FDSDtVQUFBLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQywyREFBMkQsQ0FDL0U7WUFBQSxDQUFDLFNBQVMsQ0FBQyxTQUFT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