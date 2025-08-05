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
import { Trash2, Edit, Plus, Tag, TrendingUp, TrendingDown, Loader2 } from "lucide-react"


interface Category {
  id: string
  name: string
  type: "income" | "expense"
  color: string
  budget?: number | null
  spent?: number | null // Nullable to match DB
  user_id?: string // Add user_id for Supabase
}

export function CategoriesManager() {
  const supabase = createSupabaseBrowserClient()
  const [categories, setCategories] = useState<Category[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "expense" as Category["type"],
    color: "#ef4444",
    budget: "",
  })

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from("categories").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching categories:", error)
    } else {
      setCategories(data as Category[])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getBudgetPercentage = (spent: number, budget: number) => {
    if (budget === 0) return 0 // Avoid division by zero
    return Math.round((spent / budget) * 100)
  }

  const getBudgetStatus = (spent: number, budget: number) => {
    const percentage = getBudgetPercentage(spent, budget)
    if (percentage >= 100) return { color: "text-red-600", status: "Excedido" }
    if (percentage >= 80) return { color: "text-yellow-600", status: "Atenção" }
    return { color: "text-green-600", status: "No orçamento" }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const categoryData = {
      name: formData.name,
      type: formData.type,
      color: formData.color,
      budget: formData.budget ? Number.parseFloat(formData.budget) : null,
      spent: editingCategory?.spent || 0, // Keep existing spent or default to 0
    }

    if (editingCategory) {
      const { data, error } = await supabase
        .from("categories")
        .update(categoryData)
        .eq("id", editingCategory.id)
        .select()

      if (error) {
        console.error("Error updating category:", error)
      } else {
        setCategories(categories.map((cat) => (cat.id === editingCategory.id ? (data[0] as Category) : cat)))
      }
    } else {
      const { data, error } = await supabase.from("categories").insert(categoryData).select()

      if (error) {
        console.error("Error creating category:", error)
      } else {
        setCategories([data[0] as Category, ...categories])
      }
    }

    setSubmitting(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: "",
      type: "expense",
      color: "#ef4444",
      budget: "",
    })
    setEditingCategory(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color,
      budget: category.budget?.toString() || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta categoria?")) {
      return
    }
    const { error } = await supabase.from("categories").delete().eq("id", id)

    if (error) {
      console.error("Error deleting category:", error)
    } else {
      setCategories(categories.filter((cat) => cat.id !== id))
    }
  }

  const incomeCategories = categories.filter((cat) => cat.type === "income")
  const expenseCategories = categories.filter((cat) => cat.type === "expense")

  const totalIncomeBudget = incomeCategories.reduce((sum, cat) => sum + (cat.budget || 0), 0)
  const totalIncomeSpent = incomeCategories.reduce((sum, cat) => sum + (cat.spent || 0), 0)
  const totalExpenseBudget = expenseCategories.reduce((sum, cat) => sum + (cat.budget || 0), 0)
  const totalExpenseSpent = expenseCategories.reduce((sum, cat) => sum + (cat.spent || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-green-800">Categorias</h2>
          <div className="flex gap-4 text-sm">
            <span className="text-green-600">
              Receitas: {formatCurrency(totalIncomeSpent)} / {formatCurrency(totalIncomeBudget)}
            </span>
            <span className="text-red-600">
              Despesas: {formatCurrency(totalExpenseSpent)} / {formatCurrency(totalExpenseBudget)}
            </span>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? "Edite as informações da categoria."
                  : "Adicione uma nova categoria para organizar suas transações."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Categoria</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Alimentação, Transporte"
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: Category["type"]) => setFormData({ ...formData, type: value })}
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

              <div>
                <Label htmlFor="color">Cor</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#ef4444"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="budget">Orçamento Mensal (opcional)</Label>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="1000,00"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editingCategory ? "Salvar" : "Criar Categoria"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <span className="ml-2 text-green-600">Carregando categorias...</span>
        </div>
      ) : (
        <>
          {/* Categorias de Receita */}
          <div>
            <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Categorias de Receita
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {incomeCategories.map((category) => {
                const budgetStatus =
                  category.budget !== null &&
                  category.budget !== undefined &&
                  category.spent !== null &&
                  category.spent !== undefined
                    ? getBudgetStatus(category.spent, category.budget)
                    : null

                return (
                  <Card key={category.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                          <div>
                            <CardTitle className="text-lg">{category.name}</CardTitle>
                            {category.budget !== null && category.budget !== undefined && (
                              <CardDescription>Orçamento: {formatCurrency(category.budget)}</CardDescription>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary">Receita</Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {category.budget !== null &&
                        category.budget !== undefined &&
                        category.spent !== null &&
                        category.spent !== undefined && (
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Recebido</span>
                              <span className="font-medium">
                                {formatCurrency(category.spent)} / {formatCurrency(category.budget)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(getBudgetPercentage(category.spent, category.budget), 100)}%`,
                                  backgroundColor: category.color,
                                }}
                              />
                            </div>
                            {budgetStatus && (
                              <p className={`text-xs mt-1 ${budgetStatus.color}`}>
                                {getBudgetPercentage(category.spent, category.budget)}% • {budgetStatus.status}
                              </p>
                            )}
                          </div>
                        )}

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(category)} className="flex-1">
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
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
          </div>

          {/* Categorias de Despesa */}
          <div>
            <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Categorias de Despesa
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {expenseCategories.map((category) => {
                const budgetStatus =
                  category.budget !== null &&
                  category.budget !== undefined &&
                  category.spent !== null &&
                  category.spent !== undefined
                    ? getBudgetStatus(category.spent, category.budget)
                    : null

                return (
                  <Card key={category.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                          <div>
                            <CardTitle className="text-lg">{category.name}</CardTitle>
                            {category.budget !== null && category.budget !== undefined && (
                              <CardDescription>Orçamento: {formatCurrency(category.budget)}</CardDescription>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline">Despesa</Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {category.budget !== null &&
                        category.budget !== undefined &&
                        category.spent !== null &&
                        category.spent !== undefined && (
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Gasto</span>
                              <span className="font-medium">
                                {formatCurrency(category.spent)} / {formatCurrency(category.budget)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(getBudgetPercentage(category.spent, category.budget), 100)}%`,
                                  backgroundColor: category.color,
                                }}
                              />
                            </div>
                            {budgetStatus && (
                              <p className={`text-xs mt-1 ${budgetStatus.color}`}>
                                {getBudgetPercentage(category.spent, category.budget)}% • {budgetStatus.status}
                              </p>
                            )}
                          </div>
                        )}

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(category)} className="flex-1">
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
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
          </div>

          {categories.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Tag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma categoria cadastrada</h3>
                <p className="text-gray-500 mb-4">Comece criando categorias para organizar suas transações.</p>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Categoria
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
