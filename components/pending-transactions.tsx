"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Calendar, Clock, DollarSign, Edit, Plus, Trash2, CheckCircle, XCircle } from "lucide-react"
import { useFinance } from "@/lib/finance-context"

export function PendingTransactions() {
  const {
    pendingTransactions,
    categories,
    accounts,
    addPendingTransaction,
    updatePendingTransaction,
    deletePendingTransaction,
    isLoading,
  } = useFinance()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    due_date: "",
    category_id: "",
    account_id: "",
    type: "expense" as "income" | "expense",
    status: "pending" as "pending" | "paid" | "canceled",
    notes: "",
  })

  const resetForm = () => {
    setFormData({
      description: "",
      amount: "",
      due_date: "",
      category_id: "",
      account_id: "",
      type: "expense",
      status: "pending",
      notes: "",
    })
    setEditingTransaction(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.description ||
      !formData.amount ||
      !formData.due_date ||
      !formData.category_id ||
      !formData.account_id
    ) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }

    try {
      const transactionData = {
        id: editingTransaction?.id || crypto.randomUUID(),
        description: formData.description,
        amount: Number.parseFloat(formData.amount),
        due_date: formData.due_date,
        category_id: formData.category_id,
        account_id: formData.account_id,
        type: formData.type,
        status: formData.status,
        notes: formData.notes,
      }

      if (editingTransaction) {
        updatePendingTransaction(transactionData)
      } else {
        addPendingTransaction(transactionData)
      }

      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Erro ao salvar transação pendente:", error)
      alert("Erro ao salvar transação pendente")
    }
  }

  const handleEdit = (transaction: any) => {
    if (!transaction || !transaction.id) {
      console.error("Transaction is invalid:", transaction)
      return
    }

    setEditingTransaction(transaction)
    setFormData({
      description: transaction.description || "",
      amount: Math.abs(transaction.amount || 0).toString(),
      due_date: transaction.due_date || "",
      category_id: transaction.category_id || "",
      account_id: transaction.account_id || "",
      type: transaction.type || "expense",
      status: transaction.status || "pending",
      notes: transaction.notes || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!id) {
      console.error("Invalid transaction ID")
      return
    }

    try {
      deletePendingTransaction(id)
    } catch (error) {
      console.error("Erro ao excluir transação pendente:", error)
      alert("Erro ao excluir transação pendente")
    }
  }

  const handleStatusChange = async (transaction: any, newStatus: "pending" | "paid" | "canceled") => {
    if (!transaction || !transaction.id) {
      console.error("Transaction is invalid:", transaction)
      alert("Erro: transação inválida")
      return
    }

    try {
      const updatedTransaction = {
        ...transaction,
        status: newStatus,
      }
      updatePendingTransaction(updatedTransaction)
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      alert("Erro ao atualizar status")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        )
      case "paid":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Pago
          </Badge>
        )
      case "canceled":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelado
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    return type === "income" ? (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        Receita
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800">
        Despesa
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Data inválida"
    try {
      return new Date(dateString).toLocaleDateString("pt-BR")
    } catch (error) {
      return "Data inválida"
    }
  }

  const getCategoryName = (categoryId: string) => {
    if (!categoryId) return "Categoria não definida"
    const category = categories.find((c) => c.id === categoryId)
    return category?.name || "Categoria não encontrada"
  }

  const getAccountName = (accountId: string) => {
    if (!accountId) return "Conta não definida"
    const account = accounts.find((a) => a.id === accountId)
    return account?.name || "Conta não encontrada"
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando transações pendentes...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Transações Pendentes</h2>
          <p className="text-muted-foreground">Gerencie suas contas a pagar e receber</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Transação Pendente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingTransaction ? "Editar Transação Pendente" : "Nova Transação Pendente"}</DialogTitle>
              <DialogDescription>
                {editingTransaction ? "Edite os dados da transação pendente" : "Adicione uma nova transação pendente"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Conta de luz"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor *</Label>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="due_date">Data de Vencimento *</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "income" | "expense") => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Despesa</SelectItem>
                      <SelectItem value="income">Receita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length > 0 ? (
                        categories
                          .filter((category) => category.type === formData.type)
                          .map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))
                      ) : (
                        <SelectItem value="no-categories" disabled>
                          Nenhuma categoria disponível
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account">Conta *</Label>
                  <Select
                    value={formData.account_id}
                    onValueChange={(value) => setFormData({ ...formData, account_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.length > 0 ? (
                        accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-accounts" disabled>
                          Nenhuma conta disponível
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "pending" | "paid" | "canceled") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="canceled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observações adicionais..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">{editingTransaction ? "Salvar Alterações" : "Adicionar Transação"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!pendingTransactions || pendingTransactions.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Nenhuma transação pendente encontrada</p>
              <p className="text-sm">Adicione uma nova transação pendente para começar</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingTransactions.map((transaction) => {
            if (!transaction || !transaction.id) {
              console.warn("Invalid transaction found:", transaction)
              return null
            }

            return (
              <Card key={transaction.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{transaction.description || "Sem descrição"}</h3>
                        {getTypeBadge(transaction.type || "expense")}
                        {getStatusBadge(transaction.status || "pending")}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span className={transaction.type === "income" ? "text-green-600" : "text-red-600"}>
                            {formatCurrency(transaction.amount || 0)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(transaction.due_date)}</span>
                        </div>
                        <div>
                          <span className="font-medium">Categoria:</span> {getCategoryName(transaction.category_id)}
                        </div>
                        <div>
                          <span className="font-medium">Conta:</span> {getAccountName(transaction.account_id)}
                        </div>
                      </div>
                      {transaction.notes && <p className="text-sm text-muted-foreground mt-2">{transaction.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {transaction.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(transaction, "paid")}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(transaction, "canceled")}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleEdit(transaction)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 bg-transparent"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir esta transação pendente? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(transaction.id)}>Excluir</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
