import React, { useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/components/custom-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Edit, DollarSign, Download, ArrowLeft, Calendar, User, Building, FileText, Clock, CreditCard, Send, Link, Printer, CheckCircle } from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { formatCurrency } from '@/utils/currency';
import { InvoicePaymentModal } from '@/components/invoices/invoice-payment-modal';

const PAYMENT_METHOD_OPTIONS = [
  { key: 'bank_transfer', label: 'Bank Transfer' },
  { key: 'company_card', label: 'Company Card' },
  { key: 'personal', label: 'Personal' },
  { key: 'personal_card', label: 'Personal Card' },
  { key: 'cash', label: 'Cash' }
];
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { NewYork, Toronto, Rio, London, Istanbul, Mumbai, HongKong, Tokyo, Sydney, Paris } from '../settings/components/invoice-templates';

interface InvoiceItem {
    id: number;
    type: string;
    description: string;
    rate: number;
    amount: number;
    task?: {
        id: number;
        title: string;
    };
    expense?: {
        id: number;
        title: string;
    };
}

interface Invoice {
    id: number;
    invoice_number: string;
    approved_at?: string | null;
    approver?: { id: number; name: string } | null;
    project: {
        id: number;
        title: string;
    };
    task?: {
        id: number;
        title: string;
    };
    budget_category?: {
        id: number;
        name: string;
    } | null;
    client?: {
        id: number;
        name: string;
        avatar?: string;
    };
    creator: {
        id: number;
        name: string;
    };
    title: string;
    description?: string;
    invoice_date: string;
    due_date: string;
    subtotal: number;
    tax_rate: Array<{id: number, name: string, rate: number}>;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
    paid_amount: number;
    payment_method?: string;
    payment_reference?: string;
    payment_details?: any;
    status: string;
    is_overdue: boolean;
    days_overdue: number;
    balance_due: number;
    notes?: string;
    terms?: string;
    payment_token: string;
    items: InvoiceItem[];
    created_at: string;
}

export default function InvoiceShow() {
    const { t } = useTranslation();
    const { invoice, userWorkspaceRole, flash, emailNotificationsEnabled, invoiceSettings, canApprove } = usePage().props as { invoice: Invoice; userWorkspaceRole: string; flash?: any; emailNotificationsEnabled?: boolean; invoiceSettings?: any; canApprove?: boolean };
    const [showPaymentModal, setShowPaymentModal] = React.useState(false);
    const [showMarkPaidModal, setShowMarkPaidModal] = React.useState(false);
    const [markPaidPaymentMethod, setMarkPaidPaymentMethod] = React.useState(PAYMENT_METHOD_OPTIONS[0].key);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get('payment_status');
        const message = urlParams.get('message');
        
        if (paymentStatus && message) {
            const decodedMessage = decodeURIComponent(message);
            setTimeout(() => {
                if (paymentStatus === 'success') {
                    toast.success(decodedMessage);
                } else {
                    toast.error(decodedMessage);
                }
            }, 1000);
            
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
        }
        
        if (flash?.success) {
            const message = flash.success.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
            setTimeout(() => {
                toast.success(message);
            }, 1000);
        }
        if (flash?.error) {
            const message = flash.error.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
            setTimeout(() => {
                toast.error(message);
            }, 1000);
        }
    }, [flash]);

    const getStatusColor = (status: string) => {
        const colors = {
            draft: 'bg-gray-100 text-gray-800',
            sent: 'bg-blue-100 text-blue-800',
            viewed: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-green-100 text-green-800',
            partial_paid: 'bg-orange-100 text-orange-800',
            overdue: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800'
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const handlePrint = () => {
        window.print();
    };

    const handleAction = (action: string) => {
        switch (action) {
            case 'approve':
                toast.loading(t('Approving...'));
                router.post(route('invoices.approve', invoice.id), {}, {
                    onSuccess: () => {
                        toast.dismiss();
                        toast.success(t('Invoice approved'));
                    },
                    onError: () => {
                        toast.dismiss();
                        toast.error(t('Failed to approve invoice'));
                    }
                });
                break;

            case 'edit':
                router.get(route('invoices.edit', invoice.id));
                break;

            case 'mark-paid':
                setShowMarkPaidModal(true);
                break;

            case 'send':
                toast.loading('Sending invoice...');
                router.post(route('invoices.send', invoice.id), {}, {
                    onSuccess: () => {
                        toast.dismiss();
                    },
                    onError: () => {
                        toast.dismiss();
                        toast.error('Failed to send invoice');
                    }
                });
                break;

            case 'pay':
                setShowPaymentModal(true);
                break;
                
            case 'copy-payment-link':
                const paymentUrl = route('invoices.payment', invoice.payment_token);
                navigator.clipboard.writeText(paymentUrl).then(() => {
                    toast.success(t('Payment link copied to clipboard'));
                }).catch(() => {
                    toast.error(t('Failed to copy payment link'));
                });
                break;
        }
    };

    const handlePaymentSuccess = () => {
        router.reload();
    };

    const handleMarkPaidConfirm = () => {
        toast.loading('Marking invoice as paid...');
        router.post(route('invoices.mark-paid', invoice.id), { payment_method: markPaidPaymentMethod }, {
            onSuccess: () => {
                toast.dismiss();
                setShowMarkPaidModal(false);
            },
            onError: () => {
                toast.dismiss();
                toast.error('Failed to mark invoice as paid');
                setShowMarkPaidModal(false);
            }
        });
    };

    const pageActions = [
        {
            label: t('Print'),
            icon: <Printer className="h-4 w-4 mr-2" />,
            variant: 'outline',
            onClick: handlePrint
        }
    ];
    
    if (['owner', 'manager'].includes(userWorkspaceRole)) {
        pageActions.push(
            {
                label: t('Edit'),
                icon: <Edit className="h-4 w-4 mr-2" />,
                variant: 'outline',
                onClick: () => handleAction('edit')
            },
            {
                label: t('Copy Payment Link'),
                icon: <Link className="h-4 w-4 mr-2" />,
                variant: 'outline',
                onClick: () => handleAction('copy-payment-link')
            }
        );
        if (invoice.status === 'draft' && emailNotificationsEnabled) {
            pageActions.push(
                {
                    label: t('Send'),
                    icon: <Send className="h-4 w-4 mr-2" />,
                    variant: 'default',
                    onClick: () => handleAction('send')
                }
            );
        }
    }

    if (canApprove) {
        pageActions.push(
            {
                label: t('Approve'),
                icon: <CheckCircle className="h-4 w-4 mr-2" />,
                variant: 'default',
                onClick: () => handleAction('approve')
            }
        );
    }

    if (invoice.status !== 'paid' && invoice.status !== 'cancelled') {
        if (userWorkspaceRole === 'client') {
            pageActions.push(
                {
                    label: t('Pay Now'),
                    icon: <CreditCard className="h-4 w-4 mr-2" />,
                    variant: 'default',
                    onClick: () => handleAction('pay')
                }
            );
        } else {
            pageActions.push(
                {
                    label: t('Mark as Paid'),
                    icon: <DollarSign className="h-4 w-4 mr-2" />,
                    variant: 'default',
                    onClick: () => handleAction('mark-paid')
                }
            );
        }
    }

    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Invoices'), href: route('invoices.index') },
        { title: invoice.invoice_number }
    ];

    const showQr = invoiceSettings?.invoice_qr_display === 'true' || invoiceSettings?.invoice_qr_display === true;
    const footerTitle = invoiceSettings?.invoice_footer_title || '';
    const footerNotes = invoiceSettings?.invoice_footer_notes || '';
    const templateName = invoiceSettings?.invoice_template || 'london';
    const invoiceColor = invoiceSettings?.invoice_color || '#3b82f6';
    const remainingAmount = invoice.balance_due || (invoice.total_amount - invoice.paid_amount);

    const renderPrintTemplate = () => {
        const templateProps = {
            invoice,
            color: invoiceColor,
            showQr,
            invoiceUrl: route('invoices.payment', invoice.payment_token),
            footerTitle,
            footerNotes,
            remainingAmount,
            formatAmount: formatCurrency,
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
    };

    return (
        <>
            <style>{`
                @media print {
                    @page { margin: 0.5in; }
                    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                    a[href]::after { content: none !important; }
                    nav, aside, header, .sidebar, [role="navigation"] { display: none !important; }
                    main { margin: 0 !important; padding: 0 !important; }
                    .flex.h-full.flex-1.flex-col.gap-4.p-4 > .flex.items-center.justify-between { display: none !important; }
                    .flex.h-full.flex-1.flex-col.gap-4.p-4 { padding: 0 !important; gap: 0 !important; }
                    .rounded-xl.border.p-6 { border: none !important; padding: 0 !important; }
                }
            `}</style>
            <PageTemplate 
                title={`${t('Invoice')} ${invoice.invoice_number}`}
                url={`/invoices/${invoice.id}`}
                actions={pageActions}
                breadcrumbs={breadcrumbs}
            >
                <div className="max-w-4xl mx-auto space-y-6 print:hidden">
                {/* Invoice Header */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Invoice Number */}
                            <div>
                                <span className="text-sm text-gray-500">{t('Invoice Number')}:</span>
                                <p className="font-semibold">{invoice.invoice_number}</p>
                            </div>

                            {/* Status, Invoice Date, Due Date - Center */}
                            <div className="space-y-2">
                                <div>
                                    <Badge className={getStatusColor(invoice.status)}>
                                        {invoice.status?.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                    </Badge>
                                    {invoice.approved_at && (
                                        <Badge className="ml-2 bg-green-100 text-green-800">
                                            {t('Approved')} {invoice.approver?.name && `(${invoice.approver.name})`}
                                        </Badge>
                                    )}
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">{t('Invoice Date')}:</span>
                                    <p>{new Date(invoice.invoice_date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">{t('Due Date')}:</span>
                                    <p>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '—'}</p>
                                </div>
                            </div>

                            {/* QR Code */}
                            <div className="flex justify-end">
                                <div className="text-center">
                                    <QRCodeGenerator 
                                        value={route('invoices.payment', invoice.payment_token)}
                                        size={120}
                                    />
                                    <p className="text-xs text-gray-500 mt-2">{t('Scan to pay')}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bill To */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            {invoice.client && (
                                <div>
                                    <h3 className="font-bold mb-2">{t('Bill To')}</h3>
                                    <p>{invoice.client.name}</p>
                                </div>
                            )}

                            {invoice.project && (
                                <div className="text-right">
                                    <h3 className="font-bold mb-2">{t('Project')}</h3>
                                    <p>{invoice.project.title}</p>
                                    {invoice.task && (
                                        <p className="text-sm text-muted-foreground mt-1">{t('Task')}: {invoice.task.title}</p>
                                    )}
                                    {invoice.budget_category && (
                                        <p className="text-sm text-muted-foreground mt-1">{t('Category')}: {invoice.budget_category.name}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Invoice Items */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('Invoice Items')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">{t('Task')}</th>
                                        <th className="text-right py-2">{t('Price')}</th>
                                        <th className="text-right py-2">{t('Total')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.items?.map((item) => (
                                        <tr key={item.id} className="border-b">
                                            <td className="py-3">
                                                <div className="font-medium">{item.description}</div>
                                            </td>
                                            <td className="text-right py-3">
                                                {formatCurrency(item.rate)}
                                            </td>
                                            <td className="text-right py-3 font-medium">
                                                {formatCurrency(item.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Invoice Summary */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Notes and Terms */}
                            <div className="space-y-4">
                                {invoice.notes && (
                                    <div>
                                        <h4 className="font-semibold mb-2">{t('Notes')}</h4>
                                        <p className="text-sm text-gray-600">{invoice.notes}</p>
                                    </div>
                                )}

                                {invoice.terms && (
                                    <div>
                                        <h4 className="font-semibold mb-2">{t('Terms & Conditions')}</h4>
                                        <p className="text-sm text-gray-600">{invoice.terms}</p>
                                    </div>
                                )}
                            </div>

                            {/* Totals */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-gray-700">
                                        <span>{t('Subtotal')}:</span>
                                        <span>{formatCurrency(invoice.subtotal)}</span>
                                    </div>
                                    {invoice.tax_rate && Array.isArray(invoice.tax_rate) && invoice.tax_rate.length > 0 && (
                                        <>
                                            <div className="text-sm font-medium text-gray-600 mt-2">{t('Taxes')}:</div>
                                            {invoice.tax_rate.map((tax: any, index: number) => {
                                                const taxAmount = tax.amount ?? (tax.is_inclusive
                                                    ? invoice.subtotal - (invoice.subtotal / (1 + (tax.rate || 0) / 100))
                                                    : (invoice.subtotal * (tax.rate || 0)) / 100);
                                                return (
                                                    <div key={index} className="flex justify-between text-gray-700 pl-2">
                                                        <span>{tax.name} ({tax.rate}%){tax.is_inclusive ? ` ${t('included')}` : ''}:</span>
                                                        <span>{formatCurrency(taxAmount)}</span>
                                                    </div>
                                                );
                                            })}
                                        </>
                                    )}
                                    <div className="border-t pt-3 flex justify-between font-bold text-xl text-blue-600">
                                        <span>{t('Total')}:</span>
                                        <span>{formatCurrency(invoice.total_amount)}</span>
                                    </div>

                                    {invoice.paid_amount > 0 && (
                                        <>
                                            <div className="flex justify-between text-green-600">
                                                <span>{t('Paid')}:</span>
                                                <span>{formatCurrency(invoice.paid_amount)}</span>
                                            </div>
                                            
                                            <div className="flex justify-between font-bold text-red-600">
                                                <span>{t('Balance Due')}:</span>
                                                <span>{formatCurrency(invoice.total_amount - invoice.paid_amount)}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment History */}
                {invoice.payments && invoice.payments.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <DollarSign className="h-5 w-5 mr-2" />
                                {t('Payment History')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4">{t('Date')}</th>
                                            <th className="text-left py-3 px-4">{t('Method')}</th>
                                            <th className="text-left py-3 px-4">{t('Type')}</th>
                                            <th className="text-left py-3 px-4">{t('Amount')}</th>
                                            <th className="text-left py-3 px-4">{t('Status')}</th>
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
                                                    {formatCurrency(payment.amount)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge className={`${
                                                        payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {payment.status?.replace('_', ' ').split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Payment Modal */}
                <InvoicePaymentModal
                    invoice={invoice}
                    open={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    onSuccess={handlePaymentSuccess}
                />

                {/* Mark as Paid Confirmation Modal */}
                <Dialog open={showMarkPaidModal} onOpenChange={setShowMarkPaidModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('Mark Invoice as Paid')}</DialogTitle>
                        </DialogHeader>
                        <p className="mb-3">{t('Are you sure you want to mark invoice')} {invoice.invoice_number} {t('as paid')}?</p>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('Payment method')}</label>
                            <select
                                value={markPaidPaymentMethod}
                                onChange={(e) => setMarkPaidPaymentMethod(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                {PAYMENT_METHOD_OPTIONS.map(({ key, label }) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => setShowMarkPaidModal(false)}>
                                {t('Cancel')}
                            </Button>
                            <Button onClick={handleMarkPaidConfirm}>
                                {t('Mark as Paid')}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="hidden print:block">
                {renderPrintTemplate()}
            </div>
        </PageTemplate>
        </>
    );
}
