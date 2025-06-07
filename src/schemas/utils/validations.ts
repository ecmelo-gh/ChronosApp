/**
 * Valida um CPF, removendo pontuação e verificando dígitos
 */
export function validateCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '')

  // Verifica tamanho
  if (cpf.length !== 11) return false

  // Verifica números repetidos
  if (/^(\d)\1+$/.test(cpf)) return false

  // Calcula dígitos verificadores
  let sum = 0
  let remainder: number

  // Primeiro dígito
  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf.substring(9, 10))) return false

  // Segundo dígito
  sum = 0
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf.substring(10, 11))) return false

  return true
}

/**
 * Valida um telefone, aceitando formatos:
 * - (99) 9999-9999
 * - (99) 99999-9999
 * - 99999999999
 */
export function validatePhone(phone: string): boolean {
  // Remove caracteres não numéricos
  const numbers = phone.replace(/[^\d]/g, '')
  
  // Verifica se tem 10 (fixo) ou 11 (celular) dígitos
  if (numbers.length !== 10 && numbers.length !== 11) return false
  
  // Verifica DDD válido (10-99)
  const ddd = parseInt(numbers.substring(0, 2))
  if (ddd < 10 || ddd > 99) return false
  
  // Se for celular (11 dígitos), primeiro dígito deve ser 9
  if (numbers.length === 11 && numbers[2] !== '9') return false
  
  return true
}
