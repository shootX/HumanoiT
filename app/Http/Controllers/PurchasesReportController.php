<?php

namespace App\Http\Controllers;

use App\Models\InvoiceItem;
use App\Models\Project;
use App\Exports\PurchasesReportExport;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class PurchasesReportController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $workspace = $user->currentWorkspace;

        if (!$workspace) {
            return redirect()->route('dashboard')->with('error', 'No workspace selected.');
        }

        $projects = Project::forWorkspace($workspace->id)->orderBy('title')->get(['id', 'title']);

        $stats = $this->calculateStats($workspace->id, $request);

        $initialItems = $this->getItemsQuery($workspace->id, $request)
            ->limit(15)
            ->get()
            ->map(fn($item) => $this->transformItem($item));

        return Inertia::render('purchases-reports/Index', [
            'projects' => $projects,
            'stats' => $stats,
            'items' => [
                'data' => $initialItems,
                'total' => $this->getItemsQuery($workspace->id, $request)->count()
            ],
            'filters' => $request->only(['search', 'project_id', 'per_page', 'start_date', 'end_date'])
        ]);
    }

    public function getPurchasesData(Request $request)
    {
        $user = Auth::user();
        $workspace = $user->currentWorkspace;

        if (!$workspace) {
            return response()->json(['error' => 'No workspace'], 403);
        }

        $query = $this->getItemsQuery($workspace->id, $request);
        $perPage = (int) $request->get('per_page', 15);
        $paginated = $query->paginate($perPage);

        $transformed = $paginated->getCollection()->map(fn($item) => $this->transformItem($item));
        $paginated->setCollection($transformed);

        return response()->json([
            'data' => $transformed,
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
                'from' => $paginated->firstItem(),
                'to' => $paginated->lastItem(),
            ]
        ]);
    }

    public function export(Request $request)
    {
        $user = Auth::user();
        $workspace = $user->currentWorkspace;

        if (!$workspace) {
            return response()->json(['error' => 'No workspace'], 403);
        }

        $filters = $request->only(['search', 'project_id', 'start_date', 'end_date']);
        $export = new PurchasesReportExport($workspace->id, $filters);
        $filename = 'purchases_report_' . date('Y-m-d') . '.xlsx';
        return Excel::download($export, $filename);
    }

    private function getItemsQuery(int $workspaceId, Request $request)
    {
        $query = InvoiceItem::with(['invoice.project', 'task.project'])
            ->where('type', 'asset')
            ->whereHas('invoice', fn($q) => $q->forWorkspace($workspaceId));

        if ($request->filled('project_id') && $request->project_id !== 'all') {
            $projectId = $request->project_id;
            $query->where(function ($q) use ($projectId) {
                $q->whereHas('invoice', fn($i) => $i->where('project_id', $projectId))
                    ->orWhereHas('task', fn($t) => $t->where('project_id', $projectId));
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('description', 'like', "%{$search}%");
        }

        if ($request->filled('start_date')) {
            $startDate = Carbon::parse($request->start_date)->startOfDay();
            $query->whereHas('invoice', fn($q) => $q->where('invoice_date', '>=', $startDate));
        }
        if ($request->filled('end_date')) {
            $endDate = Carbon::parse($request->end_date)->endOfDay();
            $query->whereHas('invoice', fn($q) => $q->where('invoice_date', '<=', $endDate));
        }

        return $query->orderBy('created_at', 'desc');
    }

    private function transformItem(InvoiceItem $item): array
    {
        $project = $item->task?->project ?? $item->invoice?->project;

        return [
            'id' => $item->id,
            'description' => $item->description,
            'quantity' => (float) ($item->quantity ?: 1),
            'rate' => (float) $item->rate,
            'amount' => (float) $item->amount,
            'task' => $item->task ? ['id' => $item->task->id, 'title' => $item->task->title] : null,
            'project' => $project ? ['id' => $project->id, 'title' => $project->title] : null,
        ];
    }

    private function calculateStats(int $workspaceId, Request $request): array
    {
        $query = InvoiceItem::where('type', 'asset')
            ->whereHas('invoice', fn($q) => $q->forWorkspace($workspaceId));

        if ($request->filled('start_date')) {
            $startDate = Carbon::parse($request->start_date)->startOfDay();
            $query->whereHas('invoice', fn($q) => $q->where('invoice_date', '>=', $startDate));
        }
        if ($request->filled('end_date')) {
            $endDate = Carbon::parse($request->end_date)->endOfDay();
            $query->whereHas('invoice', fn($q) => $q->where('invoice_date', '<=', $endDate));
        }

        $totalItems = $query->count();
        $totalAmount = (clone $query)->sum('amount');

        return [
            'total_items' => $totalItems,
            'total_amount' => round((float) $totalAmount, 2),
        ];
    }
}
