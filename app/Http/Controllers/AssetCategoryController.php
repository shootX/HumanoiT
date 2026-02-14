<?php

namespace App\Http\Controllers;

use App\Models\AssetCategory;
use App\Traits\HasPermissionChecks;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssetCategoryController extends Controller
{
    use HasPermissionChecks;

    public function index(): Response
    {
        $this->authorizePermission('asset_manage_categories');

        $user = auth()->user();
        $categories = AssetCategory::forWorkspace($user->current_workspace_id)
            ->withCount('assets')
            ->ordered()
            ->get();

        return Inertia::render('asset-categories/Index', [
            'categories' => $categories,
            'permissions' => [
                'create' => $this->checkPermission('asset_manage_categories'),
                'update' => $this->checkPermission('asset_manage_categories'),
                'delete' => $this->checkPermission('asset_manage_categories'),
                'reorder' => $this->checkPermission('asset_manage_categories'),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizePermission('asset_manage_categories');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'required|string|max:7',
        ]);

        $maxOrder = AssetCategory::forWorkspace(auth()->user()->current_workspace_id)->max('order') ?? 0;

        AssetCategory::create([
            ...$validated,
            'workspace_id' => auth()->user()->current_workspace_id,
            'order' => $maxOrder + 1,
        ]);

        return back()->with('success', __('Asset category created successfully!'));
    }

    public function update(Request $request, AssetCategory $assetCategory)
    {
        $this->authorizePermission('asset_manage_categories');

        if ($assetCategory->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'required|string|max:7',
        ]);

        $assetCategory->update($validated);

        return back()->with('success', __('Asset category updated successfully!'));
    }

    public function destroy(AssetCategory $assetCategory)
    {
        $this->authorizePermission('asset_manage_categories');

        if ($assetCategory->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        if ($assetCategory->assets()->count() > 0) {
            return back()->with('error', __('Cannot delete category with existing assets'));
        }

        $assetCategory->delete();

        return back()->with('success', __('Asset category deleted successfully!'));
    }

    public function reorder(Request $request)
    {
        $this->authorizePermission('asset_manage_categories');

        $validated = $request->validate([
            'categories' => 'required|array',
            'categories.*.id' => 'required|exists:asset_categories,id',
            'categories.*.order' => 'required|integer|min:1'
        ]);

        foreach ($validated['categories'] as $catData) {
            AssetCategory::where('id', $catData['id'])
                ->where('workspace_id', auth()->user()->current_workspace_id)
                ->update(['order' => $catData['order']]);
        }

        return back()->with('success', __('Asset categories reordered successfully!'));
    }
}
