'use client';

import { useEffect, useState } from 'react';
import { Users, Search, Shield, Ban, Check } from 'lucide-react';
import { supabase, type Profile } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setUsers(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = users.filter((u) => {
    if (filter !== 'all' && u.role !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return u.full_name?.toLowerCase().includes(q) || u.phone?.toLowerCase().includes(q);
    }
    return true;
  });

  async function toggleSuspend(u: Profile) {
    const { error } = await supabase.from('profiles')
      .update({ is_suspended: !u.is_suspended })
      .eq('id', u.id);
    if (error) { toast.error('Failed'); return; }
    setUsers((prev) => prev.map((p) => p.id === u.id ? { ...p, is_suspended: !u.is_suspended } : p));
    toast.success(u.is_suspended ? 'User reinstated' : 'User suspended');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="mt-1 text-muted-foreground">Manage all platform users.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input placeholder="Search by name…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
        <div className="flex gap-2">
          {['all', 'customer', 'owner', 'admin'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition capitalize ${
                filter === f ? 'bg-primary text-white' : 'bg-white border border-border text-foreground/70 hover:bg-muted'
              }`}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center">
          <Users className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">No users found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded-xl border border-border bg-white p-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={u.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary">{u.full_name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium truncate">{u.full_name || 'Unnamed'}</p>
                  <p className="text-sm text-muted-foreground truncate">{u.city} · {u.phone || 'No phone'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="capitalize bg-primary/10 text-primary">{u.role}</Badge>
                {u.is_verified && <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><Shield className="mr-1 h-3 w-3" /> Verified</Badge>}
                {u.is_suspended && <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Suspended</Badge>}
                <Button variant="outline" size="sm" onClick={() => toggleSuspend(u)}
                  className={u.is_suspended ? 'text-green-600' : 'text-destructive'}>
                  {u.is_suspended ? <Check className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
