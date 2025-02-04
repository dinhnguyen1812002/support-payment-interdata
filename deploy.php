<?php

namespace Deployer;

require 'recipe/laravel.php';

// Config

set('repository', 'https://github.com/dinhnguyen1812002/support-payment-interdata.git');

add('shared_files', []);
add('shared_dirs', []);
add('writable_dirs', []);

// Hosts

host('103.20.96.236')
    ->set('remote_user', 'root')
    ->set('deploy_path', '~/var/www/support-ticket')
    ->set('password', 'Hhjshefnkd@23');
// Hooks

after('deploy:failed', 'deploy:unlock');
task('build', function () {
    run('cd {{release_path}} && npm install && npm run build');
});

// Kích hoạt queue worker sau khi deploy
task('restart-queue', function () {
    run('php {{deploy_path}}/current/artisan queue:restart');
});

after('deploy:symlink', 'restart-queue');
after('deploy:failed', 'deploy:unlock'); // Mở khóa nếu deploy thất bại
