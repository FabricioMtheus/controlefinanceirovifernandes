"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2, Edit, Plus, Calendar, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api"

interface CardDetails {
  id: string
  name: string
  last_four_digits: string // Changed to match Supabase column
  limit: number
  current_balance: number // Changed to match Supabase column
  due_date: number // Changed to match Supabase column
  closing_date: number // Changed to match Supabase column
  brand: string
  user_id?: string // Add user_id for Supabase
}

export function CreditCardManager() {
  const [cards, setCards] = useState<CardDetails[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<CardDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    last_four_digits: "",
    limit: "",
    current_balance: "",
    due_date: "",
    closing_date: "",
    brand: "",
  })

  const fetchCards = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiClient.get<CardDetails>("credit_cards")
      setCards(data)
    } catch (error) {
      console.error("Error fetching credit cards:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === 0) return 0 // Avoid division by zero
    return Math.round((current / limit) * 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 80) return "text-red-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-green-600"
  }

  const getDaysUntilDue = (dueDate: number) => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    const currentDay = today.getDate()

    let targetMonth = currentMonth
    let targetYear = currentYear

    if (dueDate < currentDay) {
      targetMonth += 1
      if (targetMonth > 11) {
        targetMonth = 0
        targetYear += 1
      }
    }

    const dueDateTime = new Date(targetYear, targetMonth, dueDate)
    // Set hours, minutes, seconds, milliseconds to 0 for accurate day calculation
    today.setHours(0, 0, 0, 0)
    dueDateTime.setHours(0, 0, 0, 0)

    const diffTime = dueDateTime.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const cardData = {
      name: formData.name,
      last_four_digits: formData.last_four_digits,
      limit: Number.parseFloat(formData.limit) || 0,
      current_balance: Number.parseFloat(formData.current_balance) || 0,
      due_date: Number.parseInt(formData.due_date) || 1,
      closing_date: Number.parseInt(formData.closing_date) || 1,
      brand: formData.brand,
    }

    try {
      if (editingCard) {
        const updatedCard = await apiClient.put<CardDetails>("credit_cards", editingCard.id, cardData)
        setCards(cards.map((card) => (card.id === editingCard.id ? updatedCard : card)))
      } else {
        const newCard = await apiClient.post<CardDetails>("credit_cards", cardData)
        setCards([newCard, ...cards])
      }
      resetForm()
    } catch (error) {
      console.error("Error saving card:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      last_four_digits: "",
      limit: "",
      current_balance: "",
      due_date: "",
      closing_date: "",
      brand: "",
    })
    setEditingCard(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (card: CardDetails) => {
    setEditingCard(card)
    setFormData({
      name: card.name,
      last_four_digits: card.last_four_digits,
      limit: card.limit.toString(),
      current_balance: card.current_balance.toString(),
      due_date: card.due_date.toString(),
      closing_date: card.closing_date.toString(),
      brand: card.brand,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este cartão?")) {
      return
    }

    try {
      await apiClient.delete("credit_cards", id)
      setCards(cards.filter((card) => card.id !== id))
    } catch (error) {
      console.error("Error deleting card:", error)
    }
  }

  const totalLimit = cards.reduce((sum, card) => sum + card.limit, 0)
  const totalUsed = cards.reduce((sum, card) => sum + card.current_balance, 0)
  const totalAvailable = totalLimit - totalUsed

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-green-800">Cartões de Crédito</h2>
          <div className="flex gap-4 text-sm">
            <span className="text-blue-600">Limite total: {formatCurrency(totalLimit)}</span>
            <span className="text-red-600">Usado: {formatCurrency(totalUsed)}</span>
            <span className="text-green-600">Disponível: {formatCurrency(totalAvailable)}</span>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Cartão
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCard ? "Editar Cartão" : "Novo Cartão"}</DialogTitle>
              <DialogDescription>
                {editingCard ? "Edite as informações do cartão." : "Adicione um novo cartão de crédito."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Cartão</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Nubank, Itaú"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="last_four_digits">Últimos 4 dígitos</Label>
                  <Input
                    id="last_four_digits"
                    value={formData.last_four_digits}
                    onChange={(e) => setFormData({ ...formData, last_four_digits: e.target.value })}
                    placeholder="1234"
                    maxLength={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="brand">Bandeira</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Visa, Mastercard"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="limit">Limite</Label>
                  <Input
                    id="limit"
                    type="number"
                    step="0.01"
                    value={formData.limit}
                    onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                    placeholder="5000,00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="current_balance">Saldo Atual</Label>
                  <Input
                    id="current_balance"
                    type="number"
                    step="0.01"
                    value={formData.current_balance}
                    onChange={(e) => setFormData({ ...formData, current_balance: e.target.value })}
                    placeholder="1250,00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="due_date">Dia do Vencimento</Label>
                  <Input
                    id="due_date"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    placeholder="15"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="closing_date">Dia do Fechamento</Label>
                  <Input
                    id="closing_date"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.closing_date}
                    onChange={(e) => setFormData({ ...formData, closing_date: e.target.value })}
                    placeholder="10"
                    required
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editingCard ? "Salvar" : "Criar Cartão"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <span className="ml-2 text-green-600">Carregando cartões...</span>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => {
              const usagePercentage = getUsagePercentage(card.current_balance, card.limit)
              const daysUntilDue = getDaysUntilDue(card.due_date)

              return (
                <Card key={card.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <div>
                          <CardTitle className="text-lg">{card.name}</CardTitle>
                          <CardDescription>
                            **** {card.last_four_digits} • {card.brand}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={daysUntilDue <= 3 && daysUntilDue >= 0 ? "destructive" : "secondary"}>
                        {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} dias atrasado` : `${daysUntilDue} dias`}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Usado</span>
                        <span className={getUsageColor(usagePercentage)}>
                          {formatCurrency(card.current_balance)} / {formatCurrency(card.limit)}
                        </span>
                      </div>
                      <Progress value={usagePercentage} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {usagePercentage}% utilizado • Disponível: {formatCurrency(card.limit - card.current_balance)}
                      </p>
                    </div>

                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Vencimento: dia {card.due_date}</span>
                      </div>
                      <span className="text-muted-foreground">Fecha: dia {card.closing_date}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(card)} className="flex-1">
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(card.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {cards.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cartão cadastrado</h3>
                <p className="text-gray-500 mb-4">Comece adicionando seu primeiro cartão de crédito.</p>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Cartão
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
