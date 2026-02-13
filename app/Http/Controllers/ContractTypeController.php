<?php

namespace App\Http\Controllers;

use App\Models\ContractType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContractTypeController extends Controller
{
    public function index(Request $request)
    {
        $workspaceId = auth()->user()->current_workspace_id;
        $query = ContractType::forWorkspace($workspaceId)
            ->with('creator')
            ->withCount('contracts');

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }
        
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        $contractTypes = $query->ordered()->paginate($request->get('per_page', 15));

        return Inertia::render('contracts/types/Index', [
            'contractTypes' => $contractTypes,
            'filters' => $request->only(['status', 'search', 'per_page', 'view']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'is_active' => 'boolean',
        ]);

        $workspaceId = auth()->user()->current_workspace_id;
        ContractType::create([
            'name' => $request->name,
            'description' => $request->description,
            'color' => $request->color,
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => ContractType::forWorkspace($workspaceId)->max('sort_order') + 1,
            'workspace_id' => $workspaceId,
            'created_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Contract type created successfully.');
    }

    public function update(Request $request, ContractType $contractType)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'is_active' => 'boolean',
        ]);

        $contractType->update([
            'name' => $request->name,
            'description' => $request->description,
            'color' => $request->color,
            'is_active' => $request->boolean('is_active'),
        ]);

        return redirect()->back()->with('success', 'Contract type updated successfully.');
    }

    public function destroy(ContractType $contractType)
    {
        if ($contractType->contracts()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete contract type that has contracts associated with it.');
        }

        $contractType->delete();
        return redirect()->back()->with('success', 'Contract type deleted successfully.');
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:contracts_types,id',
            'items.*.sort_order' => 'required|integer',
        ]);

        $workspaceId = auth()->user()->current_workspace_id;
        foreach ($request->items as $item) {
            ContractType::where('id', $item['id'])
                ->where('workspace_id', $workspaceId)
                ->update(['sort_order' => $item['sort_order']]);
        }

        return redirect()->back()->with('success', 'Contract types reordered successfully.');
    }

    public function toggleStatus(ContractType $contractType)
    {
        $contractType->update(['is_active' => !$contractType->is_active]);
        $status = $contractType->is_active ? 'activated' : 'deactivated';
        return redirect()->back()->with('success', "Contract type {$status} successfully.");
    }
}