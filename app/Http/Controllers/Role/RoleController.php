<?php

namespace App\Http\Controllers\Role;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Spatie\Permission\Exceptions\UnauthorizedException;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index()
    {
        // Only admin can view all roles
        if (! auth()->user()->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $roles = Role::select('id', 'name')->orderBy('name')->get();

        return response()->json($roles);
    }

    public function assignRole(Request $request)
    {
        // Validate dữ liệu đầu vào
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|string|exists:roles,name',
        ]);

        // Chỉ admin có thể gán vai trò
        if (! auth()->user()->hasRole('admin')) {
            throw UnauthorizedException::forRoles(['admin']);
        }

        // Tìm user theo ID
        $user = User::findOrFail($request->user_id);

        // Gán vai trò cho user
        $user->syncRoles([$request->role]);

        return Redirect::back()->with('success', 'Role assigned successfully.');
    }
    public function storeRole(Request $request)
    {
        // Validate input data
        $request->validate([
            'name' => 'required|string|unique:roles,name',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        // Only admin can create roles
        if (! auth()->user()->hasRole('admin')) {
            throw UnauthorizedException::forRoles(['admin']);
        }

        // Create new role
        $role = Role::create(['name' => $request->name]);

        // Assign permissions to role if provided
        if ($request->has('permissions') && is_array($request->permissions)) {
            $role->syncPermissions($request->permissions);
        }

        return redirect()->back()->with('success', 'Role created successfully.');
    }

    public function updateRole(Request $request, $id)
    {
        // Validate input data
        $request->validate([
            'name' => 'required|string|unique:roles,name,' . $id,
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        // Only admin can update roles
        if (! auth()->user()->hasRole('admin')) {
            throw UnauthorizedException::forRoles(['admin']);
        }

        // Find role by ID
        $role = Role::findOrFail($id);

        // Update role name
        $role->update(['name' => $request->name]);

        // Sync permissions for the role if provided
        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return redirect()->back()->with('success', 'Role updated successfully.');
    }
}
