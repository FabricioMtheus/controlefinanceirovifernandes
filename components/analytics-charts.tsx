"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Target, PieChart, BarChart3, Activity } from "lucide-react"

export function AnalyticsCharts() {
  // Mock data for analytics
  const monthlyData = [
    { month: "Jan", income: 8500, expenses: 6200, savings: 2300 },
    { month: "Fev", income: 8500, expenses: 5800, savings: 2700 },
    { month: "Mar", income: 9200, expenses: 6500, savings: 2700 },
    { month: "Abr", income: 8500, expenses: 6100, savings: 2400 },
    { month: "Mai", income: 8500, expenses: 5900, savings: 2600 },
    { month: "Jun", income: 8500, expenses: 6300, savings: 2200 },
  ]

  const expenseCategories = [
    { name: "Alimentação", amount: 1200, percentage: 25, color: "bg-red-500" },
    { name: "Transporte", amount: 800, percentage: 17, color: "bg-blue-500" },
    { name: "Moradia", amount: 1800, percentage: 38, color: "bg-green-500" },
    { name: "Entretenimento", amount: 400, percentage: 8, color: "bg-purple-500" },
    { name: "Outros", amount: 600, percentage: 12, color: "bg-orange-500" },
  ]

  const incomeCategories = [
    { name: "Salário", amount: 8500, percentage: 85, color: "bg-green-600" },
    { name: "Freelance", amount: 1200, percentage: 12, color: "bg-blue-600" },
    { name: "Investimentos", amount: 300, percentage: 3, color: "bg-purple-600" },
  ]

  const financialGoals = [
    { name: "Reserva de Emergência", target: 50000, current: 32000, progress: 64 },
    { name: "Viagem Europa", target: 15000, current: 8500, progress: 57 },
    { name: "Carro Novo", target: 80000, current: 25000, progress: 31 },
    { name: "Curso MBA", target: 25000, current: 18000, progress: 72 },
  ]

  const accountPerformance = [
    { name: "Conta Corrente", balance: 5420, transactions: 45, trend: "up" },
    { name: "Poupança", balance: 32000, transactions: 8, trend: "up" },
    { name: "Investimentos", balance: 25000, transactions: 12, trend: "up" },
    { name: "Cartão de Crédito", balance: -2340, transactions: 28, trend: "down" },
  ]

  const currentMonth = monthlyData[monthlyData.length - 1]
  const previousMonth = monthlyData[monthlyData.length - 2]
  const incomeChange = ((currentMonth.income - previousMonth.income) / previousMonth.income) * 100
  const expenseChange = ((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100
  const savingsChange = ((currentMonth.savings - previousMonth.savings) / previousMonth.savings) * 100

  const totalExpenses = expenseCategories.reduce((sum, cat) => sum + cat.amount, 0)
  const totalIncome = incomeCategories.reduce((sum, cat) => sum + cat.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-financial-primary mb-2">Análises Financeiras</h2>
        <p className="text-muted-foreground">Insights detalhados sobre seus padrões financeiros e desempenho</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Receita Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {currentMonth.income.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
            <div className={`flex items-center gap-1 text-xs ${incomeChange >= 0 ? "text-green-600" : "text-red-600"}`}>
              <TrendingUp className={`h-3 w-3 ${incomeChange < 0 ? "rotate-180" : ""}`} />
              {Math.abs(incomeChange).toFixed(1)}% vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Gastos Mensais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {currentMonth.expenses.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
            <div
              className={`flex items-center gap-1 text-xs ${expenseChange <= 0 ? "text-green-600" : "text-red-600"}`}
            >
              <TrendingDown className={`h-3 w-3 ${expenseChange < 0 ? "rotate-180" : ""}`} />
              {Math.abs(expenseChange).toFixed(1)}% vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Poupança Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {currentMonth.savings.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
            <div
              className={`flex items-center gap-1 text-xs ${savingsChange >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              <TrendingUp className={`h-3 w-3 ${savingsChange < 0 ? "rotate-180" : ""}`} />
              {Math.abs(savingsChange).toFixed(1)}% vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card className="border-financial-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-financial-primary" />
              Taxa de Poupança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-financial-primary">
              {((currentMonth.savings / currentMonth.income) * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Meta: 20% (Atingida!)</div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-financial-primary" />
            Tendência Mensal
          </CardTitle>
          <CardDescription>Evolução das receitas, gastos e poupança nos últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyData.map((month, index) => (
              <div key={month.month} className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>{month.month}</span>
                  <span>
                    Líquido:{" "}
                    {(month.income - month.expenses).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-green-600">Receita</span>
                      <span>{month.income.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                    </div>
                    <div className="w-full bg-green-100 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(month.income / 10000) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-red-600">Gastos</span>
                      <span>{month.expenses.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                    </div>
                    <div className="w-full bg-red-100 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(month.expenses / 10000) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-blue-600">Poupança</span>
                      <span>{month.savings.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(month.savings / 3000) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Analysis */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-red-600" />
              Distribuição de Gastos
            </CardTitle>
            <CardDescription>
              Total: {totalExpenses.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenseCategories.map((category, index) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${category.color}`} />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {category.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </div>
                      <div className="text-xs text-muted-foreground">{category.percentage}%</div>
                    </div>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-green-600" />
              Fontes de Receita
            </CardTitle>
            <CardDescription>
              Total: {totalIncome.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {incomeCategories.map((category, index) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${category.color}`} />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {category.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </div>
                      <div className="text-xs text-muted-foreground">{category.percentage}%</div>
                    </div>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-financial-primary" />
            Metas Financeiras
          </CardTitle>
          <CardDescription>Progresso das suas metas de longo prazo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {financialGoals.map((goal, index) => (
              <div key={goal.name} className="space-y-3 p-4 border border-border/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{goal.name}</h4>
                  <Badge variant={goal.progress >= 70 ? "default" : goal.progress >= 40 ? "secondary" : "outline"}>
                    {goal.progress}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Atual: {goal.current.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                    <span>Meta: {goal.target.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Faltam:{" "}
                    {(goal.target - goal.current).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Account Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-financial-primary" />
            Performance das Contas
          </CardTitle>
          <CardDescription>Resumo do desempenho de cada conta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {accountPerformance.map((account, index) => (
              <div key={account.name} className="space-y-2 p-4 border border-border/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{account.name}</h4>
                  <div
                    className={`flex items-center gap-1 ${account.trend === "up" ? "text-green-600" : "text-red-600"}`}
                  >
                    <TrendingUp className={`h-3 w-3 ${account.trend === "down" ? "rotate-180" : ""}`} />
                  </div>
                </div>
                <div className={`text-lg font-bold ${account.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {account.balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </div>
                <div className="text-xs text-muted-foreground">{account.transactions} transações este mês</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Financial Health Score */}
      <Card className="bg-gradient-to-r from-financial-secondary/30 to-financial-accent/20 border-financial-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-financial-primary" />
            Pontuação de Saúde Financeira
          </CardTitle>
          <CardDescription>Avaliação geral da sua situação financeira</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-financial-primary">87</div>
              <div className="text-sm text-muted-foreground">Pontuação Geral</div>
              <Badge className="bg-financial-primary text-white">Excelente</Badge>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-green-600">27%</div>
              <div className="text-sm text-muted-foreground">Taxa de Poupança</div>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Acima da Meta
              </Badge>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-blue-600">6.2</div>
              <div className="text-sm text-muted-foreground">Meses de Reserva</div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Saudável
              </Badge>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-orange-600">15%</div>
              <div className="text-sm text-muted-foreground">Uso do Crédito</div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                Controlado
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
