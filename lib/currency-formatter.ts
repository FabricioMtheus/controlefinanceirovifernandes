export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export const parseCurrency = (value: string): number => {
  // Remove todos os caracteres exceto números, vírgula e ponto
  const cleanValue = value.replace(/[^\d,.-]/g, '')
  
  // Se estiver vazio, retorna 0
  if (!cleanValue) return 0
  
  // Substitui vírgula por ponto para conversão
  const normalizedValue = cleanValue.replace(',', '.')
  
  return parseFloat(normalizedValue) || 0
}

export const formatCurrencyInput = (value: string): string => {
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '')
  
  if (!numbers) return ''
  
  // Converte para número e divide por 100 para ter centavos
  const amount = parseInt(numbers) / 100
  
  // Formata como moeda brasileira
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount)
}

export const getCurrencyValue = (formattedValue: string): number => {
  if (!formattedValue) return 0
  
  // Remove símbolos de moeda e espaços
  const cleanValue = formattedValue
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '') // Remove pontos de milhares
    .replace(',', '.') // Substitui vírgula decimal por ponto
  
  return parseFloat(cleanValue) || 0
}
