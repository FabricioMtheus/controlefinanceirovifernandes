"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Download,
  Upload,
  Trash2,
  FileText,
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"
import { cleanApiClient } from "@/lib/api-clean"
import { googleDriveManager } from "@/lib/google-drive"
import { useFinance } from "@/lib/finance-context"

export function DataManager() {
  const { refreshData } = useFinance()
  const [isGoogleConnected, setIsGoogleConnected] = useState(false)
  const [googleFiles, setGoogleFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    checkGoogleConnection()
  }, [])

  const checkGoogleConnection = () => {
    setIsGoogleConnected(googleDriveManager.getSignInStatus())
  }

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      const success = await googleDriveManager.signIn()
      if (success) {
        setIsGoogleConnected(true)
        showMessage("success", "Conectado ao Google Drive com sucesso!")
        await loadGoogleFiles()
      } else {
        showMessage("error", "Falha ao conectar com Google Drive")
      }
    } catch (error) {
      console.error("Google sign in error:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      if (errorMessage.includes("credentials not configured")) {
        showMessage(
          "error",
          "Google Drive não configurado. Configure as credenciais GOOGLE_API_KEY e GOOGLE_CLIENT_ID nas variáveis de ambiente.",
        )
      } else {
        showMessage("error", "Erro ao conectar com Google Drive: " + errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignOut = async () => {
    setLoading(true)
    try {
      await googleDriveManager.signOut()
      setIsGoogleConnected(false)
      setGoogleFiles([])
      showMessage("success", "Desconectado do Google Drive")
    } catch (error) {
      console.error("Google sign out error:", error)
      showMessage("error", "Erro ao desconectar do Google Drive")
    } finally {
      setLoading(false)
    }
  }

  const loadGoogleFiles = async () => {
    if (!isGoogleConnected) return

    setLoading(true)
    try {
      const files = await googleDriveManager.listFiles()
      setGoogleFiles(files.filter((file) => file.name.includes("financial-backup")))
    } catch (error) {
      console.error("Error loading Google files:", error)
      showMessage("error", "Erro ao carregar arquivos do Google Drive")
    } finally {
      setLoading(false)
    }
  }

  const handleExportLocal = async () => {
    try {
      const data = await cleanApiClient.exportData()
      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `financial-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showMessage("success", "Dados exportados com sucesso!")
    } catch (error) {
      console.error("Export error:", error)
      showMessage("error", "Erro ao exportar dados")
    }
  }

  const handleImportLocal = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const text = await file.text()
      const success = await cleanApiClient.importData(text)
      if (success) {
        await refreshData()
        showMessage("success", "Dados importados com sucesso!")
      } else {
        showMessage("error", "Erro ao importar dados - formato inválido")
      }
    } catch (error) {
      console.error("Import error:", error)
      showMessage("error", "Erro ao importar dados")
    } finally {
      setLoading(false)
      // Reset file input
      event.target.value = ""
    }
  }

  const handleBackupToGoogle = async () => {
    if (!isGoogleConnected) return

    setLoading(true)
    try {
      const data = await cleanApiClient.exportData()
      const fileName = `financial-backup-${new Date().toISOString().split("T")[0]}.json`
      const fileId = await googleDriveManager.uploadFile(fileName, data)

      if (fileId) {
        showMessage("success", "Backup salvo no Google Drive!")
        await loadGoogleFiles()
      } else {
        showMessage("error", "Erro ao salvar backup no Google Drive")
      }
    } catch (error) {
      console.error("Backup error:", error)
      showMessage("error", "Erro ao fazer backup")
    } finally {
      setLoading(false)
    }
  }

  const handleRestoreFromGoogle = async (fileId: string, fileName: string) => {
    setLoading(true)
    try {
      const data = await googleDriveManager.downloadFile(fileId)
      if (data) {
        const success = await cleanApiClient.importData(data)
        if (success) {
          await refreshData()
          showMessage("success", `Dados restaurados de ${fileName}!`)
        } else {
          showMessage("error", "Erro ao restaurar dados - formato inválido")
        }
      } else {
        showMessage("error", "Erro ao baixar arquivo do Google Drive")
      }
    } catch (error) {
      console.error("Restore error:", error)
      showMessage("error", "Erro ao restaurar dados")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFromGoogle = async (fileId: string, fileName: string) => {
    setLoading(true)
    try {
      const success = await googleDriveManager.deleteFile(fileId)
      if (success) {
        showMessage("success", `${fileName} excluído do Google Drive!`)
        await loadGoogleFiles()
      } else {
        showMessage("error", "Erro ao excluir arquivo")
      }
    } catch (error) {
      console.error("Delete error:", error)
      showMessage("error", "Erro ao excluir arquivo")
    } finally {
      setLoading(false)
    }
  }

  const handleClearAllData = async () => {
    setLoading(true)
    try {
      await cleanApiClient.clearAllData()
      await refreshData()
      showMessage("success", "Todos os dados foram limpos!")
    } catch (error) {
      console.error("Clear data error:", error)
      showMessage("error", "Erro ao limpar dados")
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gerenciamento de Dados</h2>
        <p className="text-muted-foreground">Faça backup, restaure e gerencie seus dados financeiros</p>
      </div>

      {message && (
        <Card
          className={`border-l-4 ${message.type === "success" ? "border-l-green-500 bg-green-50" : "border-l-red-500 bg-red-50"}`}
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              {message.type === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className={message.type === "success" ? "text-green-800" : "text-red-800"}>{message.text}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="local" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="local">Gerenciamento Local</TabsTrigger>
          <TabsTrigger value="cloud">Google Drive</TabsTrigger>
        </TabsList>

        <TabsContent value="local" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Exportar Dados
                </CardTitle>
                <CardDescription>Baixe todos os seus dados financeiros em formato JSON</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleExportLocal} className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                  Exportar Dados
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Importar Dados
                </CardTitle>
                <CardDescription>Restaure seus dados a partir de um arquivo JSON</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="import-file">Selecionar arquivo JSON</Label>
                  <Input id="import-file" type="file" accept=".json" onChange={handleImportLocal} disabled={loading} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Zona de Perigo
              </CardTitle>
              <CardDescription>Ações irreversíveis que afetam todos os seus dados</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={loading}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpar Todos os Dados
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação irá excluir permanentemente todos os seus dados financeiros. Esta ação não pode ser
                      desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAllData} className="bg-red-600 hover:bg-red-700">
                      Sim, limpar tudo
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cloud" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isGoogleConnected ? (
                  <Cloud className="h-5 w-5 text-green-600" />
                ) : (
                  <CloudOff className="h-5 w-5 text-gray-400" />
                )}
                Status do Google Drive
              </CardTitle>
              <CardDescription>
                {isGoogleConnected ? "Conectado e pronto para backup" : "Conecte-se para fazer backup na nuvem"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant={isGoogleConnected ? "default" : "secondary"}
                  className={isGoogleConnected ? "bg-green-100 text-green-800" : ""}
                >
                  {isGoogleConnected ? "Conectado" : "Desconectado"}
                </Badge>
              </div>

              {!isGoogleConnected && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Para usar o Google Drive:</strong> Configure as variáveis de ambiente
                    NEXT_PUBLIC_GOOGLE_API_KEY e NEXT_PUBLIC_GOOGLE_CLIENT_ID no seu projeto.
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                {!isGoogleConnected ? (
                  <Button onClick={handleGoogleSignIn} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Cloud className="mr-2 h-4 w-4" />}
                    Conectar ao Google Drive
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleBackupToGoogle} disabled={loading}>
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      Fazer Backup
                    </Button>
                    <Button variant="outline" onClick={handleGoogleSignOut} disabled={loading}>
                      <CloudOff className="mr-2 h-4 w-4" />
                      Desconectar
                    </Button>
                    <Button variant="outline" onClick={loadGoogleFiles} disabled={loading}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Atualizar
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {isGoogleConnected && (
            <Card>
              <CardHeader>
                <CardTitle>Backups na Nuvem</CardTitle>
                <CardDescription>Seus backups salvos no Google Drive</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : googleFiles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>Nenhum backup encontrado</p>
                    <p className="text-sm">Faça seu primeiro backup clicando no botão acima</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {googleFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{file.name}</p>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>{formatDate(file.modifiedTime)}</span>
                            <span>{formatFileSize(Number.parseInt(file.size || "0"))}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestoreFromGoogle(file.id, file.name)}
                            disabled={loading}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 bg-transparent"
                                disabled={loading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir backup?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o backup "{file.name}"? Esta ação não pode ser
                                  desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteFromGoogle(file.id, file.name)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
