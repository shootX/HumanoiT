<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetWarrantyCase;
use Illuminate\Http\Request;

class AssetWarrantyCaseController extends Controller
{
    public function store(Request $request, Asset $asset)
    {
        if ($asset->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403, __('Asset not found in current workspace'));
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|string|in:open,closed',
        ]);

        AssetWarrantyCase::create([
            'workspace_id' => $asset->workspace_id,
            'asset_id' => $asset->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? 'open',
            'opened_at' => now(),
        ]);

        return back()->with('success', __('Warranty case created successfully'));
    }

    public function update(Request $request, AssetWarrantyCase $assetWarrantyCase)
    {
        if ($assetWarrantyCase->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403, __('Warranty case not found in current workspace'));
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|string|in:open,closed',
        ]);

        if (isset($validated['status']) && $validated['status'] === 'closed') {
            $validated['closed_at'] = now();
        }

        $assetWarrantyCase->update($validated);

        return back()->with('success', __('Warranty case updated successfully'));
    }

    public function destroy(AssetWarrantyCase $assetWarrantyCase)
    {
        if ($assetWarrantyCase->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403, __('Warranty case not found in current workspace'));
        }

        $assetWarrantyCase->delete();

        return back()->with('success', __('Warranty case deleted successfully'));
    }
}
