/**
 * Formata um número para moeda brasileira (BRL)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata um número de telefone para o formato brasileiro
 */
export function formatPhone(phone: string): string {
  // Remove tudo que não for número
  const numbers = phone.replace(/\D/g, '');
  
  // Verifica se é celular (9 dígitos) ou fixo (8 dígitos)
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
}

/**
 * Formata uma data para o formato brasileiro
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(
    typeof date === 'string' ? new Date(date) : date
  );
}

/**
 * Formata uma data e hora para o formato brasileiro
 */
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(typeof date === 'string' ? new Date(date) : date);
}

/**
 * Formata um CPF (xxx.xxx.xxx-xx)
 */
export function formatCPF(cpf: string): string {
  const numbers = cpf.replace(/\D/g, '');
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata um CNPJ (xx.xxx.xxx/xxxx-xx)
 */
export function formatCNPJ(cnpj: string): string {
  const numbers = cnpj.replace(/\D/g, '');
  return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Formata um CEP (xxxxx-xxx)
 */
export function formatCEP(cep: string): string {
  const numbers = cep.replace(/\D/g, '');
  return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
}
