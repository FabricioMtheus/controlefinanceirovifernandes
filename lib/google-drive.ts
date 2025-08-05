// Configuração do Google Drive API
const GOOGLE_DRIVE_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "",
  discoveryDoc: "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
  scopes: "https://www.googleapis.com/auth/drive.file",
}

export class GoogleDriveManager {
  private static instance: GoogleDriveManager
  private gapi: any = null
  private isInitialized = false

  static getInstance(): GoogleDriveManager {
    if (!GoogleDriveManager.instance) {
      GoogleDriveManager.instance = new GoogleDriveManager()
    }
    return GoogleDriveManager.instance
  }

  // Inicializar Google API
  async initialize(): Promise<boolean> {
    if (typeof window === "undefined") return false

    try {
      // Carregar Google API se não estiver carregado
      if (!window.gapi) {
        await this.loadGoogleAPI()
      }

      await window.gapi.load("client:auth2", async () => {
        await window.gapi.client.init({
          apiKey: GOOGLE_DRIVE_CONFIG.apiKey,
          clientId: GOOGLE_DRIVE_CONFIG.clientId,
          discoveryDocs: [GOOGLE_DRIVE_CONFIG.discoveryDoc],
          scope: GOOGLE_DRIVE_CONFIG.scopes,
        })
      })

      this.gapi = window.gapi
      this.isInitialized = true
      console.log("✅ Google Drive API inicializada")
      return true
    } catch (error) {
      console.error("❌ Erro ao inicializar Google Drive API:", error)
      return false
    }
  }

  // Carregar Google API Script
  private loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script")
      script.src = "https://apis.google.com/js/api.js"
      script.onload = () => resolve()
      script.onerror = () => reject(new Error("Falha ao carregar Google API"))
      document.head.appendChild(script)
    })
  }

  // Fazer login no Google
  async signIn(): Promise<boolean> {
    if (!this.isInitialized) {
      const initialized = await this.initialize()
      if (!initialized) return false
    }

    try {
      const authInstance = this.gapi.auth2.getAuthInstance()
      await authInstance.signIn()
      console.log("✅ Login no Google realizado")
      return true
    } catch (error) {
      console.error("❌ Erro no login do Google:", error)
      return false
    }
  }

  // Fazer logout do Google
  async signOut(): Promise<void> {
    if (!this.isInitialized) return

    try {
      const authInstance = this.gapi.auth2.getAuthInstance()
      await authInstance.signOut()
      console.log("✅ Logout do Google realizado")
    } catch (error) {
      console.error("❌ Erro no logout do Google:", error)
    }
  }

  // Verificar se está logado
  isSignedIn(): boolean {
    if (!this.isInitialized) return false

    try {
      const authInstance = this.gapi.auth2.getAuthInstance()
      return authInstance.isSignedIn.get()
    } catch {
      return false
    }
  }

  // Obter informações do usuário
  getUserInfo(): any {
    if (!this.isSignedIn()) return null

    try {
      const authInstance = this.gapi.auth2.getAuthInstance()
      const user = authInstance.currentUser.get()
      const profile = user.getBasicProfile()

      return {
        id: profile.getId(),
        name: profile.getName(),
        email: profile.getEmail(),
        picture: profile.getImageUrl(),
      }
    } catch {
      return null
    }
  }

  // Salvar dados no Google Drive
  async saveToGoogleDrive(data: any): Promise<boolean> {
    if (!this.isSignedIn()) {
      throw new Error("Não está logado no Google")
    }

    try {
      const fileName = `financial-backup-${new Date().toISOString().split("T")[0]}.json`
      const fileContent = JSON.stringify(data, null, 2)

      // Verificar se já existe um backup
      const existingFile = await this.findBackupFile()

      if (existingFile) {
        // Atualizar arquivo existente
        await this.updateFile(existingFile.id, fileContent)
        console.log("✅ Backup atualizado no Google Drive")
      } else {
        // Criar novo arquivo
        await this.createFile(fileName, fileContent)
        console.log("✅ Backup criado no Google Drive")
      }

      return true
    } catch (error) {
      console.error("❌ Erro ao salvar no Google Drive:", error)
      return false
    }
  }

  // Carregar dados do Google Drive
  async loadFromGoogleDrive(): Promise<any | null> {
    if (!this.isSignedIn()) {
      throw new Error("Não está logado no Google")
    }

    try {
      const backupFile = await this.findBackupFile()
      if (!backupFile) {
        console.log("📁 Nenhum backup encontrado no Google Drive")
        return null
      }

      const fileContent = await this.downloadFile(backupFile.id)
      const data = JSON.parse(fileContent)

      console.log("✅ Backup carregado do Google Drive")
      return data
    } catch (error) {
      console.error("❌ Erro ao carregar do Google Drive:", error)
      return null
    }
  }

  // Procurar arquivo de backup
  private async findBackupFile(): Promise<any> {
    const response = await this.gapi.client.drive.files.list({
      q: "name contains 'financial-backup' and trashed=false",
      orderBy: "modifiedTime desc",
      pageSize: 1,
    })

    return response.result.files?.[0] || null
  }

  // Criar arquivo no Google Drive
  private async createFile(fileName: string, content: string): Promise<void> {
    const boundary = "-------314159265358979323846"
    const delimiter = "\r\n--" + boundary + "\r\n"
    const close_delim = "\r\n--" + boundary + "--"

    const metadata = {
      name: fileName,
      parents: [], // Salva na raiz
    }

    const multipartRequestBody =
      delimiter +
      "Content-Type: application/json\r\n\r\n" +
      JSON.stringify(metadata) +
      delimiter +
      "Content-Type: application/json\r\n\r\n" +
      content +
      close_delim

    await this.gapi.client.request({
      path: "https://www.googleapis.com/upload/drive/v3/files",
      method: "POST",
      params: { uploadType: "multipart" },
      headers: {
        "Content-Type": 'multipart/related; boundary="' + boundary + '"',
      },
      body: multipartRequestBody,
    })
  }

  // Atualizar arquivo existente
  private async updateFile(fileId: string, content: string): Promise<void> {
    const boundary = "-------314159265358979323846"
    const delimiter = "\r\n--" + boundary + "\r\n"
    const close_delim = "\r\n--" + boundary + "--"

    const multipartRequestBody =
      delimiter +
      "Content-Type: application/json\r\n\r\n" +
      delimiter +
      "Content-Type: application/json\r\n\r\n" +
      content +
      close_delim

    await this.gapi.client.request({
      path: "https://www.googleapis.com/upload/drive/v3/files/" + fileId,
      method: "PATCH",
      params: { uploadType: "multipart" },
      headers: {
        "Content-Type": 'multipart/related; boundary="' + boundary + '"',
      },
      body: multipartRequestBody,
    })
  }

  // Baixar arquivo do Google Drive
  private async downloadFile(fileId: string): Promise<string> {
    const response = await this.gapi.client.drive.files.get({
      fileId: fileId,
      alt: "media",
    })

    return response.body
  }

  // Listar backups disponíveis
  async listBackups(): Promise<any[]> {
    if (!this.isSignedIn()) return []

    try {
      const response = await this.gapi.client.drive.files.list({
        q: "name contains 'financial-backup' and trashed=false",
        orderBy: "modifiedTime desc",
        pageSize: 10,
        fields: "files(id,name,modifiedTime,size)",
      })

      return response.result.files || []
    } catch (error) {
      console.error("❌ Erro ao listar backups:", error)
      return []
    }
  }
}

export const googleDriveManager = GoogleDriveManager.getInstance()
