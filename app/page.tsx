import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardOverview } from "@/components/dashboard-overview"
import { AccountsManager } from "@/components/accounts-manager"
import { TransactionsManager } from "@/components/transactions-manager"
import { CreditCardManager } from "@/components/credit-card-manager"
import { CategoriesManager } from "@/components/categories-manager"
import { RecurringTransactions } from "@/components/recurring-transactions"
import { PendingTransactions } from "@/components/pending-transactions"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { DataManager } from "@/components/data-manager"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Controle Financeiro</h1>
          <p className="text-green-600">Gerencie suas finanças de forma inteligente</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-9 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="overview" className="text-xs">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="accounts" className="text-xs">
              Contas
            </TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs">
              Transações
            </TabsTrigger>
            <TabsTrigger value="cards" className="text-xs">
              Cartões
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-xs">
              Categorias
            </TabsTrigger>
            <TabsTrigger value="recurring" className="text-xs">
              Recorrentes
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs">
              Pendentes
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs">
              Análises
            </TabsTrigger>
            <TabsTrigger value="data" className="text-xs">
              Dados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="accounts">
            <AccountsManager />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionsManager />
          </TabsContent>

          <TabsContent value="cards">
            <CreditCardManager />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesManager />
          </TabsContent>

          <TabsContent value="recurring">
            <RecurringTransactions />
          </TabsContent>

          <TabsContent value="pending">
            <PendingTransactions />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsCharts />
          </TabsContent>

          <TabsContent value="data">
            <DataManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
