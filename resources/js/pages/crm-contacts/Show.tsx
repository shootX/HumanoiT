import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { PageTemplate } from '@/components/page-template';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building, Mail, Phone, MapPin, FileText, Eye } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

export default function CrmContactShow() {
  const { t } = useTranslation();
  const { contact, invoices } = usePage().props as any;

  const getDisplayName = () => {
    if (contact.type === 'legal') return contact.brand_name || contact.company_name || contact.name;
    return contact.name || contact.email || '—';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      viewed: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      partial_paid: 'bg-orange-100 text-orange-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Contacts'), href: route('crm-contacts.index') },
    { title: getDisplayName() },
  ];

  return (
    <PageTemplate title={getDisplayName()} url={`/crm-contacts/${contact.id}`} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={route('crm-contacts.index')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('Back to Contacts')}
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {t('Contact Details')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contact.type === 'legal' && (
                <>
                  {contact.company_name && (
                    <div>
                      <span className="text-sm text-muted-foreground">{t('Company Name')}:</span>
                      <p className="font-medium">{contact.company_name}</p>
                    </div>
                  )}
                  {contact.brand_name && (
                    <div>
                      <span className="text-sm text-muted-foreground">{t('Brand Name')}:</span>
                      <p className="font-medium">{contact.brand_name}</p>
                    </div>
                  )}
                  {contact.identification_code && (
                    <div>
                      <span className="text-sm text-muted-foreground">{t('Identification Code')}:</span>
                      <p className="font-medium">{contact.identification_code}</p>
                    </div>
                  )}
                </>
              )}
              {contact.name && (
                <div>
                  <span className="text-sm text-muted-foreground">{t('Contact Person')}:</span>
                  <p className="font-medium">{contact.name}</p>
                </div>
              )}
              {contact.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${contact.email}`} className="text-primary hover:underline">{contact.email}</a>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${contact.phone}`} className="text-primary hover:underline">{contact.phone}</a>
                </div>
              )}
              {contact.address && (
                <div className="flex items-start gap-2 md:col-span-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm">{contact.address}</p>
                </div>
              )}
              {contact.notes && (
                <div className="md:col-span-2">
                  <span className="text-sm text-muted-foreground">{t('Notes')}:</span>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{contact.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('Invoices')} ({invoices?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invoices?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium">{t('Number')}</th>
                      <th className="text-left py-3 px-2 font-medium">{t('Title')}</th>
                      <th className="text-left py-3 px-2 font-medium">{t('Project')}</th>
                      <th className="text-left py-3 px-2 font-medium">{t('Amount')}</th>
                      <th className="text-left py-3 px-2 font-medium">{t('Status')}</th>
                      <th className="text-left py-3 px-2 font-medium">{t('Date')}</th>
                      <th className="text-right py-3 px-2 font-medium">{t('Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv: any) => (
                      <tr key={inv.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2 font-medium">{inv.invoice_number}</td>
                        <td className="py-3 px-2">{inv.title}</td>
                        <td className="py-3 px-2">{inv.project?.title || '—'}</td>
                        <td className="py-3 px-2">{formatCurrency(inv.total_amount)}</td>
                        <td className="py-3 px-2">
                          <Badge className={getStatusColor(inv.status)} variant="secondary">
                            {inv.status?.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">{inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString() : '—'}</td>
                        <td className="py-3 px-2 text-right">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={route('invoices.show', inv.id)}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">{t('No invoices assigned to this contact.')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}
