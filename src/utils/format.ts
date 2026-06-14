import { serviceLabels, statusLabels } from '@/constants/services';
import type { CitizenRequest, RequestStatus, ServiceType } from '@/types';

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function serviceLabel(type: ServiceType) {
  return serviceLabels[type];
}

export function statusLabel(status: RequestStatus) {
  return statusLabels[status];
}

export function requestTitle(request: CitizenRequest) {
  return `${serviceLabel(request.serviceType)} - ${request.trackingNumber}`;
}

export function humanizeKey(key: string) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, (char) => char.toUpperCase());
}

export function sortByNewest<T extends { updatedAt?: string; createdAt?: string; submittedAt?: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    const aDate = a.updatedAt ?? a.createdAt ?? a.submittedAt ?? '';
    const bDate = b.updatedAt ?? b.createdAt ?? b.submittedAt ?? '';
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });
}
