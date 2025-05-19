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
}
