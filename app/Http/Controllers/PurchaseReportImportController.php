<?php

namespace App\Http\Controllers;

use App\Models\CrmContact;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Project;
use App\Models\Tax;
use App\Models\Unit;
use App\Models\Task;
use App\Services\PurchaseReportImportService;
use App\Events\InvoiceCreated;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PurchaseReportImportController extends Controller
{
    public function __construct(
        protected PurchaseReportImportService $importService
    ) {}

    public function index(Request $request)
    {
        $user = auth()->user();
        $workspace = $user->currentWorkspace;

        if (!$workspace) {
            return redirect()->route('dashboard')->with('error', __('No workspace selected.'));
        }

        $projects = Project::forWorkspace($workspace->id)->orderBy('title')->get(['id', 'title']);

        return Inertia::render('invoices/ImportFromPurchase', [
            'projects' => $projects,
        ]);
    }

    public function preview(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xls,xlsx|max:5120',
        ]);

        $path = $request->file('file')->getRealPath();
        $data = $this->importService->parse($path);

        return response()->json($data);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xls,xlsx|max:5120',
            'project_id' => 'required|exists:projects,id',
            'task_id' => 'nullable|exists:tasks,id',
        ]);

        $user = auth()->user();
        $workspace = $user->currentWorkspace;

        if (!$workspace) {
            return response()->json(['error' => __('No workspace selected.')], 403);
        }

        $project = Project::findOrFail($request->project_id);
        if ($project->workspace_id !== $workspace->id) {
            return response()->json(['error' => __('Invalid project.')], 403);
        }

        $path = $request->file('file')->getRealPath();
        $data = $this->importService->parse($path);

        if (empty($data['items'])) {
            return response()->json(['error' => __('No valid items found in file.')], 422);
        }

        $crmContact = $this->resolveOrCreateSeller($workspace->id, $user->id, $data['seller']);

        $vatTax = Tax::where('workspace_id', $workspace->id)
            ->where('is_inclusive', true)
            ->whereRaw('ABS(rate - 18) < 0.01')
            ->first();
        $vatTaxId = $vatTax?->id;

        $sellerName = $data['seller']['company_name'] ?? $data['seller']['raw'] ?? __('Import');

        $invoice = Invoice::create([
            'project_id' => $project->id,
            'task_id' => $request->task_id,
            'workspace_id' => $workspace->id,
            'client_id' => null,
            'crm_contact_id' => $crmContact?->id,
            'client_details' => $crmContact ? [
                'name' => $crmContact->company_name ?? $crmContact->name,
                'identification_code' => $crmContact->identification_code,
            ] : null,
            'created_by' => $user->id,
            'title' => __('Purchase from :seller', ['seller' => $sellerName]),
            'description' => __('Imported from purchase report'),
            'invoice_date' => $data['invoice_date'],
            'due_date' => $data['invoice_date'],
            'tax_rate' => [],
            'subtotal' => 0,
            'tax_amount' => 0,
            'total_amount' => 0,
        ]);

        $primaryTaskId = $request->task_id;
        foreach ($data['items'] as $i => $item) {
            $unitId = null;
            if (!empty($item['unit_label'])) {
                $unitId = Unit::findIdForWorkspace($workspace->id, $item['unit_label']);
            }
            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'type' => 'asset',
                'description' => $item['description'],
                'quantity' => $item['quantity'],
                'rate' => $item['rate'],
                'amount' => $item['amount'],
                'task_id' => $primaryTaskId,
                'tax_id' => $vatTaxId,
                'unit_id' => $unitId,
                'sort_order' => $i + 1,
            ]);
        }

        $invoice->calculateTotals();

        try {
            if (!config('app.is_demo', true)) {
                event(new InvoiceCreated($invoice));
            }
        } catch (\Exception $e) {
            \Log::warning('Invoice notification failed: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'invoice_id' => $invoice->id,
            'invoice_number' => $invoice->invoice_number,
            'message' => __('Invoice created successfully!'),
        ]);
    }

    protected function resolveOrCreateSeller(int $workspaceId, int $createdBy, array $seller): ?CrmContact
    {
        $companyName = $seller['company_name'];
        $identificationCode = $seller['identification_code'];

        if (empty($companyName) && empty($identificationCode)) {
            return null;
        }

        $existing = null;
        if ($identificationCode) {
            $existing = CrmContact::forWorkspace($workspaceId)
                ->where('type', 'legal')
                ->where('identification_code', $identificationCode)
                ->first();
        }
        if (!$existing && $companyName) {
            $existing = CrmContact::forWorkspace($workspaceId)
                ->where('type', 'legal')
                ->where('company_name', $companyName)
                ->first();
        }

        if ($existing) {
            return $existing;
        }

        return CrmContact::create([
            'workspace_id' => $workspaceId,
            'type' => 'legal',
            'name' => $companyName ?: ($identificationCode ?: 'Unknown'),
            'company_name' => $companyName,
            'identification_code' => $identificationCode,
            'created_by' => $createdBy,
        ]);
    }
}
