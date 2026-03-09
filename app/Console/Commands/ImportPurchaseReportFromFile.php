<?php

namespace App\Console\Commands;

use App\Models\CrmContact;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Project;
use App\Models\Tax;
use App\Services\PurchaseReportImportService;
use Illuminate\Console\Command;

class ImportPurchaseReportFromFile extends Command
{
    protected $signature = 'purchase-report:import-from-file
                            {file : Path to XLS/XLSX file}
                            {--project= : Project ID (required)}
                            {--task= : Optional task ID}
                            {--workspace=1 : Workspace ID}
                            {--user=1 : User ID for created_by}';

    protected $description = 'Import purchase report Excel file as invoice (for data restore)';

    public function handle(PurchaseReportImportService $importService): int
    {
        $path = $this->argument('file');
        if (!is_file($path)) {
            $this->error("File not found: {$path}");
            return self::FAILURE;
        }

        $projectId = (int) $this->option('project');
        $taskId = $this->option('task') ? (int) $this->option('task') : null;
        $workspaceId = (int) $this->option('workspace');
        $userId = (int) $this->option('user');

        $project = Project::where('id', $projectId)->where('workspace_id', $workspaceId)->first();
        if (!$project) {
            $this->error("Project {$projectId} not found in workspace {$workspaceId}");
            return self::FAILURE;
        }

        $data = $importService->parse($path);
        if (empty($data['items'])) {
            $this->error('No valid items in file');
            return self::FAILURE;
        }

        $crmContact = null;
        try {
            $crmContact = $this->resolveOrCreateSeller($workspaceId, $userId, $data['seller']);
        } catch (\Throwable $e) {
            $this->warn('Could not resolve CRM contact: ' . $e->getMessage());
        }
        $vatTax = Tax::where('workspace_id', $workspaceId)
            ->where('is_inclusive', true)
            ->whereRaw('ABS(rate - 18) < 0.01')
            ->first();
        $sellerName = $data['seller']['company_name'] ?? $data['seller']['raw'] ?? __('Import');

        $invoiceData = [
            'project_id' => $project->id,
            'task_id' => $taskId,
            'workspace_id' => $workspaceId,
            'client_id' => null,
            'client_details' => $crmContact ? [
                'name' => $crmContact->company_name ?? $crmContact->name,
                'identification_code' => $crmContact->identification_code,
            ] : [
                'name' => $sellerName,
                'identification_code' => $data['seller']['identification_code'] ?? null,
            ],
            'created_by' => $userId,
            'title' => __('Purchase from :seller', ['seller' => $sellerName]),
            'description' => __('Imported from purchase report (restore)'),
            'invoice_date' => $data['invoice_date'],
            'due_date' => $data['invoice_date'],
            'tax_rate' => [],
            'subtotal' => 0,
            'tax_amount' => 0,
            'total_amount' => 0,
        ];
        if ($crmContact && \Schema::hasColumn('invoices', 'crm_contact_id')) {
            $invoiceData['crm_contact_id'] = $crmContact->id;
        }
        $invoice = Invoice::create($invoiceData);

        foreach ($data['items'] as $i => $item) {
            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'type' => 'asset',
                'description' => $item['description'],
                'quantity' => $item['quantity'],
                'rate' => $item['rate'],
                'amount' => $item['amount'],
                'task_id' => $taskId,
                'tax_id' => $vatTax?->id,
                'sort_order' => $i + 1,
            ]);
        }

        $invoice->calculateTotals();

        $this->info("Created invoice #{$invoice->invoice_number} with " . count($data['items']) . " items, total: {$invoice->total_amount}");
        return self::SUCCESS;
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
