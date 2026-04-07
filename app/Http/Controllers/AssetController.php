<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\Project;
use App\Models\Unit;
use App\Services\AssetMergeService;
use App\Traits\HasPermissionChecks;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssetController extends Controller
{
    use HasPermissionChecks;

    public function index(Request $request)
    {
        return $this->renderAssetList($request, false);
    }

    public function instrumentsIndex(Request $request)
    {
        return $this->renderAssetList($request, true);
    }

    /**
     * @param  bool  $instrumentsOnly  true = მხოლოდ ინსტრუმენტები, false = ყველა არა-ინსტრუმენტი
     */
    private function renderAssetList(Request $request, bool $instrumentsOnly)
    {
        $this->authorizePermission('asset_view_any');

        $user = auth()->user();
        $workspaceId = $user->current_workspace_id;

        $query = Asset::forWorkspace($workspaceId)->notMerged()->with(['project', 'assetCategory', 'unit']);
        if ($instrumentsOnly) {
            $query->instruments();
        } else {
            $query->excludingInstruments();
        }

        $this->applyAssetListFilters($query, $request);

        $perPage = $request->get('per_page', 30);
        $assets = $query->latest()->paginate($perPage)->withQueryString();

        $projects = Project::forWorkspace($workspaceId)->orderBy('title')->get(['id', 'title']);
        $assetCategories = AssetCategory::forWorkspace($workspaceId)->ordered()->get(['id', 'name', 'color']);
        $units = Unit::forWorkspace($workspaceId)->orderBy('name')->get(['id', 'name', 'short_name']);

        return Inertia::render('assets/Index', [
            'assets' => $assets,
            'projects' => $projects,
            'assetCategories' => $assetCategories,
            'units' => $units,
            'assetListMode' => $instrumentsOnly ? 'instruments' : 'default',
            'filters' => $request->only(['search', 'type', 'status', 'project_id', 'asset_category_id', 'per_page']),
        ]);
    }

    private function applyAssetListFilters(Builder $query, Request $request): void
    {
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('asset_code', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        if ($request->filled('type') && $request->type !== 'all') {
            $query->byType($request->type);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->byStatus($request->status);
        } elseif (!$request->filled('status')) {
            $query->byStatus('active');
        }

        if ($request->filled('project_id') && $request->project_id !== 'all') {
            $query->forProject($request->project_id);
        }

        if ($request->filled('asset_category_id') && $request->asset_category_id !== 'all') {
            $query->byCategory($request->asset_category_id);
        }
    }

    public function bulkInstrument(Request $request)
    {
        $this->authorizePermission('asset_update');

        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:assets,id',
            'is_instrument' => 'required|boolean',
        ]);

        $workspaceId = auth()->user()->current_workspace_id;

        $updated = Asset::forWorkspace($workspaceId)
            ->notMerged()
            ->whereIn('id', $validated['ids'])
            ->update(['is_instrument' => $validated['is_instrument']]);

        if ($updated === 0) {
            return back()->with('error', __('No matching records were updated.'));
        }

        $message = $validated['is_instrument']
            ? __('Marked as instrument.')
            : __('Removed from instruments.');

        return back()->with('success', $message);
    }

    public function merge(Request $request, AssetMergeService $mergeService)
    {
        $this->authorizePermission('asset_update');

        $validated = $request->validate([
            'primary_asset_id' => 'required|integer|exists:assets,id',
            'merge_asset_ids' => 'required|array|min:1',
            'merge_asset_ids.*' => 'integer|exists:assets,id',
            'name' => 'required|string|max:255',
        ]);

        $workspaceId = auth()->user()->current_workspace_id;
        $primaryId = (int) $validated['primary_asset_id'];
        $secondaryIds = array_map('intval', $validated['merge_asset_ids']);
        $secondaryIds = array_values(array_unique(array_filter($secondaryIds, fn (int $id) => $id !== $primaryId)));

        if ($secondaryIds === []) {
            return back()->withErrors(['merge_asset_ids' => __('Select at least one other asset to merge.')]);
        }

        $primary = Asset::forWorkspace($workspaceId)->notMerged()->where('id', $primaryId)->first();
        if (!$primary) {
            return back()->withErrors(['primary_asset_id' => __('Invalid primary asset.')]);
        }

        $count = Asset::forWorkspace($workspaceId)->notMerged()->whereIn('id', $secondaryIds)->count();
        if ($count !== count($secondaryIds)) {
            return back()->withErrors(['merge_asset_ids' => __('One or more assets are invalid or already merged.')]);
        }

        try {
            $mergeService->merge($workspaceId, $primaryId, $secondaryIds, $validated['name']);
        } catch (\InvalidArgumentException $e) {
            $key = $e->getMessage();
            $message = match ($key) {
                'merge_no_secondary' => __('merge_no_secondary'),
                'merge_invalid_assets' => __('merge_invalid_assets'),
                'merge_instrument_mismatch' => __('merge_instrument_mismatch'),
                default => __('Merge failed.'),
            };

            return back()->withErrors(['merge' => $message]);
        }

        return redirect()
            ->route('assets.show', $primaryId)
            ->with('success', __('Assets merged successfully.'));
    }

    public function show(Asset $asset)
    {
        $this->authorizePermission('asset_view');

        if ($asset->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        if ($asset->merged_into_asset_id) {
            return redirect()->route('assets.show', $asset->merged_into_asset_id);
        }

        $asset->load([
            'project', 'assetCategory', 'unit', 'invoice:id,invoice_number,invoice_date',
            'taskAllocations' => fn ($q) => $q->with('project:id,title')->orderBy('asset_task.created_at', 'desc')->limit(50),
        ]);

        $mergedChildIds = Asset::forWorkspace($asset->workspace_id)
            ->where('merged_into_asset_id', $asset->id)
            ->pluck('id');
        $invoiceAssetIds = collect([$asset->id])->merge($mergedChildIds)->unique()->values()->all();

        $sourceInvoices = \DB::table('invoice_items as ii')
            ->join('invoices as i', 'ii.invoice_id', '=', 'i.id')
            ->whereIn('ii.asset_id', $invoiceAssetIds)
            ->where('ii.type', 'asset')
            ->select('i.id', 'i.invoice_number', 'i.invoice_date', 'ii.quantity')
            ->orderBy('i.invoice_date')
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'invoice_number' => $r->invoice_number,
                'invoice_date' => $r->invoice_date,
                'quantity' => (float) $r->quantity,
            ]);

        $mergedFormerNames = Asset::forWorkspace($asset->workspace_id)
            ->where('merged_into_asset_id', $asset->id)
            ->orderBy('id')
            ->get(['id', 'name', 'asset_code'])
            ->map(fn (Asset $a) => [
                'id' => $a->id,
                'name' => $a->name,
                'asset_code' => $a->asset_code,
            ])
            ->values()
            ->all();

        return Inertia::render('assets/Show', [
            'asset' => $asset,
            'sourceInvoices' => $sourceInvoices,
            'mergedFormerNames' => $mergedFormerNames,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizePermission('asset_create');

        $workspaceId = auth()->user()->current_workspace_id;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'quantity' => 'nullable|numeric|min:0',
            'asset_code' => 'nullable|string|max:255',
            'asset_category_id' => 'nullable|exists:asset_categories,id',
            'unit_id' => 'nullable|exists:units,id',
            'type' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'project_id' => 'nullable|exists:projects,id',
            'purchase_date' => 'nullable|date',
            'warranty_until' => 'nullable|date',
            'status' => 'required|in:active,used,maintenance,retired',
            'is_instrument' => 'sometimes|boolean',
            'notes' => 'nullable|string',
        ]);

        if (!array_key_exists('is_instrument', $validated)) {
            $validated['is_instrument'] = false;
        }

        if (!empty($validated['asset_category_id'])) {
            $category = AssetCategory::find($validated['asset_category_id']);
            if (!$category || $category->workspace_id !== $workspaceId) {
                return back()->withErrors(['asset_category_id' => __('Invalid category.')])->withInput();
            }
        }

        if (empty(trim($validated['asset_code'] ?? ''))) {
            $validated['asset_code'] = Asset::generateUniqueAssetCode($workspaceId);
        } else {
            $exists = Asset::forWorkspace($workspaceId)
                ->notMerged()
                ->where('asset_code', $validated['asset_code'])
                ->exists();
            if ($exists) {
                return back()->withErrors(['asset_code' => __('Asset code already exists in this workspace.')])->withInput();
            }
        }

        if (!empty($validated['project_id'])) {
            $project = Project::find($validated['project_id']);
            if (!$project || $project->workspace_id !== $workspaceId) {
                return back()->withErrors(['project_id' => __('Invalid project.')])->withInput();
            }
        }

        $validated['workspace_id'] = $workspaceId;
        Asset::create($validated);

        return redirect()->route('assets.index')->with('success', __('Asset created successfully.'));
    }

    public function update(Request $request, Asset $asset)
    {
        $this->authorizePermission('asset_update');

        if ($asset->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        if ($asset->merged_into_asset_id) {
            return redirect()->route('assets.show', $asset->merged_into_asset_id)
                ->with('error', __('This asset was merged into another record.'));
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'quantity' => 'nullable|numeric|min:0',
            'asset_code' => 'nullable|string|max:255',
            'asset_category_id' => 'nullable|exists:asset_categories,id',
            'unit_id' => 'nullable|exists:units,id',
            'type' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'project_id' => 'nullable|exists:projects,id',
            'purchase_date' => 'nullable|date',
            'warranty_until' => 'nullable|date',
            'status' => 'required|in:active,used,maintenance,retired',
            'is_instrument' => 'sometimes|boolean',
            'notes' => 'nullable|string',
        ]);

        if (!array_key_exists('is_instrument', $validated)) {
            unset($validated['is_instrument']);
        }

        if (!empty($validated['asset_category_id'])) {
            $category = AssetCategory::find($validated['asset_category_id']);
            if (!$category || $category->workspace_id !== $asset->workspace_id) {
                return back()->withErrors(['asset_category_id' => __('Invalid category.')])->withInput();
            }
        }

        if (empty(trim($validated['asset_code'] ?? ''))) {
            $validated['asset_code'] = Asset::generateUniqueAssetCode($asset->workspace_id);
        } else {
            $exists = Asset::forWorkspace($asset->workspace_id)
                ->notMerged()
                ->where('asset_code', $validated['asset_code'])
                ->where('id', '!=', $asset->id)
                ->exists();
            if ($exists) {
                return back()->withErrors(['asset_code' => __('Asset code already exists in this workspace.')])->withInput();
            }
        }

        if (!empty($validated['project_id'])) {
            $project = Project::find($validated['project_id']);
            if (!$project || $project->workspace_id !== $asset->workspace_id) {
                return back()->withErrors(['project_id' => __('Invalid project.')])->withInput();
            }
        }

        $asset->update($validated);

        return redirect()->back()->with('success', __('Asset updated successfully.'));
    }

    public function destroy(Asset $asset)
    {
        $this->authorizePermission('asset_delete');

        if ($asset->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        if ($asset->merged_into_asset_id) {
            return redirect()->route('assets.index')->with('error', __('Cannot delete a merged asset record.'));
        }

        if ($asset->mergedIntoChildren()->exists()) {
            return redirect()->route('assets.index')->with('error', __('Cannot delete an asset that has merged records linked to it.'));
        }

        $asset->tasks()->update(['asset_id' => null]);
        $asset->delete();

        return redirect()->route('assets.index')->with('success', __('Asset deleted successfully.'));
    }
}
