import { Badge } from '@/components/ui/badge';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';

export function HongKong({ invoice, color, showQr, invoiceUrl, footerTitle, footerNotes, remainingAmount, formatAmount, t }: any) {
  const template = { primary: color, secondary: color };
  
  const isPreview = !invoice;
  const invoiceData = isPreview ? {
    invoice_number: '<Invoice Number>',
    status: 'sent',
    invoice_date: '2025-12-01',
    due_date: '2025-12-01',
    client: { name: '<Client Name>', email: '<Email>' },
    project: { title: 'UI Design Project' },
    items: [1,2,3].map(i => ({ id: i, description: `Task ${i}`, rate: 100, amount: 100 })),
    notes: '<Notes>',
    terms: '<Terms & Conditions>',
    subtotal: 300,
    total_amount: 351,
    tax_rate: [{ name: 'Tax', rate: 17 }]
  } : invoice;
  
  const displayAmount = (amount) => isPreview ? `$${amount.toFixed(2)}` : formatAmount(amount);
  const translate = (key) => isPreview ? key : t(key);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-8 space-y-8">
          <div className="pb-8 flex items-center justify-between" style={{ borderBottom: `3px solid ${template.primary}` }}>
            <div className="flex items-center gap-8">
              <div>
                <h1 className="text-4xl font-bold mb-2" style={{ color: template.secondary }}>INVOICE</h1>
                <div className="text-sm"><span className="font-semibold">{translate('Invoice Number')}:</span> {invoiceData.invoice_number}</div>
              </div>
              
              <div className="flex gap-4">
                <div className="p-2 rounded" style={{ backgroundColor: `${template.primary}08` }}>
                  <div className="text-xs text-gray-500">{translate('Invoice Date')}</div>
                  <div className="font-semibold text-sm">{new Date(invoiceData.invoice_date).toLocaleDateString()}</div>
                </div>
                <div className="p-2 rounded" style={{ backgroundColor: `${template.primary}08` }}>
                  <div className="text-xs text-gray-500">{translate('Due Date')}</div>
                  <div className="font-semibold text-sm">{new Date(invoiceData.due_date).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="p-2 rounded" style={{ backgroundColor: `${template.primary}08` }}>
                <div className="text-xs text-gray-500">{translate('Status')}</div>
                <Badge style={{ backgroundColor: `${template.primary}20`, color: template.primary }}>
                  {invoiceData.status === 'paid' ? translate('Paid') : invoiceData.status === 'partial_paid' ? translate('Partial Paid') : translate('Sent')}
                </Badge>
              </div>
              
              {showQr && (
                <div className="p-3 rounded-lg border-2 border-dashed flex flex-col items-center" style={{ borderColor: `${template.primary}40`, backgroundColor: `${template.primary}05` }}>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">{translate('Scan to Share')}</div>
                  <QRCodeGenerator value={invoiceUrl || 'https://example.com/invoice'} size={80} />
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between items-start gap-8">
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-3" style={{ color: template.primary }}>{translate('BILL TO')}:</h3>
              <div className="text-sm space-y-1">
                <p>{invoiceData.client?.name}</p>
                <p>{invoiceData.client?.email}</p>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-3" style={{ color: template.primary }}>{translate('PROJECT')}:</h3>
              <div className="p-4 rounded" style={{ backgroundColor: `${template.primary}10` }}>
                <div className="font-bold">{invoiceData.project?.title}</div>
              </div>
            </div>
          </div>
          <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm"><thead><tr style={{ background: template.primary }}><th className="text-left py-4 px-6 text-white font-bold text-sm uppercase">{translate('Description')}</th><th className="text-right py-4 px-6 text-white font-bold text-sm uppercase">{translate('Unit Price')}</th><th className="text-right py-4 px-6 text-white font-bold text-sm uppercase">{translate('Total')}</th></tr></thead><tbody className="bg-white">{invoiceData.items?.map((item: any, index: number) => (<tr key={item.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}><td className="py-4 px-6">{item.description}</td><td className="text-right py-4 px-6">{displayAmount(item.rate)}</td><td className="text-right py-4 px-6 font-semibold">{displayAmount(item.amount)}</td></tr>))}</tbody></table>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <h4 className="font-bold mb-1" style={{ color: template.primary }}>{translate('NOTES')}:</h4>
                <p className="text-sm text-gray-600">{invoiceData.notes}</p>
              </div>
              <div>
                <h4 className="font-bold mb-1" style={{ color: template.primary }}>{translate('TERMS & CONDITIONS')}:</h4>
                <p className="text-sm text-gray-600">{invoiceData.terms}</p>
              </div>
            </div>
            <div>
              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="p-4 space-y-2">
                  <div className="flex justify-between py-1">
                    <span className="text-sm">{translate('Subtotal')}:</span>
                    <span className="text-sm">{displayAmount(invoiceData.subtotal || invoiceData.total_amount)}</span>
                  </div>
                  {invoiceData.tax_rate && Array.isArray(invoiceData.tax_rate) && invoiceData.tax_rate.length > 0 && (
                    invoiceData.tax_rate.map((tax: any, index: number) => {
                      const taxAmount = (invoiceData.subtotal * tax.rate) / 100;
                      return (
                        <div key={index} className="flex justify-between py-1">
                          <span className="text-sm">{tax.name} ({tax.rate}%):</span>
                          <span className="text-sm">{displayAmount(taxAmount)}</span>
                        </div>
                      );
                    })
                  )}
                  <div className="flex justify-between py-1 border-t border-b">
                    <span className="text-sm">{translate('Total')}:</span>
                    <span className="text-sm font-bold">{displayAmount(invoiceData.total_amount)}</span>
                  </div>
                  {!isPreview && (invoiceData.total_amount - remainingAmount) > 0 && (
                    <div className="flex justify-between py-1">
                      <span className="text-sm">{translate('Paid')}:</span>
                      <span className="text-sm">{displayAmount(invoiceData.total_amount - remainingAmount)}</span>
                    </div>
                  )}
                </div>
                <div className="px-4 py-2" style={{ backgroundColor: `${template.primary}15` }}>
                  <div className="flex justify-between">
                    <span className="font-bold text-sm" style={{ color: template.primary }}>{translate('BALANCE DUE')}:</span>
                    <span className="font-bold text-lg" style={{ color: template.primary }}>{displayAmount(isPreview ? invoiceData.total_amount : remainingAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-8" style={{ borderTop: `3px solid ${template.primary}` }}>
            <p className="text-lg font-semibold mb-2" style={{ color: template.primary }}>{footerTitle || 'Thank you for your business!'}</p>
            {footerNotes && <p className="text-sm text-gray-600 mb-4">{footerNotes}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}