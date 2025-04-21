<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run()
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        Role::create(['name' => 'department_manager']);
        Role::create(['name' => 'employee']);
        Permission::create(['name' => 'create-post']);
        Permission::create(['name' => 'assign-post']);
        Permission::create(['name' => 'manage-department']);
        Permission::create(['name' => 'view-department-posts']);
        // Tạo quyền
        Permission::create(['name' => 'view admin dashboard']);

        // Tạo vai trò
        $adminRole = Role::findByName('admin');
        $adminRole->givePermissionTo(Permission::all());

        $managerRole = Role::findByName('department_manager');
        $managerRole->givePermissionTo(['manage-department', 'assign-post', 'view-department-posts']);

        $employeeRole = Role::findByName('employee');
        $employeeRole->givePermissionTo(['create-post', 'view-department-posts']);

    }
}
