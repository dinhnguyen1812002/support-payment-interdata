<?php

namespace App\Console\Commands;

use App\Events\NewQuestionCreated;
use App\Models\Post;
use Illuminate\Console\Command;

class test extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:test';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $post = Post::find('01jp1xepa4cv3en4axatkh9vdk');

        event(new NewQuestionCreated($post));
    }
}
