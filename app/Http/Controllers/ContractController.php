<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\ContractType;
use App\Models\ContractNote;
use App\Models\ContractComment;
use App\Models\ContractAttachment;
use App\Models\User;
use App\Models\MediaItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf as PDF;
use App\Events\ContractCreated;
use Illuminate\Support\Facades\Process;

class ContractController extends Controller
{
    public function index(Request $request)
    {
        $workspaceId = auth()->user()->current_workspace_id;
        $query = Contract::forWorkspace($workspaceId)
            ->with(['contractType', 'client', 'creator'])
            ->withCount(['notes', 'comments', 'attachments']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('contract_type_id')) {
            $query->where('contract_type_id', $request->contract_type_id);
        }
        if ($request->filled('client_id')) {
            $query->where('client_id', $request->client_id);
        }
        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('subject', 'like', '%' . $request->search . '%')
                    ->orWhere('contract_id', 'like', '%' . $request->search . '%');
            });
        }

        $contracts = $query->orderBy('created_at', 'desc')->paginate(15);
        $contractTypes = ContractType::forWorkspace($workspaceId)->active()->ordered()->get();
        $clients = User::whereHas('workspaces', function ($q) use ($workspaceId) {
            $q->where('workspace_id', $workspaceId)
              ->where('role', 'client');
        })->get(['id', 'name', 'email']);
        $projects = \App\Models\Project::forWorkspace($workspaceId)
            ->with(['clients:users.id'])
            ->get(['id', 'title'])
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'clients' => $project->clients->map(fn($c) => ['id' => $c->id])
                ];
            });

        return Inertia::render('contracts/Index', [
            'contracts' => $contracts,
            'contractTypes' => $contractTypes,
            'clients' => $clients,
            'projects' => $projects,
            'filters' => $request->only(['status', 'contract_type_id', 'client_id', 'project_id', 'search']),
        ]);
    }

    public function create()
    {
        $workspaceId = auth()->user()->current_workspace_id;
        $contractTypes = ContractType::forWorkspace($workspaceId)->active()->ordered()->get();
        $clients = User::whereHas('workspaces', function ($q) use ($workspaceId) {
            $q->where('workspace_id', $workspaceId)
              ->where('role', 'client');
        })->get(['id', 'name', 'email']);
        $users = User::whereHas('workspaces', function ($q) use ($workspaceId) {
            $q->where('workspace_id', $workspaceId);
        })->get();
        $projects = \App\Models\Project::forWorkspace($workspaceId)
            ->with(['clients:users.id'])
            ->get(['id', 'title'])
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'clients' => $project->clients->map(fn($c) => ['id' => $c->id])
                ];
            });

        return Inertia::render('contracts/Create', [
            'contractTypes' => $contractTypes,
            'clients' => $clients,
            'users' => $users,
            'projects' => $projects,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'contract_type_id' => 'required|exists:contracts_types,id',
            'contract_value' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'client_id' => 'required|exists:users,id',
        ]);

        $contract = Contract::create([
            'subject' => $request->subject,
            'description' => $request->description,
            'contract_type_id' => $request->contract_type_id,
            'contract_value' => $request->contract_value,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'client_id' => $request->client_id,
            'project_id' => $request->project_id,
            'assigned_users' => $request->assigned_users,
            'terms_conditions' => $request->terms_conditions,
            'notes' => $request->notes,
            'currency' => $request->currency ?? 'USD',
            'workspace_id' => auth()->user()->current_workspace_id,
            'created_by' => auth()->id(),
        ]);
       
        return redirect()->route('contracts.index')->with('success', 'Contract created successfully.');
    }

    public function show(Contract $contract)
    {
        $contract->load([
            'contractType',
            'client',
            'creator',
            'notes' => fn($q) => $q->with('creator'),
            'comments' => fn($q) => $q->with('creator')->orderBy('created_at', 'desc'),
            'attachments'
        ]);

        foreach ($contract->attachments as $attachment) {
            $attachment->url = Storage::url('contract_attachments/' . $attachment->files);
        }

        $emailEnabled = isEmailTemplateEnabled('New Contract', auth()->user()->id);
        
        return Inertia::render('contracts/Show', [
            'contract' => $contract,
            'assignedUsers' => $contract->assignedUsers(),
            'emailTemplateEnabled' => $emailEnabled,
        ]);
    }

    public function edit(Contract $contract)
    {
        $workspaceId = auth()->user()->current_workspace_id;
        $contractTypes = ContractType::forWorkspace($workspaceId)->active()->ordered()->get();
        $clients = User::whereHas('workspaces', function ($q) use ($workspaceId) {
            $q->where('workspace_id', $workspaceId)
              ->where('role', 'client');
        })->get(['id', 'name', 'email']);
        $users = User::whereHas('workspaces', function ($q) use ($workspaceId) {
            $q->where('workspace_id', $workspaceId);
        })->get();
        $projects = \App\Models\Project::forWorkspace($workspaceId)
            ->with(['clients:users.id'])
            ->get(['id', 'title'])
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'clients' => $project->clients->map(fn($c) => ['id' => $c->id])
                ];
            });

        return Inertia::render('contracts/Edit', [
            'contract' => $contract,
            'contractTypes' => $contractTypes,
            'clients' => $clients,
            'users' => $users,
            'projects' => $projects,
        ]);
    }

    public function update(Request $request, Contract $contract)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'contract_type_id' => 'required|exists:contracts_types,id',
            'contract_value' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'client_id' => 'required|exists:users,id',
        ]);

        $contract->update($request->only([
            'subject',
            'description',
            'contract_type_id',
            'contract_value',
            'start_date',
            'end_date',
            'client_id',
            'project_id',
            'assigned_users',
            'terms_conditions',
            'notes',
            'currency'
        ]));

        return redirect()->route('contracts.index')->with('success', 'Contract updated successfully.');
    }

    public function destroy(Contract $contract)
    {
        // Delete all attachment files from storage
        foreach ($contract->attachments as $attachment) {
            $filePath = 'contract_attachments/' . $attachment->files;
            if (Storage::disk('public')->exists($filePath)) {
                Storage::disk('public')->delete($filePath);
            }
        }
        
        $contract->notes()->delete();
        $contract->comments()->delete();
        $contract->attachments()->delete();
        $contract->delete();
        return redirect()->route('contracts.index')->with('success', 'Contract deleted successfully.');
    }

    public function duplicate(Contract $contract)
    {
        $newContract = $contract->replicate();
        $newContract->contract_id = Contract::generateContractId();
        $newContract->signed_at = null;
        $newContract->sent_at = null;
        $newContract->created_by = auth()->id();
        $newContract->save();

        return redirect()->route('contracts.index')->with('success', 'Contract duplicated successfully.');
    }

    public function changeStatus(Request $request, Contract $contract)
    {
        $request->validate(['status' => 'required|in:pending,sent,accept,decline,expired']);
        $updates = ['status' => $request->status];
        if ($request->status === 'sent' && !$contract->sent_at)
            $updates['sent_at'] = now();
        if ($request->status === 'accept' && !$contract->accepted_at)
            $updates['accepted_at'] = now();
        if ($request->status === 'decline' && !$contract->declined_at)
            $updates['declined_at'] = now();
        $contract->update($updates);
        return redirect()->back()->with('success', 'Contract status updated successfully.');
    }
    public function sendContractEmail(Contract $contract)
    {
        if (!config('app.is_demo', true)) {
            event(new ContractCreated($contract));
        }
        $contract->update(['status' => 'sent', 'sent_at' => now()]);
        return redirect()->back()->with('success', 'Contract email sent successfully');
    }

    public function download()
    {
        $filePath = resource_path('js/pages/contracts/Preview.tsx');
        
        if (!file_exists($filePath)) {
            return redirect()->back()->with('error', __('Preview file not found.'));
        }
        
        return response()->download($filePath, 'Preview.tsx');
    }

    public function preview(Contract $contract)
    {
        $contract->load(['contractType', 'client', 'creator']);

        return Inertia::render('contracts/Preview', [
            'contract' => $contract,
        ]);
    }

    public function noteStore(Request $request, Contract $contract)
    {
        $request->validate(['note' => 'required|string']);
        ContractNote::create([
            'contract_id' => $contract->id,
            'note' => $request->note,
            'is_pinned' => false,
            'created_by' => auth()->id(),
        ]);
        return back()->with('success', 'Note added successfully.');
    }

    public function noteDestroy(Contract $contract, ContractNote $note)
    {
        $note->delete();
        return redirect()->back()->with('success', 'Note deleted successfully.');
    }

    public function commentStore(Request $request, Contract $contract)
    {
        $request->validate(['comment' => 'required|string']);
        ContractComment::create([
            'contract_id' => $contract->id,
            'comment' => $request->comment,
            'parent_id' => $request->parent_id,
            'is_internal' => $request->boolean('is_internal'),
            'created_by' => auth()->id(),
        ]);
        return redirect()->back()->with('success', 'Comment added successfully.');
    }

    public function commentDestroy(ContractComment $comment)
    {
        $comment->delete();
        return redirect()->back()->with('success', 'Comment deleted successfully.');
    }

    public function fileUpload(Request $request, Contract $contract)
    {
        if ($contract->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403, __('Contract not found in current workspace'));
        }

        $request->validate([
            'files' => 'required|array',
            'files.*' => 'file|max:10240'
        ]);

        $dir = 'contract_attachments/';
        $attachments = [];
        
        foreach ($request->file('files') as $file) {
            $originalName = basename($file->getClientOriginalName());
            $originalName = preg_replace('/[^\w\-\.]/', '_', $originalName) ?: 'file';
            $fileName = time() . '_' . $originalName;
            $file->storeAs($dir, $fileName, 'public');
            
            $attachment = ContractAttachment::create([
                'contract_id' => $contract->id,
                'files' => $fileName,
                'workspace_id' => $contract->workspace_id
            ]);
            
            $attachments[] = $attachment;
        }

        return back()->with('success', __('Attachment(s) uploaded successfully'));
    }

    public function fileDelete(ContractAttachment $attachment)
    {
        $filePath = 'contract_attachments/' . basename($attachment->files);
        if (Storage::disk('public')->exists($filePath)) {
            Storage::disk('public')->delete($filePath);
        }
        
        $attachment->delete();
        return redirect()->back()->with('success', 'Attachment removed successfully.');
    }

    public function fileDownload(ContractAttachment $attachment)
    {
        $safeName = basename($attachment->files);
        $safeName = preg_replace('/[^\w\-\.]/', '_', $safeName) ?: 'download';
        $filePath = 'contract_attachments/' . basename($attachment->files);
        if (!Storage::disk('public')->exists($filePath)) {
            abort(404, 'File not found.');
        }
        return Storage::disk('public')->download($filePath, $safeName);
    }

    public function signatureStore(Request $request, Contract $contract)
    {
        $request->validate([
            'company_signature' => 'nullable|string',
            'client_signature' => 'nullable|string',
            'signature_type' => 'required|in:company,client'
        ]);

        $updates = [];
        if ($request->signature_type === 'company' && $request->company_signature) {
            $updates['company_signature'] = $request->company_signature;
        } elseif ($request->signature_type === 'client' && $request->client_signature) {
            $updates['client_signature'] = $request->client_signature;
            $updates['signed_at'] = now();
        }

        $contract->update($updates);

        return redirect()->back()->with('success', 'Signature added successfully.');
    }
}