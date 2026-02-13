<?php

namespace App\Console\Commands;

use App\Models\Project;
use App\Models\Workspace;
use App\Services\GoogleSheetsTaskSyncService;
use Illuminate\Console\Command;

class SyncTasksFromGoogleSheet extends Command
{
    protected $signature = 'tasks:sync-from-google-sheet
                            {spreadsheet_id : Google Spreadsheet ID from the URL}
                            {workspace_id : Taskly workspace ID}
                            {--sheet=ია : Sheet tab name (default: ია)}
                            {--project= : Default project ID when row has no "მაღაზია" or project not found}
                            {--user=1 : User ID for created_by}';

    protected $description = 'Sync tasks from Google Sheet. Uses "მაღაზია" column: value "ვარკეთილი" → project "ვარკეთილის ფილიალი".';

    public function handle(): int
    {
        $spreadsheetId = $this->argument('spreadsheet_id');
        $workspaceId = (int) $this->argument('workspace_id');
        $sheet = $this->option('sheet');
        $defaultProjectId = $this->option('project') !== null ? (int) $this->option('project') : null;
        $userId = (int) $this->option('user');

        $workspace = Workspace::find($workspaceId);
        if (!$workspace) {
            $this->error("Workspace {$workspaceId} not found.");
            return self::FAILURE;
        }

        try {
            $service = app(GoogleSheetsTaskSyncService::class);
        } catch (\Throwable $e) {
            $this->error($e->getMessage());
            $this->line('To use this command:');
            $this->line('1. Create a Google Cloud project and enable Sheets API.');
            $this->line('2. Create a Service Account, download JSON key.');
            $this->line('3. Set GOOGLE_SHEETS_CREDENTIALS_JSON=/path/to/key.json in .env');
            $this->line('4. Share your Google Sheet with the service account email (Viewer or Editor).');
            return self::FAILURE;
        }

        $this->info("Syncing from spreadsheet {$spreadsheetId}, sheet '{$sheet}', workspace: {$workspace->name} (ID {$workspaceId})...");

        try {
            $result = $service->syncToProject($spreadsheetId, $workspaceId, $defaultProjectId, $userId, $sheet);
        } catch (\Throwable $e) {
            $this->error('Sync failed: ' . $e->getMessage());
            return self::FAILURE;
        }

        $this->info("Created: {$result['created']}, Updated: {$result['updated']}.");
        if (!empty($result['errors'])) {
            foreach ($result['errors'] as $err) {
                $this->warn($err);
            }
        }
        return self::SUCCESS;
    }
}
