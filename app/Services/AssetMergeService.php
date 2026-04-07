<?php

namespace App\Services;

use App\Models\Asset;
use App\Models\AssetAttachment;
use App\Models\Task;
use Illuminate\Support\Facades\DB;

class AssetMergeService
{
    /**
     * @param  list<int>  $secondaryIds  Asset IDs folded into primary (must not include primary).
     */
    public function merge(int $workspaceId, int $primaryId, array $secondaryIds, string $name): Asset
    {
        $secondaryIds = array_values(array_unique(array_map('intval', $secondaryIds)));
        $secondaryIds = array_values(array_filter($secondaryIds, fn (int $id) => $id !== $primaryId));

        if ($secondaryIds === []) {
            throw new \InvalidArgumentException('merge_no_secondary');
        }

        return DB::transaction(function () use ($workspaceId, $primaryId, $secondaryIds, $name) {
            /** @var Asset $primary */
            $primary = Asset::forWorkspace($workspaceId)->whereNull('merged_into_asset_id')->lockForUpdate()->findOrFail($primaryId);

            $secondaries = Asset::forWorkspace($workspaceId)
                ->whereIn('id', $secondaryIds)
                ->whereNull('merged_into_asset_id')
                ->lockForUpdate()
                ->get();

            if ($secondaries->count() !== count($secondaryIds)) {
                throw new \InvalidArgumentException('merge_invalid_assets');
            }

            $instrument = $primary->is_instrument;
            foreach ($secondaries as $s) {
                if ((bool) $s->is_instrument !== $instrument) {
                    throw new \InvalidArgumentException('merge_instrument_mismatch');
                }
            }

            $this->repointAssetTaskPivot($primaryId, $secondaryIds);
            Task::whereIn('asset_id', $secondaryIds)->update(['asset_id' => $primaryId]);
            $this->repointAttachments($primaryId, $secondaryIds);
            DB::table('asset_warranty_cases')->whereIn('asset_id', $secondaryIds)->update(['asset_id' => $primaryId]);

            $totalQty = (float) ($primary->quantity ?? 0);
            foreach ($secondaries as $s) {
                $totalQty += (float) ($s->quantity ?? 0);
            }

            foreach ($secondaries as $s) {
                $s->update(['merged_into_asset_id' => $primaryId]);
            }

            $primary->update([
                'name' => $name,
                'quantity' => $totalQty,
            ]);

            return $primary->fresh();
        });
    }

    /**
     * @param  list<int>  $secondaryIds
     */
    private function repointAssetTaskPivot(int $primaryId, array $secondaryIds): void
    {
        $rows = DB::table('asset_task')->whereIn('asset_id', $secondaryIds)->orderBy('id')->get();

        foreach ($rows as $row) {
            $existing = DB::table('asset_task')
                ->where('task_id', $row->task_id)
                ->where('asset_id', $primaryId)
                ->first();

            if ($existing) {
                $sumQty = (float) $existing->quantity + (float) $row->quantity;
                DB::table('asset_task')->where('id', $existing->id)->update([
                    'quantity' => $sumQty,
                    'updated_at' => now(),
                ]);
                DB::table('asset_task')->where('id', $row->id)->delete();
            } else {
                DB::table('asset_task')->where('id', $row->id)->update([
                    'asset_id' => $primaryId,
                    'updated_at' => now(),
                ]);
            }
        }
    }

    /**
     * @param  list<int>  $secondaryIds
     */
    private function repointAttachments(int $primaryId, array $secondaryIds): void
    {
        AssetAttachment::whereIn('asset_id', $secondaryIds)->update(['asset_id' => $primaryId]);

        $dupMediaIds = AssetAttachment::query()
            ->where('asset_id', $primaryId)
            ->select('media_item_id')
            ->groupBy('media_item_id')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('media_item_id');

        foreach ($dupMediaIds as $mediaItemId) {
            $ids = AssetAttachment::where('asset_id', $primaryId)
                ->where('media_item_id', $mediaItemId)
                ->orderBy('id')
                ->pluck('id');
            $keep = $ids->shift();
            if ($keep && $ids->isNotEmpty()) {
                AssetAttachment::whereIn('id', $ids->all())->delete();
            }
        }
    }
}
