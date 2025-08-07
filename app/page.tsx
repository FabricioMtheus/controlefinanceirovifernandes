"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardOverview } from "@/components/dashboard-overview"
import { TransactionsManager } from "@/components/transactions-manager"
import { AccountsManager } from "@/components/accounts-manager"
import { CategoriesManager } from "@/components/categories-manager"
import { CreditCardManager } from "@/components/credit-card-manager"
import { RecurringTransactions } from "@/components/recurring-transactions"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { DataManager } from "@/components/data-manager"
import { FinanceProvider } from "@/lib/finance-context"

export default function Home() {
  return (
    <FinanceProvider>
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-green-800">Controle Financeiro Pessoal</h1>
          <p className="text-muted-foreground">Gerencie suas finanças de forma inteligente e organizada</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="accounts">Contas</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="cards">Cartões</TabsTrigger>
            <TabsTrigger value="recurring">Recorrentes</TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
            <TabsTrigger value="data">Dados</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionsManager />
          </TabsContent>

          <TabsContent value="accounts">
            <AccountsManager />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesManager />
          </TabsContent>

          <TabsContent value="cards">
            <CreditCardManager />
          </TabsContent>

          <TabsContent value="recurring">
            <RecurringTransactions />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsCharts />
          </TabsContent>

          <TabsContent value="data">
            <DataManager />
          </TabsContent>
        </Tabs>
      </div>
    </FinanceProvider>
  )
}
