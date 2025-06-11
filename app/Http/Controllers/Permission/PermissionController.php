<?php

namespace App\Http\Controllers\Permission;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Spatie\Permission\Exceptions\UnauthorizedException;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionController extends Controller
{
    public function index()
    {
        // Only admin can view all permissions
        if (! auth()->user()->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $permissions = Permission::select('id', 'name')->orderBy('name')->get();

        return response()->json($permissions);
    }

    public function assignRole(Request $request)
    {
        // Validate input data
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|string|exists:roles,name',
        ]);

        // Only admin can assign roles
        if (! auth()->user()->hasRole('admin')) {
            throw UnauthorizedException::forRoles(['admin']);
        }

        // Find user by ID
        $user = User::findOrFail($request->user_id);

        // Sync role for the user (remove all existing roles and assign the new one)
        $user->syncRoles([$request->role]);

        return Redirect::back()->with('success', 'Role assigned successfully.');
    }

    public function assignPermissions(Request $request)
    {
        // Validate input data
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'permissions' => 'required|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        // Only admin can assign permissions
        if (! auth()->user()->hasRole('admin')) {
            throw UnauthorizedException::forRoles(['admin']);
        }

        // Find user by ID
        $user = User::findOrFail($request->user_id);

        // Sync permissions for the user
        $user->syncPermissions($request->permissions);

        return Redirect::back()->with('success', 'Permissions assigned successfully.');
    }



}
