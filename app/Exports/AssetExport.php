<?php

namespace App\Exports;

use App\Models\Asset;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\Exportable;
use Illuminate\Http\Request;

class AssetExport implements FromQuery, WithHeadings, WithMapping
{
    use Exportable;

    protected $request;

    public function __construct(Request $request = null)
    {
        $this->request = $request;
    }

    public function query()
    {
        $workspaceId = auth()->user()->current_workspace_id;
        $query = Asset::forWorkspace($workspaceId)->with(['project', 'assetCategory']);

        if ($this->request) {
            if ($this->request->filled('search')) {
                $search = $this->request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('asset_code', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%");
                });
            }
            if ($this->request->filled('type') && $this->request->type !== 'all') {
                $query->byType($this->request->type);
            }
            if ($this->request->filled('status') && $this->request->status !== 'all') {
                $query->byStatus($this->request->status);
            }
            if ($this->request->filled('project_id') && $this->request->project_id !== 'all') {
                $query->forProject($this->request->project_id);
            }
            if ($this->request->filled('asset_category_id') && $this->request->asset_category_id !== 'all') {
                $query->byCategory($this->request->asset_category_id);
            }
        }

        return $query->latest();
    }

    public function headings(): array
    {
        return [
            'სახელი',
            'რაოდენობა',
            'აქტივის კოდი',
            'კატეგორია',
            'მდებარეობა',
            'პროექტი',
            'შეძენის თარიღი',
            'გარანტია ვადის',
            'სტატუსი',
            'შენიშვნები',
        ];
    }

    public function map($asset): array
    {
        return [
            $asset->name,
            $asset->quantity ?? 1,
            $asset->asset_code,
            $asset->assetCategory?->name ?? $asset->type ?? '',
            $asset->location,
            $asset->project?->title ?? '',
            $asset->purchase_date ? $asset->purchase_date->format('Y-m-d') : '',
            $asset->warranty_until ? $asset->warranty_until->format('Y-m-d') : '',
            $asset->status,
            $asset->notes,
        ];
    }
}
