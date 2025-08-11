declare global {
  interface Window {
    gapi: any
    google: any
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
  private tokenClient: any = null
  private accessToken: string | null = null
  private credentialsAvailable = false
  private domainError = false
  private errorMessage = ""
  private initializationPromise: Promise<void> | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.initializationPromise = this.loadGoogleAPI().catch((error) => {
        console.warn("Google API initialization failed:", error)
        this.errorMessage = "Failed to initialize Google API"
      })
    }
  }

  private async loadGoogleAPI(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        console.warn("Window is not available")
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

      let scriptsLoaded = 0
      const totalScripts = 2

      const checkAllLoaded = () => {
        scriptsLoaded++
        if (scriptsLoaded === totalScripts) {
          this.initializeGAPI()
            .then(resolve)
            .catch(() => resolve())
        }
      }

      // Load Google API script
      if (!window.gapi) {
        const gapiScript = document.createElement("script")
        gapiScript.src = "https://apis.google.com/js/api.js"
        gapiScript.onload = () => {
          this.gapi = window.gapi
          checkAllLoaded()
        }
        gapiScript.onerror = () => {
          console.warn("Failed to load Google API script")
          this.errorMessage = "Failed to load Google API script"
          resolve()
        }
        document.head.appendChild(gapiScript)
      } else {
        this.gapi = window.gapi
        checkAllLoaded()
      }

      // Load Google Identity Services script
      if (!window.google) {
        const gisScript = document.createElement("script")
        gisScript.src = "https://accounts.google.com/gsi/client"
        gisScript.onload = checkAllLoaded
        gisScript.onerror = () => {
          console.warn("Failed to load Google Identity Services script")
          this.errorMessage = "Failed to load Google Identity Services script"
          resolve()
        }
        document.head.appendChild(gisScript)
      } else {
        checkAllLoaded()
      }
    })
  }

  private async initializeGAPI(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.gapi || !window.google) {
        console.warn("Google APIs not loaded")
        resolve()
        return
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY!
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!

      const currentOrigin = window.location.origin
      console.log("Initializing Google API for domain:", currentOrigin)

      const timeoutId = setTimeout(() => {
        console.warn("Google API initialization timed out")
        this.errorMessage = "Google API initialization timed out"
        resolve()
      }, 15000)

      this.gapi.load("client", {
        callback: async () => {
          clearTimeout(timeoutId)
          try {
            await this.gapi.client.init({
              apiKey: apiKey,
              discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
            })

            this.tokenClient = window.google.accounts.oauth2.initTokenClient({
              client_id: clientId,
              scope: "https://www.googleapis.com/auth/drive.file",
              callback: (response: any) => {
                if (response.error) {
                  console.error("Token client error:", response.error)
                  return
                }
                this.accessToken = response.access_token
                this.isSignedIn = true
                console.log("Google sign-in successful")
              },
            })

            this.isInitialized = true
            console.log("Google API initialized successfully with new Identity Services")
            resolve()
          } catch (error: any) {
            console.warn("Failed to initialize Google API:", error)
            this.errorMessage = "Failed to initialize Google API"
            resolve()
          }
        },
        onerror: (error: any) => {
          clearTimeout(timeoutId)
          console.warn("Failed to load Google API libraries:", error)
          this.errorMessage = "Failed to load Google API libraries"
          resolve()
        },
        timeout: 10000,
        ontimeout: () => {
          clearTimeout(timeoutId)
          console.warn("Google API loading timed out")
          this.errorMessage = "Google API loading timed out"
          resolve()
        },
      })
    })
  }

  async signIn(): Promise<boolean> {
    try {
      if (this.initializationPromise) {
        await this.initializationPromise
      }

      if (!this.credentialsAvailable) {
        throw new Error("Google Drive credentials not configured")
      }

      if (!this.isInitialized || !this.tokenClient) {
        await this.loadGoogleAPI()

        if (!this.credentialsAvailable) {
          throw new Error("Google Drive credentials not configured")
        }

        if (!this.tokenClient) {
          throw new Error("Google Auth not initialized")
        }
      }

      return new Promise((resolve, reject) => {
        try {
          this.tokenClient.callback = (response: any) => {
            if (response.error) {
              console.error("Sign-in error:", response.error)
              reject(new Error(`Sign-in failed: ${response.error}`))
              return
            }
            this.accessToken = response.access_token
            this.isSignedIn = true
            this.gapi.client.setToken({ access_token: this.accessToken })
            resolve(true)
          }

          this.tokenClient.requestAccessToken({ prompt: "consent" })
        } catch (error) {
          reject(error)
        }
      })
    } catch (error) {
      if (error instanceof Error && error.message.includes("popup_closed_by_user")) {
        throw new Error("Sign-in was cancelled by user")
      }
      throw error
    }
  }

  async signOut(): Promise<void> {
    try {
      if (!this.credentialsAvailable) {
        throw new Error("Google Auth not properly initialized")
      }

      if (this.accessToken && window.google) {
        window.google.accounts.oauth2.revoke(this.accessToken, () => {
          console.log("Google sign-out successful")
        })
      }

      this.accessToken = null
      this.isSignedIn = false
      this.gapi.client.setToken(null)
    } catch (error) {
      console.error("Google sign-out failed:", error)
      throw error
    }
  }

  getSignInStatus(): boolean {
    return this.credentialsAvailable && this.isSignedIn && !!this.accessToken
  }

  getErrorMessage(): string {
    return this.errorMessage
  }

  isDomainError(): boolean {
    return this.domainError
  }

  isGoogleDriveAvailable(): boolean {
    return this.credentialsAvailable && this.isInitialized
  }

  async uploadFile(fileName: string, content: string): Promise<string> {
    try {
      if (!this.credentialsAvailable) {
        throw new Error("Google Drive credentials not configured")
      }

      if (!this.isSignedIn || !this.accessToken) {
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

      if (!this.isSignedIn || !this.accessToken) {
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

      if (!this.isSignedIn || !this.accessToken) {
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

      if (!this.isSignedIn || !this.accessToken) {
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
