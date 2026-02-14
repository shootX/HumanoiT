<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CrmContactTemplateExport implements FromCollection, WithHeadings, WithStyles
{
    use Exportable;

    public function collection()
    {
        return collect([]);
    }

    public function headings(): array
    {
        return [
            'ტიპი',           // type (individual/legal)
            'სახელი',         // name
            'შპს სახელი',     // company_name
            'ბრენდული სახელი', // brand_name
            'საიდენტიფიკაციო კოდი', // identification_code
            'ელფოსტა',        // email
            'ტელეფონი',       // phone
            'მისამართი',     // address
            'შენიშვნები',     // notes
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
