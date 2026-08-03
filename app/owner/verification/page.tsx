'use client';

import { useEffect, useState } from 'react';
import { Shield, Upload, Check, Clock, X, Loader2, FileText } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

type Doc = {
  id: string;
  owner_id: string;
  truck_id: string | null;
  doc_type: string;
  doc_url: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note: string;
  created_at: string;
};

const DOC_TYPES = [
  { key: 'rc_book', label: 'RC Book', desc: 'Vehicle Registration Certificate' },
  { key: 'insurance', label: 'Insurance', desc: 'Valid vehicle insurance document' },
  { key: 'driving_license', label: 'Driving License', desc: "Driver's valid license" },
  { key: 'fitness_certificate', label: 'Fitness Certificate', desc: 'Vehicle fitness certificate' },
  { key: 'permit', label: 'Permit', desc: 'Transport permit' },
  { key: 'pollution', label: 'Pollution Certificate', desc: 'Valid PUC certificate' },
];

const PLACEHOLDER_DOCS: Record<string, string> = {};
DOC_TYPES.forEach((d) => {
  PLACEHOLDER_DOCS[d.key] = `https://images.pexels.com/photos/20922619/pexels-photo-20922619.jpeg?auto=compress&cs=tinysrgb&w=800`;
});

export default function OwnerVerification() {
  const { profile } = useAuth();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!profile) return;
      const { data } = await supabase
        .from('verification_documents')
        .select('*')
        .eq('owner_id', profile.id)
        .order('created_at', { ascending: false });
      setDocs(data || []);
      setLoading(false);
    }
    load();
  }, [profile]);

  async function uploadDoc(docType: string) {
    if (!profile) return;
    setSubmitting(docType);
    try {
      const { error } = await supabase.from('verification_documents').insert({
        owner_id: profile.id,
        doc_type: docType,
        doc_url: PLACEHOLDER_DOCS[docType],
        status: 'pending',
      });
      if (error) throw error;
      toast.success(`${docType.replace(/_/g, ' ')} uploaded for review`);
      const { data } = await supabase
        .from('verification_documents')
        .select('*')
        .eq('owner_id', profile.id)
        .order('created_at', { ascending: false });
      setDocs(data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload');
    } finally {
      setSubmitting(null);
    }
  }

  const docStatus = (type: string) => docs.find((d) => d.doc_type === type);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Verification</h1>
        <p className="mt-1 text-muted-foreground">
          Upload your documents to get verified. Verified owners get more bookings and trust.
        </p>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center gap-2 text-blue-800">
          <Shield className="h-5 w-5" />
          <span className="font-semibold">Why get verified?</span>
        </div>
        <p className="mt-1 text-sm text-blue-700">
          Verified trucks appear at the top of search results, get a verified badge, and receive 3x more booking requests.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {DOC_TYPES.map((dt) => {
            const existing = docStatus(dt.key);
            return (
              <div key={dt.key} className="rounded-2xl border border-border bg-white p-5">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{dt.label}</h3>
                      <p className="text-xs text-muted-foreground">{dt.desc}</p>
                    </div>
                  </div>
                  {existing && (
                    <Badge className={
                      existing.status === 'approved' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                      existing.status === 'rejected' ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                      'bg-amber-100 text-amber-700 hover:bg-amber-100'
                    }>
                      {existing.status === 'approved' && <Check className="mr-1 h-3 w-3" />}
                      {existing.status === 'pending' && <Clock className="mr-1 h-3 w-3" />}
                      {existing.status === 'rejected' && <X className="mr-1 h-3 w-3" />}
                      {existing.status}
                    </Badge>
                  )}
                </div>
                {existing?.admin_note && existing.status === 'rejected' && (
                  <p className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700">
                    {existing.admin_note}
                  </p>
                )}
                <div className="mt-4">
                  {existing ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-green-500" /> Uploaded on {new Date(existing.created_at).toLocaleDateString()}
                    </div>
                  ) : (
                    <Button
                      onClick={() => uploadDoc(dt.key)}
                      disabled={submitting === dt.key}
                      variant="outline"
                      className="w-full"
                    >
                      {submitting === dt.key ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      Upload Document
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
