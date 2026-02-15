<?php

namespace App\Http\Controllers;

use App\Models\CrmContact;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Project;
use App\Models\Task;
use App\Models\ProjectExpense;
use App\Models\TimesheetEntry;
use App\Events\InvoiceCreated;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $workspace = $user->currentWorkspace;
        $userWorkspaceRole = $workspace->getMemberRole($user);
       
        $query = Invoice::with(['project:id,title', 'client:id,name,avatar', 'crmContact:id,name,company_name,email', 'creator:id,name', 'payments'])
            ->where('workspace_id', $workspace->id);

        // Apply role-based filtering
        if (in_array($userWorkspaceRole, ['manager', 'member'])) {
            $query->where(function ($q) use ($user, $userWorkspaceRole) {
                // Show sent invoices to all members
                $q->where('status', '!=', 'draft')
                    ->whereHas('project', function ($projQ) use ($user) {
                        $projQ->where(function ($projectQuery) use ($user) {
                            $projectQuery->whereHas('members', function ($memberQuery) use ($user) {
                                $memberQuery->where('user_id', $user->id);
                            })->orWhere('created_by', $user->id);
                        });
                    });

                // Show draft invoices only to managers
                if ($userWorkspaceRole === 'manager') {
                    $q->orWhere('status', 'draft')
                        ->whereHas('project', function ($projQ) use ($user) {
                            $projQ->where(function ($projectQuery) use ($user) {
                                $projectQuery->whereHas('members', function ($memberQuery) use ($user) {
                                    $memberQuery->where('user_id', $user->id);
                                })->orWhere('created_by', $user->id);
                            });
                        });
                }
            });
        } elseif ($userWorkspaceRole === 'client') {
            // Clients see all invoices assigned to them (including drafts)
            $query->where('client_id', $user->id);
        }
        // Owners see all invoices (no additional filtering needed)

        // Apply filters
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('invoice_number', 'like', '%' . $request->search . '%')
                    ->orWhere('title', 'like', '%' . $request->search . '%')
                    ->orWhereHas('project', function ($projQ) use ($request) {
                        $projQ->where('title', 'like', '%' . $request->search . '%');
                    });
            });
        }

        if ($request->status) {
            if ($request->status === 'partial_paid') {
                $query->where('status', 'partially_paid');
            } else {
                $query->where('status', $request->status);
            }
        }

        if ($request->project_id) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->client_id) {
            $query->where('client_id', $request->client_id);
        }

        if ($request->crm_contact_id) {
            $query->where('crm_contact_id', $request->crm_contact_id);
        }

        $perPage = $request->get('per_page', 12);
        $invoices = $query->latest()->paginate($perPage)->withQueryString();

        // Debug: Log invoices without projects
        $invoicesWithoutProject = $invoices->getCollection()->filter(function ($invoice) {
            return is_null($invoice->project);
        });

        if ($invoicesWithoutProject->count() > 0) {
            \Log::warning('Found invoices without projects:', [
                'count' => $invoicesWithoutProject->count(),
                'invoice_ids' => $invoicesWithoutProject->pluck('id')->toArray()
            ]);
        }

        // Get projects for filter dropdown
        $projectsQuery = Project::forWorkspace($workspace->id);
        if (in_array($userWorkspaceRole, ['manager', 'member'])) {
            $projectsQuery->where(function ($q) use ($user) {
                $q->whereHas('members', function ($memberQuery) use ($user) {
                    $memberQuery->where('user_id', $user->id);
                })->orWhere('created_by', $user->id);
            });
        } elseif ($userWorkspaceRole === 'client') {
            $projectsQuery->whereHas('clients', function ($clientQuery) use ($user) {
                $clientQuery->where('user_id', $user->id);
            });
        }
        $projects = $projectsQuery->get(['id', 'title']);

        // Get clients for filter dropdown
        $clients = $workspace->users()
            ->whereHas('roles', function ($q) {
                $q->where('name', 'client');
            })
            ->get(['users.id', 'users.name']);

        $crmContacts = CrmContact::forWorkspace($workspace->id)
            ->orderBy('name')
            ->get(['id', 'name', 'company_name', 'type']);

        return Inertia::render('invoices/Index', [
            'invoices' => $invoices,
            'projects' => $projects,
            'clients' => $clients,
            'crmContacts' => $crmContacts,
            'filters' => $request->only(['search', 'status', 'project_id', 'client_id', 'crm_contact_id', 'per_page']),
            'userWorkspaceRole' => $userWorkspaceRole,
            'emailNotificationsEnabled' => emailNotificationEnabled()
        ]);
    }

    public function show(Invoice $invoice)
    {
        $invoice->load(['project', 'budgetCategory', 'client', 'crmContact', 'creator', 'approver', 'items.task', 'items.expense', 'items.timesheetEntry', 'items.assetCategory', 'payments']);
        $user = auth()->user();
        $workspace = $user->currentWorkspace;
        $userWorkspaceRole = $workspace->getMemberRole($user);

        // Check access permissions
        if ($userWorkspaceRole === 'client') {
            // Clients can only view invoices assigned to them
            if ($invoice->client_id !== $user->id) {
                abort(403, 'Access denied.');
            }
        } elseif ($invoice->status === 'draft' && !in_array($userWorkspaceRole, ['owner', 'manager'])) {
            // Only managers, owners, and assigned clients can view draft invoices
            abort(403, 'Access denied.');
        }

        // Ensure tax_rate is properly formatted
        $invoiceData = $invoice->toArray();
        $taxRate = $invoice->tax_rate;
        if (is_string($taxRate)) {
            $taxRate = json_decode($taxRate, true) ?: [];
        }
        $invoiceData['tax_rate'] = $taxRate;
        // Check if email notifications are enabled
        $emailNotificationsEnabled = emailNotificationEnabled();
        
        // Get invoice settings
        $invoiceSettings = \App\Models\Setting::where('user_id', $invoice->created_by)
            ->whereIn('key', ['invoice_template', 'invoice_qr_display', 'invoice_color', 'invoice_footer_title', 'invoice_footer_notes'])
            ->pluck('value', 'key')
            ->toArray();
        
        return Inertia::render('invoices/Show', [
            'invoice' => $invoiceData,
            'userWorkspaceRole' => $userWorkspaceRole,
            'emailNotificationsEnabled' => $emailNotificationsEnabled,
            'invoiceSettings' => $invoiceSettings,
            'canApprove' => auth()->user()->can('invoice_approve') && $invoice->canBeApproved(),
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        $workspace = $user->currentWorkspace;

        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'task_id' => 'nullable|exists:tasks,id',
            'budget_category_id' => 'nullable|exists:budget_categories,id',
            'client_id' => 'nullable|exists:users,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'invoice_date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:invoice_date',
            'notes' => 'nullable|string',
            'terms' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.type' => 'required|in:asset,service',
            'items.*.task_id' => 'nullable|exists:tasks,id',
            'items.*.asset_category_id' => 'nullable|exists:asset_categories,id',
            'items.*.asset_name' => 'nullable|string|max:255',
            'items.*.tax_id' => 'nullable|exists:taxes,id',
            'items.*.description' => 'required|string|max:500',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.rate' => 'required|numeric|min:0',
        ]);

        $project = Project::findOrFail($validated['project_id']);

        foreach ($validated['items'] as $item) {
            if ($item['type'] === 'asset' && empty($item['asset_category_id'])) {
                throw \Illuminate\Validation\ValidationException::withMessages(['items' => [__('Asset items require an asset category.')]]);
            }
        }

        $validated['budget_category_id'] = $this->validateInvoiceBudgetCategory($validated['project_id'], $validated['budget_category_id'] ?? null);

        $clientDetails = null;
        if (!empty($validated['crm_contact_id'])) {
            $contact = CrmContact::find($validated['crm_contact_id']);
            if ($contact) {
                $clientDetails = [
                    'name' => $contact->display_name,
                    'company_name' => $contact->company_name,
                    'email' => $contact->email,
                    'phone' => $contact->phone,
                    'address' => $contact->address,
                ];
            }
        }

        $invoice = Invoice::create([
            'project_id' => $validated['project_id'],
            'task_id' => $validated['task_id'] ?? null,
            'budget_category_id' => $validated['budget_category_id'],
            'workspace_id' => $project->workspace_id,
            'client_id' => $validated['client_id'],
            'crm_contact_id' => $validated['crm_contact_id'] ?? null,
            'client_details' => $clientDetails,
            'created_by' => $user->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'invoice_date' => $validated['invoice_date'],
            'due_date' => $validated['due_date'],
            'tax_rate' => [],
            'notes' => $validated['notes'],
            'terms' => $validated['terms'],
            'subtotal' => 0,
            'tax_amount' => 0,
            'total_amount' => 0,
        ]);

        foreach ($validated['items'] as $index => $item) {
            $quantity = $item['quantity'] ?? 1;
            $rate = $item['rate'] ?? 0;
            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'type' => $item['type'],
                'description' => $item['description'],
                'quantity' => $quantity,
                'rate' => $rate,
                'amount' => $rate * $quantity,
                'task_id' => $item['task_id'] ?? $validated['task_id'] ?? null,
                'asset_category_id' => $item['asset_category_id'] ?? null,
                'asset_name' => $item['asset_name'] ?? null,
                'tax_id' => $item['tax_id'] ?? null,
                'sort_order' => $index + 1,
            ]);
        }
        $invoice->calculateTotals();

        // Fire event for Slack notification
        try {
            if (!config('app.is_demo', true)) {
                event(new InvoiceCreated($invoice));
            }
        } catch (\Exception $e) {
            \Log::warning('Invoice notification failed: ' . $e->getMessage());
        }

        return redirect()->route('invoices.show', $invoice)->with('success', __('Invoice created successfully!'));
    }

    public function update(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'task_id' => 'nullable|exists:tasks,id',
            'budget_category_id' => 'nullable|exists:budget_categories,id',
            'client_id' => 'nullable|exists:users,id',
            'crm_contact_id' => 'nullable|exists:crm_contacts,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'invoice_date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:invoice_date',
            'notes' => 'nullable|string',
            'terms' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.type' => 'required|in:asset,service',
            'items.*.description' => 'required|string|max:500',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.rate' => 'required|numeric|min:0',
            'items.*.task_id' => 'nullable|exists:tasks,id',
            'items.*.asset_category_id' => 'nullable|exists:asset_categories,id',
            'items.*.asset_name' => 'nullable|string|max:255',
            'items.*.tax_id' => 'nullable|exists:taxes,id',
        ]);

        foreach ($validated['items'] as $item) {
            if ($item['type'] === 'asset' && empty($item['asset_category_id'])) {
                throw \Illuminate\Validation\ValidationException::withMessages(['items' => [__('Asset items require an asset category.')]]);
            }
        }

        $validated['budget_category_id'] = $this->validateInvoiceBudgetCategory($invoice->project_id, $validated['budget_category_id'] ?? null);

        $clientDetails = null;
        if (!empty($validated['crm_contact_id'])) {
            $contact = CrmContact::find($validated['crm_contact_id']);
            if ($contact) {
                $clientDetails = [
                    'name' => $contact->display_name,
                    'company_name' => $contact->company_name,
                    'email' => $contact->email,
                    'phone' => $contact->phone,
                    'address' => $contact->address,
                ];
            }
        }

        $invoice->update([
            'task_id' => $validated['task_id'] ?? null,
            'budget_category_id' => $validated['budget_category_id'],
            'client_id' => $validated['client_id'],
            'crm_contact_id' => $validated['crm_contact_id'] ?? null,
            'client_details' => $clientDetails,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'invoice_date' => $validated['invoice_date'],
            'due_date' => $validated['due_date'],
            'notes' => $validated['notes'],
            'terms' => $validated['terms'],
        ]);

        $invoice->items()->delete();
        foreach ($validated['items'] as $index => $item) {
            $quantity = $item['quantity'] ?? 1;
            $rate = $item['rate'] ?? 0;
            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'type' => $item['type'],
                'description' => $item['description'],
                'quantity' => $quantity,
                'rate' => $rate,
                'amount' => $rate * $quantity,
                'task_id' => $item['task_id'] ?? $validated['task_id'] ?? null,
                'asset_category_id' => $item['asset_category_id'] ?? null,
                'asset_name' => $item['asset_name'] ?? null,
                'tax_id' => $item['tax_id'] ?? null,
                'sort_order' => $index + 1,
            ]);
        }

        $invoice->calculateTotals();

        return redirect()->route('invoices.show', $invoice)->with('success', __('Invoice updated successfully!'));
    }

    public function create()
    {
        $user = auth()->user();
        $workspace = $user->currentWorkspace;

        $projects = Project::forWorkspace($workspace->id)->get(['id', 'title']);
        $clients = $workspace->users()->whereHas('roles', function ($q) {
            $q->where('name', 'client');
        })->get(['users.id', 'users.name']);
        
        $taxes = \App\Models\Tax::where('workspace_id', $workspace->id)
            ->orderBy('name')
            ->get(['id', 'name', 'rate', 'is_inclusive']);

        $assetCategories = \App\Models\AssetCategory::forWorkspace($workspace->id)
            ->ordered()
            ->get(['id', 'name', 'color'])
            ->toArray();

        $crmContacts = CrmContact::forWorkspace($workspace->id)
            ->orderBy('name')
            ->get(['id', 'name', 'company_name', 'type', 'email']);

        return Inertia::render('invoices/Form', [
            'projects' => $projects,
            'clients' => $clients,
            'crmContacts' => $crmContacts,
            'taxes' => $taxes,
            'assetCategories' => $assetCategories,
        ]);
    }

    public function getProjectInvoiceData($projectId)
    {
        try {
            $project = Project::findOrFail($projectId);

            $tasks = $project->tasks()->get(['id', 'title']);
            $clients = $project->clients()->get(['users.id', 'users.name']);

            $budgetCategories = \App\Models\BudgetCategory::whereHas('projectBudget', function ($q) use ($projectId) {
                $q->where('project_id', $projectId);
            })
                ->orderBy('sort_order')
                ->get(['id', 'name', 'color', 'allocated_amount'])
                ->toArray();

            $assetCategories = \App\Models\AssetCategory::forWorkspace($project->workspace_id)
                ->ordered()
                ->get(['id', 'name', 'color'])
                ->toArray();

            return response()->json([
                'tasks' => $tasks,
                'clients' => $clients,
                'budget_categories' => $budgetCategories,
                'asset_categories' => $assetCategories,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error loading project invoice data: ' . $e->getMessage());
            return response()->json([
                'tasks' => [],
                'clients' => [],
                'budget_categories' => [],
                'asset_categories' => [],
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function edit(Invoice $invoice)
    {
        $invoice->load(['items', 'project']);

        $user = auth()->user();
        $workspace = $user->currentWorkspace;
        $userWorkspaceRole = $workspace->getMemberRole($user);

        // Only managers and owners can edit invoices
        if (!in_array($userWorkspaceRole, ['owner', 'manager'])) {
            abort(403, 'Access denied. Only managers and owners can edit invoices.');
        }

        $projects = Project::forWorkspace($workspace->id)->get(['id', 'title']);
        $clients = $workspace->users()->whereHas('roles', function ($q) {
            $q->where('name', 'client');
        })->get(['users.id', 'users.name']);
        
        $taxes = \App\Models\Tax::where('workspace_id', $workspace->id)
            ->orderBy('name')
            ->get(['id', 'name', 'rate', 'is_inclusive']);

        $invoiceData = $invoice->toArray();
        
        // Parse tax_rate properly - handle double encoding
        $taxRate = $invoice->getRawOriginal('tax_rate');
        $selectedTaxIds = [];
        if ($taxRate) {
            $firstDecode = json_decode($taxRate, true);
            // If first decode returns a string, decode again
            if (is_string($firstDecode)) {
                $parsedTaxRate = json_decode($firstDecode, true);
            } else {
                $parsedTaxRate = $firstDecode;
            }
            
            if (is_array($parsedTaxRate)) {
                $selectedTaxIds = collect($parsedTaxRate)->pluck('id')->filter()->toArray();
            }
        }
        $invoiceData['selected_taxes'] = $selectedTaxIds;

        $workspaceId = $invoice->project_id && $invoice->project
            ? $invoice->project->workspace_id
            : $workspace->id;
        $assetCategories = \App\Models\AssetCategory::forWorkspace($workspaceId)
            ->ordered()
            ->get(['id', 'name', 'color'])
            ->toArray();

        $crmContacts = CrmContact::forWorkspace($workspace->id)
            ->orderBy('name')
            ->get(['id', 'name', 'company_name', 'type', 'email']);

        return Inertia::render('invoices/Form', [
            'invoice' => $invoiceData,
            'projects' => $projects,
            'clients' => $clients,
            'crmContacts' => $crmContacts,
            'taxes' => $taxes,
            'assetCategories' => $assetCategories,
        ]);
    }

    public function destroy(Invoice $invoice)
    {
        $invoice->delete();
        return back()->with('success', __('Invoice deleted successfully!'));
    }



    public function approve(Invoice $invoice)
    {
        if (!$invoice->canBeApproved()) {
            return back()->with('error', __('Invoice cannot be approved in current status.'));
        }
        $invoice->update([
            'approved_at' => now(),
            'approved_by' => auth()->id(),
        ]);
        return back()->with('success', __('Invoice approved successfully!'));
    }

    public function markAsPaid(Request $request, Invoice $invoice)
    {
        $hasAssetItems = $invoice->items()->where('type', 'asset')->exists();
        if ($hasAssetItems && !$invoice->approved_at) {
            return back()->with('error', __('Please approve the invoice first before marking as paid. Assets will be created after approval and payment.'));
        }

        $validated = $request->validate([
            'paid_amount' => 'nullable|numeric|min:0|max:' . $invoice->total_amount,
            'payment_method' => 'nullable|string|in:bank_transfer,company_card,personal,personal_card,cash',
            'payment_reference' => 'nullable|string',
            'payment_details' => 'nullable|array',
        ]);

        $oldStatus = $invoice->status;
        $invoice->markAsPaid(
            $validated['paid_amount'] ?? null,
            $validated['payment_method'] ?? null,
            $validated['payment_reference'] ?? null,
            $validated['payment_details'] ?? null
        );

        // Fire event for Slack notification
        try {
            if (!config('app.is_demo', true)) {
                event(new \App\Events\InvoiceStatusUpdated($invoice, $oldStatus, 'paid'));
            }
        } catch (\Exception $e) {
            \Log::warning('Invoice status notification failed: ' . $e->getMessage());
        }

        return back()->with('success', __('Invoice marked as paid successfully!'));
    }

    public function send(Invoice $invoice)
    {
        $oldStatus = $invoice->status;
        $invoice->update([
            'status' => 'sent',
            'sent_at' => now()
        ]);

        // Fire events
        try {
            if (!config('app.is_demo', true)) {
                event(new \App\Events\InvoiceStatusUpdated($invoice, $oldStatus, 'sent'));
                event(new InvoiceCreated($invoice));
            }
        } catch (\Exception $e) {
            \Log::warning('Invoice send notifications failed: ' . $e->getMessage());
        }

        return back()->with('success', __('Invoice sent successfully!'));
    }

    public function getProjectData(Project $project)
    {
        $project->load('budget.categories');
        $tasks = $project->tasks()
            ->with('taskStage')
            ->where('status', 'completed')
            ->get(['id', 'title', 'task_stage_id']);

        $expenses = $project->expenses()
            ->with('budgetCategory')
            ->where('status', 'approved')
            ->get(['id', 'title', 'amount', 'currency', 'budget_category_id']);

        $budgetCategories = [];
        if ($project->budget) {
            $budgetCategories = $project->budget->categories()
                ->get(['id', 'name', 'color', 'allocated_amount'])
                ->toArray();
        }

        $timesheetEntries = TimesheetEntry::whereHas('timesheet', function ($q) use ($project) {
            $q->where('project_id', $project->id);
        })
            ->with(['task', 'user'])
            ->get(['id', 'task_id', 'user_id', 'hours', 'description']);

        return response()->json([
            'tasks' => $tasks,
            'expenses' => $expenses,
            'budget_categories' => $budgetCategories,
            'timesheet_entries' => $timesheetEntries
        ]);
    }

    /**
     * Ensure budget_category_id belongs to the project's budget; return null if invalid.
     */
    private function validateInvoiceBudgetCategory(int $projectId, ?int $categoryId): ?int
    {
        if (!$categoryId) {
            return null;
        }
        $belongsToProject = \App\Models\BudgetCategory::where('id', $categoryId)
            ->whereHas('projectBudget', fn ($q) => $q->where('project_id', $projectId))
            ->exists();
        return $belongsToProject ? $categoryId : null;
    }
}