<?php

namespace App\Exports;

use App\Models\Equipment;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\Exportable;
use Illuminate\Http\Request;

class EquipmentExport implements FromQuery, WithHeadings, WithMapping
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
        $query = Equipment::forWorkspace($workspaceId)->with(['project', 'equipmentType']);

        if ($this->request) {
            if ($this->request->filled('search')) {
                $search = $this->request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")->orWhere('code', 'like', "%{$search}%");
                });
            }
            if ($this->request->filled('project_id') && $this->request->project_id !== 'all') {
                $query->forProject($this->request->project_id);
            }
            if ($this->request->filled('equipment_type_id') && $this->request->equipment_type_id !== 'all') {
                $query->byType($this->request->equipment_type_id);
            }
            if ($this->request->filled('health_status') && $this->request->health_status !== 'all') {
                $query->byHealthStatus($this->request->health_status);
            }
        }

        return $query->latest();
    }

    public function headings(): array
    {
        return [
            'კოდი',
            'სახელი',
            'ფილიალი (პროექტი)',
            'ტიპი',
            'მონტაჟის თარიღი',
            'ბოლო სერვისი',
            'სტატუსი',
            'შენიშვნები',
        ];
    }

    public function map($equipment): array
    {
        return [
            $equipment->code ?? '',
            $equipment->name,
            $equipment->project?->title ?? '',
            $equipment->equipmentType?->name ?? '',
            $equipment->installation_date ? $equipment->installation_date->format('Y-m-d') : '',
            $equipment->last_service_date ? $equipment->last_service_date->format('Y-m-d') : '',
            $equipment->health_status ?? 'green',
            $equipment->notes ?? '',
        ];
    }
}
