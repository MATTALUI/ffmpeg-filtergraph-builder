import { invoke } from '@tauri-apps/api/core';
import type {
  IAPIService,
  APIServiceSuccess,
  APIServiceFailure,
  APIServiceResponse,
  FFMPEGFilter,
} from "../types";

declare global {
  interface Window {
    __TAURI_INTERNALS__: unknown | undefined;
  }
}

export const TAURI_INSTANCE = !!window.__TAURI_INTERNALS__;
const SERVICE_NAME = "Tauri Service";

const buildServiceSuccess = <T>(data: T): APIServiceSuccess<T> => ({
  service: SERVICE_NAME,
  success: true,
  error: null,
  data,
});

const buildServiceError = (error: string): APIServiceFailure => ({
  service: SERVICE_NAME,
  success: false,
  error,
  data: null,
});

const getServiceName = () => SERVICE_NAME;

const displayServiceInformation = () => {
  console.log(`CURRENT SERVICE: ${SERVICE_NAME}`);
  return false;
};

const getAllFilters = async (): APIServiceResponse<FFMPEGFilter[]> => {
  try {
    const filterJSON = await invoke<string>("get_all_filters");
    return buildServiceSuccess(JSON.parse(filterJSON));
  } catch (e: any) {
    return buildServiceError(e.toString())
  }
}

const getFilePreview = async (filePath: string): APIServiceResponse<string> => {
  try {
    const base64 = await invoke<string>("get_file_preview", { filePath });
    const previewUrl = `data:image/png;base64,${base64}`;
    return buildServiceSuccess(previewUrl);
  } catch (e: any) {
    return buildServiceError(e.toString())
  }
}

let TauriService: IAPIService = {
  getServiceName,
  displayServiceInformation,
  getAllFilters,
  getFilePreview,
};

export default TauriService;

