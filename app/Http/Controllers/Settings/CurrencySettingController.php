<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use Illuminate\Validation\Rule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Workspace;

class CurrencySettingController extends Controller
{
    /**
     * Update the currency settings.
     */
    public function update(Request $request)
    {
        try {
            $request->merge([
                'decimalFormat' => $request->input('decimalFormat', '2'),
                'defaultCurrency' => $request->input('defaultCurrency', 'GEL'),
                'decimalSeparator' => $request->input('decimalSeparator', '.'),
                'thousandsSeparator' => $request->input('thousandsSeparator', ','),
                'floatNumber' => $request->has('floatNumber') ? $request->input('floatNumber') : true,
                'currencySymbolSpace' => $request->has('currencySymbolSpace') ? $request->input('currencySymbolSpace') : false,
                'currencySymbolPosition' => $request->input('currencySymbolPosition', 'before'),
            ]);

            $validated = $request->validate([
                'decimalFormat' => 'required|string|in:0,1,2,3,4',
                'defaultCurrency' => 'required|string|exists:currencies,code',
                'decimalSeparator' => ['required', 'string', Rule::in(['.', ','])],
                'thousandsSeparator' => 'nullable|string',
                'floatNumber' => 'required|boolean',
                'currencySymbolSpace' => 'required|boolean',
                'currencySymbolPosition' => 'required|string|in:before,after',
            ]);
            
            $user = auth()->user();
            $workspaceId = null;
            $targetUserId = $user->id;
            $ignoreWorkspace = false;
            
            if ($user->type === 'company') {
                $workspaceId = $user->current_workspace_id;
            }
            
            // In non-SaaS mode, always store currency settings at company scope
            if (!isSaasMode()) {
                $companyOwner = \App\Models\User::where('type', 'company')
                    ->where(function($q) {
                        $q->whereNull('created_by')->orWhere('created_by', 0);
                    })
                    ->first();
                if ($companyOwner) {
                    $targetUserId = $companyOwner->id;
                    $workspaceId = null;
                    $ignoreWorkspace = true;
                }
            }
            
            // Normalize defaults
            if (!isset($validated['thousandsSeparator']) || $validated['thousandsSeparator'] === '') {
                $validated['thousandsSeparator'] = ',';
            }

            // Update settings using helper function
            foreach ($validated as $key => $value) { 
                updateSetting($key, $value, $targetUserId, $workspaceId, $ignoreWorkspace);
            }
            
            return redirect()->back()->with('success', __('Currency settings updated successfully.'));
        } catch (\Exception $e) {
            return redirect()->back()->with('error', __('Failed to update currency settings: :error', ['error' => $e->getMessage()]));
        }
    }
}