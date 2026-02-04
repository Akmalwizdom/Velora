<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles  The allowed role names (e.g., 'hr', 'manager', 'admin')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(403, 'Unauthorized. Authentication required.');
        }

        $userRole = $user->role?->name;

        if (! in_array($userRole, $roles, true)) {
            abort(403, 'Unauthorized. Required role: '.implode(' or ', $roles));
        }

        return $next($request);
    }
}
