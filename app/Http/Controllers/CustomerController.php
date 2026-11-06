<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $category = $request->query('kategori', 'all');
        $search = $request->query('search', '');

        $query = Customer::query()
            ->when($search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('nama', 'like', "%{$search}%")
                        ->orWhere('telepon', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            });

        // Filter berdasarkan kategori tier member (Classic, Silver, Gold, Top)
        if ($category === 'classic') {
            $query->where('poin', '<', 50);
        } elseif ($category === 'silver') {
            $query->whereBetween('poin', [50, 150]);
        } elseif ($category === 'gold') {
            $query->where('poin', '>', 150);
        } elseif ($category === 'top') {
            $query->orderByDesc('poin')->orderByDesc('total_transaksi');
        }

        if ($category !== 'top') {
            $query->latest();
        }

        $customers = $query->paginate(15)->withQueryString();

        // Transform item agar memiliki tier eksplisit
        $customers->getCollection()->transform(function ($c) {
            $pts = (int) ($c->poin ?? 0);
            if ($pts >= 150) {
                $tier = 'Gold';
            } elseif ($pts >= 50) {
                $tier = 'Silver';
            } else {
                $tier = 'Classic';
            }
            $c->tier = $tier;
            $c->total_belanja = (float) ($c->total_transaksi ?? 0);
            return $c;
        });

        // Summary counts untuk KPI bar
        $allCustomers = Customer::all(['poin', 'total_transaksi']);
        $counts = [
            'total' => $allCustomers->count(),
            'classic' => $allCustomers->where('poin', '<', 50)->count(),
            'silver' => $allCustomers->whereBetween('poin', [50, 150])->count(),
            'gold' => $allCustomers->where('poin', '>', 150)->count(),
            'total_poin' => (int) $allCustomers->sum('poin'),
            'total_belanja' => (float) $allCustomers->sum('total_transaksi'),
        ];

        return Inertia::render('Customer/Index', [
            'customers' => $customers,
            'counts' => $counts,
            'kategori' => $category,
            'filters' => [
                'search' => $search,
                'kategori' => $category,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'telepon' => 'nullable|string|max:20|unique:customers,telepon',
            'email' => 'nullable|email|max:100',
            'poin' => 'nullable|integer|min:0',
            'catatan' => 'nullable|string|max:255',
        ]);

        $validated['poin'] = $validated['poin'] ?? 25; // Bonus poin selamat datang

        Customer::create($validated);

        return redirect()->route('customer.index')->with('success', 'Member baru berhasil didaftarkan.');
    }

    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'telepon' => 'nullable|string|max:20|unique:customers,telepon,' . $customer->id,
            'email' => 'nullable|email|max:100',
            'poin' => 'nullable|integer|min:0',
            'catatan' => 'nullable|string|max:255',
        ]);

        $customer->update($validated);

        return redirect()->route('customer.index')->with('success', 'Data member berhasil diperbarui.');
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();
        return redirect()->route('customer.index')->with('success', 'Member berhasil dihapus dari sistem.');
    }
}
