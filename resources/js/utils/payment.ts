/**
 * Payment methods for recording payments (invoices, etc.).
 * Only these 5 methods are used in the system.
 */
export const PAYMENT_METHODS = {
  BANK_TRANSFER: 'bank_transfer',
  COMPANY_CARD: 'company_card',
  PERSONAL: 'personal',
  PERSONAL_CARD: 'personal_card',
  CASH: 'cash'
} as const;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  [PAYMENT_METHODS.BANK_TRANSFER]: 'Bank Transfer',
  [PAYMENT_METHODS.COMPANY_CARD]: 'Company Card',
  [PAYMENT_METHODS.PERSONAL]: 'Personal',
  [PAYMENT_METHODS.PERSONAL_CARD]: 'Personal Card',
  [PAYMENT_METHODS.CASH]: 'Cash'
};

/** Georgian labels (used when app language is Georgian or as fallback) */
export const PAYMENT_METHOD_LABELS_KA: Record<string, string> = {
  [PAYMENT_METHODS.BANK_TRANSFER]: 'საბანკო გადარიცხვა',
  [PAYMENT_METHODS.COMPANY_CARD]: 'კომპანიის ბარათი',
  [PAYMENT_METHODS.PERSONAL]: 'პირადი',
  [PAYMENT_METHODS.PERSONAL_CARD]: 'პირადი ბარათი',
  [PAYMENT_METHODS.CASH]: 'ქეში'
};

export const PAYMENT_METHOD_LIST = [
  { key: PAYMENT_METHODS.BANK_TRANSFER, labelKey: 'Bank Transfer', labelKa: PAYMENT_METHOD_LABELS_KA[PAYMENT_METHODS.BANK_TRANSFER] },
  { key: PAYMENT_METHODS.COMPANY_CARD, labelKey: 'Company Card', labelKa: PAYMENT_METHOD_LABELS_KA[PAYMENT_METHODS.COMPANY_CARD] },
  { key: PAYMENT_METHODS.PERSONAL, labelKey: 'Personal', labelKa: PAYMENT_METHOD_LABELS_KA[PAYMENT_METHODS.PERSONAL] },
  { key: PAYMENT_METHODS.PERSONAL_CARD, labelKey: 'Personal Card', labelKa: PAYMENT_METHOD_LABELS_KA[PAYMENT_METHODS.PERSONAL_CARD] },
  { key: PAYMENT_METHODS.CASH, labelKey: 'Cash', labelKa: PAYMENT_METHOD_LABELS_KA[PAYMENT_METHODS.CASH] }
] as const;

export type PaymentMethodKey = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

export const PAYMENT_METHOD_HELP_URLS: Record<string, string> = {};

export const PAYMENT_MODES = {
  SANDBOX: 'sandbox',
  LIVE: 'live'
} as const;

export type PaymentMode = typeof PAYMENT_MODES[keyof typeof PAYMENT_MODES];

export interface PaymentConfig {
  enabled: boolean;
  mode?: PaymentMode;
  [key: string]: any;
}

export interface PaymentFormData {
  planId: number;
  planPrice: number;
  couponCode?: string;
  billingCycle: 'monthly' | 'yearly';
}

export function formatPaymentAmount(amount: number, currency: string = 'GEL'): string {
  return new Intl.NumberFormat('ka-GE', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

export function getPaymentMethodLabel(key: string, language: string = 'en'): string {
  if (language === 'ka' && PAYMENT_METHOD_LABELS_KA[key]) {
    return PAYMENT_METHOD_LABELS_KA[key];
  }
  return PAYMENT_METHOD_LABELS[key] || key;
}
