<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Http\Request;
use App\Http\Controllers\Admin\AdminController;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class TestPaginationCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:pagination 
                            {--user-id=1 : User ID to test with}
                            {--page=1 : Page number to test}
                            {--per-page=10 : Items per page}
                            {--search= : Search term}
                            {--status= : Status filter}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test pagination functionality to debug 409 errors';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing Admin Pagination...');
        
        // Get user for testing
        $userId = $this->option('user-id');
        $user = User::find($userId);
        
        if (!$user) {
            $this->error("User with ID {$userId} not found");
            return 1;
        }
        
        // Authenticate user
        Auth::login($user);
        $this->info("Authenticated as: {$user->name} ({$user->email})");
        
        // Create test request
        $params = [
            'page' => $this->option('page'),
            'per_page' => $this->option('per-page'),
        ];
        
        if ($this->option('search')) {
            $params['search'] = $this->option('search');
        }
        
        if ($this->option('status')) {
            $params['status'] = $this->option('status');
        }
        
        $this->info('Testing with parameters: ' . json_encode($params));
        
        try {
            // Create mock request
            $request = Request::create('/admin/posts', 'GET', $params);
            $request->headers->set('Accept', 'application/json');
            $request->headers->set('X-Inertia', 'true');
            
            // Test the controller
            $controller = app(AdminController::class);
            $response = $controller->getAllPost($request);
            
            $this->info('✅ Pagination test successful!');
            
            // Display results
            if (method_exists($response, 'getData')) {
                $data = $response->getData();
                if (isset($data->props)) {
                    $pagination = $data->props->pagination ?? null;
                    if ($pagination) {
                        $this->table(
                            ['Metric', 'Value'],
                            [
                                ['Total Posts', $pagination->total ?? 'N/A'],
                                ['Current Page', $pagination->current_page ?? 'N/A'],
                                ['Per Page', $pagination->per_page ?? 'N/A'],
                                ['Last Page', $pagination->last_page ?? 'N/A'],
                                ['From', $pagination->from ?? 'N/A'],
                                ['To', $pagination->to ?? 'N/A'],
                            ]
                        );
                    }
                }
            }
            
        } catch (\Exception $e) {
            $this->error('❌ Pagination test failed!');
            $this->error('Error: ' . $e->getMessage());
            
            if ($this->option('verbose')) {
                $this->error('Stack trace:');
                $this->error($e->getTraceAsString());
            }
            
            // Suggest solutions
            $this->warn('Possible solutions:');
            $this->line('1. Check user permissions');
            $this->line('2. Verify database connection');
            $this->line('3. Check for route conflicts');
            $this->line('4. Review server logs');
            
            return 1;
        }
        
        // Test multiple scenarios
        $this->info('Running additional tests...');
        
        $testScenarios = [
            ['page' => 1, 'per_page' => 5],
            ['page' => 2, 'per_page' => 10],
            ['search' => 'test'],
            ['status' => 'published'],
            ['sort' => 'created_at', 'direction' => 'desc'],
        ];
        
        foreach ($testScenarios as $scenario) {
            try {
                $request = Request::create('/admin/posts', 'GET', $scenario);
                $request->headers->set('Accept', 'application/json');
                $request->headers->set('X-Inertia', 'true');
                
                $controller = app(AdminController::class);
                $response = $controller->getAllPost($request);
                
                $this->info('✅ Scenario passed: ' . json_encode($scenario));
                
            } catch (\Exception $e) {
                $this->error('❌ Scenario failed: ' . json_encode($scenario));
                $this->error('Error: ' . $e->getMessage());
            }
        }
        
        $this->info('Pagination testing completed!');
        return 0;
    }
}
