import { RoleGuard } from '@/components/RoleGuard';
import { RequestSuccessScreen } from '@/screens/requestForm';

export default function SuccessRoute() {
  return (
    <RoleGuard role="warga">
      <RequestSuccessScreen />
    </RoleGuard>
  );
}
