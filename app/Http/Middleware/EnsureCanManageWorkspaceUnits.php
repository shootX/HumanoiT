<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCanManageWorkspaceUnits
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user || !$user->canManageWorkspaceUnits()) {
            abort(403, __('You do not have permission to manage measurement units.'));
        }

        return $next($request);
    }
}
