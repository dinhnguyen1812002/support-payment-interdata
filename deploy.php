<?php
namespace Deployer;

require 'recipe/laravel.php';

// Cấu hình Project
set('application', 'support ticket');
set('repository', 'https://github.com/dinhnguyen1812002/support-payment-interdata.git');
set('php_fpm_version', '8.3');

add('shared_files', []);
add('shared_dirs', []);
add('writable_dirs', []);

// Cấu hình máy chủ
host('103.20.96.236')
    ->set('remote_user', 'deployer')
    ->set('deploy_path', '~/var/www/support-ticket')
    ->set('ssh_multiplexing', false)
    ->set('timeout', 300)
    ->set('keep_releases', 5);

desc('Build the assets');
task('build', function () {
    run('cd {{release_path}} && export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use node && npm install && npm run build');
});

task('optimize', function () {
    cd('{{release_path}}');
    run('php artisan optimize');
});
desc('Fix asset permissions');
task('fix:permissions', function () {
    run('chmod -R 755 {{release_path}}/public/build');
});


after('deploy:update_code', 'build');
after('deploy:symlink', 'optimize');
after('build', 'fix:permissions');
// Hooks
after('deploy:failed', 'deploy:unlock');
