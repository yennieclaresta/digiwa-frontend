import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import {
  createRequest as createRequestRequest,
  generateDocument as generateDocumentRequest,
  getAdminDashboard,
  getMe,
  getRequest,
  listNotifications,
  listRequests,
  login as loginRequest,
  markNotificationRead as markNotificationReadRequest,
  register as registerRequest,
  updateMe,
  updateRequestStatus as updateRequestStatusRequest,
  updateMyPassword,
} from '@/services/api';
import { getDispatchDocuments } from '@/utils/documentDispatch';
import {
  mapAdminActivity,
  mapGeneratedDocument,
  mapNotification,
  mapRequestDetail,
  mapRequestSummary,
  mapUser,
} from '@/services/apiMappers';
import { uploadFilesToCloudinary } from '@/services/uploadService';
import type {
  AdminActivity,
  CitizenRequest,
  GeneratedDocument,
  Notification,
  RequestStatus,
  ServiceType,
  UploadedFile,
  User,
} from '@/types';

type LoginInput = {
  identifier: string;
  password: string;
};

type RegisterInput = {
  name: string;
  nik: string;
  kkNumber: string;
  email: string;
  phone: string;
  address: string;
  rt: string;
  rw: string;
  password: string;
};

type ProfileInput = Pick<User, 'name' | 'email' | 'phone' | 'address' | 'rt' | 'rw'>;

type PasswordInput = {
  currentPassword: string;
  newPassword: string;
};

type AppContextValue = {
  requests: CitizenRequest[];
  notifications: Notification[];
  activities: AdminActivity[];
  currentUser: User | null;
  sessionLoading: boolean;
  dataLoading: boolean;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  refreshData: () => Promise<void>;
  getRequestById: (requestId: string) => Promise<CitizenRequest>;
  submitRequest: (
    serviceType: ServiceType,
    formData: Record<string, string>,
    uploadedFiles: UploadedFile[],
  ) => Promise<CitizenRequest>;
  updateRequestStatus: (requestId: string, status: RequestStatus, adminNote?: string) => Promise<CitizenRequest>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  generateDocument: (requestId: string) => Promise<GeneratedDocument>;
  updateProfile: (input: ProfileInput) => Promise<User>;
  changePassword: (input: PasswordInput) => Promise<void>;
};

const SESSION_KEY = 'DIGIWA_SESSION_TOKEN';

const AppContext = createContext<AppContextValue | undefined>(undefined);

function upsertRequest(previous: CitizenRequest[], request: CitizenRequest) {
  return [request, ...previous.filter((item) => item.id !== request.id)];
}

function mergeRequest(previous: CitizenRequest[], request: CitizenRequest) {
  const existing = previous.find((item) => item.id === request.id);
  if (!existing) {
    return upsertRequest(previous, request);
  }
  return previous.map((item) => (item.id === request.id ? request : item));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState('');
  const [requests, setRequests] = useState<CitizenRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  async function loadAppData(authToken: string, user: User) {
    setDataLoading(true);
    try {
      const mePromise = getMe(authToken).then((r) => mapUser(r.user)).catch(() => null);
      const requestPromise = listRequests(authToken);
      const notificationPromise = listNotifications(authToken);
      const dashboardPromise = user.role === 'admin' ? getAdminDashboard(authToken) : null;
      const [refreshedUser, requestResponse, notificationResponse, dashboardResponse] = await Promise.all([
        mePromise,
        requestPromise,
        notificationPromise,
        dashboardPromise,
      ]);
      if (refreshedUser) {
        setCurrentUser(refreshedUser);
      }
      const detailedRequests = await Promise.all(
        requestResponse.requests.map(async (rawRequest) => {
          const summary = mapRequestSummary(rawRequest);
          try {
            const detailResponse = await getRequest(authToken, summary.id);
            return mapRequestDetail(detailResponse.request);
          } catch {
            return summary;
          }
        }),
      );

      setRequests(detailedRequests);
      setNotifications(notificationResponse.notifications.map(mapNotification));
      setActivities(
        user.role === 'admin' && dashboardResponse
          ? dashboardResponse.recentActivity.map(mapAdminActivity)
          : [],
      );
    } finally {
      setDataLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const storedToken = await AsyncStorage.getItem(SESSION_KEY);
        if (!storedToken) {
          return;
        }

        const response = await getMe(storedToken);
        const user = mapUser(response.user);
        if (!active) {
          return;
        }

        setToken(storedToken);
        setCurrentUser(user);
        await loadAppData(storedToken, user);
      } catch {
        await AsyncStorage.removeItem(SESSION_KEY);
      } finally {
        if (active) {
          setSessionLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  async function persistSession(nextToken: string, user: User) {
    setToken(nextToken);
    setCurrentUser(user);
    await AsyncStorage.setItem(SESSION_KEY, nextToken);
    await loadAppData(nextToken, user);
  }

  const login = async ({ identifier, password }: LoginInput) => {
    const response = await loginRequest(identifier.trim(), password);
    const user = mapUser(response.user);
    await persistSession(response.token, user);
    return user;
  };

  const register = async (input: RegisterInput) => {
    const nik = input.nik.trim();
    const response = await registerRequest({
      name: input.name,
      full_name: input.name,
      nik: nik || undefined,
      kkNumber: input.kkNumber,
      kk_number: input.kkNumber,
      email: input.email,
      phone: input.phone,
      phone_number: input.phone,
      address: input.address,
      rt: input.rt,
      rw: input.rw,
      password: input.password,
    });
    const user = mapUser(response.user);
    setToken(response.token);
    setCurrentUser(user);
    await AsyncStorage.setItem(SESSION_KEY, response.token);
    loadAppData(response.token, user).catch(() => {});
    return user;
  };

  const logout = async () => {
    setToken('');
    setCurrentUser(null);
    setRequests([]);
    setNotifications([]);
    setActivities([]);
    await AsyncStorage.removeItem(SESSION_KEY);
  };

  const refreshData = async () => {
    if (!token || !currentUser) {
      return;
    }
    await loadAppData(token, currentUser);
  };

  const getRequestById = async (requestId: string) => {
    if (!token) {
      throw new Error('Unauthorized.');
    }

    const cachedRequest = requests.find((item) => item.id === requestId);
    if (
      cachedRequest &&
      (Object.keys(cachedRequest.formData).length > 0 ||
        cachedRequest.timeline.length > 0 ||
        cachedRequest.uploadedFiles.length > 0 ||
        cachedRequest.generatedDocuments.length > 0)
    ) {
      return cachedRequest;
    }

    const response = await getRequest(token, requestId);
    const request = mapRequestDetail(response.request);
    setRequests((previous) => mergeRequest(previous, request));
    return request;
  };

  const submitRequest: AppContextValue['submitRequest'] = async (serviceType, formData, uploadedFiles) => {
    if (!token || !currentUser || currentUser.role !== 'warga') {
      throw new Error('Akses tidak diizinkan.');
    }

    const cloudinaryFiles = uploadedFiles.length
      ? await uploadFilesToCloudinary(token, serviceType, uploadedFiles)
      : [];
    const response = await createRequestRequest(token, {
      serviceType,
      formData,
      statementAccepted: true,
      uploadedFiles: cloudinaryFiles.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        publicUrl: file.publicUrl,
        storagePath: file.storagePath,
        fileCategory: file.fileCategory,
        uploadedAt: file.uploadedAt,
      })),
    });
    const request = mapRequestDetail(response.request);
    setRequests((previous) => upsertRequest(previous, request));

    const notificationResponse = await listNotifications(token);
    setNotifications(notificationResponse.notifications.map(mapNotification));

    return request;
  };

  const updateRequestStatus: AppContextValue['updateRequestStatus'] = async (requestId, status, adminNote) => {
    if (!token || !currentUser || currentUser.role !== 'admin') {
      throw new Error('Akses tidak diizinkan.');
    }

    const response = await updateRequestStatusRequest(token, requestId, {
      status,
      adminNote: adminNote?.trim() || '',
    });
    const updatedRequest = mapRequestDetail(response.request);

    if (status === 'selesai') {
      const docsToDispatch = getDispatchDocuments(updatedRequest.serviceType);
      await Promise.allSettled(
        docsToDispatch.map((doc) =>
          generateDocumentRequest(token, requestId, {
            publicId: doc.publicId,
            fileName: doc.fileName,
            documentLabel: doc.documentLabel,
          }),
        ),
      );
      const refreshedResponse = await getRequest(token, requestId);
      const refreshedRequest = mapRequestDetail(refreshedResponse.request);
      setRequests((previous) => mergeRequest(previous, refreshedRequest));
      await loadAppData(token, currentUser);
      return refreshedRequest;
    }

    setRequests((previous) => mergeRequest(previous, updatedRequest));
    await loadAppData(token, currentUser);
    return updatedRequest;
  };

  const markNotificationRead = async (notificationId: string) => {
    if (!token) {
      throw new Error('Unauthorized.');
    }

    await markNotificationReadRequest(token, notificationId);
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
  };

  const generateDocument = async (requestId: string) => {
    if (!token || !currentUser || currentUser.role !== 'admin') {
      throw new Error('Akses tidak diizinkan.');
    }

    const response = await generateDocumentRequest(token, requestId);
    const document = mapGeneratedDocument(response.document);
    const detailResponse = await getRequest(token, requestId);
    setRequests((previous) => mergeRequest(previous, mapRequestDetail(detailResponse.request)));
    return document;
  };

  const updateProfile = async (input: ProfileInput) => {
    if (!token || !currentUser) {
      throw new Error('Unauthorized.');
    }

    const response = await updateMe(token, input);
    const user = mapUser(response.user);
    setCurrentUser(user);
    return user;
  };

  const changePassword = async (input: PasswordInput) => {
    if (!token) {
      throw new Error('Unauthorized.');
    }

    await updateMyPassword(token, input);
  };

  const value = {
    requests,
    notifications,
    activities,
    currentUser,
    sessionLoading,
    dataLoading,
    login,
    register,
    logout,
    refreshData,
    getRequestById,
    submitRequest,
    updateRequestStatus,
    markNotificationRead,
    generateDocument,
    updateProfile,
    changePassword,
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
