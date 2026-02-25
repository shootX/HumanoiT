<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetAttachment;
use App\Models\MediaItem;
use App\Helpers\UrlSecurity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AssetAttachmentController extends Controller
{
    public function store(Request $request, Asset $asset)
    {
        if ($asset->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403, __('Asset not found in current workspace'));
        }

        $request->validate([
            'media_ids' => 'required|array',
            'media_ids.*' => 'integer|exists:media_items,id'
        ]);

        foreach ($request->media_ids as $mediaItemId) {
            AssetAttachment::firstOrCreate(
                ['asset_id' => $asset->id, 'media_item_id' => $mediaItemId],
                [
                    'workspace_id' => $asset->workspace_id,
                    'uploaded_by' => auth()->id()
                ]
            );
        }

        return back()->with('success', __('Attachment(s) uploaded successfully'));
    }

    public function destroy(AssetAttachment $assetAttachment)
    {
        if ($assetAttachment->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403, __('Attachment not found in current workspace'));
        }

        $assetAttachment->delete();

        return back()->with('success', __('Attachment deleted successfully'));
    }

    public function download(AssetAttachment $assetAttachment)
    {
        if ($assetAttachment->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403, __('Attachment not found in current workspace'));
        }

        $mediaItem = $assetAttachment->mediaItem;
        if (!$mediaItem) {
            abort(404, __('File not found'));
        }

        if ($mediaItem->url) {
            if (!UrlSecurity::isOwnAppUrl($mediaItem->url)) {
                abort(403, __('External file URLs are not allowed'));
            }
            $safeName = preg_replace('/[^\w\-\.]/', '_', $mediaItem->name ?? 'download');
            $headers = [
                'Content-Type' => $mediaItem->mime_type ?? 'application/octet-stream',
                'Content-Disposition' => 'attachment; filename="' . $safeName . '"',
            ];
            return response()->streamDownload(function () use ($mediaItem) {
                echo file_get_contents($mediaItem->url);
            }, $safeName, $headers);
        }

        if (!$mediaItem->path || !Storage::disk($mediaItem->disk ?? 'public')->exists($mediaItem->path)) {
            abort(404, __('File not found'));
        }

        $safeName = preg_replace('/[^\w\-\.]/', '_', $mediaItem->name ?? 'download');
        return Storage::disk($mediaItem->disk ?? 'public')->download($mediaItem->path, $safeName);
    }
}
