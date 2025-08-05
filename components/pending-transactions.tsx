"use client"

import type React from "react"

import { useState } from "react"
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
import { Trash2, Edit, Plus, Clock, Check, X, AlertTriangle } from "lucide-react"

interface PendingTransaction {
  id: string
  description: string
  amount: number
  type: "income" | "expense"
  category: string
  account: string
  dueDate: string
  status: "pending" | "overdue" | "completed" | "cancelled"
  priority: "low" | "medium" | "high"
  notes?: string
  createdAt: string
}

export function PendingTransactions() {
  const [transactions, setTransactions] = useState<PendingTransaction[]>([
    {
      id: "1",
      description: "Fatura Cartão Nubank",
      amount: 1250.0,
      type: "expense",
      category: "Cartão de Crédito",
      account: "Conta Corrente Principal",
      dueDate: "2024-01-18",
      status: "pending",
      priority: "high",
      createdAt: "2024-01-10",
    },
    {
      id: "2",
      description: "Freelance - Projeto Website",
      amount: 2500.0,
      type: "income",
      category: "Receita Extra",
      account: "Conta Corrente Principal",
      dueDate: "2024-01-20",
      status: "pending",
      priority: "medium",
      createdAt: "2024-01-12",
    },
    {
      id: "3",
      description: "Conta de Internet",
      amount: 89.9,
      type: "expense",
      category: "Utilidades",
      account: "Conta Corrente Principal",
      dueDate: "2024-01-12",
      status: "overdue",
      priority: "high",
      createdAt: "2024-01-05",
    },
    {
      id: "4",
      description: "Reembolso Seguro Saúde",
      amount: 450.0,
      type: "income",
      category: "Reembolso",
      account: "Conta Corrente Principal",
      dueDate: "2024-01-25",
      status: "pending",
      priority: "low",
      createdAt: "2024-01-08",
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<PendingTransaction | null>(null)
  const [filterStatus, setFilterStatus] = useState<"all" | PendingTransaction["status"]>("all")
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense" as PendingTransaction["type"],
    category: "",
    account: "Conta Corrente Principal",
    dueDate: new Date().toISOString().split("T")[0],
    priority: "medium" as PendingTransaction["priority"],
    notes: "",
  })

  const categories = {
    income: ["Salário", "Receita Extra", "Reembolso", "Investimentos", "Outros"],
    expense: [
      "Cartão de Crédito",
      "Alimentação",
      "Transporte",
      "Moradia",
      "Utilidades",
      "Saúde",
      "Educação",
      "Lazer",
      "Outros",
    ],
  }

  const accounts = ["Conta Corrente Principal", "Poupança", "Investimentos", "Carteira"]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusColor = (status: PendingTransaction["status"]) => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: PendingTransaction["status"]) => {
    switch (status) {
      case "pending":
        return "Pendente"
      case "overdue":
        return "Atrasado"
      case "completed":
        return "Concluído"
      case "cancelled":
        return "Cancelado"
    }
  }

  const getPriorityColor = (priority: PendingTransaction["priority"]) => {
    switch (priority) {
      case "low":
        return "text-green-600"
      case "medium":
        return "text-yellow-600"
      case "high":
        return "text-red-600"
    }
  }

  const getPriorityLabel = (priority: PendingTransaction["priority"]) => {
    switch (priority) {
      case "low":
        return "Baixa"
      case "medium":
        return "Média"
      case "high":
        return "Alta"
    }
  }

  const filteredTransactions = transactions.filter((transaction) => {
    if (filterStatus === "all") return true
    return transaction.status === filterStatus
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const transactionData = {
      id: editingTransaction?.id || Date.now().toString(),
      description: formData.description,
      amount: Number.parseFloat(formData.amount) || 0,
      type: formData.type,
      category: formData.category,
      account: formData.account,
      dueDate: formData.dueDate,
      status: "pending" as PendingTransaction["status"],
      priority: formData.priority,
      notes: formData.notes || undefined,
      createdAt: editingTransaction?.createdAt || new Date().toISOString().split("T")[0],
    }

    if (editingTransaction) {
      setTransactions(transactions.map((t) => (t.id === editingTransaction.id ? transactionData : t)))
    } else {
      setTransactions([transactionData, ...transactions])
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      description: "",
      amount: "",
      type: "expense",
      category: "",
      account: "Conta Corrente Principal",
      dueDate: new Date().toISOString().split("T")[0],
      priority: "medium",
      notes: "",
    })
    setEditingTransaction(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (transaction: PendingTransaction) => {
    setEditingTransaction(transaction)
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      account: transaction.account,
      dueDate: transaction.dueDate,
      priority: transaction.priority,
      notes: transaction.notes || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id))
  }

  const handleStatusChange = (id: string, status: PendingTransaction["status"]) => {
    setTransactions(transactions.map((t) => (t.id === id ? { ...t, status } : t)))
  }

  const pendingCount = transactions.filter((t) => t.status === "pending").length
  const overdueCount = transactions.filter((t) => t.status === "overdue").length
  const completedCount = transactions.filter((t) => t.status === "completed").length

  const totalPendingAmount = transactions
    .filter((t) => t.status === "pending" || t.status === "overdue")
    .reduce((sum, t) => sum + (t.type === "expense" ? t.amount : -t.amount), 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-green-800">Transações Pendentes</h2>
          <div className="flex gap-4 text-sm">
            <span className="text-blue-600">Pendentes: {pendingCount}</span>
            <span className="text-red-600">Atrasadas: {overdueCount}</span>
            <span className="text-green-600">Concluídas: {completedCount}</span>
            <span className="text-orange-600">Impacto: {formatCurrency(totalPendingAmount)}</span>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Pendente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTransaction ? "Editar Transação Pendente" : "Nova Transação Pendente"}</DialogTitle>
              <DialogDescription>
                {editingTransaction
                  ? "Edite as informações da transação pendente."
                  : "Adicione uma nova transação pendente."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Fatura cartão, Freelance"
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
                    onValueChange={(value: PendingTransaction["type"]) =>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dueDate">Data de Vencimento</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: PendingTransaction["priority"]) =>
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingTransaction ? "Salvar" : "Criar"}
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
            <Label>Filtrar por status:</Label>
            <Select
              value={filterStatus}
              onValueChange={(value: "all" | PendingTransaction["status"]) => setFilterStatus(value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="overdue">Atrasados</SelectItem>
                <SelectItem value="completed">Concluídos</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Transações */}
      <div className="space-y-3">
        {filteredTransactions.map((transaction) => {
          const daysUntilDue = getDaysUntilDue(transaction.dueDate)
          const isOverdue = daysUntilDue < 0 && transaction.status === "pending"

          return (
            <Card
              key={transaction.id}
              className={`hover:shadow-md transition-shadow ${isOverdue ? "border-red-200" : ""}`}
            >
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Clock className={`h-5 w-5 ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{transaction.description}</p>
                        {isOverdue && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      </div>
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <span>{transaction.category}</span>
                        <span>•</span>
                        <span>{transaction.account}</span>
                        <span>•</span>
                        <span>Vence: {formatDate(transaction.dueDate)}</span>
                        {daysUntilDue >= 0 ? (
                          <span>({daysUntilDue === 0 ? "Hoje" : `${daysUntilDue} dias`})</span>
                        ) : (
                          <span className="text-red-600">({Math.abs(daysUntilDue)} dias atrasado)</span>
                        )}
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
                      <div className="flex gap-1 text-xs">
                        <Badge className={getStatusColor(transaction.status)}>
                          {getStatusLabel(transaction.status)}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(transaction.priority)}>
                          {getPriorityLabel(transaction.priority)}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      {transaction.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(transaction.id, "completed")}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Marcar como concluído"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(transaction.id, "cancelled")}
                            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                            title="Cancelar"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      )}
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

      {filteredTransactions.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filterStatus === "all"
                ? "Nenhuma transação pendente"
                : `Nenhuma transação ${getStatusLabel(filterStatus as PendingTransaction["status"]).toLowerCase()}`}
            </h3>
            <p className="text-gray-500 mb-4">
              {filterStatus === "all"
                ? "Comece adicionando transações que precisam de acompanhamento."
                : `Tente ajustar os filtros para ver outras transações.`}
            </p>
            {filterStatus === "all" && (
              <Button onClick={() => setIsDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeira Pendente
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
