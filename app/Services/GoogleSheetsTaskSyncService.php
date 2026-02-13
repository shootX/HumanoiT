<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskStage;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class GoogleSheetsTaskSyncService
{
    protected ?\Google_Client $client = null;

    protected ?\Google_Service_Sheets $sheets = null;

    public function __construct()
    {
        $path = config('services.google.sheets_credentials_path');
        if (!$path || !is_file($path)) {
            throw new \RuntimeException('Google Sheets credentials file not found. Set GOOGLE_SHEETS_CREDENTIALS_JSON in .env to the path of your service account JSON.');
        }
        $this->client = new \Google_Client();
        $this->client->setAuthConfig($path);
        $this->client->addScope('https://www.googleapis.com/auth/spreadsheets.readonly');
        $this->sheets = new \Google_Service_Sheets($this->client);
    }

    /**
     * Sync tasks from a Google Sheet. If sheet has "მაღაზია" column, project is resolved per row:
     * value "ვარკეთილი" → project named "ვარკეთილის ფილიალი" (or containing "ვარკეთილი") in the workspace.
     *
     * @param string $spreadsheetId Google Spreadsheet ID (from URL)
     * @param int $workspaceId Workspace ID (used when resolving project from "მაღაზია" column)
     * @param int|null $defaultProjectId If no "მაღაზია" column or project not found, use this project (optional)
     * @param int $createdByUserId User ID for created_by
     * @param string $range Sheet tab name, e.g. "ია" or "Sheet1!A:Z"
     * @return array{created: int, updated: int, errors: array}
     */
    public function syncToProject(string $spreadsheetId, int $workspaceId, ?int $defaultProjectId, int $createdByUserId, string $range = 'ია'): array
    {
        $range = str_contains($range, '!') ? $range : $range . '!A:Z';
        $response = $this->sheets->spreadsheets_values->get($spreadsheetId, $range);
        $rows = $response->getValues();
        if (empty($rows)) {
            return ['created' => 0, 'updated' => 0, 'errors' => []];
        }

        $header = array_map(function ($h) {
            return mb_strtolower(trim((string) $h));
        }, $rows[0]);
        $storeCol = $this->columnIndex($header, ['მაღაზია', 'store', 'magazia', 'ფილიალი', 'branch']);
        $offset = $storeCol !== null ? 1 : 0;
        $titleCol = $this->columnIndex($header, ['title', 'task', 'name', 'სათაური', 'task title']) ?? $offset;
        $descCol = $this->columnIndex($header, ['description', 'desc', 'details', 'აღწერა', 'notes']) ?? ($offset + 1);
        $priorityCol = $this->columnIndex($header, ['priority', 'პრიორიტეტი', 'prio']) ?? ($offset + 2);
        $dueCol = $this->columnIndex($header, ['due date', 'due', 'due_date', 'deadline', 'ვადა', 'date']) ?? ($offset + 3);
        $idCol = $this->columnIndex($header, ['taskly id', 'taskly_id', 'id', 'taskly']);

        $created = 0;
        $updated = 0;
        $errors = [];
        $sheetName = explode('!', $range)[0];

        for ($i = 1; $i < count($rows); $i++) {
            $row = $rows[$i];
            $syncKey = $spreadsheetId . '|' . $sheetName . '|' . ($i + 1);

            $projectId = $defaultProjectId;
            if ($storeCol !== null && isset($row[$storeCol]) && trim((string) $row[$storeCol]) !== '') {
                $storeValue = trim((string) $row[$storeCol]);
                $project = $this->resolveProjectByStoreName($workspaceId, $storeValue);
                if ($project) {
                    $projectId = $project->id;
                }
            }
            if ($projectId === null) {
                $errors[] = "Row " . ($i + 1) . ": project not found for this store, skipped.";
                continue;
            }

            $project = Project::find($projectId);
            $firstStage = TaskStage::forWorkspace($project->workspace_id)->ordered()->first();
            if (!$firstStage) {
                $errors[] = "Row " . ($i + 1) . ": no task stage for workspace.";
                continue;
            }

            $title = isset($row[$titleCol]) ? trim((string) $row[$titleCol]) : null;
            if ($title === null || $title === '') {
                continue;
            }

            $description = $descCol !== null && isset($row[$descCol]) ? trim((string) $row[$descCol]) : null;
            $priorityRaw = $priorityCol !== null && isset($row[$priorityCol]) ? strtolower(trim((string) $row[$priorityCol])) : 'medium';
            $priority = in_array($priorityRaw, ['low', 'medium', 'high', 'critical'], true) ? $priorityRaw : 'medium';
            $dueDate = null;
            if ($dueCol !== null && isset($row[$dueCol]) && trim((string) $row[$dueCol]) !== '') {
                $dueDate = $this->parseDate(trim((string) $row[$dueCol]));
            }

            $existingId = null;
            if ($idCol !== null && isset($row[$idCol]) && is_numeric(trim((string) $row[$idCol]))) {
                $existingId = (int) trim((string) $row[$idCol]);
            }

            $task = null;
            if ($existingId) {
                $task = Task::where('id', $existingId)->where('project_id', $projectId)->first();
            }
            if (!$task) {
                $task = Task::where('project_id', $projectId)->where('google_sheet_sync_key', $syncKey)->first();
            }

            try {
                if ($task) {
                    $task->update([
                        'title' => $title,
                        'description' => $description,
                        'priority' => $priority,
                        'due_date' => $dueDate,
                    ]);
                    $updated++;
                } else {
                    Task::create([
                        'project_id' => $projectId,
                        'task_stage_id' => $firstStage->id,
                        'title' => $title,
                        'description' => $description,
                        'priority' => $priority,
                        'due_date' => $dueDate,
                        'created_by' => $createdByUserId,
                        'progress' => 0,
                        'google_sheet_sync_key' => $syncKey,
                    ]);
                    $created++;
                }
            } catch (\Throwable $e) {
                $errors[] = "Row " . ($i + 1) . ": " . $e->getMessage();
                Log::warning('Google Sheets task sync row error', ['row' => $i + 1, 'error' => $e->getMessage()]);
            }
        }

        return ['created' => $created, 'updated' => $updated, 'errors' => $errors];
    }

    /**
     * Find project by store name: "ვარკეთილი" → project "ვარკეთილის ფილიალი" or name containing "ვარკეთილი".
     */
    private function resolveProjectByStoreName(int $workspaceId, string $storeName): ?Project
    {
        $name = trim($storeName);
        if ($name === '') {
            return null;
        }
        $withFiliaali = $name . ' ფილიალი';
        return Project::where('workspace_id', $workspaceId)
            ->where(function ($q) use ($name, $withFiliaali) {
                $q->where('name', $withFiliaali)
                    ->orWhere('name', 'like', '%' . $name . '%');
            })
            ->first();
    }

    private function columnIndex(array $header, array $candidates): ?int
    {
        foreach ($candidates as $c) {
            $idx = array_search($c, $header, true);
            if ($idx !== false) {
                return $idx;
            }
        }
        return null;
    }

    private function parseDate(string $value): ?string
    {
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
            return $value;
        }
        try {
            $d = Carbon::parse($value);
            return $d->format('Y-m-d');
        } catch (\Throwable $e) {
            return null;
        }
    }
}
