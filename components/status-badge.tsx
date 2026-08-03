import { Badge } from '@/components/ui/badge';

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
    accepted: 'bg-sky-100 text-sky-700 hover:bg-sky-100',
    rejected: 'bg-red-100 text-red-700 hover:bg-red-100',
    in_transit: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
    completed: 'bg-green-100 text-green-700 hover:bg-green-100',
    cancelled: 'bg-slate-100 text-slate-600 hover:bg-slate-100',
  };
  return <Badge className={styles[status] || 'bg-slate-100'}>{status.replace('_', ' ')}</Badge>;
}
