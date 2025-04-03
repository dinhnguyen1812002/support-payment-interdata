<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

use Spatie\Permission\Models\Role;
class AssignRole extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {

        $user = User::find(1);

        if (! $user) {

            $user = User::create([
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => bcrypt('password'), // Mật khẩu mặc định
            ]);
        }


        $role = Role::firstOrCreate(['name' => 'admin']);


        $user->assignRole('admin');

        echo "Role 'admin' has been assigned to user with ID: {$user->id}\n";
    }
}
