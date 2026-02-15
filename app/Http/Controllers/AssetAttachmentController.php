<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetAttachment;
use App\Helpers\UrlSecurity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AssetAttachmentController extends Controller
{
    public function store(Request $request, Asset $asset)
    {
        if ($asset->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        $validated = $request->validate([
            'media_item_ids' => 'required|array',
            'media_item_ids.*' => 'exists:media_items,id'
        ]);

        foreach ($validated['media_item_ids'] as $mediaItemId) {
            AssetAttachment::firstOrCreate([
                'asset_id' => $asset->id,
                'media_item_id' => $mediaItemId
            ], [
                'workspace_id' => $asset->workspace_id,
                'attachment_type' => 'warranty',
                'uploaded_by' => auth()->id()
            ]);
        }

        return back();
    }

    public function destroy(AssetAttachment $assetAttachment)
    {
        if ($assetAttachment->asset->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        $assetAttachment->delete();

        return back();
    }

    public function download(AssetAttachment $assetAttachment)
    {
        if ($assetAttachment->asset->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        $mediaItem = $assetAttachment->mediaItem;

        if (!$mediaItem) {
            abort(404, 'Media item not found');
        }

        if ($mediaItem->url) {
            if (!UrlSecurity::isOwnAppUrl($mediaItem->url)) {
                abort(403, 'External file URLs are not allowed');
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
            abort(404, 'File not found');
        }

        $safeName = preg_replace('/[^\w\-\.]/', '_', $mediaItem->name ?? 'download');
        return Storage::disk($mediaItem->disk ?? 'public')->download(
            $mediaItem->path,
            $safeName
        );
    }
}
