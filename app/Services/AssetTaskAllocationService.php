<?php

namespace App\Services;

use App\Models\Asset;
use App\Models\Task;
use Illuminate\Support\Facades\DB;

class AssetTaskAllocationService
{
    /**
     * Process asset items for task allocation. Splits active assets when quantity is partially used.
     * Returns sync array [asset_id => ['quantity' => n]] for task->assets()->sync()
     */
    public static function processAssetItems(array $assetItems, Task $task, int $workspaceId): array
    {
        return DB::transaction(function () use ($assetItems, $task, $workspaceId) {
            $sync = [];

            foreach ($assetItems as $item) {
                $asset = Asset::find($item['asset_id']);
                if (!$asset || $asset->workspace_id != $workspaceId) {
                    continue;
                }

                $qty = (int) $item['quantity'];
                $availableQty = (int) ($asset->quantity ?? 1);

                if ($asset->status === 'used') {
                    if ($qty > $availableQty) {
                        abort(422, __('Cannot allocate more than available quantity for used asset.'));
                    }
                    $sync[$asset->id] = ['quantity' => $qty];
                    continue;
                }

                if ($asset->status !== 'active') {
                    abort(422, __('Only active assets can be allocated to tasks.'));
                }

                if ($qty > $availableQty) {
                    abort(422, __('Insufficient asset quantity. Available: :available', ['available' => $availableQty]));
                }

                if ($qty == $availableQty) {
                    $asset->update(['status' => 'used']);
                    $sync[$asset->id] = ['quantity' => $qty];
                } else {
                    $used = $asset->replicate();
                    $used->quantity = $qty;
                    $used->status = 'used';
                    $used->project_id = $task->project_id;
                    $used->asset_code = ($asset->asset_code ?? '') ? $asset->asset_code . '-U' . $task->id : null;
                    $used->save();

                    $asset->decrement('quantity', $qty);

                    $sync[$used->id] = ['quantity' => $qty];
                }
            }

            return $sync;
        });
    }
}
