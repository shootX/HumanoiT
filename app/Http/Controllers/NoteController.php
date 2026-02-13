<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NoteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $currentWorkspace = Auth::user()->currentWorkspace;
        
        if (!$currentWorkspace) {
            return redirect()->route('dashboard');
        }

        $personal_notes = Note::where('type', '=', 'personal')
            ->where('workspace', '=', $currentWorkspace->id)
            ->where('created_by', '=', Auth::user()->id)
            ->with('creator')
            ->orderBy('created_at', 'desc')
            ->get();

        $shared_notes = Note::where('type', '=', 'shared')
            ->where('workspace', '=', $currentWorkspace->id)
            ->whereRaw('find_in_set(?, notes.assign_to)', [Auth::id()])
            ->with('creator')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($note) {
                if ($note->assign_to) {
                    $assignedUserIds = explode(',', $note->assign_to);
                    $note->assigned_users = User::whereIn('id', $assignedUserIds)->select('id', 'name', 'email')->get();
                }
                return $note;
            });

        $users = User::select('users.*', 'workspace_members.role')
            ->join('workspace_members', 'workspace_members.user_id', '=', 'users.id')
            ->where('workspace_members.workspace_id', '=', $currentWorkspace->id)
            ->where('users.id', '!=', Auth::user()->id)
            ->get();

        return Inertia::render('notes/Index', [
            'personal_notes' => $personal_notes,
            'shared_notes' => $shared_notes,
            'users' => $users,
            'currentWorkspace' => $currentWorkspace,
            'permissions' => [
                'view' => Auth::user()->can('note_view_any'),
                'create' => Auth::user()->can('note_create'),
                'update' => Auth::user()->can('note_update'),
                'delete' => Auth::user()->can('note_delete')
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'text' => 'required|string',
            'color' => 'required|string',
            'type' => 'required|in:personal,shared',
            'assign_to' => 'nullable|array'
        ]);

        $currentWorkspace = Auth::user()->currentWorkspace;
        
        if (!$currentWorkspace) {
            return response()->json(['error' => 'No workspace selected'], 400);
        }

        $data = $request->all();
        $data['text'] = sanitizeHtml($data['text'] ?? '');
        
        if ($data['type'] === 'shared' && !empty($data['assign_to'])) {
            $assign_to = $data['assign_to'];
            $assign_to[] = Auth::user()->id;
            $data['assign_to'] = implode(',', array_unique($assign_to));
        } else {
            $data['assign_to'] = null;
        }

        $data['workspace'] = $currentWorkspace->id;
        $data['created_by'] = Auth::user()->id;

        Note::create($data);

        return redirect()->route('notes.index')->with('success', 'Note created successfully!');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Note $note)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'text' => 'required|string',
            'color' => 'required|string',
            'type' => 'required|in:personal,shared',
            'assign_to' => 'nullable|array'
        ]);

        $currentWorkspace = Auth::user()->currentWorkspace;
        
        // Check workspace access only
        if ($note->workspace !== $currentWorkspace->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $data = $request->all();
        $data['text'] = sanitizeHtml($data['text'] ?? '');
        
        if ($data['type'] === 'shared' && !empty($data['assign_to'])) {
            $assign_to = $data['assign_to'];
            $assign_to[] = Auth::user()->id;
            $data['assign_to'] = implode(',', array_unique($assign_to));
        } else {
            $data['assign_to'] = null;
        }

        $note->update($data);

        return redirect()->route('notes.index')->with('success', 'Note updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Note $note)
    {
        $currentWorkspace = Auth::user()->currentWorkspace;
        
        // Check workspace access only
        if ($note->workspace !== $currentWorkspace->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $note->delete();

        return redirect()->route('notes.index')->with('success', 'Note deleted successfully!');
    }
}