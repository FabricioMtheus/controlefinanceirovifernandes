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
import { Switch } from "@/components/ui/switch"
import { Trash2, Edit, Plus, Repeat, Play, Pause, Loader2 } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

interface RecurringTransaction {
  id: string
  description: string
  amount: number
  type: "income" | "expense"
  category: string
  account: string
  frequency: "daily" | "weekly" | "monthly" | "yearly"
  day_of_month?: number | null // Changed to match DB column
  day_of_week?: number | null // Changed to match DB column
  start_date: string // Changed to match DB column
  end_date?: string | null // Changed to match DB column
  is_active: boolean // Changed to match DB column
  next_date: string // Changed to match DB column
  notes?: string | null
  user_id?: string // Add user_id for Supabase
}

export function RecurringTransactions() {
  const supabase = createSupabaseBrowserClient()
  const [transactions, setTransactions] = useState<RecurringTransaction[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense" as RecurringTransaction["type"],
    category: "",
    account: "Conta Corrente Principal",
    frequency: "monthly" as RecurringTransaction["frequency"],
    day_of_month: "",
    day_of_week: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    is_active: true,
    notes: "",
  })

  const categories = {
    income: ["Salário", "Receita Extra", "Investimentos", "Outros"],
    expense: ["Alimentação", "Transporte", "Moradia", "Utilidades", "Saúde", "Educação", "Lazer", "Outros"],
  }

  const accounts = ["Conta Corrente Principal", "Poupança", "Investimentos", "Carteira"]

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("recurring_transactions")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching recurring transactions:", error)
    } else {
      setTransactions(data as RecurringTransaction[])
    }
    setLoading(false)
  }, [supabase])

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

  const getFrequencyLabel = (frequency: RecurringTransaction["frequency"]) => {
    switch (frequency) {
      case "daily":
        return "Diário"
      case "weekly":
        return "Semanal"
      case "monthly":
        return "Mensal"
      case "yearly":
        return "Anual"
    }
  }

  const getDaysUntilNext = (nextDate: string) => {
    const today = new Date()
    const next = new Date(nextDate)
    today.setHours(0, 0, 0, 0)
    next.setHours(0, 0, 0, 0)
    const diffTime = next.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const transactionData = {
      description: formData.description,
      amount: Number.parseFloat(formData.amount) || 0,
      type: formData.type,
      category: formData.category,
      account: formData.account,
      frequency: formData.frequency,
      day_of_month:
        formData.frequency === "monthly" || formData.frequency === "yearly"
          ? Number.parseInt(formData.day_of_month) || null
          : null,
      day_of_week: formData.frequency === "weekly" ? Number.parseInt(formData.day_of_week) || null : null,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      is_active: formData.is_active,
      next_date: formData.start_date, // Simplified - would calculate based on frequency
      notes: formData.notes || null,
    }

    if (editingTransaction) {
      const { data, error } = await supabase
        .from("recurring_transactions")
        .update(transactionData)
        .eq("id", editingTransaction.id)
        .select()

      if (error) {
        console.error("Error updating recurring transaction:", error)
      } else {
        setTransactions(
          transactions.map((t) => (t.id === editingTransaction.id ? (data[0] as RecurringTransaction) : t)),
        )
      }
    } else {
      const { data, error } = await supabase.from("recurring_transactions").insert(transactionData).select()

      if (error) {
        console.error("Error creating recurring transaction:", error)
      } else {
        setTransactions([data[0] as RecurringTransaction, ...transactions])
      }
    }

    setSubmitting(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      description: "",
      amount: "",
      type: "expense",
      category: "",
      account: "Conta Corrente Principal",
      frequency: "monthly",
      day_of_month: "",
      day_of_week: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
      is_active: true,
      notes: "",
    })
    setEditingTransaction(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (transaction: RecurringTransaction) => {
    setEditingTransaction(transaction)
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      account: transaction.account,
      frequency: transaction.frequency,
      day_of_month: transaction.day_of_month?.toString() || "",
      day_of_week: transaction.day_of_week?.toString() || "",
      start_date: transaction.start_date,
      end_date: transaction.end_date || "",
      is_active: transaction.is_active,
      notes: transaction.notes || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta transação recorrente?")) {
      return
    }
    const { error } = await supabase.from("recurring_transactions").delete().eq("id", id)

    if (error) {
      console.error("Error deleting recurring transaction:", error)
    } else {
      setTransactions(transactions.filter((t) => t.id !== id))
    }
  }

  const toggleActive = async (id: string) => {
    const transaction = transactions.find((t) => t.id === id)
    if (!transaction) return

    const { data, error } = await supabase
      .from("recurring_transactions")
      .update({ is_active: !transaction.is_active })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error toggling transaction status:", error)
    } else {
      setTransactions(transactions.map((t) => (t.id === id ? (data[0] as RecurringTransaction) : t)))
    }
  }

  const activeTransactions = transactions.filter((t) => t.is_active)
  const inactiveTransactions = transactions.filter((t) => !t.is_active)

  const monthlyIncome = activeTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => {
      if (t.frequency === "monthly") return sum + t.amount
      if (t.frequency === "yearly") return sum + t.amount / 12
      if (t.frequency === "weekly") return sum + t.amount * 4.33
      if (t.frequency === "daily") return sum + t.amount * 30
      return sum
    }, 0)

  const monthlyExpenses = activeTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => {
      if (t.frequency === "monthly") return sum + t.amount
      if (t.frequency === "yearly") return sum + t.amount / 12
      if (t.frequency === "weekly") return sum + t.amount * 4.33
      if (t.frequency === "daily") return sum + t.amount * 30
      return sum
    }, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-green-800">Transações Recorrentes</h2>
          <div className="flex gap-4 text-sm">
            <span className="text-green-600">Receitas mensais: {formatCurrency(monthlyIncome)}</span>
            <span className="text-red-600">Despesas mensais: {formatCurrency(monthlyExpenses)}</span>
            <span className="text-blue-600">Saldo mensal: {formatCurrency(monthlyIncome - monthlyExpenses)}</span>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Recorrente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTransaction ? "Editar Transação Recorrente" : "Nova Transação Recorrente"}
              </DialogTitle>
              <DialogDescription>
                {editingTransaction
                  ? "Edite as informações da transação recorrente."
                  : "Configure uma nova transação recorrente."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Salário, Aluguel"
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
                    onValueChange={(value: RecurringTransaction["type"]) =>
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
                <Label htmlFor="frequency">Frequência</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value: RecurringTransaction["frequency"]) =>
                    setFormData({ ...formData, frequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(formData.frequency === "monthly" || formData.frequency === "yearly") && (
                <div>
                  <Label htmlFor="day_of_month">Dia do Mês</Label>
                  <Input
                    id="day_of_month"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.day_of_month}
                    onChange={(e) => setFormData({ ...formData, day_of_month: e.target.value })}
                    placeholder="15"
                    required
                  />
                </div>
              )}

              {formData.frequency === "weekly" && (
                <div>
                  <Label htmlFor="day_of_week">Dia da Semana</Label>
                  <Select
                    value={formData.day_of_week}
                    onValueChange={(value) => setFormData({ ...formData, day_of_week: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o dia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Domingo</SelectItem>
                      <SelectItem value="1">Segunda</SelectItem>
                      <SelectItem value="2">Terça</SelectItem>
                      <SelectItem value="3">Quarta</SelectItem>
                      <SelectItem value="4">Quinta</SelectItem>
                      <SelectItem value="5">Sexta</SelectItem>
                      <SelectItem value="6">Sábado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Data de Início</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">Data de Fim (opcional)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Ativo</Label>
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
                  {editingTransaction ? "Salvar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <span className="ml-2 text-green-600">Carregando transações recorrentes...</span>
        </div>
      ) : (
        <>
          {/* Transações Ativas */}
          <div>
            <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
              <Play className="h-5 w-5" />
              Transações Ativas ({activeTransactions.length})
            </h3>
            <div className="space-y-3">
              {activeTransactions.map((transaction) => {
                const daysUntilNext = getDaysUntilNext(transaction.next_date)

                return (
                  <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Repeat
                            className={`h-5 w-5 ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                          />
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <div className="flex gap-2 text-sm text-muted-foreground">
                              <span>{transaction.category}</span>
                              <span>•</span>
                              <span>{getFrequencyLabel(transaction.frequency)}</span>
                              <span>•</span>
                              <span>{transaction.account}</span>
                            </div>
                            {transaction.notes && (
                              <p className="text-sm text-muted-foreground mt-1">{transaction.notes}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p
                              className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                            >
                              {transaction.type === "income" ? "+" : "-"}
                              {formatCurrency(transaction.amount)}
                            </p>
                            <div className="flex gap-1 text-xs">
                              <Badge variant="outline">{getFrequencyLabel(transaction.frequency)}</Badge>
                              <Badge variant={daysUntilNext <= 3 ? "destructive" : "secondary"}>
                                {daysUntilNext <= 0 ? "Hoje" : `${daysUntilNext}d`}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleActive(transaction.id)}
                              className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                            >
                              <Pause className="h-3 w-3" />
                            </Button>
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
                )
              })}
            </div>
          </div>

          {/* Transações Inativas */}
          {inactiveTransactions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Pause className="h-5 w-5" />
                Transações Pausadas ({inactiveTransactions.length})
              </h3>
              <div className="space-y-3">
                {inactiveTransactions.map((transaction) => (
                  <Card key={transaction.id} className="hover:shadow-md transition-shadow opacity-60">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Repeat className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-600">{transaction.description}</p>
                            <div className="flex gap-2 text-sm text-muted-foreground">
                              <span>{transaction.category}</span>
                              <span>•</span>
                              <span>{getFrequencyLabel(transaction.frequency)}</span>
                              <span>•</span>
                              <span>{transaction.account}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-bold text-gray-500">
                              {transaction.type === "income" ? "+" : "-"}
                              {formatCurrency(transaction.amount)}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              Pausado
                            </Badge>
                          </div>

                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleActive(transaction.id)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Play className="h-3 w-3" />
                            </Button>
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
            </div>
          )}

          {transactions.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Repeat className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma transação recorrente</h3>
                <p className="text-gray-500 mb-4">Configure transações que se repetem automaticamente.</p>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Recorrente
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
