"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { TrendingUp, DollarSign, PieChartIcon, BarChart3, Activity } from "lucide-react"
import { useFinance } from "@/lib/finance-context"

export function AnalyticsCharts() {
  const { transactions, categories, accounts, loading } = useFinance()

  // Calculate monthly trends
  const monthlyTrends = useMemo(() => {
    if (!transactions.length) return []

    const monthlyData: { [key: string]: { income: number; expenses: number } } = {}

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 }
      }

      const category = categories.find((c) => c.id === transaction.category_id)
      if (category?.type === "income") {
        monthlyData[monthKey].income += transaction.amount
      } else {
        monthlyData[monthKey].expenses += transaction.amount
      }
    })

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // Last 6 months
      .map(([month, data]) => ({
        month: new Date(month + "-01").toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
        receitas: data.income,
        despesas: data.expenses,
      }))
  }, [transactions, categories])

  // Calculate expense distribution
  const expenseDistribution = useMemo(() => {
    if (!transactions.length || !categories.length) return []

    const categoryTotals: { [key: string]: number } = {}

    transactions.forEach((transaction) => {
      const category = categories.find((c) => c.id === transaction.category_id)
      if (category?.type === "expense") {
        categoryTotals[category.name] = (categoryTotals[category.name] || 0) + transaction.amount
      }
    })

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8) // Top 8 categories
  }, [transactions, categories])

  // Calculate income sources
  const incomeSources = useMemo(() => {
    if (!transactions.length || !categories.length) return []

    const categoryTotals: { [key: string]: number } = {}

    transactions.forEach((transaction) => {
      const category = categories.find((c) => c.id === transaction.category_id)
      if (category?.type === "income") {
        categoryTotals[category.name] = (categoryTotals[category.name] || 0) + transaction.amount
      }
    })

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [transactions, categories])

  // Calculate account performance
  const accountPerformance = useMemo(() => {
    if (!accounts.length) return []

    return accounts.map((account) => {
      const accountTransactions = transactions.filter((t) => t.account_id === account.id)
      const totalIncome = accountTransactions
        .filter((t) => {
          const category = categories.find((c) => c.id === t.category_id)
          return category?.type === "income"
        })
        .reduce((sum, t) => sum + t.amount, 0)

      const totalExpenses = accountTransactions
        .filter((t) => {
          const category = categories.find((c) => c.id === t.category_id)
          return category?.type === "expense"
        })
        .reduce((sum, t) => sum + t.amount, 0)

      return {
        name: account.name,
        saldo: account.balance,
        receitas: totalIncome,
        despesas: totalExpenses,
      }
    })
  }, [accounts, transactions, categories])

  // Calculate financial health scores
  const financialHealth = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => {
        const category = categories.find((c) => c.id === t.category_id)
        return category?.type === "income"
      })
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions
      .filter((t) => {
        const category = categories.find((c) => c.id === t.category_id)
        return category?.type === "expense"
      })
      .reduce((sum, t) => sum + t.amount, 0)

    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
    const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0
    const liquidityScore = totalBalance > 0 ? Math.min(100, (totalBalance / (totalExpenses / 12)) * 10) : 0

    return [
      { metric: "Taxa de Poupança", score: Math.max(0, Math.min(100, savingsRate)) },
      { metric: "Controle de Gastos", score: Math.max(0, 100 - expenseRatio) },
      { metric: "Liquidez", score: liquidityScore },
      { metric: "Diversificação", score: accounts.length > 1 ? 75 : 25 },
    ]
  }, [transactions, categories, accounts])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="text-center">Carregando dados...</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const hasData = transactions.length > 0 && categories.length > 0 && accounts.length > 0

  if (!hasData) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2 lg:col-span-3">
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Dados insuficientes para análise</p>
              <p>Adicione contas, categorias e transações para visualizar os gráficos de análise.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Análises Financeiras</h2>
        <p className="text-muted-foreground">Visualize seus dados financeiros e tendências</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Monthly Trends */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendências Mensais
            </CardTitle>
            <CardDescription>Receitas vs Despesas nos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyTrends.length > 0 ? (
              <ChartContainer
                config={{
                  receitas: {
                    label: "Receitas",
                    color: "hsl(var(--chart-1))",
                  },
                  despesas: {
                    label: "Despesas",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="receitas"
                      stroke="var(--color-receitas)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-receitas)" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="despesas"
                      stroke="var(--color-despesas)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-despesas)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Dados insuficientes para gráfico mensal
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Distribuição de Despesas
            </CardTitle>
            <CardDescription>Por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            {expenseDistribution.length > 0 ? (
              <ChartContainer config={{}} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expenseDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background border rounded-lg p-2 shadow-md">
                              <p className="font-medium">{payload[0].name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(payload[0].value as number)}
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhuma despesa encontrada
              </div>
            )}
          </CardContent>
        </Card>

        {/* Income Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Fontes de Receita
            </CardTitle>
            <CardDescription>Por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            {incomeSources.length > 0 ? (
              <div className="space-y-3">
                {incomeSources.map((source, index) => (
                  <div key={source.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium">{source.name}</span>
                    </div>
                    <span className="text-sm text-green-600 font-medium">{formatCurrency(source.value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Nenhuma receita encontrada
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Performance */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance das Contas
            </CardTitle>
            <CardDescription>Saldo, receitas e despesas por conta</CardDescription>
          </CardHeader>
          <CardContent>
            {accountPerformance.length > 0 ? (
              <ChartContainer
                config={{
                  saldo: {
                    label: "Saldo",
                    color: "hsl(var(--chart-1))",
                  },
                  receitas: {
                    label: "Receitas",
                    color: "hsl(var(--chart-2))",
                  },
                  despesas: {
                    label: "Despesas",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={accountPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="saldo" fill="var(--color-saldo)" />
                    <Bar dataKey="receitas" fill="var(--color-receitas)" />
                    <Bar dataKey="despesas" fill="var(--color-despesas)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhuma conta encontrada
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Saúde Financeira
            </CardTitle>
            <CardDescription>Indicadores de performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {financialHealth.map((item, index) => (
                <div key={item.metric} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.metric}</span>
                    <span
                      className={`font-medium ${
                        item.score >= 70 ? "text-green-600" : item.score >= 40 ? "text-yellow-600" : "text-red-600"
                      }`}
                    >
                      {item.score.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        item.score >= 70 ? "bg-green-500" : item.score >= 40 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{ width: `${Math.max(5, item.score)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
