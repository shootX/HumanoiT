<?php

namespace App\Observers;

use App\Models\Workspace;
use Database\Seeders\TaskStageSeeder;
class WorkspaceObserver
{
    public function created(Workspace $workspace): void
    {
        // Auto-create default task stages for new workspace
        TaskStageSeeder::createDefaultStagesForWorkspace($workspace->id);
    }
}