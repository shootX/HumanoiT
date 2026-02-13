import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingsSection } from '@/components/settings-section';
import { useTranslation } from 'react-i18next';
import { PAYMENT_METHOD_LIST, getPaymentMethodLabel } from '@/utils/payment';
import { Banknote, CreditCard, User, Wallet, Landmark } from 'lucide-react';

const METHOD_ICONS: Record<string, React.ReactNode> = {
  bank_transfer: <Landmark className="h-5 w-5" />,
  company_card: <CreditCard className="h-5 w-5" />,
  personal: <User className="h-5 w-5" />,
  personal_card: <Wallet className="h-5 w-5" />,
  cash: <Banknote className="h-5 w-5" />
};

interface PaymentSettingsProps {
  settings?: Record<string, unknown>;
}

export default function PaymentSettings({ settings: _settings }: PaymentSettingsProps = {}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';

  return (
    <SettingsSection
      title={t('Payment Methods')}
      description={t('These payment methods are used when recording payments (e.g. marking an invoice as paid).')}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('Available payment methods')}</CardTitle>
          <CardDescription>
            {t('Select one of these when recording a payment.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {PAYMENT_METHOD_LIST.map(({ key }) => (
              <li
                key={key}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  {METHOD_ICONS[key] || <CreditCard className="h-5 w-5" />}
                </span>
                <span className="font-medium">
                  {getPaymentMethodLabel(key, 'en')}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </SettingsSection>
  );
}
