import { File, UploadType } from 'expo-file-system';
import { Platform } from 'react-native';

import { requestUploadSignature } from '@/services/api';
import type { ServiceType, UploadedFile } from '@/types';

export async function uploadFilesToCloudinary(
  token: string,
  serviceType: ServiceType,
  files: UploadedFile[],
) {
  const uploaded: UploadedFile[] = [];

  for (const file of files) {
    const signature = await requestUploadSignature(token, serviceType);
    let payload:
      | {
          secure_url?: string;
          public_id?: string;
          bytes?: number;
          resource_type?: string;
          format?: string;
          original_filename?: string;
        }
      | undefined;
    let ok = false;

    if (Platform.OS === 'web') {
      const formData = new FormData();
      formData.append('api_key', signature.apiKey);
      formData.append('folder', signature.folder);
      formData.append('timestamp', String(signature.timestamp));
      formData.append('signature', signature.signature);

      // On Expo Web the { uri, name, type } RN trick sends a stringified object.
      // Use the native File object (asset.file) when available, otherwise
      // retrieve the blob from the blob/data URI returned by the document picker.
      if (file.file) {
        formData.append('file', file.file, file.name);
      } else {
        const blobRes = await fetch(file.uri);
        const blob = await blobRes.blob();
        formData.append('file', blob, file.name);
      }

      const response = await fetch(signature.uploadUrl, {
        method: 'POST',
        body: formData,
      });
      payload = (await response.json().catch(() => ({}))) as typeof payload;
      ok = response.ok;
    } else {
      const nativeFile = new File(file.uri);
      const result = await nativeFile.upload(signature.uploadUrl, {
        uploadType: UploadType.MULTIPART,
        fieldName: 'file',
        mimeType: file.type || 'application/octet-stream',
        parameters: {
          api_key: signature.apiKey,
          folder: signature.folder,
          timestamp: String(signature.timestamp),
          signature: signature.signature,
        },
      });
      payload = JSON.parse(result.body || '{}') as typeof payload;
      ok = result.status >= 200 && result.status < 300;
    }

    if (!ok || !payload?.secure_url) {
      throw new Error('Upload dokumen gagal. Periksa konfigurasi Cloudinary.');
    }

    uploaded.push({
      ...file,
      file: undefined, // strip the File object — not serialisable to JSON
      uri: payload.secure_url,
      name: file.name || payload.original_filename || 'dokumen',
      type:
        payload.resource_type && payload.format
          ? `${payload.resource_type}/${payload.format}`
          : file.type,
      size: payload.bytes ?? file.size,
      publicUrl: payload.secure_url,
      storagePath: payload.public_id || file.storagePath,
    });
  }

  return uploaded;
}
