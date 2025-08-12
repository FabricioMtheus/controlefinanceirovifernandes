"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Trash2, Edit, Plus, Building, CreditCard, PiggyBank, Wallet, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api"
import { CurrencyInput } from "@/components/ui/currency-input"

interface Account {
  id: string
  name: string
  type: "checking" | "savings" | "investment" | "cash"
  balance: number
  bank?: string
}

export function AccountsManager() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "checking" as Account["type"],
    balance: 0,
    bank: "",
  })

  const fetchAccounts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiClient.get<Account>("accounts")
      setAccounts(data)
    } catch (error) {
      console.error("Error fetching accounts:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getAccountIcon = (type: Account["type"]) => {
    switch (type) {
      case "checking":
        return <Building className="h-4 w-4" />
      case "savings":
        return <PiggyBank className="h-4 w-4" />
      case "investment":
        return <CreditCard className="h-4 w-4" />
      case "cash":
        return <Wallet className="h-4 w-4" />
    }
  }

  const getAccountTypeLabel = (type: Account["type"]) => {
    switch (type) {
      case "checking":
        return "Conta Corrente"
      case "savings":
        return "Poupança"
      case "investment":
        return "Investimento"
      case "cash":
        return "Dinheiro"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const accountData = {
      name: formData.name,
      type: formData.type,
      balance: formData.balance,
      bank: formData.bank || undefined,
    }

    try {
      if (editingAccount) {
        const updatedAccount = await apiClient.put<Account>("accounts", editingAccount.id, accountData)
        setAccounts(accounts.map((acc) => (acc.id === editingAccount.id ? updatedAccount : acc)))
      } else {
        const newAccount = await apiClient.post<Account>("accounts", accountData)
        setAccounts([newAccount, ...accounts])
      }
      resetForm()
    } catch (error) {
      console.error("Error saving account:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: "", type: "checking", balance: 0, bank: "" })
    setEditingAccount(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance,
      bank: account.bank || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta conta?")) {
      return
    }
    try {
      await apiClient.delete("accounts", id)
      setAccounts(accounts.filter((acc) => acc.id !== id))
    } catch (error) {
      console.error("Error deleting account:", error)
    }
  }

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-green-800">Gerenciar Contas</h2>
          <p className="text-green-600">Saldo total: {formatCurrency(totalBalance)}</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAccount ? "Editar Conta" : "Nova Conta"}</DialogTitle>
              <DialogDescription>
                {editingAccount
                  ? "Edite as informações da conta."
                  : "Adicione uma nova conta ao seu controle financeiro."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Conta</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Conta Corrente Principal"
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Tipo de Conta</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: Account["type"]) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Conta Corrente</SelectItem>
                    <SelectItem value="savings">Poupança</SelectItem>
                    <SelectItem value="investment">Investimento</SelectItem>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="balance">Saldo Atual</Label>
                <CurrencyInput
                  id="balance"
                  value={formData.balance}
                  onChange={(value) => setFormData({ ...formData, balance: value })}
                  placeholder="R$ 0,00"
                />
              </div>

              <div>
                <Label htmlFor="bank">Banco (opcional)</Label>
                <Input
                  id="bank"
                  value={formData.bank}
                  onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                  placeholder="Ex: Nubank, Itaú, Bradesco"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editingAccount ? "Salvar" : "Criar Conta"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <span className="ml-2 text-green-600">Carregando contas...</span>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <Card key={account.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getAccountIcon(account.type)}
                      <div>
                        <CardTitle className="text-lg">{account.name}</CardTitle>
                        <CardDescription>{account.bank}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">{getAccountTypeLabel(account.type)}</Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-2xl font-bold text-green-700">{formatCurrency(account.balance)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(account)} className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(account.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {accounts.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma conta cadastrada</h3>
                <p className="text-gray-500 mb-4">Comece adicionando sua primeira conta financeira.</p>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeira Conta
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
