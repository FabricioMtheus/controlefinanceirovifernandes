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
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-800">Controle Financeiro Pessoal</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gerencie suas finanças de forma inteligente e organizada
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <div className="w-full overflow-x-auto">
            <TabsList className="grid w-full min-w-max grid-cols-8 sm:min-w-0">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="transactions" className="text-xs sm:text-sm">
                Transações
              </TabsTrigger>
              <TabsTrigger value="accounts" className="text-xs sm:text-sm">
                Contas
              </TabsTrigger>
              <TabsTrigger value="categories" className="text-xs sm:text-sm">
                Categorias
              </TabsTrigger>
              <TabsTrigger value="cards" className="text-xs sm:text-sm">
                Cartões
              </TabsTrigger>
              <TabsTrigger value="recurring" className="text-xs sm:text-sm">
                Recorrentes
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm">
                Análises
              </TabsTrigger>
              <TabsTrigger value="data" className="text-xs sm:text-sm">
                Dados
              </TabsTrigger>
            </TabsList>
          </div>

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
