<?php

namespace App\Console\Commands;

use App\Models\Project;
use App\Models\User;
use Illuminate\Console\Command;

class AddUserToAllProjects extends Command
{
    protected $signature = 'project:add-user-to-all {user : User ID, email or name}';
    protected $description = 'Add a user to all projects in workspaces they belong to';

    public function handle(): int
    {
        $input = $this->argument('user');

        $user = is_numeric($input)
            ? User::find($input)
            : User::where('email', $input)->orWhere('name', 'like', "%{$input}%")->first();

        if (!$user) {
            $this->error("User not found: {$input}");
            return 1;
        }

        $workspaceIds = $user->workspaces()->wherePivot('status', 'active')->pluck('workspaces.id')
            ->merge($user->ownedWorkspaces()->pluck('id'))
            ->unique();
        $projects = Project::whereIn('workspace_id', $workspaceIds)->get();

        $added = 0;
        $skipped = 0;

        foreach ($projects as $project) {
            if ($project->users()->where('user_id', $user->id)->exists()) {
                $skipped++;
                continue;
            }

            $project->users()->attach($user->id, [
                'role' => 'member',
                'assigned_by' => $user->id,
                'assigned_at' => now(),
            ]);
            $added++;
        }

        $this->info("Added {$user->name} ({$user->email}) to {$added} projects. Skipped {$skipped} (already member).");
        return 0;
    }
}
