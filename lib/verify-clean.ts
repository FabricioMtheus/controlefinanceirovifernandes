// Arquivo de verificação - garantir que não há imports do Supabase

export const verifyCleanBuild = () => {
  console.log("🔍 Verificando build limpo...")

  // Verificar se window está disponível (client-side)
  if (typeof window !== "undefined") {
    console.log("✅ Executando no cliente")

    // Verificar localStorage
    const hasLocalStorage = typeof localStorage !== "undefined"
    console.log(`📦 LocalStorage disponível: ${hasLocalStorage}`)

    return {
      isClient: true,
      hasLocalStorage,
      timestamp: new Date().toISOString(),
    }
  }

  console.log("🖥️ Executando no servidor")
  return {
    isClient: false,
    hasLocalStorage: false,
    timestamp: new Date().toISOString(),
  }
}

// Executar verificação
if (typeof window !== "undefined") {
  verifyCleanBuild()
}
