import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { mockActivities, mockNotifications, mockRequests, mockUsers } from '@/data/mockData';
import type {
  AdminActivity,
  CitizenRequest,
  Notification,
  RequestStatus,
  ServiceType,
  UploadedFile,
  User,
} from '@/types';

type LoginInput = {
  identifier: string;
  password: string;
  role: User['role'];
};

type RegisterInput = Omit<User, 'id' | 'role'>;

type AppContextValue = {
  users: User[];
  requests: CitizenRequest[];
  notifications: Notification[];
  activities: AdminActivity[];
  currentUser: User | null;
  sessionLoading: boolean;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  submitRequest: (
    serviceType: ServiceType,
    formData: Record<string, string>,
    uploadedFiles: UploadedFile[],
  ) => Promise<CitizenRequest>;
  updateRequestStatus: (requestId: string, status: RequestStatus, adminNote?: string) => Promise<CitizenRequest>;
  markNotificationRead: (notificationId: string) => Promise<void>;
};

const SESSION_KEY = 'DIGIWA_SESSION_USER_ID';

const AppContext = createContext<AppContextValue | undefined>(undefined);

function wait<T>(value: T, ms = 220) {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function createTrackingNumber(serviceType: ServiceType) {
  const serviceCode = {
    ktp: 'KTP',
    akta_kelahiran: 'AKL',
    akta_kematian: 'AKM',
    surat_rt_rw: 'SRT',
  }[serviceType];
  const now = new Date();
  const stamp = now.toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Math.floor(100 + Math.random() * 900);
  return `DGW-${serviceCode}-${stamp}-${suffix}`;
}

function notificationMessage(status: RequestStatus) {
  const messages: Record<RequestStatus, string> = {
    pending: 'Pengajuan Anda telah diterima dan sedang menunggu verifikasi admin.',
    diproses: 'Pengajuan Anda sedang diproses oleh admin.',
    revisi: 'Pengajuan Anda membutuhkan revisi. Silakan cek catatan admin pada detail pengajuan.',
    selesai: 'Pengajuan Anda telah selesai diproses.',
    ditolak: 'Pengajuan Anda ditolak. Silakan cek alasan penolakan pada detail pengajuan.',
  };
  return messages[status];
}

function timelineTitle(status: RequestStatus) {
  const titles: Record<RequestStatus, string> = {
    pending: 'Menunggu Verifikasi',
    diproses: 'Diproses Admin',
    revisi: 'Perlu Revisi',
    selesai: 'Selesai Diproses',
    ditolak: 'Ditolak',
  };
  return titles[status];
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [requests, setRequests] = useState<CitizenRequest[]>(mockRequests);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activities, setActivities] = useState<AdminActivity[]>(mockActivities);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const userId = await AsyncStorage.getItem(SESSION_KEY);
        if (userId) {
          const foundUser = mockUsers.find((user) => user.id === userId) ?? null;
          setCurrentUser(foundUser);
        }
      } finally {
        setSessionLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = async ({ identifier, password, role }: LoginInput) => {
    const normalized = identifier.trim().toLowerCase();
    const user = users.find(
      (candidate) =>
        candidate.role === role &&
        candidate.password === password &&
        (candidate.email.toLowerCase() === normalized || (candidate.nik && candidate.nik === identifier.trim())),
    );

    if (!user) {
      throw new Error('Email/NIK atau password tidak sesuai.');
    }

    setCurrentUser(user);
    await AsyncStorage.setItem(SESSION_KEY, user.id);
    return wait(user);
  };

  const register = async (input: RegisterInput) => {
    const duplicate = users.some(
      (user) =>
        user.email.toLowerCase() === input.email.toLowerCase() ||
        (Boolean(input.nik) && user.nik === input.nik),
    );
    if (duplicate) {
      throw new Error(input.nik ? 'Email atau NIK sudah terdaftar.' : 'Email sudah terdaftar.');
    }

    const user: User = {
      ...input,
      id: createId('user-warga'),
      role: 'warga',
    };

    setUsers((previous) => [user, ...previous]);
    setCurrentUser(user);
    await AsyncStorage.setItem(SESSION_KEY, user.id);
    return wait(user);
  };

  const logout = async () => {
    setCurrentUser(null);
    await AsyncStorage.removeItem(SESSION_KEY);
  };

  const submitRequest: AppContextValue['submitRequest'] = async (serviceType, formData, uploadedFiles) => {
    if (!currentUser || currentUser.role !== 'warga') {
      throw new Error('Akses tidak diizinkan.');
    }

    const now = new Date().toISOString();
    const request: CitizenRequest = {
      id: createId('req'),
      trackingNumber: createTrackingNumber(serviceType),
      userId: currentUser.id,
      applicantName:
        formData.namaLengkap ??
        formData.namaPelapor ??
        formData.namaAyah ??
        formData.namaAnak ??
        formData.namaAlmarhum ??
        currentUser.name,
      nik:
        formData.nik ||
        formData.nikPelapor ||
        formData.nikAyah ||
        formData.nikAlmarhum ||
        currentUser.nik ||
        'Belum memiliki NIK',
      serviceType,
      status: 'pending',
      submittedAt: now,
      updatedAt: now,
      formData,
      uploadedFiles,
      timeline: [
        {
          id: createId('timeline'),
          status: 'pending',
          title: 'Pengajuan Dikirim',
          description: 'Pengajuan berhasil dikirim.',
          createdAt: now,
        },
        {
          id: createId('timeline'),
          status: 'pending',
          title: 'Menunggu Verifikasi',
          description: 'Pengajuan menunggu verifikasi admin.',
          createdAt: now,
        },
      ],
    };

    const notification: Notification = {
      id: createId('notif'),
      userId: currentUser.id,
      requestId: request.id,
      title: 'Pengajuan berhasil dikirim',
      message: notificationMessage('pending'),
      isRead: false,
      createdAt: now,
    };

    setRequests((previous) => [request, ...previous]);
    setNotifications((previous) => [notification, ...previous]);
    return wait(request);
  };

  const updateRequestStatus: AppContextValue['updateRequestStatus'] = async (requestId, status, adminNote) => {
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Akses tidak diizinkan.');
    }

    let updatedRequest: CitizenRequest | undefined;
    const now = new Date().toISOString();

    setRequests((previous) =>
      previous.map((request) => {
        if (request.id !== requestId) {
          return request;
        }

        updatedRequest = {
          ...request,
          status,
          adminNote: adminNote?.trim() || request.adminNote,
          updatedAt: now,
          timeline: [
            ...request.timeline,
            {
              id: createId('timeline'),
              status,
              title: timelineTitle(status),
              description: notificationMessage(status),
              createdAt: now,
            },
          ],
        };
        return updatedRequest;
      }),
    );

    if (!updatedRequest) {
      throw new Error('Pengajuan tidak ditemukan.');
    }

    const notification: Notification = {
      id: createId('notif'),
      userId: updatedRequest.userId,
      requestId: updatedRequest.id,
      title: `Status ${timelineTitle(status)}`,
      message: notificationMessage(status),
      isRead: false,
      createdAt: now,
    };

    const activity: AdminActivity = {
      id: createId('activity'),
      adminId: currentUser.id,
      action: `Admin updated request status to ${timelineTitle(status)}`,
      requestId,
      createdAt: now,
    };

    setNotifications((previous) => [notification, ...previous]);
    setActivities((previous) => [activity, ...previous]);
    return wait(updatedRequest);
  };

  const markNotificationRead = async (notificationId: string) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === notificationId
          ? {
              ...notification,
              isRead: true,
            }
          : notification,
      ),
    );
    await wait(undefined);
  };

  const value = {
    users,
    requests,
    notifications,
    activities,
    currentUser,
    sessionLoading,
    login,
    register,
    logout,
    submitRequest,
    updateRequestStatus,
    markNotificationRead,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return context;
}
