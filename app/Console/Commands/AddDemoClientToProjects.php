<?php

namespace App\Console\Commands;

use App\Models\Project;
use App\Models\User;
use App\Models\WorkspaceMember;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class AddDemoClientToProjects extends Command
{
    protected $signature = 'projects:add-demo-client';
    protected $description = 'Add demo client (demo@demo.ge) to all projects';

    public function handle(): int
    {
        $demoUser = User::firstOrCreate(
            ['email' => 'demo@demo.ge'],
            [
                'name' => 'Demo Client',
                'password' => Hash::make('Dr@nda252'),
                'type' => 'client',
                'email_verified_at' => now(),
                'is_enable_login' => 1,
                'status' => 'active',
            ]
        );

        $firstWorkspace = WorkspaceMember::where('user_id', $demoUser->id)->value('workspace_id');
        $demoUser->update([
            'password' => Hash::make('Dr@nda252'),
            'is_enable_login' => 1,
            'status' => 'active',
            'current_workspace_id' => $demoUser->current_workspace_id ?: $firstWorkspace,
        ]);

        if (!$demoUser->hasRole('client')) {
            $demoUser->assignRole('client');
        }

        $projects = Project::with('workspace')->get();
        $added = 0;
        $workspacesAdded = [];

        foreach ($projects as $project) {
            if (!$project->clients()->where('user_id', $demoUser->id)->exists()) {
                $assignedBy = $project->created_by ?? $project->workspace?->owner_id ?? 1;
                $project->clients()->attach($demoUser->id, [
                    'assigned_at' => now(),
                    'assigned_by' => $assignedBy,
                ]);
                $added++;
            }

            $workspaceId = $project->workspace_id;
            if ($workspaceId && !isset($workspacesAdded[$workspaceId])) {
                if (!WorkspaceMember::where('workspace_id', $workspaceId)->where('user_id', $demoUser->id)->exists()) {
                    WorkspaceMember::create([
                        'workspace_id' => $workspaceId,
                        'user_id' => $demoUser->id,
                        'role' => 'client',
                        'status' => 'active',
                        'joined_at' => now(),
                    ]);
                    $workspacesAdded[$workspaceId] = true;
                }
            }
        }

        $this->info("Demo client demo@demo.ge added to {$added} projects.");
        return 0;
    }
}
