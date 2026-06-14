import { RoleGuard } from '@/components/RoleGuard';
import { AdminRequestDetailScreen } from '@/screens/requestDetail';

export default function AdminRequestDetailRoute() {
  return (
    <RoleGuard role="admin">
      <AdminRequestDetailScreen />
    </RoleGuard>
  );
}
