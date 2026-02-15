import { Link, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Calendar, MapPin, CheckSquare, FileText, FileCheck } from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { useTranslation } from 'react-i18next';
import { Asset } from '@/types';
import AssetAttachments from '@/components/assets/AssetAttachments';
import AssetWarrantyCases from '@/components/assets/AssetWarrantyCases';
import { hasPermission } from '@/utils/authorization';

interface Props {
    asset: Asset & {
        project?: { id: number; title: string };
        invoice?: { id: number; invoice_number: string } | null;
        tasks?: Array<{ id: number; title: string; project?: { id: number } }>;
        attachments?: Array<{ id: number; asset_id: number; media_item_id: number; media_item?: { id: number; name: string; url: string; thumb_url: string; mime_type: string } }>;
        warranty_cases?: Array<{ id: number; asset_id: number; damage_description: string | null; comment: string | null; status: string; reported_at: string | null; created_at: string }>;
    };
}

export default function AssetShow({ asset }: Props) {
    const { t } = useTranslation();
    const { auth } = usePage().props as any;
    const canEdit = hasPermission(auth?.permissions || [], 'asset_update');

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

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileCheck className="h-5 w-5" />
                            {t('Warranty documents')}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            {t('Attach warranty certificates and related documents')}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <AssetAttachments
                            asset={{ id: asset.id }}
                            attachments={asset.attachments || []}
                            canEdit={canEdit}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileCheck className="h-5 w-5" />
                            {t('Warranty cases')}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            {t('Damage reports, repair status and comments')}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <AssetWarrantyCases
                            asset={{ id: asset.id }}
                            warrantyCases={asset.warranty_cases || []}
                            canEdit={canEdit}
                        />
                    </CardContent>
                </Card>

                {asset.tasks && asset.tasks.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckSquare className="h-5 w-5" />
                                {t('Related Tasks')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {asset.tasks.map((task) => (
                                    <li key={task.id}>
                                        <Link
                                            href={route('tasks.show', task.id)}
                                            className="text-primary hover:underline font-medium"
                                        >
                                            {task.title}
                                        </Link>
                                        {task.project && (
                                            <span className="text-sm text-muted-foreground ml-2">({task.project.title})</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>
        </PageTemplate>
    );
}
