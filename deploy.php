<?php

namespace Deployer;

require 'recipe/laravel.php';

// Cấu hình Project
set('application', 'support ticket');
set('repository', 'https://github.com/dinhnguyen1812002/support-payment-interdata.git');
set('php_fpm_version', '8.3');
set('password', 'Hhjshefnkd@23');
// Cấu hình máy chủ
host('103.20.96.236')
    ->set('remote_user', 'deployer')
    ->set('password', 'Hhjshefnkd@23')
    ->set('deploy_path', '~/var/www/support-ticket')
    ->set('auth_mode', 'password')
    ->set('timeout', 300)
    ->set('ssh_multiplexing', false)
    ->set('keep_releases', 5)
    ->set('ssh_type', 'native');

// Các thư mục shared
set('shared_files', [
    '.env',
]);
set('shared_dirs', [
    'storage',
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
task('build-assets', function () {
    cd('{{release_path}}');
    run('npm install');
    run('npm run build');
});

// Task chạy migrations
task('artisan:migrate', function () {
    run('php {{release_path}}/artisan migrate --force');
});

// Thứ tự các task sẽ chạy
task('deploy', [
    'deploy:prepare',
    'deploy:vendors',
    'build-assets',
    'artisan:storage:link',
    'artisan:view:cache',
    'artisan:config:cache',
    'artisan:migrate',
    'deploy:publish',
]);
