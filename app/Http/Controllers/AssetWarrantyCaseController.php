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
            abort(403);
        }

        $validated = $request->validate([
            'damage_description' => 'nullable|string',
            'comment' => 'nullable|string',
            'status' => 'required|in:repaired,not_repaired,not_done,not_warranty_case',
            'reported_at' => 'nullable|date',
        ]);

        $validated['asset_id'] = $asset->id;
        $validated['created_by'] = auth()->id();
        $validated['reported_at'] = $validated['reported_at'] ?? now();

        AssetWarrantyCase::create($validated);

        return back()->with('success', __('Warranty case added.'));
    }

    public function update(Request $request, AssetWarrantyCase $assetWarrantyCase)
    {
        if ($assetWarrantyCase->asset->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        $validated = $request->validate([
            'damage_description' => 'nullable|string',
            'comment' => 'nullable|string',
            'status' => 'required|in:repaired,not_repaired,not_done,not_warranty_case',
            'reported_at' => 'nullable|date',
        ]);

        $assetWarrantyCase->update($validated);

        return back()->with('success', __('Warranty case updated.'));
    }

    public function destroy(AssetWarrantyCase $assetWarrantyCase)
    {
        if ($assetWarrantyCase->asset->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        $assetWarrantyCase->delete();

        return back()->with('success', __('Warranty case deleted.'));
    }
}
