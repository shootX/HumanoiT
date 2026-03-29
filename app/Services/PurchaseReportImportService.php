<?php

namespace App\Services;

use PhpOffice\PhpSpreadsheet\IOFactory;

class PurchaseReportImportService
{
    /**
     * Parse XLS purchase report. Uses columns: B (name), C (unit, optional), D (qty), E (rate), F (amount), K (seller).
     */
    public function parse(string $path): array
    {
        $reader = IOFactory::createReader('Xls');
        $spreadsheet = $reader->load($path);
        $sheet = $spreadsheet->getActiveSheet();
        $rows = $sheet->toArray(null, true, true, true);

        $items = [];
        $sellerRaw = null;
        $invoiceDate = null;

        foreach ($rows as $i => $row) {
            if ($i === 0) {
                continue;
            }

            $description = trim($row['B'] ?? '');
            $unitLabel = trim((string) ($row['C'] ?? ''));
            $quantity = (float) str_replace(',', '.', $row['D'] ?? 1);
            $rate = (float) str_replace(',', '.', $row['E'] ?? 0);
            $amount = (float) str_replace(',', '.', $row['F'] ?? 0);

            if (empty($description) && $quantity <= 0 && $rate <= 0) {
                continue;
            }

            if (empty($description)) {
                $description = '-';
            }
            if ($quantity <= 0) {
                $quantity = 1;
            }
            if ($amount <= 0 && $rate > 0) {
                $amount = $rate * $quantity;
            } elseif ($amount <= 0) {
                continue;
            }
            if ($rate <= 0 && $quantity > 0) {
                $rate = $amount / $quantity;
            }

            $items[] = [
                'description' => $description,
                'unit_label' => $unitLabel !== '' ? $unitLabel : null,
                'quantity' => $quantity,
                'rate' => $rate,
                'amount' => $amount,
            ];

            if ($sellerRaw === null) {
                $sellerRaw = trim($row['K'] ?? '');
            }
            if ($invoiceDate === null) {
                $dateStr = trim($row['Q'] ?? $row['R'] ?? '');
                if ($dateStr) {
                    $parsed = \Carbon\Carbon::createFromFormat('d/m/Y H:i:s', $dateStr)
                        ?: \Carbon\Carbon::createFromFormat('d/m/Y', $dateStr);
                    if ($parsed) {
                        $invoiceDate = $parsed->format('Y-m-d');
                    }
                }
            }
        }

        $seller = $this->parseSeller($sellerRaw ?? '');

        return [
            'items' => $items,
            'seller' => $seller,
            'invoice_date' => $invoiceDate ?: now()->format('Y-m-d'),
            'total_amount' => array_sum(array_column($items, 'amount')),
        ];
    }

    /**
     * Parse seller string like "(412733957) შპს გოგე და კომპანია" into identification_code and company_name.
     */
    public function parseSeller(string $raw): array
    {
        $raw = trim($raw);
        $identificationCode = null;
        $companyName = $raw;

        if (preg_match('/^\((\d+)\)\s*(.*)$/u', $raw, $m)) {
            $identificationCode = $m[1];
            $companyName = trim($m[2]);
        }

        return [
            'identification_code' => $identificationCode,
            'company_name' => $companyName ?: null,
            'raw' => $raw,
        ];
    }
}
