<?php

namespace App\Policies;

use App\Models\Departments;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class DepartmentPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    use HandlesAuthorization;

    public function addUsersToDepartment(User $user, Departments $department)
    {
        // Admin có quyền thêm nhân sự vào bất kỳ phòng ban
        if ($user->hasRole('Admin')) {
            return true;
        }

        // Department Manager chỉ được thêm vào phòng ban của họ
        return $user->hasRole('Department Manager') && $user->department_id === $department->id;
    }

    public function viewDepartmentPosts(User $user, Departments $department)
    {
        // Chỉ người dùng thuộc phòng ban được xem ticket
        return $user->department_id === $department->id;
    }
}
