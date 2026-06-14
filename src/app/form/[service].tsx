import { RoleGuard } from '@/components/RoleGuard';
import { RequestFormScreen } from '@/screens/requestForm';

export default function RequestFormRoute() {
  return (
    <RoleGuard role="warga">
      <RequestFormScreen />
    </RoleGuard>
  );
}
