// Sistema de persistência local
export class LocalStorageManager {
  private static instance: LocalStorageManager
  private storageKey = "financial-dashboard-data"

  static getInstance(): LocalStorageManager {
    if (!LocalStorageManager.instance) {
      LocalStorageManager.instance = new LocalStorageManager()
    }
    return LocalStorageManager.instance
  }

  // Estrutura padrão dos dados
  private getDefaultData() {
    return {
      accounts: [],
      transactions: [],
      credit_cards: [],
      categories: [],
      recurring_transactions: [],
      pending_transactions: [],
      lastUpdated: new Date().toISOString(),
      version: "1.0.0",
    }
  }

  // Carregar dados do localStorage
  loadData(): any {
    if (typeof window === "undefined") {
      return this.getDefaultData() // SSR safety
    }

    try {
      const stored = localStorage.getItem(this.storageKey)
      if (!stored) {
        console.log("📁 Nenhum dado local encontrado, usando dados padrão")
        return this.getDefaultData()
      }

      const data = JSON.parse(stored)
      console.log("📁 Dados carregados do localStorage:", {
        accounts: data.accounts?.length || 0,
        transactions: data.transactions?.length || 0,
        lastUpdated: data.lastUpdated,
      })

      return { ...this.getDefaultData(), ...data }
    } catch (error) {
      console.error("❌ Erro ao carregar dados locais:", error)
      return this.getDefaultData()
    }
  }

  // Salvar dados no localStorage
  saveData(data: any): void {
    if (typeof window === "undefined") return // SSR safety

    try {
      const dataToSave = {
        ...data,
        lastUpdated: new Date().toISOString(),
        version: "1.0.0",
      }

      localStorage.setItem(this.storageKey, JSON.stringify(dataToSave))
      console.log("💾 Dados salvos localmente:", {
        accounts: data.accounts?.length || 0,
        transactions: data.transactions?.length || 0,
        timestamp: dataToSave.lastUpdated,
      })
    } catch (error) {
      console.error("❌ Erro ao salvar dados locais:", error)
    }
  }

  // Exportar dados para download
  exportData(): string {
    const data = this.loadData()
    return JSON.stringify(data, null, 2)
  }

  // Importar dados de arquivo
  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString)
      this.saveData(data)
      console.log("📥 Dados importados com sucesso")
      return true
    } catch (error) {
      console.error("❌ Erro ao importar dados:", error)
      return false
    }
  }

  // Limpar todos os dados
  clearData(): void {
    if (typeof window === "undefined") return

    localStorage.removeItem(this.storageKey)
    console.log("🗑️ Dados locais removidos")
  }

  // Verificar se há dados salvos
  hasData(): boolean {
    if (typeof window === "undefined") return false
    return localStorage.getItem(this.storageKey) !== null
  }
}

export const localStorageManager = LocalStorageManager.getInstance()
