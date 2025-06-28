<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Documentation') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                <div class="flex">
                    <!-- Sidebar -->
                    <div class="w-1/4 bg-gray-50 p-6 border-r border-gray-200">
                        <h3 class="font-semibold text-lg mb-4">Topics</h3>
                        <ul>
                            @foreach ($files as $doc)
                                <li class="mb-2">
                                    <a href="{{ route('admin.docs.show', ['file' => $doc]) }}" 
                                       class="{{ $currentFile == $doc ? 'font-bold text-indigo-600' : 'text-gray-700' }} hover:text-indigo-600">
                                        {{ Str::title(str_replace('-', ' ', Str::before($doc, '.md'))) }}
                                    </a>
                                </li>
                            @endforeach
                        </ul>
                    </div>

                    <!-- Content -->
                    <div class="w-3/4 p-6">
                        <div class="prose max-w-none">
                            {!! $content !!}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
