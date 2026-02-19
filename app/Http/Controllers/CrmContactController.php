<?php

namespace App\Http\Controllers;

use App\Models\CrmContact;
use App\Models\Invoice;
use App\Traits\HasPermissionChecks;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CrmContactController extends Controller
{
    use HasPermissionChecks;

    public function index(Request $request)
    {
        $this->authorizePermission('crm_contact_view_any');

        $workspaceId = auth()->user()->current_workspace_id;
        if (!$workspaceId) {
            return redirect()->route('dashboard')->with('error', __('Please select a workspace first.'));
        }

        $query = CrmContact::forWorkspace($workspaceId)->with('creator:id,name');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('company_name', 'like', "%{$search}%")
                    ->orWhere('brand_name', 'like', "%{$search}%")
                    ->orWhere('identification_code', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('type') && $request->type !== 'all') {
            $query->byType($request->type);
        }

        $sortField = $request->input('sort_field', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $perPage = $request->get('per_page', 15);
        $contacts = $query->paginate($perPage)->withQueryString();

        return Inertia::render('crm-contacts/Index', [
            'contacts' => $contacts,
            'filters' => $request->only(['search', 'type', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function show(CrmContact $crmContact)
    {
        $this->authorizePermission('crm_contact_view_any');

        if ($crmContact->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        $crmContact->load('creator:id,name');
        $invoices = Invoice::where('crm_contact_id', $crmContact->id)
            ->with(['project:id,title'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('crm-contacts/Show', [
            'contact' => $crmContact,
            'invoices' => $invoices,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizePermission('crm_contact_create');

        $workspaceId = auth()->user()->current_workspace_id;
        if (!$workspaceId) {
            return back()->withErrors(['workspace' => __('Please select a workspace first.')])->withInput();
        }

        $validated = $request->validate([
            'type' => 'required|in:individual,legal',
            'name' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'identification_code' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($validated['type'] === 'legal') {
            if (empty(trim($validated['company_name'] ?? '')) && empty(trim($validated['brand_name'] ?? ''))) {
                return back()->withErrors(['company_name' => __('Company name or brand name is required for legal entities.')])->withInput();
            }
        }
        if ($validated['type'] === 'individual' && empty(trim($validated['name'] ?? ''))) {
            return back()->withErrors(['name' => __('Name is required for physical persons.')])->withInput();
        }

        CrmContact::create([
            ...$validated,
            'workspace_id' => $workspaceId,
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('crm-contacts.index')->with('success', __('CRM contact created successfully.'));
    }

    public function update(Request $request, CrmContact $crmContact)
    {
        $this->authorizePermission('crm_contact_update');

        if ($crmContact->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        $validated = $request->validate([
            'type' => 'required|in:individual,legal',
            'name' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'identification_code' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($validated['type'] === 'legal') {
            if (empty(trim($validated['company_name'] ?? '')) && empty(trim($validated['brand_name'] ?? ''))) {
                return back()->withErrors(['company_name' => __('Company name or brand name is required for legal entities.')])->withInput();
            }
        }
        if ($validated['type'] === 'individual' && empty(trim($validated['name'] ?? ''))) {
            return back()->withErrors(['name' => __('Name is required for physical persons.')])->withInput();
        }

        $crmContact->update($validated);

        return redirect()->back()->with('success', __('CRM contact updated successfully.'));
    }

    public function destroy(CrmContact $crmContact)
    {
        $this->authorizePermission('crm_contact_delete');

        if ($crmContact->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        $crmContact->delete();

        return redirect()->route('crm-contacts.index')->with('success', __('CRM contact deleted successfully.'));
    }

    public function export(Request $request)
    {
        $this->authorizePermission('crm_contact_export');

        $workspaceId = auth()->user()->current_workspace_id;
        $query = CrmContact::forWorkspace($workspaceId);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('company_name', 'like', "%{$search}%")
                    ->orWhere('brand_name', 'like', "%{$search}%")
                    ->orWhere('identification_code', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('type') && $request->type !== 'all') {
            $query->byType($request->type);
        }

        $contacts = $query->orderBy('created_at', 'desc')->get();

        $filename = 'crm_contacts_' . now()->format('Y-m-d_H-i-s') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($contacts) {
            $file = fopen('php://output', 'w');
            fputcsv($file, [
                __('Type'),
                __('Name'),
                __('Company Name'),
                __('Brand Name'),
                __('Identification Code'),
                __('Email'),
                __('Phone'),
                __('Address'),
                __('Notes'),
                __('Created At'),
            ]);

            foreach ($contacts as $c) {
                fputcsv($file, [
                    $c->type === 'legal' ? __('Legal Entity') : __('Physical Person'),
                    $c->name,
                    $c->company_name ?? '',
                    $c->brand_name ?? '',
                    $c->identification_code ?? '',
                    $c->email ?? '',
                    $c->phone ?? '',
                    $c->address ?? '',
                    $c->notes ?? '',
                    $c->created_at->format('Y-m-d H:i:s'),
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
