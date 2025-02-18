<?php

namespace Deployer;

require 'recipe/laravel.php';

// Cấu hình Project
set('application', 'support ticket');
set('repository', 'https://github.com/dinhnguyen1812002/support-payment-interdata.git');
set('php_fpm_version', '8.3');

// Cấu hình máy chủ
host('103.20.96.236')
    ->set('remote_user', 'deployer')
    ->set('deploy_path', '~/var/www/support-ticket')
    ->set('ssh_multiplexing', false)
    ->set('timeout', 300)
    ->set('keep_releases', 5);

// Các thư mục shared
set('shared_files', [
    '.env',
]);
set('shared_dirs', [
    'storage',
    'node_modules',
    'public/storage',
]);

// Các thư mục writable
set('writable_dirs', [
    'bootstrap/cache',
    'storage',
    'storage/app',
    'storage/app/public',
    'storage/framework',
    'storage/framework/cache',
    'storage/framework/sessions',
    'storage/framework/views',
    'storage/logs',
    'public/storage',
]);

// Tasks tùy chỉnh
desc('Build frontend');
task('build:frontend', function () {
    // Sửa đường dẫn thành release_path thay vì deploy_path
    run('export NVM_DIR="$HOME/.nvm" && source $NVM_DIR/nvm.sh && cd {{release_path}} && npm install && npm run build');
});

desc('Fix assets permissions');
task('deploy:assets', function () {
    run('chmod -R 755 {{release_path}}/public/build');
});
task('artisan:storage:link', artisan('storage:link', ['min' => 5.3]));
desc('Migrate database');
task('database:migrate', function () {
    // Sửa đường dẫn thành release_path
    run('{{bin/php}} {{release_path}}/artisan migrate --force');
});
desc('Run Category seeder');
task('database:seed:category', function () {
    run('{{bin/php}} {{release_path}}/artisan db:seed --class=CategorySeeder --force');
});
// Quá trình deploy
desc('Deploy the project');
task('deploy', [
    'deploy:prepare',
    'deploy:vendors',
    'build:frontend',
    'artisan:storage:link',
    'artisan:view:cache',
    'artisan:config:cache',
    'artisan:migrate',
    'deploy:publish',
]);

// Rollback nếu lỗi xảy ra
after('deploy:failed', 'deploy:unlock');
