<?php

namespace App\Http\Controllers;

use App\Models\Tax;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaxController extends BaseController
{
    public function index()
    {
        $taxes = Tax::where('workspace_id', auth()->user()->current_workspace_id)
            ->orderBy('name')
            ->get();

        return Inertia::render('taxes/Index', [
            'taxes' => $taxes
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'rate' => 'required|numeric|min:0|max:100',
            'is_inclusive' => 'nullable|boolean',
        ]);

        Tax::create([
            'name' => $request->name,
            'rate' => $request->rate,
            'is_inclusive' => $request->boolean('is_inclusive'),
            'workspace_id' => auth()->user()->current_workspace_id,
        ]);

        return redirect()->back()->with('success', 'Tax created successfully.');
    }

    public function update(Request $request, Tax $tax)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'rate' => 'required|numeric|min:0|max:100',
            'is_inclusive' => 'nullable|boolean',
        ]);

        $tax->update([
            'name' => $request->name,
            'rate' => $request->rate,
            'is_inclusive' => $request->boolean('is_inclusive'),
        ]);

        return redirect()->back()->with('success', 'Tax updated successfully.');
    }

    public function destroy(Tax $tax)
    {
        $tax->delete();

        return redirect()->back()->with('success', 'Tax deleted successfully.');
    }
}