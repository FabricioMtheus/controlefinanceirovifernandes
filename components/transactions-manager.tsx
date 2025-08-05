"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Edit, Plus, ArrowUpCircle, ArrowDownCircle, Filter, Search, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api"

interface Transaction {
  id: string
  description: string
  amount: number
  type: "income" | "expense"
  category: string
  account: string
  transaction_date: string
  notes?: string
}

export function TransactionsManager() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all")
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense" as Transaction["type"],
    category: "",
    account: "Conta Corrente Principal",
    transaction_date: new Date().toISOString().split("T")[0],
    notes: "",
  })

  const categories = {
    income: ["Salário", "Receita Extra", "Investimentos", "Outros"],
    expense: ["Alimentação", "Transporte", "Moradia", "Utilidades", "Saúde", "Educação", "Lazer", "Outros"],
  }

  const accounts = ["Conta Corrente Principal", "Poupança", "Investimentos", "Carteira"]

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiClient.get<Transaction>("transactions")
      setTransactions(data)
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || transaction.type === filterType
    return matchesSearch && matchesType
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const transactionData = {
      description: formData.description,
      amount: Number.parseFloat(formData.amount) || 0,
      type: formData.type,
      category: formData.category,
      account: formData.account,
      transaction_date: formData.transaction_date,
      notes: formData.notes || undefined,
    }

    try {
      if (editingTransaction) {
        const updatedTransaction = await apiClient.put<Transaction>(
          "transactions",
          editingTransaction.id,
          transactionData,
        )
        setTransactions(transactions.map((t) => (t.id === editingTransaction.id ? updatedTransaction : t)))
      } else {
        const newTransaction = await apiClient.post<Transaction>("transactions", transactionData)
        setTransactions([newTransaction, ...transactions])
      }
      resetForm()
    } catch (error) {
      console.error("Error saving transaction:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      description: "",
      amount: "",
      type: "expense",
      category: "",
      account: "Conta Corrente Principal",
      transaction_date: new Date().toISOString().split("T")[0],
      notes: "",
    })
    setEditingTransaction(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      account: transaction.account,
      transaction_date: transaction.transaction_date,
      notes: transaction.notes || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta transação?")) {
      return
    }

    try {
      await apiClient.delete("transactions", id)
      setTransactions(transactions.filter((t) => t.id !== id))
    } catch (error) {
      console.error("Error deleting transaction:", error)
    }
  }

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpenses

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-green-800">Transações</h2>
          <div className="flex gap-4 text-sm">
            <span className="text-green-600">Receitas: {formatCurrency(totalIncome)}</span>
            <span className="text-red-600">Despesas: {formatCurrency(totalExpenses)}</span>
            <span className="text-blue-600">Saldo: {formatCurrency(balance)}</span>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTransaction ? "Editar Transação" : "Nova Transação"}</DialogTitle>
              <DialogDescription>
                {editingTransaction ? "Edite as informações da transação." : "Adicione uma nova transação."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Supermercado, Salário"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Valor</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0,00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: Transaction["type"]) =>
                      setFormData({ ...formData, type: value, category: "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories[formData.type].map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="account">Conta</Label>
                <Select
                  value={formData.account}
                  onValueChange={(value) => setFormData({ ...formData, account: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account} value={account}>
                        {account}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="transaction_date">Data</Label>
                <Input
                  id="transaction_date"
                  type="date"
                  value={formData.transaction_date}
                  onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observações adicionais..."
                  rows={2}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editingTransaction ? "Salvar" : "Criar Transação"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar transações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={(value: "all" | "income" | "expense") => setFilterType(value)}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="income">Receitas</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Transações */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <span className="ml-2 text-green-600">Carregando transações...</span>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {transaction.type === "income" ? (
                        <ArrowUpCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <ArrowDownCircle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          <span>{transaction.category}</span>
                          <span>•</span>
                          <span>{transaction.account}</span>
                          <span>•</span>
                          <span>{formatDate(transaction.transaction_date)}</span>
                        </div>
                        {transaction.notes && <p className="text-sm text-muted-foreground mt-1">{transaction.notes}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {transaction.type === "income" ? "Receita" : "Despesa"}
                        </Badge>
                      </div>

                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(transaction)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(transaction.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTransactions.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <ArrowUpCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filterType !== "all" ? "Nenhuma transação encontrada" : "Nenhuma transação cadastrada"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filterType !== "all"
                    ? "Tente ajustar os filtros de busca."
                    : "Comece adicionando sua primeira transação."}
                </p>
                {!searchTerm && filterType === "all" && (
                  <Button onClick={() => setIsDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeira Transação
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
