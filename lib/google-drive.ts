declare global {
  interface Window {
    gapi: any
  }
}

export interface GoogleDriveFile {
  id: string
  name: string
  createdTime: string
  modifiedTime: string
  size: string
}

export class GoogleDriveManager {
  private isInitialized = false
  private isSignedIn = false
  private gapi: any = null
  private auth2: any = null
  private credentialsAvailable = false
  private domainError = false
  private errorMessage = ""

  constructor() {
    if (typeof window !== "undefined") {
      this.loadGoogleAPI()
    }
  }

  private async loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") {
        reject(new Error("Window is not available"))
        return
      }

      // Check if script is already loaded
      if (window.gapi) {
        this.gapi = window.gapi
        this.initializeGAPI().then(resolve).catch(reject)
        return
      }

      // Load the Google API script
      const script = document.createElement("script")
      script.src = "https://apis.google.com/js/api.js"
      script.onload = () => {
        this.gapi = window.gapi
        this.initializeGAPI().then(resolve).catch(reject)
      }
      script.onerror = () => reject(new Error("Failed to load Google API script"))
      document.head.appendChild(script)
    })
  }

  private async initializeGAPI(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.gapi) {
        console.warn("Google API not loaded")
        resolve()
        return
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

      if (!apiKey || !clientId) {
        console.warn("Google API credentials not configured. Google Drive features will be disabled.")
        this.credentialsAvailable = false
        this.errorMessage = "Google API credentials not configured"
        resolve()
        return
      }

      this.credentialsAvailable = true

      this.gapi.load("client:auth2", {
        callback: async () => {
          try {
            await this.gapi.client.init({
              apiKey: apiKey,
              clientId: clientId,
              discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
              scope: "https://www.googleapis.com/auth/drive.file",
            })

            this.auth2 = this.gapi.auth2.getAuthInstance()

            if (this.auth2) {
              this.isInitialized = true
              try {
                this.isSignedIn = this.auth2.isSignedIn?.get() || false
              } catch (error) {
                this.isSignedIn = false
              }
              console.log("Google API initialized successfully")
              resolve()
            } else {
              console.error("Failed to get auth instance")
              this.errorMessage = "Failed to get Google auth instance"
              resolve()
            }
          } catch (error: any) {
            console.error("Failed to initialize Google API:", error)
            if (
              error?.error === "idpiframe_initialization_failed" ||
              (error?.details && error.details.includes("Not a valid origin"))
            ) {
              this.domainError = true
              this.errorMessage =
                "Domain not authorized for Google OAuth. Please add this domain to your Google Cloud Console."
            } else {
              this.errorMessage = "Failed to initialize Google API"
            }
            resolve()
          }
        },
        onerror: (error: any) => {
          console.error("Failed to load Google API libraries:", error)
          if (error?.error === "idpiframe_initialization_failed") {
            this.domainError = true
            this.errorMessage =
              "Domain not authorized for Google OAuth. Please add this domain to your Google Cloud Console."
          } else {
            this.errorMessage = "Failed to load Google API libraries"
          }
          resolve()
        },
      })
    })
  }

  async signIn(): Promise<boolean> {
    try {
      if (!this.credentialsAvailable) {
        throw new Error("Google Drive credentials not configured")
      }

      if (this.domainError) {
        throw new Error("Domain not authorized for Google OAuth. Please add this domain to your Google Cloud Console.")
      }

      if (!this.isInitialized) {
        await this.loadGoogleAPI()
        if (this.domainError) {
          throw new Error(
            "Domain not authorized for Google OAuth. Please add this domain to your Google Cloud Console.",
          )
        }
      }

      if (!this.auth2) {
        throw new Error("Google Auth not properly initialized")
      }

      if (this.auth2.isSignedIn?.get?.()) {
        this.isSignedIn = true
        return true
      }

      if (!this.auth2.signIn) {
        throw new Error("Google Auth signIn method not available")
      }

      const authResult = await this.auth2.signIn()
      this.isSignedIn = authResult?.isSignedIn?.() || false

      console.log("Google sign-in successful:", this.isSignedIn)
      return this.isSignedIn
    } catch (error) {
      console.error("Google sign-in failed:", error)
      throw error
    }
  }

  async signOut(): Promise<void> {
    try {
      if (!this.credentialsAvailable || !this.auth2?.signOut) {
        throw new Error("Google Auth not properly initialized")
      }

      await this.auth2.signOut()
      this.isSignedIn = false
      console.log("Google sign-out successful")
    } catch (error) {
      console.error("Google sign-out failed:", error)
      throw error
    }
  }

  getSignInStatus(): boolean {
    try {
      if (!this.credentialsAvailable) return false
      return this.auth2?.isSignedIn?.get?.() || false
    } catch (error) {
      console.error("Error getting sign-in status:", error)
      return false
    }
  }

  getErrorMessage(): string {
    return this.errorMessage
  }

  isDomainError(): boolean {
    return this.domainError
  }

  isGoogleDriveAvailable(): boolean {
    return this.credentialsAvailable && this.isInitialized && !this.domainError
  }

  async uploadFile(fileName: string, content: string): Promise<string> {
    try {
      if (!this.credentialsAvailable) {
        throw new Error("Google Drive credentials not configured")
      }

      if (!this.isSignedIn || !this.auth2) {
        throw new Error("Not signed in to Google Drive")
      }

      const boundary = "-------314159265358979323846"
      const delimiter = "\r\n--" + boundary + "\r\n"
      const close_delim = "\r\n--" + boundary + "--"

      const metadata = {
        name: fileName,
        parents: ["appDataFolder"],
      }

      const multipartRequestBody =
        delimiter +
        "Content-Type: application/json\r\n\r\n" +
        JSON.stringify(metadata) +
        delimiter +
        "Content-Type: application/json\r\n\r\n" +
        content +
        close_delim

      const request = this.gapi.client.request({
        path: "https://www.googleapis.com/upload/drive/v3/files",
        method: "POST",
        params: { uploadType: "multipart" },
        headers: {
          "Content-Type": 'multipart/related; boundary="' + boundary + '"',
        },
        body: multipartRequestBody,
      })

      const response = await request
      console.log("File uploaded successfully:", response.result.id)
      return response.result.id
    } catch (error) {
      console.error("Failed to upload file:", error)
      throw error
    }
  }

  async listFiles(): Promise<GoogleDriveFile[]> {
    try {
      if (!this.credentialsAvailable) {
        throw new Error("Google Drive credentials not configured")
      }

      if (!this.isSignedIn || !this.auth2) {
        throw new Error("Not signed in to Google Drive")
      }

      const response = await this.gapi.client.drive.files.list({
        q: "parents in 'appDataFolder' and name contains 'financial-backup'",
        fields: "files(id,name,createdTime,modifiedTime,size)",
        orderBy: "modifiedTime desc",
      })

      return response.result.files || []
    } catch (error) {
      console.error("Failed to list files:", error)
      throw error
    }
  }

  async downloadFile(fileId: string): Promise<string> {
    try {
      if (!this.credentialsAvailable) {
        throw new Error("Google Drive credentials not configured")
      }

      if (!this.isSignedIn || !this.auth2) {
        throw new Error("Not signed in to Google Drive")
      }

      const response = await this.gapi.client.drive.files.get({
        fileId: fileId,
        alt: "media",
      })

      return response.body
    } catch (error) {
      console.error("Failed to download file:", error)
      throw error
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      if (!this.credentialsAvailable) {
        throw new Error("Google Drive credentials not configured")
      }

      if (!this.isSignedIn || !this.auth2) {
        throw new Error("Not signed in to Google Drive")
      }

      await this.gapi.client.drive.files.delete({
        fileId: fileId,
      })

      console.log("File deleted successfully:", fileId)
    } catch (error) {
      console.error("Failed to delete file:", error)
      throw error
    }
  }
}

export const googleDriveManager = new GoogleDriveManager()
