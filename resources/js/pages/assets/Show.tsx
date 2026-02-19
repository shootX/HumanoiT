import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Calendar, MapPin, CheckSquare, FileText } from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { useTranslation } from 'react-i18next';
import { Asset } from '@/types';

interface TaskAllocation {
    id: number;
    title: string;
    project?: { id: number; title: string };
    pivot: { quantity: number };
}

interface Props {
    asset: Asset & {
        project?: { id: number; title: string };
        invoice?: { id: number; invoice_number: string } | null;
        taskAllocations?: TaskAllocation[];
    };
}

export default function AssetShow({ asset }: Props) {
    const { t } = useTranslation();

    const getTypeLabel = (type: string) => t(`asset_type_${type}`);
    const getStatusLabel = (status: string) => t(`asset_status_${status}`);

    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Assets'), href: route('assets.index') },
        { title: asset.name },
    ];

    return (
        <PageTemplate title={asset.name} url={`/assets/${asset.id}`} breadcrumbs={breadcrumbs}>
            <div className="space-y-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={route('assets.index')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {t('Back to Assets')}
                    </Link>
                </Button>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                {asset.name}
                            </CardTitle>
                            <Badge variant={asset.status === 'active' ? 'default' : asset.status === 'maintenance' ? 'secondary' : 'destructive'}>
                                {getStatusLabel(asset.status)}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">{t('Quantity')}</p>
                                <p className="font-medium">{asset.quantity ?? 1}</p>
                            </div>
                            {asset.asset_code && (
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('Asset Code')}</p>
                                    <p className="font-medium">{asset.asset_code}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-muted-foreground">{t('Type')}</p>
                                <p className="font-medium">{getTypeLabel(asset.type)}</p>
                            </div>
                            {asset.location && (
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('Location')}</p>
                                        <p className="font-medium">{asset.location}</p>
                                    </div>
                                </div>
                            )}
                            {asset.project && (
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('Project')}</p>
                                    <Link href={route('projects.show', asset.project.id)} className="font-medium text-primary hover:underline">
                                        {asset.project.title}
                                    </Link>
                                </div>
                            )}
                            {asset.invoice && (
                                <div className="flex items-start gap-2">
                                    <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('Invoice')}</p>
                                        <Link href={route('invoices.show', asset.invoice.id)} className="font-medium text-primary hover:underline">
                                            {asset.invoice.invoice_number}
                                        </Link>
                                    </div>
                                </div>
                            )}
                            {asset.purchase_date && (
                                <div className="flex items-start gap-2">
                                    <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('Purchase Date')}</p>
                                        <p className="font-medium">{String(asset.purchase_date).split('T')[0]}</p>
                                    </div>
                                </div>
                            )}
                            {asset.warranty_until && (
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('Warranty Until')}</p>
                                    <p className="font-medium">{String(asset.warranty_until).split('T')[0]}</p>
                                </div>
                            )}
                        </div>
                        {asset.notes && (
                            <div>
                                <p className="text-sm text-muted-foreground">{t('Notes')}</p>
                                <p className="whitespace-pre-wrap">{asset.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {asset.taskAllocations && asset.taskAllocations.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckSquare className="h-5 w-5" />
                                {t('Used in')}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">{t('Where and how many of this asset were used')}</p>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2 font-medium">{t('Task')}</th>
                                            <th className="text-left py-2 font-medium">{t('Project')}</th>
                                            <th className="text-right py-2 font-medium">{t('Quantity')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {asset.taskAllocations.map((alloc) => (
                                            <tr key={alloc.id} className="border-b last:border-0">
                                                <td className="py-2">
                                                    <Link
                                                        href={alloc.project ? route('projects.show', alloc.project.id) + '?tab=tasks' : route('tasks.index')}
                                                        className="text-primary hover:underline font-medium"
                                                    >
                                                        {alloc.title}
                                                    </Link>
                                                </td>
                                                <td className="py-2 text-muted-foreground">
                                                    {alloc.project ? (
                                                        <Link href={route('projects.show', alloc.project.id)} className="hover:underline">
                                                            {alloc.project.title}
                                                        </Link>
                                                    ) : '—'}
                                                </td>
                                                <td className="py-2 text-right font-medium">{alloc.pivot?.quantity ?? 1}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </PageTemplate>
    );
}
