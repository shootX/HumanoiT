<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\Exportable;
use Illuminate\Support\Collection;

class AssetTemplateExport implements FromCollection, WithHeadings
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
}
