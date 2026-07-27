const BANGLA_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']

export function formatBanglaNumber(value: string | number): string {
  return String(value).replace(/[0-9]/g, d => BANGLA_DIGITS[Number(d)])
}
