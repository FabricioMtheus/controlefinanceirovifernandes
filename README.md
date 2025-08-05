# 💰 Controle Financeiro

Sistema completo de controle financeiro pessoal com **persistência local** e **sincronização Google Drive**.

## 🚀 Características

- ✅ **Armazenamento Local**: Dados salvos no navegador (localStorage)
- ✅ **Google Drive**: Sincronização automática na nuvem
- ✅ **Backup/Restore**: Múltiplas opções de backup
- ✅ **Offline First**: Funciona sem internet
- ✅ **Privacidade Total**: Você controla onde seus dados ficam
- ✅ **Auto-save**: Salva automaticamente a cada mudança

## 🌐 Deploy na Vercel

### Passo 1: Preparar o Código
1. Certifique-se que todos os arquivos estão no seu projeto
2. Crie um repositório no GitHub
3. Faça push do código

### Passo 2: Configurar Google Drive API
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **Google Drive API**
4. Vá em **Credenciais** → **Criar Credenciais** → **Chave de API**
5. Copie a **API Key**
6. Crie **ID do cliente OAuth 2.0**:
   - Tipo: Aplicação da Web
   - Origens JavaScript autorizadas: `https://seu-dominio.vercel.app`
   - Copie o **Client ID**

### Passo 3: Deploy na Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em **"New Project"**
4. Selecione seu repositório
5. Configure as **Environment Variables**:
   \`\`\`
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu_client_id_aqui
   NEXT_PUBLIC_GOOGLE_API_KEY=sua_api_key_aqui
   \`\`\`
6. Clique em **"Deploy"**

### Passo 4: Configurar Domínio no Google
1. Após o deploy, copie a URL da Vercel
2. Volte ao Google Cloud Console
3. Em **Credenciais** → **IDs do cliente OAuth 2.0**
4. Edite seu cliente OAuth
5. Adicione a URL da Vercel em **"Origens JavaScript autorizadas"**
6. Salve as alterações

## 📱 Como Usar

### Primeira Vez
1. Acesse seu site na Vercel
2. Comece adicionando contas e transações
3. Dados são salvos automaticamente no navegador

### Sincronização Google Drive
1. Vá na aba **"Dados"**
2. Clique em **"Conectar Google Drive"**
3. Autorize o acesso
4. Use **"Enviar para Nuvem"** para backup
5. Use **"Baixar da Nuvem"** para restaurar

## 🔧 Desenvolvimento Local

\`\`\`bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/financial-dashboard.git
cd financial-dashboard

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
# Crie arquivo .env.local:
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu_client_id
NEXT_PUBLIC_GOOGLE_API_KEY=sua_api_key

# 4. Execute localmente
npm run dev
\`\`\`

## 🛠️ Funcionalidades

- ✅ **Visão Geral**: Dashboard com resumo financeiro
- ✅ **Contas**: Gerenciamento de contas bancárias
- ✅ **Transações**: Controle completo de receitas/despesas
- ✅ **Cartões**: Gestão de cartões de crédito
- ✅ **Categorias**: Organização por categorias
- ✅ **Recorrentes**: Transações que se repetem
- ✅ **Pendentes**: Transações futuras/lembretes
- ✅ **Análises**: Relatórios e gráficos detalhados
- ✅ **Dados**: Backup, restore e sincronização

## 🔒 Privacidade & Segurança

### Dados Locais
- Salvos no localStorage do navegador
- Não saem do seu dispositivo
- Criptografados pelo navegador

### Google Drive
- Apenas você tem acesso
- Arquivos salvos na sua conta pessoal
- Pode revogar acesso a qualquer momento

### Sem Rastreamento
- Não usa cookies de rastreamento
- Não coleta dados pessoais
- Código 100% open source

## 📊 Estrutura dos Dados

\`\`\`json
{
  "accounts": [...],           // Contas bancárias
  "transactions": [...],       // Transações
  "credit_cards": [...],       // Cartões de crédito
  "categories": [...],         // Categorias
  "recurring_transactions": [...], // Recorrentes
  "pending_transactions": [...],   // Pendentes
  "lastUpdated": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
\`\`\`

## 🆘 Troubleshooting

### Google Drive não conecta?
1. Verifique se as variáveis de ambiente estão corretas
2. Confirme se a URL está autorizada no Google Cloud
3. Tente fazer logout/login novamente

### Dados perdidos?
1. Verifique se está no mesmo navegador
2. Tente restaurar do Google Drive
3. Use backup local se disponível

### Deploy falhou?
1. Verifique se todas as dependências estão no package.json
2. Confirme se as variáveis de ambiente estão configuradas
3. Veja os logs de erro na Vercel

## 🔄 Atualizações

Para atualizar o sistema:
1. Faça pull das mudanças do repositório
2. Push para o GitHub
3. Vercel fará deploy automático

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/financial-dashboard/issues)
- **Documentação**: Este README
- **Código**: Explore o código fonte

---

**Desenvolvido com ❤️ usando Next.js, TypeScript e Tailwind CSS**
\`\`\`
\`\`\`

Agora vamos criar um arquivo de configuração para facilitar o deploy:
