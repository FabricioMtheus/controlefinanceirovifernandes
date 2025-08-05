"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Download,
  Upload,
  Trash2,
  Database,
  AlertTriangle,
  CheckCircle,
  Info,
  Cloud,
  CloudOff,
  User,
  LogOut,
  RefreshCw,
} from "lucide-react"
import { apiClient } from "@/lib/api"
import { localStorageManager } from "@/lib/local-storage"
import { googleDriveManager } from "@/lib/google-drive"

export function DataManager() {
  const [importing, setImporting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [googleUser, setGoogleUser] = useState<any>(null)
  const [isGoogleReady, setIsGoogleReady] = useState(false)
  const [backups, setBackups] = useState<any[]>([])
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)

  useEffect(() => {
    initializeGoogle()
  }, [])

  const initializeGoogle = async () => {
    try {
      const initialized = await googleDriveManager.initialize()
      setIsGoogleReady(initialized)

      if (initialized && googleDriveManager.isSignedIn()) {
        setGoogleUser(googleDriveManager.getUserInfo())
        loadBackupsList()
      }
    } catch (error) {
      console.error("Erro ao inicializar Google:", error)
    }
  }

  const loadBackupsList = async () => {
    try {
      const backupsList = await googleDriveManager.listBackups()
      setBackups(backupsList)
    } catch (error) {
      console.error("Erro ao carregar lista de backups:", error)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const success = await googleDriveManager.signIn()
      if (success) {
        setGoogleUser(googleDriveManager.getUserInfo())
        setMessage({ type: "success", text: "Conectado ao Google Drive!" })
        loadBackupsList()
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao conectar com Google Drive" })
    }
  }

  const handleGoogleSignOut = async () => {
    try {
      await googleDriveManager.signOut()
      setGoogleUser(null)
      setBackups([])
      setMessage({ type: "info", text: "Desconectado do Google Drive" })
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao desconectar" })
    }
  }

  const handleSyncToGoogle = async () => {
    if (!googleUser) {
      setMessage({ type: "error", text: "Faça login no Google Drive primeiro" })
      return
    }

    setSyncing(true)
    try {
      const localData = localStorageManager.loadData()
      const success = await googleDriveManager.saveToGoogleDrive(localData)

      if (success) {
        setMessage({ type: "success", text: "Dados sincronizados com Google Drive!" })
        loadBackupsList()
      } else {
        setMessage({ type: "error", text: "Erro ao sincronizar com Google Drive" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro na sincronização" })
    } finally {
      setSyncing(false)
    }
  }

  const handleSyncFromGoogle = async () => {
    if (!googleUser) {
      setMessage({ type: "error", text: "Faça login no Google Drive primeiro" })
      return
    }

    setSyncing(true)
    try {
      const googleData = await googleDriveManager.loadFromGoogleDrive()

      if (googleData) {
        localStorageManager.saveData(googleData)
        setMessage({ type: "success", text: "Dados restaurados do Google Drive! Recarregando..." })
        setTimeout(() => window.location.reload(), 2000)
      } else {
        setMessage({ type: "info", text: "Nenhum backup encontrado no Google Drive" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao carregar do Google Drive" })
    } finally {
      setSyncing(false)
    }
  }

  const handleExport = async () => {
    try {
      const data = await apiClient.exportData()
      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `financial-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setMessage({ type: "success", text: "Backup exportado com sucesso!" })
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao exportar dados" })
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    try {
      const text = await file.text()
      const success = await apiClient.importData(text)

      if (success) {
        setMessage({ type: "success", text: "Dados importados com sucesso! Recarregue a página." })
        setTimeout(() => window.location.reload(), 2000)
      } else {
        setMessage({ type: "error", text: "Erro ao importar dados. Verifique o arquivo." })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Arquivo inválido" })
    } finally {
      setImporting(false)
      event.target.value = ""
    }
  }

  const handleClearData = async () => {
    if (!window.confirm("⚠️ ATENÇÃO: Isso irá apagar TODOS os seus dados permanentemente. Tem certeza?")) {
      return
    }

    if (!window.confirm("🚨 ÚLTIMA CHANCE: Todos os dados serão perdidos. Continuar?")) {
      return
    }

    try {
      await apiClient.clearAllData()
      setMessage({ type: "success", text: "Todos os dados foram removidos. Recarregando..." })
      setTimeout(() => window.location.reload(), 1500)
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao limpar dados" })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const hasLocalData = localStorageManager.hasData()
  const localData = localStorageManager.loadData()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-green-800 mb-2">Gerenciar Dados</h2>
        <p className="text-muted-foreground">Faça backup, restaure ou sincronize seus dados financeiros</p>
      </div>

      {message && (
        <Alert
          className={
            message.type === "error"
              ? "border-red-200 bg-red-50"
              : message.type === "success"
                ? "border-green-200 bg-green-50"
                : "border-blue-200 bg-blue-50"
          }
        >
          {message.type === "error" && <AlertTriangle className="h-4 w-4 text-red-600" />}
          {message.type === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
          {message.type === "info" && <Info className="h-4 w-4 text-blue-600" />}
          <AlertDescription
            className={
              message.type === "error"
                ? "text-red-800"
                : message.type === "success"
                  ? "text-green-800"
                  : "text-blue-800"
            }
          >
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Google Drive Status */}
      <Card className={googleUser ? "border-green-200 bg-green-50" : "border-gray-200"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {googleUser ? <Cloud className="h-5 w-5 text-green-600" /> : <CloudOff className="h-5 w-5 text-gray-600" />}
            Google Drive
          </CardTitle>
          <CardDescription>
            {googleUser
              ? `Conectado como ${googleUser.name} (${googleUser.email})`
              : "Conecte-se para sincronizar seus dados na nuvem"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {googleUser ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img
                  src={googleUser.picture || "/placeholder.svg"}
                  alt={googleUser.name}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <div className="font-medium">{googleUser.name}</div>
                  <div className="text-sm text-muted-foreground">{googleUser.email}</div>
                </div>
                <Badge variant="secondary" className="ml-auto">
                  Conectado
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSyncToGoogle} disabled={syncing || !hasLocalData} className="flex-1">
                  {syncing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  Enviar para Nuvem
                </Button>

                <Button
                  onClick={handleSyncFromGoogle}
                  disabled={syncing}
                  variant="outline"
                  className="flex-1 bg-transparent"
                >
                  {syncing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Baixar da Nuvem
                </Button>

                <Button onClick={handleGoogleSignOut} variant="outline" size="icon">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>

              {/* Lista de Backups */}
              {backups.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Backups na Nuvem:</h4>
                  {backups.slice(0, 3).map((backup) => (
                    <div
                      key={backup.id}
                      className="flex justify-between items-center text-sm p-2 bg-white rounded border"
                    >
                      <span>{backup.name}</span>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>{formatFileSize(Number.parseInt(backup.size || "0"))}</span>
                        <span>{new Date(backup.modifiedTime).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  ))}
                  {backups.length > 3 && (
                    <div className="text-xs text-muted-foreground">+{backups.length - 3} backups mais antigos</div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-muted-foreground">
                Conecte-se ao Google Drive para sincronizar seus dados automaticamente
              </div>
              <Button onClick={handleGoogleSignIn} disabled={!isGoogleReady} className="bg-blue-600 hover:bg-blue-700">
                <User className="h-4 w-4 mr-2" />
                {isGoogleReady ? "Conectar Google Drive" : "Carregando..."}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status dos Dados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Status dos Dados Locais
          </CardTitle>
          <CardDescription>Informações sobre seus dados salvos no navegador</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{localData.accounts?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Contas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{localData.transactions?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Transações</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{localData.credit_cards?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Cartões</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{localData.categories?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Categorias</div>
            </div>
          </div>

          {hasLocalData && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Última atualização: {new Date(localData.lastUpdated).toLocaleString("pt-BR")}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações de Backup Local */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-green-600" />
              Exportar Dados
            </CardTitle>
            <CardDescription>Baixe um arquivo com todos os seus dados financeiros</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExport} className="w-full bg-green-600 hover:bg-green-700" disabled={!hasLocalData}>
              <Download className="h-4 w-4 mr-2" />
              Baixar Backup Local
            </Button>
            {!hasLocalData && <p className="text-xs text-muted-foreground mt-2">Nenhum dado para exportar</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Importar Dados
            </CardTitle>
            <CardDescription>Restaure seus dados de um arquivo de backup</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="import-file">Selecionar arquivo JSON</Label>
              <Input id="import-file" type="file" accept=".json" onChange={handleImport} disabled={importing} />
              {importing && <p className="text-xs text-blue-600">Importando dados...</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zona de Perigo */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Zona de Perigo
          </CardTitle>
          <CardDescription>Ações irreversíveis que podem causar perda de dados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Atenção:</strong> Esta ação irá apagar permanentemente todos os seus dados salvos localmente.
                Faça um backup antes de continuar.
              </AlertDescription>
            </Alert>

            <Button variant="destructive" onClick={handleClearData} disabled={!hasLocalData} className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Apagar Todos os Dados Locais
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informações Técnicas */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Info className="h-5 w-5" />
            Como Funciona
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <p>
            • <strong>Local:</strong> Dados salvos no navegador (localStorage)
          </p>
          <p>
            • <strong>Google Drive:</strong> Sincronização automática na nuvem
          </p>
          <p>
            • <strong>Privacidade:</strong> Você controla onde seus dados ficam
          </p>
          <p>
            • <strong>Backup:</strong> Múltiplas opções de backup e restore
          </p>
          <p>
            • <strong>Offline:</strong> Funciona sem internet, sincroniza quando conecta
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
