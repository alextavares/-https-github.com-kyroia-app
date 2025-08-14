export const PaymentStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const

export type PaymentStatusType = typeof PaymentStatus[keyof typeof PaymentStatus]

// Helper functions for status validation and conversion
export function isValidPaymentStatus(status: string): status is PaymentStatusType {
  return Object.values(PaymentStatus).includes(status as PaymentStatusType)
}

export function normalizePaymentStatus(status: string): PaymentStatusType {
  const normalized = status.toLowerCase()
  
  switch (normalized) {
    case 'paid':
    case 'approved':
    case 'completed':
      return PaymentStatus.COMPLETED
    case 'failed':
    case 'rejected':
    case 'refunded':
      return PaymentStatus.FAILED
    case 'pending':
      return PaymentStatus.PENDING
    default:
      throw new Error(`Unknown payment status: ${status}`)
  }
}