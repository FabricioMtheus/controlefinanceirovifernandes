import { localStorageManager } from "./local-storage"

export class ApiClient {
  private data: any

  constructor() {
    this.data = localStorageManager.loadData()
  }

  // Método para salvar dados após mudanças
  private saveData() {
    localStorageManager.saveData(this.data)
  }

  // Gerar ID único
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  async get<T>(endpoint: string): Promise<T[]> {
    // Simular delay de rede para UX
    await new Promise((resolve) => setTimeout(resolve, 100))

    if (!this.data[endpoint]) {
      this.data[endpoint] = []
      this.saveData()
    }

    return [...this.data[endpoint]] // Retorna cópia para evitar mutação
  }

  async getById<T>(endpoint: string, id: string): Promise<T> {
    await new Promise((resolve) => setTimeout(resolve, 50))

    const item = this.data[endpoint]?.find((item: any) => item.id === id)
    if (!item) {
      throw new Error(`Item ${id} not found in ${endpoint}`)
    }

    return { ...item } // Retorna cópia
  }

  async post<T>(endpoint: string, data: Omit<T, "id">): Promise<T> {
    await new Promise((resolve) => setTimeout(resolve, 100))

    if (!this.data[endpoint]) {
      this.data[endpoint] = []
    }

    const newItem = {
      id: this.generateId(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as T

    this.data[endpoint].push(newItem)
    this.saveData()

    return { ...newItem } // Retorna cópia
  }

  async put<T>(endpoint: string, id: string, data: Partial<T>): Promise<T> {
    await new Promise((resolve) => setTimeout(resolve, 100))

    if (!this.data[endpoint]) {
      throw new Error(`Endpoint ${endpoint} not found`)
    }

    const itemIndex = this.data[endpoint].findIndex((item: any) => item.id === id)
    if (itemIndex === -1) {
      throw new Error(`Item ${id} not found in ${endpoint}`)
    }

    this.data[endpoint][itemIndex] = {
      ...this.data[endpoint][itemIndex],
      ...data,
      updated_at: new Date().toISOString(),
    }

    this.saveData()

    return { ...this.data[endpoint][itemIndex] } // Retorna cópia
  }

  async delete(endpoint: string, id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100))

    if (!this.data[endpoint]) {
      throw new Error(`Endpoint ${endpoint} not found`)
    }

    const itemIndex = this.data[endpoint].findIndex((item: any) => item.id === id)
    if (itemIndex === -1) {
      throw new Error(`Item ${id} not found in ${endpoint}`)
    }

    this.data[endpoint].splice(itemIndex, 1)
    this.saveData()
  }

  // Métodos extras para gerenciamento de dados
  async exportData(): Promise<string> {
    return localStorageManager.exportData()
  }

  async importData(jsonString: string): Promise<boolean> {
    const success = localStorageManager.importData(jsonString)
    if (success) {
      this.data = localStorageManager.loadData()
    }
    return success
  }

  async clearAllData(): Promise<void> {
    localStorageManager.clearData()
    this.data = localStorageManager.loadData()
  }
}

export const apiClient = new ApiClient()
