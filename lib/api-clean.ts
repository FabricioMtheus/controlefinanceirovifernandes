import { localStorageManager } from "./local-storage"

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: "income" | "expense"
  category: string
  account: string
  credit_card?: string
  installments?: number
  current_installment?: number
  recurring?: boolean
  recurring_frequency?: "monthly" | "weekly" | "yearly"
  tags?: string[]
  notes?: string
  efetivada: boolean // Novo campo para indicar se a transação foi efetivada
}

export interface Account {
  id: string
  name: string
  type: "checking" | "savings" | "investment" | "cash"
  balance: number
  initial_balance: number
  bank?: string
  color: string
  icon: string
  notes?: string
}

export interface CreditCard {
  id: string
  name: string
  bank: string
  limit: number
  used: number
  due_date: number
  closing_date: number
  color: string
  icon: string
  notes?: string
}

export interface Category {
  id: string
  name: string
  type: "income" | "expense"
  color: string
  icon: string
  budget?: number
}

export interface PendingTransaction {
  id: string
  description: string
  amount: number
  due_date: string
  category_id: string
  account_id: string
  type: "income" | "expense"
  status: "pending" | "paid" | "canceled"
  notes?: string
}

export interface FinancialData {
  transactions: Transaction[]
  accounts: Account[]
  credit_cards: CreditCard[]
  categories: Category[]
  pending_transactions: PendingTransaction[]
  lastUpdated: string
}

class ApiClient {
  // Load all data
  async loadData(): Promise<FinancialData> {
    return localStorageManager.loadData()
  }

  // Save all data
  async saveData(data: FinancialData): Promise<boolean> {
    try {
      localStorageManager.saveData(data)
      return true
    } catch (error) {
      console.error("Error saving data:", error)
      return false
    }
  }

  // Clear all data
  async clearAllData(): Promise<boolean> {
    try {
      localStorageManager.clearData()
      return true
    } catch (error) {
      console.error("Error clearing data:", error)
      return false
    }
  }

  // REST-style methods for compatibility
  async get<T>(resource: string, id?: string): Promise<T[]> {
    const data = localStorageManager.loadData()

    switch (resource) {
      case "accounts":
        return (data.accounts || []) as T[]
      case "transactions":
        return (data.transactions || []) as T[]
      case "categories":
        return (data.categories || []) as T[]
      case "credit_cards":
        return (data.credit_cards || []) as T[]
      case "pending_transactions":
        return (data.pending_transactions || []) as T[]
      default:
        return []
    }
  }

  async post<T>(resource: string, item: Omit<T, "id">): Promise<T> {
    const data = localStorageManager.loadData()
    const newItem = {
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    } as T

    switch (resource) {
      case "accounts":
        data.accounts = [...(data.accounts || []), newItem as Account]
        break
      case "transactions":
        data.transactions = [...(data.transactions || []), newItem as Transaction]
        break
      case "categories":
        data.categories = [...(data.categories || []), newItem as Category]
        break
      case "credit_cards":
        data.credit_cards = [...(data.credit_cards || []), newItem as CreditCard]
        break
      case "pending_transactions":
        data.pending_transactions = [...(data.pending_transactions || []), newItem as PendingTransaction]
        break
    }

    data.lastUpdated = new Date().toISOString()
    localStorageManager.saveData(data)
    return newItem
  }

  async put<T>(resource: string, id: string, updates: Partial<T>): Promise<T | null> {
    const data = localStorageManager.loadData()
    let updated: T | null = null

    switch (resource) {
      case "accounts":
        const accountIndex = data.accounts?.findIndex((item) => item.id === id) ?? -1
        if (accountIndex !== -1 && data.accounts) {
          data.accounts[accountIndex] = { ...data.accounts[accountIndex], ...updates }
          updated = data.accounts[accountIndex] as T
        }
        break
      case "transactions":
        const transactionIndex = data.transactions?.findIndex((item) => item.id === id) ?? -1
        if (transactionIndex !== -1 && data.transactions) {
          data.transactions[transactionIndex] = { ...data.transactions[transactionIndex], ...updates }
          updated = data.transactions[transactionIndex] as T
        }
        break
      case "categories":
        const categoryIndex = data.categories?.findIndex((item) => item.id === id) ?? -1
        if (categoryIndex !== -1 && data.categories) {
          data.categories[categoryIndex] = { ...data.categories[categoryIndex], ...updates }
          updated = data.categories[categoryIndex] as T
        }
        break
      case "credit_cards":
        const cardIndex = data.credit_cards?.findIndex((item) => item.id === id) ?? -1
        if (cardIndex !== -1 && data.credit_cards) {
          data.credit_cards[cardIndex] = { ...data.credit_cards[cardIndex], ...updates }
          updated = data.credit_cards[cardIndex] as T
        }
        break
      case "pending_transactions":
        const pendingIndex = data.pending_transactions?.findIndex((item) => item.id === id) ?? -1
        if (pendingIndex !== -1 && data.pending_transactions) {
          data.pending_transactions[pendingIndex] = { ...data.pending_transactions[pendingIndex], ...updates }
          updated = data.pending_transactions[pendingIndex] as T
        }
        break
    }

    if (updated) {
      data.lastUpdated = new Date().toISOString()
      localStorageManager.saveData(data)
    }

    return updated
  }

  async delete(resource: string, id: string): Promise<boolean> {
    const data = localStorageManager.loadData()
    let deleted = false

    switch (resource) {
      case "accounts":
        const initialAccountsLength = data.accounts?.length || 0
        data.accounts = data.accounts?.filter((item) => item.id !== id) || []
        deleted = data.accounts.length < initialAccountsLength
        break
      case "transactions":
        const initialTransactionsLength = data.transactions?.length || 0
        data.transactions = data.transactions?.filter((item) => item.id !== id) || []
        deleted = data.transactions.length < initialTransactionsLength
        break
      case "categories":
        const initialCategoriesLength = data.categories?.length || 0
        data.categories = data.categories?.filter((item) => item.id !== id) || []
        deleted = data.categories.length < initialCategoriesLength
        break
      case "credit_cards":
        const initialCardsLength = data.credit_cards?.length || 0
        data.credit_cards = data.credit_cards?.filter((item) => item.id !== id) || []
        deleted = data.credit_cards.length < initialCardsLength
        break
      case "pending_transactions":
        const initialPendingLength = data.pending_transactions?.length || 0
        data.pending_transactions = data.pending_transactions?.filter((item) => item.id !== id) || []
        deleted = data.pending_transactions.length < initialPendingLength
        break
    }

    if (deleted) {
      data.lastUpdated = new Date().toISOString()
      localStorageManager.saveData(data)
    }

    return deleted
  }

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    const data = localStorageManager.loadData()
    return data.transactions || []
  }

  async saveTransactions(transactions: Transaction[]): Promise<boolean> {
    const data = localStorageManager.loadData()
    data.transactions = transactions
    data.lastUpdated = new Date().toISOString()
    localStorageManager.saveData(data)
    return true
  }

  async addTransaction(transaction: Omit<Transaction, "id">): Promise<Transaction> {
    return this.post<Transaction>("transactions", transaction)
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | null> {
    return this.put<Transaction>("transactions", id, updates)
  }

  async deleteTransaction(id: string): Promise<boolean> {
    return this.delete("transactions", id)
  }

  // Accounts
  async getAccounts(): Promise<Account[]> {
    const data = localStorageManager.loadData()
    return data.accounts || []
  }

  async saveAccounts(accounts: Account[]): Promise<boolean> {
    const data = localStorageManager.loadData()
    data.accounts = accounts
    data.lastUpdated = new Date().toISOString()
    localStorageManager.saveData(data)
    return true
  }

  async addAccount(account: Omit<Account, "id">): Promise<Account> {
    return this.post<Account>("accounts", account)
  }

  async updateAccount(id: string, updates: Partial<Account>): Promise<Account | null> {
    return this.put<Account>("accounts", id, updates)
  }

  async deleteAccount(id: string): Promise<boolean> {
    return this.delete("accounts", id)
  }

  // Credit Cards
  async getCreditCards(): Promise<CreditCard[]> {
    const data = localStorageManager.loadData()
    return data.credit_cards || []
  }

  async saveCreditCards(creditCards: CreditCard[]): Promise<boolean> {
    const data = localStorageManager.loadData()
    data.credit_cards = creditCards
    data.lastUpdated = new Date().toISOString()
    localStorageManager.saveData(data)
    return true
  }

  async addCreditCard(card: Omit<CreditCard, "id">): Promise<CreditCard> {
    return this.post<CreditCard>("credit_cards", card)
  }

  async updateCreditCard(id: string, updates: Partial<CreditCard>): Promise<CreditCard | null> {
    return this.put<CreditCard>("credit_cards", id, updates)
  }

  async deleteCreditCard(id: string): Promise<boolean> {
    return this.delete("credit_cards", id)
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const data = localStorageManager.loadData()
    return data.categories || []
  }

  async saveCategories(categories: Category[]): Promise<boolean> {
    const data = localStorageManager.loadData()
    data.categories = categories
    data.lastUpdated = new Date().toISOString()
    localStorageManager.saveData(data)
    return true
  }

  async addCategory(category: Omit<Category, "id">): Promise<Category> {
    return this.post<Category>("categories", category)
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    return this.put<Category>("categories", id, updates)
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.delete("categories", id)
  }

  // Pending Transactions
  async getPendingTransactions(): Promise<PendingTransaction[]> {
    const data = localStorageManager.loadData()
    return data.pending_transactions || []
  }

  async savePendingTransactions(pendingTransactions: PendingTransaction[]): Promise<boolean> {
    const data = localStorageManager.loadData()
    data.pending_transactions = pendingTransactions
    data.lastUpdated = new Date().toISOString()
    localStorageManager.saveData(data)
    return true
  }

  async addPendingTransaction(transaction: Omit<PendingTransaction, "id">): Promise<PendingTransaction> {
    return this.post<PendingTransaction>("pending_transactions", transaction)
  }

  async updatePendingTransaction(id: string, updates: Partial<PendingTransaction>): Promise<PendingTransaction | null> {
    return this.put<PendingTransaction>("pending_transactions", id, updates)
  }

  async deletePendingTransaction(id: string): Promise<boolean> {
    return this.delete("pending_transactions", id)
  }

  // Data Management
  async exportData(): Promise<string> {
    const data = localStorageManager.loadData()
    return JSON.stringify(data, null, 2)
  }

  async importData(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData) as FinancialData

      // Validate data structure
      if (typeof data !== "object" || data === null) {
        return false
      }

      // Ensure all required arrays exist
      const validatedData: FinancialData = {
        transactions: Array.isArray(data.transactions) ? data.transactions : [],
        accounts: Array.isArray(data.accounts) ? data.accounts : [],
        credit_cards: Array.isArray(data.credit_cards) ? data.credit_cards : [],
        categories: Array.isArray(data.categories) ? data.categories : [],
        pending_transactions: Array.isArray(data.pending_transactions) ? data.pending_transactions : [],
        lastUpdated: new Date().toISOString(),
      }

      localStorageManager.saveData(validatedData)
      return true
    } catch (error) {
      console.error("Error importing data:", error)
      return false
    }
  }
}

export const apiClient = new ApiClient()
export const cleanApiClient = apiClient // For backward compatibility
