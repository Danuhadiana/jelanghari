<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $tab = $request->get('tab', 'staf'); // 'staf' | 'pelanggan' | 'all'
        $selectedRole = $request->get('role', 'all');

        // Total counters for tabs & badges
        $totalStaf = User::whereIn('role', ['owner', 'manager', 'kasir', 'barista', 'kitchen'])->count();
        $totalPelanggan = User::where('role', 'pelanggan')->count();
        $totalAll = User::count();
        $stafAktif = User::whereIn('role', ['owner', 'manager', 'kasir', 'barista', 'kitchen'])->where('is_aktif', true)->count();

        $countByRole = [
            'owner' => User::where('role', 'owner')->count(),
            'manager' => User::where('role', 'manager')->count(),
            'kasir' => User::where('role', 'kasir')->count(),
            'barista' => User::where('role', 'barista')->count(),
            'kitchen' => User::where('role', 'kitchen')->count(),
            'pelanggan' => User::where('role', 'pelanggan')->count(),
        ];

        $query = User::query();

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%")
                  ->orWhere('telepon', 'like', "%{$search}%");
            });
        }

        // Tab separation
        if ($tab === 'staf') {
            $query->whereIn('role', ['owner', 'manager', 'kasir', 'barista', 'kitchen']);
        } elseif ($tab === 'pelanggan') {
            $query->where('role', 'pelanggan');
        }

        // Sub-role filter
        if ($selectedRole && $selectedRole !== 'all') {
            $query->where('role', $selectedRole);
        }

        $users = $query->latest()
            ->paginate(15)
            ->withQueryString();

        // Attach customer loyalty data if pelanggan
        $emails = $users->getCollection()->pluck('email')->filter();
        $phones = $users->getCollection()->pluck('telepon')->filter();
        $customers = \App\Models\Customer::where(function ($q) use ($emails, $phones) {
            $q->whereIn('email', $emails)->orWhereIn('telepon', $phones);
        })->get();

        $users->getCollection()->transform(function ($u) use ($customers) {
            $c = $customers->first(function ($item) use ($u) {
                return (strtolower($item->email) === strtolower($u->email)) || 
                       ($u->telepon && $item->telepon === $u->telepon);
            });
            $u->customer_poin = $c ? (int) $c->poin : 0;
            $u->customer_kunjungan = $c ? (int) $c->kunjungan_count : 0;
            $u->customer_total_transaksi = $c ? (float) $c->total_transaksi : 0;
            return $u;
        });

        return Inertia::render('User/Index', [
            'users' => $users,
            'tab' => $tab,
            'selectedRole' => $selectedRole,
            'counts' => [
                'total_staf' => $totalStaf,
                'total_pelanggan' => $totalPelanggan,
                'total_all' => $totalAll,
                'staf_aktif' => $stafAktif,
                'by_role' => $countByRole,
            ],
            'roles' => [
                ['id' => 1, 'nama' => 'Owner Cafe', 'slug' => 'owner'],
                ['id' => 2, 'nama' => 'Manager Cafe', 'slug' => 'manager'],
                ['id' => 3, 'nama' => 'Kasir POS', 'slug' => 'kasir'],
                ['id' => 4, 'nama' => 'Barista Bar', 'slug' => 'barista'],
                ['id' => 5, 'nama' => 'Dapur / Kitchen', 'slug' => 'kitchen'],
                ['id' => 6, 'nama' => 'Pelanggan / Member', 'slug' => 'pelanggan'],
            ],
            'filters' => [
                'search' => $request->search ?? '',
                'tab' => $tab,
                'role' => $selectedRole,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'username' => 'nullable|string|max:50|unique:users,username',
            'email' => 'required|email|max:100|unique:users,email',
            'password' => 'required|string|min:6',
            'pin' => 'nullable|string|size:6',
            'role' => 'required|in:owner,manager,kasir,barista,kitchen,pelanggan',
            'telepon' => 'nullable|string|max:20',
            'is_aktif' => 'boolean',
            'poin' => 'nullable|integer|min:0',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'] ?? null,
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'pin' => !empty($validated['pin']) ? Hash::make($validated['pin']) : null,
            'role' => $validated['role'],
            'telepon' => $validated['telepon'] ?? null,
            'is_aktif' => $validated['is_aktif'] ?? true,
        ]);

        // If customer, also synchronize with customers CRM table
        if ($validated['role'] === 'pelanggan') {
            \App\Models\Customer::firstOrCreate(
                ['email' => $validated['email']],
                [
                    'nama' => $validated['name'],
                    'telepon' => $validated['telepon'] ?? null,
                    'poin' => $validated['poin'] ?? 25,
                    'total_transaksi' => 0,
                    'kunjungan_count' => 0,
                ]
            );
        }

        $label = $validated['role'] === 'pelanggan' ? 'Akun pelanggan baru' : 'Akun staf baru';
        return redirect()->back()->with('success', "{$label} berhasil ditambahkan.");
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'username' => 'nullable|string|max:50|unique:users,username,' . $user->id,
            'email' => 'required|email|max:100|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'pin' => 'nullable|string|size:6',
            'role' => 'required|in:owner,manager,kasir,barista,kitchen,pelanggan',
            'telepon' => 'nullable|string|max:20',
            'is_aktif' => 'boolean',
            'poin' => 'nullable|integer|min:0',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'username' => $validated['username'] ?? null,
            'email' => $validated['email'],
            'role' => $validated['role'],
            'telepon' => $validated['telepon'] ?? null,
            'is_aktif' => $validated['is_aktif'] ?? true,
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        if (!empty($validated['pin'])) {
            $updateData['pin'] = Hash::make($validated['pin']);
        }

        $user->update($updateData);

        // Update customer points if customer
        if ($validated['role'] === 'pelanggan' && isset($validated['poin'])) {
            $cust = \App\Models\Customer::where('email', $user->email)
                ->when($user->telepon, fn($q) => $q->orWhere('telepon', $user->telepon))
                ->first();
            if ($cust) {
                $cust->update([
                    'nama' => $validated['name'],
                    'poin' => (int) $validated['poin'],
                    'telepon' => $validated['telepon'] ?? $cust->telepon,
                ]);
            }
        }

        return redirect()->back()->with('success', 'Data akun berhasil diperbarui.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $user->delete();
        return redirect()->route('user.index')->with('success', 'Karyawan berhasil dihapus.');
    }

    public function toggle(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat menonaktifkan akun sendiri.');
        }

        $user->update(['is_aktif' => !$user->is_aktif]);
        return back();
    }
}
