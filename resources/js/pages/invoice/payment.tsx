import { useState, useEffect } from 'react';
import { usePage, Head } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Share2, Printer, Package, Calendar, DollarSign, Link2, User } from 'lucide-react';
import { toast } from '@/components/custom-toast';
import { InvoicePaymentCopylinkModal } from '@/components/invoice-payment-copylink-modal';
import { useTranslation } from 'react-i18next';
import { NewYork, Toronto, Rio, London, Istanbul, Mumbai, HongKong, Tokyo, Sydney, Paris } from '../settings/components/invoice-templates';
import { useBrand } from '@/contexts/BrandContext';
import { THEME_COLORS } from '@/hooks/use-appearance';

export default function InvoicePayment() {
    const { t } = useTranslation();
    const { invoice, enabledGateways, remainingAmount, company, favicon, appName, flash, invoiceSettings } = usePage().props as any;
    const { themeColor, customColor } = useBrand();

    const [showGatewayModal, setShowGatewayModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState(remainingAmount || invoice.total_amount || 0);

    const primaryColor = themeColor === 'custom' ? customColor : THEME_COLORS[themeColor as keyof typeof THEME_COLORS];
    const showQr = invoiceSettings?.invoice_qr_display === 'true' || invoiceSettings?.invoice_qr_display === true;
    const footerTitle = invoiceSettings?.invoice_footer_title || '';
    const footerNotes = invoiceSettings?.invoice_footer_notes || '';
    const templateName = invoiceSettings?.invoice_template || 'default';

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('payment_success') === 'true') {
            toast.success('Payment processed successfully.');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (flash?.success) {
                toast.success(flash.success);
            }
            if (flash?.error) {
                toast.error(flash.error);
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [flash]);

    const getPaymentMethodIcon = (gatewayId: string) => {
        const iconMap = {
            bank: <CreditCard className="h-5 w-5" />,
            stripe: <CreditCard className="h-5 w-5" />,
            paypal: <CreditCard className="h-5 w-5" />,
        };
        return iconMap[gatewayId] || <CreditCard className="h-5 w-5" />;
    };

    const gatewaysWithIcons = enabledGateways?.map(gateway => ({
        ...gateway,
        icon: getPaymentMethodIcon(gateway.id)
    })) || [];

    const formatAmount = (amount) => {
        const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount);
        return `$${numericAmount.toFixed(2)}`;
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: t('Invoice {{number}}', { number: invoice.invoice_number }),
                    text: t('Invoice from {{company}}', { company: company.name }),
                    url: window.location.href
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success(t('Invoice link copied to clipboard!'));
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const renderCopyLinkView = () => {
        return (
            <div className="space-y-6">
                {/* Header Section */}
                <div className="bg-white rounded-lg shadow-sm border p-8">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{t('New Invoice')}</h1>
                            <p className="text-base text-gray-600 mt-2 leading-relaxed">{t('This is new invoice')}</p>
                        </div>
                        <div className="text-right ml-6">
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                invoice.status === 'paid' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                invoice.status === 'partial_paid' ? 'bg-orange-50 text-orange-700 ring-orange-600/20' :
                                'bg-red-50 text-red-700 ring-red-600/20'
                            }`}>
                                {invoice.status === 'paid' ? t('Paid') : invoice.status === 'partial_paid' ? t('Partially Paid') : t('Unpaid')}
                            </span>
                            <p className="text-sm font-medium text-gray-700 mt-2 font-mono">{invoice.invoice_number}</p>
                        </div>
                    </div>
                </div>

                {/* Payment Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border-l-4 hover:shadow-lg transition-shadow bg-white rounded-lg shadow-sm border" style={{ borderLeftColor: primaryColor }}>
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('Total Amount')}</p>
                                    <h3 className="mt-2 text-2xl font-bold leading-none" style={{ color: primaryColor }}>{formatAmount(invoice.total_amount)}</h3>
                                </div>
                                <div className="rounded-full p-4" style={{ backgroundColor: `${primaryColor}15` }}>
                                    <DollarSign className="h-5 w-5" style={{ color: primaryColor }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-l-4 hover:shadow-lg transition-shadow bg-white rounded-lg shadow-sm border" style={{ borderLeftColor: primaryColor }}>
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('Paid Amount')}</p>
                                    <h3 className="mt-2 text-2xl font-bold leading-none" style={{ color: primaryColor }}>{formatAmount(invoice.total_amount - remainingAmount)}</h3>
                                </div>
                                <div className="rounded-full p-4" style={{ backgroundColor: `${primaryColor}15` }}>
                                    <DollarSign className="h-5 w-5" style={{ color: primaryColor }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow bg-white rounded-lg shadow-sm border">
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('Due Amount')}</p>
                                    <h3 className="mt-2 text-2xl font-bold text-red-600 leading-none">{formatAmount(remainingAmount)}</h3>
                                </div>
                                <div className="rounded-full bg-red-100 p-4">
                                    <DollarSign className="h-5 w-5 text-red-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invoice Details Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border-l-4 hover:shadow-lg transition-shadow bg-white rounded-lg shadow-sm border" style={{ borderLeftColor: primaryColor }}>
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('Tasks')}</p>
                                    <h3 className="mt-2 text-2xl font-bold leading-none" style={{ color: primaryColor }}>{invoice.items?.length || 0}</h3>
                                </div>
                                <div className="rounded-full p-4" style={{ backgroundColor: `${primaryColor}15` }}>
                                    <Package className="h-5 w-5" style={{ color: primaryColor }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-l-4 hover:shadow-lg transition-shadow bg-white rounded-lg shadow-sm border" style={{ borderLeftColor: primaryColor }}>
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('Invoice Date')}</p>
                                    <h3 className="mt-2 text-lg font-bold leading-tight" style={{ color: primaryColor }}>{new Date(invoice.invoice_date).toLocaleDateString()}</h3>
                                </div>
                                <div className="rounded-full p-4" style={{ backgroundColor: `${primaryColor}15` }}>
                                    <Calendar className="h-5 w-5" style={{ color: primaryColor }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow bg-white rounded-lg shadow-sm border">
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('Due Date')}</p>
                                    <h3 className="mt-2 text-lg font-bold text-amber-600 leading-tight">{new Date(invoice.due_date).toLocaleDateString()}</h3>
                                </div>
                                <div className="rounded-full bg-amber-100 p-4">
                                    <Calendar className="h-5 w-5 text-amber-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Billing Details */}
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="border-b px-8 py-6" style={{ backgroundColor: `${primaryColor}25` }}>
                        <h3 className="flex items-center text-xl font-bold text-gray-800">
                            <User className="h-5 w-5 mr-3" />
                            {t('Billing Details')}
                        </h3>
                    </div>
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                    <User className="h-5 w-5 mr-2" />
                                    {t('Bill To')}
                                </h4>
                                <div className="space-y-2">
                                    <p className="font-semibold text-gray-900 text-lg">{invoice.client?.name || 'N/A'}</p>
                                    {invoice.client?.email && <p className="text-gray-600">{invoice.client.email}</p>}
                                    {invoice.client?.phone && <p className="text-gray-600">{invoice.client.phone}</p>}
                                    {invoice.client?.billing_address && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <p className="text-gray-700">{invoice.client.billing_address}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                    <Calendar className="h-5 w-5 mr-2" />
                                    {t('Invoice Details')}
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                        <span className="text-gray-600 font-medium">{t('Invoice Date')}:</span>
                                        <span className="font-semibold text-gray-900">{new Date(invoice.invoice_date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                        <span className="text-gray-600 font-medium">{t('Due Date')}:</span>
                                        <span className="font-semibold text-gray-900">{new Date(invoice.due_date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tasks Table */}
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="bg-gray-50 border-b px-8 py-6">
                        <h3 className="flex items-center text-xl font-bold text-gray-800">
                            <Package className="h-5 w-5 mr-3" />
                            {t('Tasks')}
                        </h3>
                    </div>
                    <div className="p-0">
                        <div className="overflow-hidden">
                            <table className="min-w-full">
                                <thead>
                                    <tr style={{ backgroundColor: primaryColor }}>
                                        <th className="text-base font-bold text-white py-4 px-6 text-left">{t('Task')}</th>
                                        <th className="text-right text-base font-bold text-white py-4 px-4">{t('Unit Price')}</th>
                                        <th className="text-right text-base font-bold text-white py-4 px-4">{t('Total')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.items?.map((item: any, index: number) => (
                                        <tr key={item.id} className="border-b hover:bg-gray-50">
                                            <td className="font-semibold text-base text-gray-900 py-4 px-6">
                                                <div>{item.description}</div>
                                                {item.tax_rate && (
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        {t('Tax')}: {item.tax_rate.name} ({item.tax_rate.rate}%)
                                                    </div>
                                                )}
                                            </td>
                                            <td className="text-right text-base font-semibold py-4 px-4">{formatAmount(item.rate)}</td>
                                            <td className="text-right font-bold text-base py-4 px-4">
                                                <span className="text-600 font-semibold" style={{ color: primaryColor }}>{formatAmount(item.amount)}</span>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr style={{ backgroundColor: `${primaryColor}10` }}>
                                        <td colSpan={2} className="text-right font-semibold text-base py-3 px-4" style={{ color: primaryColor }}>
                                            {t('Subtotal')}:
                                        </td>
                                        <td className="text-right font-semibold text-base py-3 px-4" style={{ color: primaryColor }}>
                                            {formatAmount(invoice.subtotal || invoice.total_amount)}
                                        </td>
                                    </tr>
                                    {invoice.tax_rate && Array.isArray(invoice.tax_rate) && invoice.tax_rate.length > 0 && (
                                        invoice.tax_rate.map((tax: any, index: number) => (
                                            <tr key={index} style={{ backgroundColor: `${primaryColor}10` }}>
                                                <td colSpan={2} className="text-right font-semibold text-base py-3 px-4">
                                                    {tax.name} ({tax.rate}%):
                                                </td>
                                                <td className="text-right font-semibold text-base py-3 px-4">
                                                    {formatAmount((invoice.subtotal * tax.rate) / 100)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    <tr className="border-t-2" style={{ backgroundColor: `${primaryColor}15`, borderTopColor: primaryColor }}>
                                        <td colSpan={2} className="text-right font-bold text-lg py-4 px-4" style={{ color: primaryColor }}>
                                            {t('Grand Total')}:
                                        </td>
                                        <td className="text-right py-4 px-4">
                                            <span className="font-bold text-xl" style={{ color: primaryColor }}>{formatAmount(invoice.total_amount)}</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                
                {/* Payment History */}
                {invoice.payments && invoice.payments.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="border-b px-8 py-6" style={{ backgroundColor: `${primaryColor}25` }}>
                            <h3 className="flex items-center text-xl font-bold text-gray-800">
                                <DollarSign className="h-5 w-5 mr-3" />
                                {t('Payment History')}
                            </h3>
                        </div>
                        <div className="p-0">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr style={{ backgroundColor: `${primaryColor}15` }}>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('Date')}</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('Method')}</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('Type')}</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('Amount')}</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('Status')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.payments.map((payment: any, index: number) => (
                                            <tr key={index} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    {new Date(payment.processed_at || payment.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-3 px-4 capitalize">{payment.payment_method}</td>
                                                <td className="py-3 px-4">
                                                    {invoice.status?.replace(/_/g, ' ').split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                </td>
                                                <td className="text-left py-3 px-4 font-semibold">
                                                    {formatAmount(payment.amount)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                                        payment.status === 'completed' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                                        payment.status === 'pending' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' :
                                                        'bg-red-50 text-red-700 ring-red-600/20'
                                                    }`}>
                                                        {payment.status?.replace('_', ' ').split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notes and Terms */}
                {(invoice.notes || invoice.terms) && (
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="border-b px-8 py-6" style={{ backgroundColor: `${primaryColor}25` }}>
                            <h3 className="text-xl font-bold text-gray-800">{t('Additional Information')}</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {invoice.notes && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('Notes')}</label>
                                        <p className="text-base text-gray-700 mt-2 leading-relaxed">{invoice.notes}</p>
                                    </div>
                                )}
                                {invoice.terms && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('Terms')}</label>
                                        <p className="text-base text-gray-700 mt-2 leading-relaxed">{invoice.terms}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        );
    };

    return (
        <>
            <Head title={`Invoice - ${company?.name || 'Taskly SaaS'}`}>
                {favicon && <link rel="icon" type="image/x-icon" href={favicon} />}
                <style>{`
                    @media print {
                        @page { margin: 0.5in; }
                        body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                        a[href]::after { content: none !important; }
                    }
                `}</style>
            </Head>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6 print:hidden">
                        <div>
                            <h1 className="text-2xl font-bold">{t('Invoice Details')}</h1>
                            <p className="text-sm text-gray-500">{t('View and manage your invoice')}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleShare} variant="outline" size="sm">
                                <Link2 className="h-4 w-4 mr-2" />
                                {t('Copy Link')}
                            </Button>
                            <Button onClick={handlePrint} style={{ backgroundColor: primaryColor }} className="hover:opacity-90" size="sm">
                                <Printer className="h-4 w-4 mr-2" />
                                {t('Print Invoice')}
                            </Button>
                            {remainingAmount > 0 && (
                                <Button onClick={() => setShowGatewayModal(true)} style={{ backgroundColor: primaryColor }} className="hover:opacity-90" size="sm">
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    {t('Pay Remaining')} ({formatAmount(remainingAmount)})
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="print:hidden">
                        {renderCopyLinkView()}
                    </div>

                    <div className="hidden print:block">
                        {(() => {
                            const invoiceColor = invoiceSettings?.invoice_color || '#3b82f6';
                            const templateProps = {
                                invoice,
                                color: invoiceColor,
                                showQr,
                                invoiceUrl: window.location.href,
                                footerTitle,
                                footerNotes,
                                remainingAmount,
                                formatAmount,
                                t
                            };

                            switch(templateName?.toLowerCase()) {
                                case 'new_york': return <NewYork {...templateProps} />;
                                case 'toronto': return <Toronto {...templateProps} />;
                                case 'rio': return <Rio {...templateProps} />;
                                case 'istanbul': return <Istanbul {...templateProps} />;
                                case 'mumbai': return <Mumbai {...templateProps} />;
                                case 'hong_kong': return <HongKong {...templateProps} />;
                                case 'tokyo': return <Tokyo {...templateProps} />;
                                case 'sydney': return <Sydney {...templateProps} />;
                                case 'paris': return <Paris {...templateProps} />;
                                case 'london':
                                default:
                                    return <London {...templateProps} />;
                            }
                        })()}
                    </div>

                    <InvoicePaymentCopylinkModal
                        isOpen={showGatewayModal}
                        onClose={() => setShowGatewayModal(false)}
                        invoice={invoice}
                        remainingAmount={remainingAmount}
                        paymentAmount={paymentAmount}
                        onPaymentAmountChange={setPaymentAmount}
                        gateways={gatewaysWithIcons}
                    />
                </div>
            </div>
        </>
    );
}