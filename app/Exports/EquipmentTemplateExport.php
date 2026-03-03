<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\Exportable;
use Illuminate\Support\Collection;

class EquipmentTemplateExport implements FromCollection, WithHeadings
{
    use Exportable;

    public function collection(): Collection
    {
        return collect([]);
    }

    public function headings(): array
    {
        return [
            'სახელი',
            'ფილიალი (პროექტი)',
            'ტიპი',
            'მონტაჟის თარიღი',
            'ბოლო სერვისი',
            'სტატუსი',
            'შენიშვნები',
        ];
    }
}
