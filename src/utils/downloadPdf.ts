import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Linking, Platform } from 'react-native';

import { getApiBaseUrl } from '@/services/api';

async function readError(response: Response) {
  const payload = (await response.json().catch(() => null)) as { error?: string } | null;
  return payload?.error || 'Gagal mengunduh dokumen.';
}

function safeFileName(fileName: string) {
  return fileName.replace(/[^a-z0-9._-]+/gi, '-');
}

export async function downloadAuthenticatedPdf(token: string, path: string, fileName: string) {
  const url = `${getApiBaseUrl()}${path}`;
  const headers = { Authorization: `Bearer ${token}` };

  if (Platform.OS === 'web') {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(await readError(response));
    }

    const href = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = href;
    link.download = safeFileName(fileName);
    link.target = '_blank';
    link.click();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
    return;
  }

  const fileUri = `${FileSystem.cacheDirectory}${safeFileName(fileName)}`;
  const result = await FileSystem.downloadAsync(url, fileUri, { headers });
  if (result.status >= 400) {
    throw new Error('Gagal mengunduh dokumen.');
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(result.uri, {
      dialogTitle: fileName,
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
    });
    return;
  }

  await Linking.openURL(result.uri);
}
