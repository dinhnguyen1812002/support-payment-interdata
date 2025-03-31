<?php

namespace App\Http\Controllers\Oauth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    // Xử lý callback từ Google
    public function handleGoogleCallback()
    {
        try {
            $socialUser = Socialite::driver('google')->user();
            $user = User::where('provider', 'google')->where('provider_id', $socialUser->id)->first();

            if ($user) {
                Auth::login($user);
            } else {
                $user = User::create([
                    'name' => $socialUser->name,
                    'email' => $socialUser->email,
                    'provider' => 'google',
                    'provider_id' => $socialUser->id,
                    'password' => bcrypt(uniqid()), // Mật khẩu ngẫu nhiên
                ]);
                Auth::login($user);
            }

            return redirect('/');
        } catch (\Exception $e) {
            return redirect('/login')->with('error', 'Đăng nhập bằng Google thất bại.');
        }
    }

    // Chuyển hướng đến GitHub
    public function redirectToGithub()
    {
        return Socialite::driver('github')->redirect();
    }

    // Xử lý callback từ GitHub
    public function handleGithubCallback()
    {
        try {
            $socialUser = Socialite::driver('github')->user();
            $user = User::where('provider', 'github')->where('provider_id', $socialUser->id)->first();

            if ($user) {
                Auth::login($user);
            } else {
                $user = User::create([
                    'name' => $socialUser->name ?? $socialUser->nickname,
                    'email' => $socialUser->email,
                    'provider' => 'github',
                    'provider_id' => $socialUser->id,
                    'password' => bcrypt(uniqid()), // Mật khẩu ngẫu nhiên
                ]);
                Auth::login($user);
            }

            return redirect('/');
        } catch (\Exception $e) {
            return redirect('/login')->with('error', 'Đăng nhập bằng GitHub thất bại.');
        }
    }
}
