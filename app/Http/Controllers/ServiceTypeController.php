<?php

namespace App\Http\Controllers;

use App\Models\ServiceType;
use App\Traits\HasPermissionChecks;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceTypeController extends Controller
{
    use HasPermissionChecks;

    public function index(): Response
    {
        $this->authorizePermission('service_type_manage');

        $user = auth()->user();
        $types = ServiceType::forWorkspace($user->current_workspace_id)
            ->ordered()
            ->get();

        return Inertia::render('service-types/Index', [
            'types' => $types,
            'permissions' => [
                'create' => $this->checkPermission('service_type_manage'),
                'update' => $this->checkPermission('service_type_manage'),
                'delete' => $this->checkPermission('service_type_manage'),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizePermission('service_type_manage');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $maxOrder = ServiceType::forWorkspace(auth()->user()->current_workspace_id)->max('order') ?? 0;

        ServiceType::create([
            ...$validated,
            'workspace_id' => auth()->user()->current_workspace_id,
            'order' => $maxOrder + 1,
        ]);

        return back()->with('success', __('Service type created successfully!'));
    }

    public function update(Request $request, ServiceType $serviceType)
    {
        $this->authorizePermission('service_type_manage');

        if ($serviceType->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $serviceType->update($validated);

        return back()->with('success', __('Service type updated successfully!'));
    }

    public function destroy(ServiceType $serviceType)
    {
        $this->authorizePermission('service_type_manage');

        if ($serviceType->workspace_id !== auth()->user()->current_workspace_id) {
            abort(403);
        }

        if ($serviceType->schedules()->count() > 0) {
            return back()->with('error', __('Cannot delete type with existing schedules'));
        }

        $serviceType->delete();

        return back()->with('success', __('Service type deleted successfully!'));
    }
}
