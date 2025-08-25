"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Plus, 
  FileText, 
  Globe, 
  MessageSquare, 
  HelpCircle,
  Trash2,
  Edit,
  Loader2,
  Upload,
  Link,
  Type,
  Search,
  Download,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface KnowledgeItem {
  id: string
  name: string
  description?: string
  type: 'DOCUMENT' | 'WEBPAGE' | 'TEXT' | 'FAQ'
  content?: string
  fileSize?: number
  mimeType?: string
  originalName?: string
  createdAt: string
  updatedAt: string
}

const typeIcons = {
  DOCUMENT: FileText,
  WEBPAGE: Globe,
  TEXT: Type,
  FAQ: HelpCircle,
}

const typeLabels = {
  DOCUMENT: 'Documento',
  WEBPAGE: 'Página Web',
  TEXT: 'Texto',
  FAQ: 'FAQ',
}

export default function KnowledgePage() {
  const { data: session } = useSession()
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showDialog, setShowDialog] = useState(false)
  const [previewDialog, setPreviewDialog] = useState(false)
  const [previewContent, setPreviewContent] = useState<KnowledgeItem | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'TEXT' as 'DOCUMENT' | 'WEBPAGE' | 'TEXT' | 'FAQ',
    content: '',
    url: '',
  })
  const [uploadFile, setUploadFile] = useState<File | null>(null)

  useEffect(() => {
    fetchKnowledge()
  }, [])

  const fetchKnowledge = async () => {
    try {
      const response = await fetch('/api/knowledge')
      if (response.ok) {
        const data = await response.json()
        setKnowledge(data.knowledgeBase)
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar a base de conhecimento.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      let content = formData.content
      let metadata: any = {}

      if (formData.type === 'DOCUMENT' && uploadFile) {
        // Convert file to base64
        const reader = new FileReader()
        content = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(uploadFile)
        })
        metadata.fileSize = uploadFile.size
        metadata.mimeType = uploadFile.type
        metadata.originalName = uploadFile.name
        metadata.uploadedAt = new Date().toISOString()
      } else if (formData.type === 'WEBPAGE' && formData.url) {
        content = formData.url
        metadata.url = formData.url
      }

      const response = await fetch('/api/knowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          type: formData.type,
          content,
          metadata,
          fileSize: uploadFile?.size,
          mimeType: uploadFile?.type,
          originalName: uploadFile?.name,
        }),
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Item adicionado à base de conhecimento.",
        })
        setShowDialog(false)
        resetForm()
        fetchKnowledge()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao adicionar')
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível adicionar o item.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este item?')) return

    try {
      const response = await fetch(`/api/knowledge/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Item removido da base de conhecimento.",
        })
        fetchKnowledge()
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o item.",
        variant: "destructive",
      })
    }
  }

  const handlePreview = async (id: string) => {
    try {
      const response = await fetch(`/api/knowledge/${id}`)
      if (response.ok) {
        const data = await response.json()
        setPreviewContent(data.knowledge)
        setPreviewDialog(true)
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar o conteúdo.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'TEXT',
      content: '',
      url: '',
    })
    setUploadFile(null)
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
  }

  const filteredKnowledge = knowledge.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'all' || item.type === selectedType
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Base de Conhecimento</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Gerencie documentos e informações para a IA usar como contexto
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="h-9 rounded-lg">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Adicionar à Base de Conhecimento</DialogTitle>
                <DialogDescription>
                  Adicione documentos, textos ou URLs para a IA usar como referência
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({...formData, type: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TEXT">
                        <div className="flex items-center gap-2">
                          <Type className="h-4 w-4" />
                          Texto
                        </div>
                      </SelectItem>
                      <SelectItem value="DOCUMENT">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Documento
                        </div>
                      </SelectItem>
                      <SelectItem value="WEBPAGE">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Página Web
                        </div>
                      </SelectItem>
                      <SelectItem value="FAQ">
                        <div className="flex items-center gap-2">
                          <HelpCircle className="h-4 w-4" />
                          FAQ
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nome do documento"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Breve descrição do conteúdo"
                  />
                </div>

                {formData.type === 'DOCUMENT' && (
                  <div className="grid gap-2">
                    <Label htmlFor="file">Arquivo</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      accept=".txt,.md,.pdf,.doc,.docx"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Formatos aceitos: TXT, MD, PDF, DOC, DOCX (max 10MB)
                    </p>
                  </div>
                )}

                {formData.type === 'WEBPAGE' && (
                  <div className="grid gap-2">
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({...formData, url: e.target.value})}
                      placeholder="https://exemplo.com/pagina"
                      required
                    />
                  </div>
                )}

                {(formData.type === 'TEXT' || formData.type === 'FAQ') && (
                  <div className="grid gap-2">
                    <Label htmlFor="content">Conteúdo</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      placeholder={formData.type === 'FAQ' ? 
                        "P: Pergunta?\nR: Resposta\n\nP: Outra pergunta?\nR: Outra resposta" : 
                        "Digite ou cole o conteúdo aqui..."
                      }
                      className="min-h-[200px]"
                      required
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" className="h-9 rounded-lg" onClick={() => setShowDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="h-9 rounded-lg gradient-primary text-white" disabled={isCreating}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Adicionar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou descrição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 rounded-lg"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[180px] h-9 rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="TEXT">Texto</SelectItem>
            <SelectItem value="DOCUMENT">Documento</SelectItem>
            <SelectItem value="WEBPAGE">Página Web</SelectItem>
            <SelectItem value="FAQ">FAQ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border border-border/60 rounded-2xl shadow-soft">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredKnowledge.length === 0 ? (
        <Card className="border border-border/60 rounded-2xl shadow-soft">
          <CardContent className="p-10 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">
              {searchQuery || selectedType !== 'all' ? 
                'Nenhum item encontrado' : 
                'Base de conhecimento vazia'
              }
            </h3>
            <p className="text-muted-foreground text-sm">
              {searchQuery || selectedType !== 'all' ? 
                'Tente ajustar os filtros de busca' :
                'Adicione documentos para a IA usar como referência'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card shadow-soft">
          <Table>
            <TableHeader>
              <TableRow className="h-11">
                <TableHead className="font-semibold text-foreground/90">Nome</TableHead>
                <TableHead className="font-semibold text-foreground/90">Tipo</TableHead>
                <TableHead className="font-semibold text-foreground/90">Tamanho</TableHead>
                <TableHead className="font-semibold text-foreground/90">Criado em</TableHead>
                <TableHead className="text-right font-semibold text-foreground/90">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKnowledge.map((item) => {
                const Icon = typeIcons[item.type]
                return (
                  <TableRow key={item.id} className="h-11 odd:bg-background/60 hover:bg-background/70 border-b border-border/60 last:border-b-0">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-md bg-background/60 border border-border/60 flex items-center justify-center">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-muted-foreground">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-md bg-background/60">
                        {typeLabels[item.type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatFileSize(item.fileSize)}
                    </TableCell>
                    <TableCell>
                      {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => handlePreview(item.id)} title="Visualizar conteúdo">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => handleDelete(item.id)} title="Remover">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewContent && (
                <>
                  {React.createElement(typeIcons[previewContent.type], { className: "h-5 w-5" })}
                  {previewContent.name}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {previewContent?.description && (
                <span>{previewContent.description}</span>
              )}
              {previewContent?.mimeType && (
                <Badge variant="outline" className="ml-2">
                  {previewContent.mimeType}
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {previewContent && (
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-medium mb-2">Conteúdo Extraído:</h4>
                <div className="whitespace-pre-wrap text-sm font-mono bg-background p-4 rounded border max-h-[400px] overflow-y-auto">
                  {previewContent.content || 'Nenhum conteúdo disponível'}
                </div>
                {previewContent.fileSize && (
                  <div className="mt-4 text-sm text-muted-foreground">
                    <strong>Tamanho:</strong> {formatFileSize(previewContent.fileSize)} • 
                    <strong className="ml-2">Criado:</strong> {new Date(previewContent.createdAt).toLocaleString('pt-BR')}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setPreviewDialog(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
