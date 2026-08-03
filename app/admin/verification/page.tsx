'use client';

import { useEffect, useState } from 'react';
import { Shield, Check, X, FileText, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type Doc = {
  id: string;
  owner_id: string;
  doc_type: string;
  doc_url: string;
  status: string;
  admin_note: string;
  created_at: string;
  profiles?: { full_name: string };
};

export default function AdminVerification() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('verification_documents')
        .select('*, profiles!verification_documents_owner_id_fkey(full_name)')
        .order('created_at', { ascending: false });
      setDocs(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = docs.filter((d) => filter === 'all' || d.status === filter);

  async function review(doc: Doc, status: 'approved' | 'rejected') {
    const note = notes[doc.id] || '';
    const { error } = await supabase.from('verification_documents')
      .update({ status, admin_note: note, updated_at: new Date().toISOString() })
      .eq('id', doc.id);
    if (error) { toast.error('Failed'); return; }
    setDocs((prev) => prev.map((d) => d.id === doc.id ? { ...d, status, admin_note: note } : d));

    await supabase.from('notifications').insert({
      user_id: doc.owner_id,
      title: `Document ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      body: `Your ${doc.doc_type.replace(/_/g, ' ')} has been ${status}.${note ? ' Note: ' + note : ''}`,
      type: 'verification',
      reference_id: doc.id,
    });
    toast.success(`Document ${status}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Verification Documents</h1>
        <p className="mt-1 text-muted-foreground">Review and approve owner documents.</p>
      </div>

      <div className="flex gap-2">
        {['pending', 'approved', 'rejected', 'all'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition capitalize ${
              filter === f ? 'bg-primary text-white' : 'bg-white border border-border text-foreground/70 hover:bg-muted'
            }`}>{f}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center">
          <Shield className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">No documents to review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <div key={d.id} className="rounded-2xl border border-border bg-white p-5">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold capitalize">{d.doc_type.replace(/_/g, ' ')}</h3>
                    <p className="text-sm text-muted-foreground">{d.profiles?.full_name} · {new Date(d.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <Badge className={
                  d.status === 'approved' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                  d.status === 'pending' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' :
                  'bg-red-100 text-red-700 hover:bg-red-100'
                }>
                  {d.status === 'pending' && <Clock className="mr-1 h-3 w-3" />}
                  {d.status}
                </Badge>
              </div>

              {d.status === 'pending' && (
                <div className="mt-4 space-y-3">
                  <Input
                    placeholder="Admin note (optional, shown on rejection)…"
                    value={notes[d.id] || ''}
                    onChange={(e) => setNotes({ ...notes, [d.id]: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => review(d, 'approved')} className="bg-green-600 hover:bg-green-700">
                      <Check className="mr-1 h-4 w-4" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => review(d, 'rejected')} className="text-destructive">
                      <X className="mr-1 h-4 w-4" /> Reject
                    </Button>
                  </div>
                </div>
              )}
              {d.admin_note && d.status !== 'pending' && (
                <p className="mt-3 rounded-lg bg-slate-50 p-2 text-xs text-muted-foreground">Note: {d.admin_note}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
