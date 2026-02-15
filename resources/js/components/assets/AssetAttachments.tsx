import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, MoreHorizontal, Trash2, File, Image, FileText } from 'lucide-react';
import MediaPicker from '@/components/MediaPicker';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { useTranslation } from 'react-i18next';

interface AssetAttachment {
    id: number;
    asset_id: number;
    media_item_id: number;
    media_item?: {
        id: number;
        name: string;
        url: string;
        thumb_url: string;
        mime_type: string;
    };
}

interface Props {
    asset: { id: number };
    attachments: AssetAttachment[];
    canEdit?: boolean;
}

export default function AssetAttachments({ asset, attachments, canEdit = true }: Props) {
    const { t } = useTranslation();
    const [selectedMedia, setSelectedMedia] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [attachmentToDelete, setAttachmentToDelete] = useState<AssetAttachment | null>(null);

    const handleMediaSelect = (url: string, mediaIds?: number[]) => {
        setSelectedMedia(url);
        if (mediaIds && mediaIds.length > 0) {
            router.post(route('asset-attachments.store', asset.id), {
                media_item_ids: mediaIds
            }, {
                onSuccess: () => setSelectedMedia('')
            });
        }
    };

    const handleDownload = (attachmentId: number) => {
        window.open(route('asset-attachments.download', attachmentId), '_blank');
    };

    const handleDelete = (att: AssetAttachment) => {
        setAttachmentToDelete(att);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (attachmentToDelete) {
            router.delete(route('asset-attachments.destroy', attachmentToDelete.id), {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setAttachmentToDelete(null);
                }
            });
        }
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType?.startsWith('image/')) return Image;
        if (mimeType?.includes('pdf') || mimeType?.includes('document')) return FileText;
        return File;
    };

    return (
        <div className="space-y-4">
            {attachments.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {attachments.map((attachment) => {
                        const FileIcon = getFileIcon(attachment.media_item?.mime_type || '');
                        const isImage = attachment.media_item?.mime_type?.startsWith('image/');
                        return (
                            <div key={attachment.id} className="relative group border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                <div className="aspect-square bg-gray-50 flex items-center justify-center">
                                    {isImage && attachment.media_item?.thumb_url ? (
                                        <img
                                            src={attachment.media_item.thumb_url}
                                            alt={attachment.media_item?.name || 'Document'}
                                            className="w-full h-full object-cover cursor-pointer"
                                            onClick={() => window.open(attachment.media_item?.url || attachment.media_item?.thumb_url, '_blank')}
                                        />
                                    ) : (
                                        <FileIcon className="h-12 w-12 text-gray-400" />
                                    )}
                                </div>
                                <div className="p-2 border-t bg-white">
                                    <p className="text-sm font-medium truncate" title={attachment.media_item?.name}>
                                        {attachment.media_item?.name || 'Document'}
                                    </p>
                                </div>
                                <div className="absolute top-2 right-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="z-[9999]">
                                            <DropdownMenuItem onClick={() => handleDownload(attachment.id)}>
                                                <Download className="h-4 w-4 mr-2" />
                                                {t('Download')}
                                            </DropdownMenuItem>
                                            {canEdit && (
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(attachment)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    {t('Remove')}
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {canEdit && (
                <div>
                    <MediaPicker
                        label={t('Upload warranty document')}
                        value={selectedMedia}
                        onChange={handleMediaSelect}
                        placeholder={t('Select or upload file...')}
                        showPreview={true}
                    />
                </div>
            )}

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setAttachmentToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                itemName={attachmentToDelete?.media_item?.name || 'document'}
                entityName="attachment"
            />
        </div>
    );
}
