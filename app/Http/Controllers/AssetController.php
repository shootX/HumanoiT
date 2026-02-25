<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\Project;
use App\Traits\HasPermissionChecks;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssetController extends Controller
{
    use HasPermissionChecks;

    public function index(Request $request)
    {
        $this->authorizePermission('asset_view_any');

        $user = auth()->user();
        $workspaceId = $user->current_workspace_id;

        $query = Asset::forWorkspace($workspaceId)->with(['project', 'assetCategory']);

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

        $perPage = $request->get('per_page', 30);
        $assets = $query->latest()->paginate($perPage)->withQueryString();

        $projects = Project::forWorkspace($workspaceId)->orderBy('title')->get(['id', 'title']);
        $assetCategories = AssetCategory::forWorkspace($workspaceId)->ordered()->get(['id', 'name', 'color']);

        return Inertia::render('assets/Index', [
            'assets' => $assets,
            'projects' => $projects,
            'assetCategories' => $assetCategories,
            'filters' => $request->only(['search', 'type', 'status', 'project_id', 'asset_category_id', 'per_page']),
        ]);
    }

    public function show(Asset $asset)
    {
        $this->authorizePermission('asset_view');

        if ($asset->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        $asset->load([
            'project', 'assetCategory', 'invoice:id,invoice_number,invoice_date',
            'taskAllocations' => fn ($q) => $q->with('project:id,title')->orderBy('asset_task.created_at', 'desc')->limit(50),
        ]);

        $sourceInvoices = \DB::table('invoice_items as ii')
            ->join('invoices as i', 'ii.invoice_id', '=', 'i.id')
            ->where('ii.asset_id', $asset->id)
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

        return Inertia::render('assets/Show', [
            'asset' => $asset,
            'sourceInvoices' => $sourceInvoices,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizePermission('asset_create');

        $workspaceId = auth()->user()->current_workspace_id;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'quantity' => 'nullable|integer|min:1',
            'asset_code' => 'nullable|string|max:255',
            'asset_category_id' => 'nullable|exists:asset_categories,id',
            'type' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'project_id' => 'nullable|exists:projects,id',
            'purchase_date' => 'nullable|date',
            'warranty_until' => 'nullable|date',
            'status' => 'required|in:active,used,maintenance,retired',
            'notes' => 'nullable|string',
        ]);

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

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'quantity' => 'nullable|integer|min:1',
            'asset_code' => 'nullable|string|max:255',
            'asset_category_id' => 'nullable|exists:asset_categories,id',
            'type' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'project_id' => 'nullable|exists:projects,id',
            'purchase_date' => 'nullable|date',
            'warranty_until' => 'nullable|date',
            'status' => 'required|in:active,used,maintenance,retired',
            'notes' => 'nullable|string',
        ]);

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

        $asset->tasks()->update(['asset_id' => null]);
        $asset->delete();

        return redirect()->route('assets.index')->with('success', __('Asset deleted successfully.'));
    }
}
