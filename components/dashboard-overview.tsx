"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  PiggyBank,
  Target,
  Calendar,
  AlertTriangle,
} from "lucide-react"

export function DashboardOverview() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(15420.5)}</div>
            <p className="text-xs text-green-100">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12.5% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(8500.0)}</div>
            <p className="text-xs text-blue-100">Meta: {formatCurrency(8000.0)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos do Mês</CardTitle>
            <TrendingDown className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(6250.3)}</div>
            <p className="text-xs text-red-100">
              <TrendingDown className="inline h-3 w-3 mr-1" />
              -5.2% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Economia</CardTitle>
            <PiggyBank className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(2249.7)}</div>
            <p className="text-xs text-yellow-100">26.5% da receita mensal</p>
          </CardContent>
        </Card>
      </div>

      {/* Metas e Progresso */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Metas Financeiras
            </CardTitle>
            <CardDescription>Progresso das suas metas mensais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Meta de Economia</span>
                <span>
                  {formatCurrency(2249.7)} / {formatCurrency(3000.0)}
                </span>
              </div>
              <Progress value={75} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">75% concluído</p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Limite de Gastos</span>
                <span>
                  {formatCurrency(6250.3)} / {formatCurrency(7000.0)}
                </span>
              </div>
              <Progress value={89} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">89% utilizado</p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Reserva de Emergência</span>
                <span>
                  {formatCurrency(8500.0)} / {formatCurrency(15000.0)}
                </span>
              </div>
              <Progress value={57} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">57% concluído</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Cartões de Crédito
            </CardTitle>
            <CardDescription>Resumo dos seus cartões</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Nubank</p>
                <p className="text-sm text-muted-foreground">**** 1234</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(1250.0)}</p>
                <Badge variant="secondary">Limite: {formatCurrency(5000.0)}</Badge>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Itaú</p>
                <p className="text-sm text-muted-foreground">**** 5678</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(850.5)}</p>
                <Badge variant="secondary">Limite: {formatCurrency(3000.0)}</Badge>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Bradesco</p>
                <p className="text-sm text-muted-foreground">**** 9012</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(420.8)}</p>
                <Badge variant="secondary">Limite: {formatCurrency(2500.0)}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transações Recentes e Alertas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Transações Recentes
            </CardTitle>
            <CardDescription>Últimas movimentações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Salário</p>
                <p className="text-sm text-muted-foreground">Hoje</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-green-600">+{formatCurrency(5500.0)}</p>
                <Badge variant="outline">Receita</Badge>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Supermercado</p>
                <p className="text-sm text-muted-foreground">Ontem</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-red-600">-{formatCurrency(245.8)}</p>
                <Badge variant="outline">Alimentação</Badge>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Combustível</p>
                <p className="text-sm text-muted-foreground">2 dias atrás</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-red-600">-{formatCurrency(120.0)}</p>
                <Badge variant="outline">Transporte</Badge>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Freelance</p>
                <p className="text-sm text-muted-foreground">3 dias atrás</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-green-600">+{formatCurrency(800.0)}</p>
                <Badge variant="outline">Receita Extra</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Alertas e Lembretes
            </CardTitle>
            <CardDescription>Itens que precisam da sua atenção</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Fatura do cartão vence em 3 dias</p>
                <p className="text-sm text-yellow-600">Nubank - {formatCurrency(1250.0)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">Transação recorrente hoje</p>
                <p className="text-sm text-blue-600">Aluguel - {formatCurrency(1200.0)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <Target className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">Meta de economia quase atingida!</p>
                <p className="text-sm text-green-600">Faltam apenas {formatCurrency(750.3)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Limite de gastos próximo</p>
                <p className="text-sm text-red-600">89% do orçamento mensal utilizado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
