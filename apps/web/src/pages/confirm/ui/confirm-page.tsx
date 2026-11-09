import { ConfirmStatusCard } from '@/features/confirm-email/ui/confirm-status-card';

export function ConfirmPage() {
  return (
    <main style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <ConfirmStatusCard />
    </main>
  );
}
