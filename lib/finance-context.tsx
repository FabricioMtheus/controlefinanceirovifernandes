"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { cleanApiClient } from "@/lib/api-clean"

// Types
export interface Account {
  id: string
  name: string
  type: string
  balance: number
  initial_balance: number
  color: string
  icon: string
  notes?: string
}

export interface Category {
  id: string
  name: string
  type: string
  color: string
  icon: string
}

export interface Transaction {
  id: string
  description: string
  amount: number
  date: string
  category_id: string
  account_id: string
  notes?: string
  efetivada: boolean // Novo campo para indicar se a transação foi efetivada
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

export interface CreditCard {
  id: string
  name: string
  limit: number
  closing_day: number
  due_day: number
  color: string
  icon: string
  notes?: string
}

interface FinanceContextType {
  // Data
  accounts: Account[]
  categories: Category[]
  transactions: Transaction[]
  pendingTransactions: PendingTransaction[]
  creditCards: CreditCard[]

  // Loading states
  isLoading: boolean

  // Account methods
  addAccount: (account: Account) => void
  updateAccount: (account: Account) => void
  deleteAccount: (id: string) => void

  // Category methods
  addCategory: (category: Category) => void
  updateCategory: (category: Category) => void
  deleteCategory: (id: string) => void

  // Transaction methods
  addTransaction: (transaction: Transaction) => void
  updateTransaction: (transaction: Transaction) => void
  deleteTransaction: (id: string) => void

  // Pending transaction methods
  addPendingTransaction: (transaction: PendingTransaction) => void
  updatePendingTransaction: (transaction: PendingTransaction) => void
  deletePendingTransaction: (id: string) => void

  // Credit card methods
  addCreditCard: (card: CreditCard) => void
  updateCreditCard: (card: CreditCard) => void
  deleteCreditCard: (id: string) => void

  // Utility methods
  refreshData: () => Promise<void>
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export function useFinance() {
  const context = useContext(FinanceContext)
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider")
  }
  return context
}

interface FinanceProviderProps {
  children: ReactNode
}

export function FinanceProvider({ children }: FinanceProviderProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([])
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load all data
  const loadData = async () => {
    try {
      setIsLoading(true)
      const data = await cleanApiClient.loadData()
      setAccounts(data.accounts || [])
      setCategories(data.categories || [])
      
      // Migrar transações antigas que não têm o campo efetivada
      const migratedTransactions = (data.transactions || []).map(transaction => ({
        ...transaction,
        efetivada: transaction.efetivada !== undefined ? transaction.efetivada : true
      }))
      setTransactions(migratedTransactions)
      
      setPendingTransactions(data.pending_transactions || [])
      setCreditCards(data.credit_cards || [])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Account methods
  const addAccount = (account: Account) => {
    const newAccounts = [...accounts, account]
    setAccounts(newAccounts)
    cleanApiClient.saveAccounts(newAccounts)
  }

  const updateAccount = (account: Account) => {
    const newAccounts = accounts.map((a) => (a.id === account.id ? account : a))
    setAccounts(newAccounts)
    cleanApiClient.saveAccounts(newAccounts)
  }

  const deleteAccount = (id: string) => {
    const newAccounts = accounts.filter((a) => a.id !== id)
    setAccounts(newAccounts)
    cleanApiClient.saveAccounts(newAccounts)
  }

  // Category methods
  const addCategory = (category: Category) => {
    const newCategories = [...categories, category]
    setCategories(newCategories)
    cleanApiClient.saveCategories(newCategories)
  }

  const updateCategory = (category: Category) => {
    const newCategories = categories.map((c) => (c.id === category.id ? category : c))
    setCategories(newCategories)
    cleanApiClient.saveCategories(newCategories)
  }

  const deleteCategory = (id: string) => {
    const newCategories = categories.filter((c) => c.id !== id)
    setCategories(newCategories)
    cleanApiClient.saveCategories(newCategories)
  }

  // Transaction methods
  const addTransaction = (transaction: Transaction) => {
    const newTransactions = [...transactions, transaction]
    setTransactions(newTransactions)
    cleanApiClient.saveTransactions(newTransactions)
  }

  const updateTransaction = (transaction: Transaction) => {
    const newTransactions = transactions.map((t) => (t.id === transaction.id ? transaction : t))
    setTransactions(newTransactions)
    cleanApiClient.saveTransactions(newTransactions)
  }

  const deleteTransaction = (id: string) => {
    const newTransactions = transactions.filter((t) => t.id !== id)
    setTransactions(newTransactions)
    cleanApiClient.saveTransactions(newTransactions)
  }

  // Pending transaction methods
  const addPendingTransaction = (transaction: PendingTransaction) => {
    const newPendingTransactions = [...pendingTransactions, transaction]
    setPendingTransactions(newPendingTransactions)
    cleanApiClient.savePendingTransactions(newPendingTransactions)
  }

  const updatePendingTransaction = (transaction: PendingTransaction) => {
    const newPendingTransactions = pendingTransactions.map((t) => (t.id === transaction.id ? transaction : t))
    setPendingTransactions(newPendingTransactions)
    cleanApiClient.savePendingTransactions(newPendingTransactions)
  }

  const deletePendingTransaction = (id: string) => {
    const newPendingTransactions = pendingTransactions.filter((t) => t.id !== id)
    setPendingTransactions(newPendingTransactions)
    cleanApiClient.savePendingTransactions(newPendingTransactions)
  }

  // Credit card methods
  const addCreditCard = (card: CreditCard) => {
    const newCreditCards = [...creditCards, card]
    setCreditCards(newCreditCards)
    cleanApiClient.saveCreditCards(newCreditCards)
  }

  const updateCreditCard = (card: CreditCard) => {
    const newCreditCards = creditCards.map((c) => (c.id === card.id ? card : c))
    setCreditCards(newCreditCards)
    cleanApiClient.saveCreditCards(newCreditCards)
  }

  const deleteCreditCard = (id: string) => {
    const newCreditCards = creditCards.filter((c) => c.id !== id)
    setCreditCards(newCreditCards)
    cleanApiClient.saveCreditCards(newCreditCards)
  }

  // Refresh data
  const refreshData = async () => {
    await loadData()
  }

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [])

  const value: FinanceContextType = {
    // Data
    accounts,
    categories,
    transactions,
    pendingTransactions,
    creditCards,

    // Loading state
    isLoading,

    // Account methods
    addAccount,
    updateAccount,
    deleteAccount,

    // Category methods
    addCategory,
    updateCategory,
    deleteCategory,

    // Transaction methods
    addTransaction,
    updateTransaction,
    deleteTransaction,

    // Pending transaction methods
    addPendingTransaction,
    updatePendingTransaction,
    deletePendingTransaction,

    // Credit card methods
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,

    // Utility methods
    refreshData,
  }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}
