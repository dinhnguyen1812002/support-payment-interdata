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
        if ($user->hasRole('admin')) {
            return true;
        }

        // Department Manager chỉ được thêm vào phòng ban của họ
        return $user->hasRole('Department Manager') &&
               $user->departments()->where('departments.id', $department->id)->exists();
    }

    public function viewDepartmentPosts(User $user, Departments $department)
    {
        // Chỉ người dùng thuộc phòng ban được xem ticket
        return $user->department_id === $department->id;
    }

    public function view(User $user, Departments $department)
    {
        // Admin có thể xem tất cả phòng ban
        if ($user->hasRole('admin')) {
            return true;
        }

        // Người dùng chỉ có thể xem phòng ban mà họ thuộc về
        return $user->departments()->where('departments.id', $department->id)->exists();
    }
}
