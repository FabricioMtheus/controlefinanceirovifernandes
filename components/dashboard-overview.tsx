"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, CreditCard, PiggyBank, AlertTriangle } from 'lucide-react'
import { useFinance } from "@/lib/finance-context"
import { formatCurrency } from "@/lib/currency-formatter"

export function DashboardOverview() {
  const { accounts, transactions, categories, creditCards } = useFinance()

  // Calcular saldo total das contas
  const totalAccountBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

  // Separar transações efetivadas e pendentes
  const effectiveTransactions = transactions.filter(t => t.efetivada)
  const pendingTransactions = transactions.filter(t => !t.efetivada)

  // Calcular receitas e despesas efetivadas
  const effectiveIncome = effectiveTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const effectiveExpenses = effectiveTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  // Calcular receitas e despesas pendentes
  const pendingIncome = pendingTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const pendingExpenses = pendingTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  // Saldo total real (considerando apenas transações efetivadas)
  const totalBalance = totalAccountBalance + effectiveIncome - effectiveExpenses

  // Economia (receitas - despesas efetivadas)
  const savings = effectiveIncome - effectiveExpenses

  // Saldo projetado (incluindo pendentes)
  const projectedBalance = totalBalance + pendingIncome - pendingExpenses

  // Estatísticas dos cartões de crédito
  const totalCreditLimit = creditCards.reduce((sum, card) => sum + card.limit, 0)
  const totalCreditUsed = creditCards.reduce((sum, card) => sum + card.currentBalance, 0)
  const totalCreditAvailable = totalCreditLimit - totalCreditUsed

  // Transações recentes (últimas 5)
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  // Categorias com mais gastos
  const expensesByCategory = categories.map(category => {
    const categoryExpenses = effectiveTransactions
      .filter(t => t.type === 'expense' && t.categoryId === category.id)
      .reduce((sum, t) => sum + t.amount, 0)
    
    return {
      ...category,
      totalExpenses: categoryExpenses
    }
  }).sort((a, b) => b.totalExpenses - a.totalExpenses)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Saldo Total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalBalance)}
            </div>
            {projectedBalance !== totalBalance && (
              <p className="text-xs text-muted-foreground">
                Projetado: {formatCurrency(projectedBalance)}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Receitas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(effectiveIncome)}
            </div>
            {pendingIncome > 0 && (
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">
                  Pendente: {formatCurrency(pendingIncome)}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Despesas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(effectiveExpenses)}
            </div>
            {pendingExpenses > 0 && (
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">
                  Pendente: {formatCurrency(pendingExpenses)}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Economia */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Economia</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(savings)}
            </div>
            <p className="text-xs text-muted-foreground">
              {savings >= 0 ? 'Você está economizando!' : 'Gastos excedem receitas'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Resumo de Contas */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Contas</CardTitle>
            <CardDescription>Saldo por conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {accounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma conta cadastrada</p>
            ) : (
              accounts.map((account) => (
                <div key={account.id} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{account.name}</span>
                  <span className={`text-sm font-bold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(account.balance)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Cartões de Crédito */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Cartões de Crédito
            </CardTitle>
            <CardDescription>Limite disponível</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Limite Total:</span>
                <span className="font-medium">{formatCurrency(totalCreditLimit)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Usado:</span>
                <span className="font-medium text-red-600">{formatCurrency(totalCreditUsed)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Disponível:</span>
                <span className="font-medium text-green-600">{formatCurrency(totalCreditAvailable)}</span>
              </div>
            </div>
            {creditCards.length > 0 && (
              <div className="space-y-2">
                {creditCards.map((card) => {
                  const usagePercentage = (card.currentBalance / card.limit) * 100
                  return (
                    <div key={card.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{card.name}</span>
                        <span>{usagePercentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            usagePercentage > 80 ? 'bg-red-500' : 
                            usagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transações Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>Últimas 5 transações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma transação encontrada</p>
            ) : (
              recentTransactions.map((transaction) => {
                const category = categories.find(c => c.id === transaction.categoryId)
                return (
                  <div key={transaction.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{transaction.description}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString('pt-BR')}
                        </p>
                        {category && (
                          <Badge variant="outline" className="text-xs">
                            {category.name}
                          </Badge>
                        )}
                        {!transaction.efetivada && (
                          <Badge variant="outline" className="text-xs text-orange-600">
                            Pendente
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Avisos */}
      {(pendingTransactions.length > 0 || creditCards.some(card => (card.currentBalance / card.limit) > 0.8)) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-4 w-4" />
              Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingTransactions.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-orange-600">
                  {pendingTransactions.length} transação(ões) pendente(s)
                </Badge>
                <span className="text-sm text-orange-700">
                  Total: {formatCurrency(pendingIncome - pendingExpenses)}
                </span>
              </div>
            )}
            {creditCards.filter(card => (card.currentBalance / card.limit) > 0.8).map(card => (
              <div key={card.id} className="flex items-center gap-2">
                <Badge variant="outline" className="text-red-600">
                  Cartão {card.name}
                </Badge>
                <span className="text-sm text-red-700">
                  {((card.currentBalance / card.limit) * 100).toFixed(1)}% do limite usado
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Top Categorias de Gastos */}
      {expensesByCategory.filter(c => c.totalExpenses > 0).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Principais Categorias de Gastos</CardTitle>
            <CardDescription>Categorias com maiores despesas efetivadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expensesByCategory
                .filter(category => category.totalExpenses > 0)
                .slice(0, 5)
                .map((category) => (
                  <div key={category.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <span className="text-sm font-bold text-red-600">
                      {formatCurrency(category.totalExpenses)}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
