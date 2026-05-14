<?php

namespace App\Services;

use Illuminate\Validation\ValidationException;

class TaskPasteImportService
{
    /**
     * @return array{branch: string, titles: list<string>, skipped_duplicates: int}
     */
    public function parse(string $raw): array
    {
        $normalized = str_replace(["\r\n", "\r"], "\n", $raw);
        $lines = array_values(array_filter(
            array_map('trim', explode("\n", $normalized)),
            static fn ($line) => $line !== ''
        ));

        if ($lines === []) {
            throw ValidationException::withMessages([
                'text' => [__('No task items found in the pasted text.')],
            ]);
        }

        $headerLine = array_shift($lines);
        $branch = preg_replace('/\s*:\s*$/u', '', $headerLine);
        $branch = trim((string) $branch);
        if ($branch === '') {
            throw ValidationException::withMessages([
                'text' => [__('Branch or location name is required on the first line.')],
            ]);
        }
        if (mb_strlen($branch) > 255) {
            throw ValidationException::withMessages([
                'text' => [__('Branch or location must not exceed 255 characters.')],
            ]);
        }

        if ($lines === []) {
            throw ValidationException::withMessages([
                'text' => [__('No task items could be read. Add one task per line, or use "1. Name" / "- Name".')],
            ]);
        }

        [$titles, $skippedDuplicates] = $this->extractTitles($lines);

        if ($titles === []) {
            throw ValidationException::withMessages([
                'text' => [__('No task items could be read. Add one task per line, or use "1. Name" / "- Name".')],
            ]);
        }

        foreach ($titles as $title) {
            if (mb_strlen($title) > 255) {
                throw ValidationException::withMessages([
                    'text' => [__('Each task title must not exceed 255 characters.')],
                ]);
            }
        }

        return [
            'branch' => $branch,
            'titles' => $titles,
            'skipped_duplicates' => $skippedDuplicates,
        ];
    }

    /**
     * @param list<string> $lines
     * @return array{0: list<string>, 1: int}
     */
    private function extractTitles(array $lines): array
    {
        $numberedPattern = '/^\s*(\d+)\s*[.)]\s*(.+)$/u';
        $bulletPattern = '/^\s*[-*•\x{2013}\x{2014}]\s*(.+)$/u';

        $rawTitles = [];
        foreach ($lines as $line) {
            if (preg_match($numberedPattern, $line, $m)) {
                $t = trim((string) $m[2]);
                if ($t !== '') {
                    $rawTitles[] = $t;
                }
            }
        }
        if ($rawTitles !== []) {
            return $this->dedupeTitles($rawTitles);
        }

        $rawTitles = [];
        foreach ($lines as $line) {
            if (preg_match($bulletPattern, $line, $m)) {
                $t = trim((string) $m[1]);
                if ($t !== '') {
                    $rawTitles[] = $t;
                }
            }
        }
        if ($rawTitles !== []) {
            return $this->dedupeTitles($rawTitles);
        }

        return $this->dedupeTitles($lines);
    }

    /**
     * @param list<string> $titles
     * @return array{0: list<string>, 1: int}
     */
    private function dedupeTitles(array $titles): array
    {
        $seenNorm = [];
        $out = [];
        $skipped = 0;
        foreach ($titles as $title) {
            $title = trim($title);
            if ($title === '') {
                continue;
            }
            $norm = mb_strtolower(preg_replace('/\s+/u', ' ', $title));
            if (isset($seenNorm[$norm])) {
                $skipped++;

                continue;
            }
            $seenNorm[$norm] = true;
            $out[] = $title;
        }

        return [$out, $skipped];
    }
}
