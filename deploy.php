<?php

namespace Deployer;

require 'recipe/laravel.php';

set('application', 'support ticket');
set('repository', 'https://github.com/dinhnguyen1812002/support-payment-interdata.git');
set('php_fpm_version', '8.3');

host('103.20.96.236')
    ->set('remote_user', 'deployer')
    ->set('deploy_path', '~/var/www/support-ticket')
    ->set('ssh_multiplexing', false)
    ->set('timeout', 300)
    ->set('keep_releases', 5);

desc('Build the assets');
task('build', function () {
    run('cd {{release_path}} && export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use node && npm ci && npm run build || echo "Build failed"');
});

desc('Fix permissions');
task('fix:permissions', function () {
    run('chmod -R 755 {{release_path}}/public/build');
    run('chown -R deployer:www-data {{release_path}}/public/build');
});

task('optimize', function () {
    cd('{{release_path}}');
    run('php artisan optimize');
});

after('deploy:update_code', 'build');
after('build', 'fix:permissions');
after('deploy:symlink', 'optimize');

after('deploy:failed', 'deploy:unlock');
