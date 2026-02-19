<?php

namespace App\Console\Commands;

use App\Models\Asset;
use App\Models\Invoice;
use Illuminate\Console\Command;

class SyncAssetsFromInvoices extends Command
{
    protected $signature = 'assets:sync-from-invoices';
    protected $description = 'Link or create assets from paid invoice items (asset type)';

    public function handle(): int
    {
        $invoices = Invoice::where('status', 'paid')
            ->whereNotNull('approved_at')
            ->get();

        $linked = 0;
        $created = 0;

        foreach ($invoices as $invoice) {
            $items = $invoice->items()->where('type', 'asset')->whereNull('asset_id')->orderBy('sort_order')->get();
            if ($items->isEmpty()) {
                continue;
            }
            $existingAssets = Asset::where('invoice_id', $invoice->id)->orderBy('id')->get();
            if ($existingAssets->isNotEmpty() && $existingAssets->count() >= $items->count()) {
                foreach ($items as $i => $item) {
                    if (isset($existingAssets[$i])) {
                        $item->update(['asset_id' => $existingAssets[$i]->id]);
                        $linked++;
                    }
                }
            } else {
                $result = $invoice->createAssetsFromPaidInvoice();
                $created += count($result);
            }
        }

        $this->info("Linked: {$linked}, Created: {$created}");
        return 0;
    }
}
