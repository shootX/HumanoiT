<?php

namespace App\Http\Controllers;

use App\Models\EquipmentServicePhoto;
use App\Models\Task;
use App\Traits\HasPermissionChecks;
use Illuminate\Http\Request;

class EquipmentServicePhotoController extends Controller
{
    use HasPermissionChecks;

    public function store(Request $request, Task $task)
    {
        $this->authorizePermission('task_add_attachments');

        if ($task->project->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        $validated = $request->validate([
            'type' => 'required|in:before,after',
            'media_item_id' => 'required|exists:media_items,id',
        ]);

        EquipmentServicePhoto::create([
            'task_id' => $task->id,
            'type' => $validated['type'],
            'media_item_id' => $validated['media_item_id'],
            'file_path' => '',
        ]);

        return back()->with('success', __('Photo uploaded successfully.'));
    }

    public function destroy(EquipmentServicePhoto $equipmentServicePhoto)
    {
        $this->authorizePermission('task_add_attachments');

        if ($equipmentServicePhoto->task->project->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        $equipmentServicePhoto->delete();

        return back()->with('success', __('Photo removed.'));
    }
}
