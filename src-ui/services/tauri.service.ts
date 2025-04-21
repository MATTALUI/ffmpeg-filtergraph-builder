import type {
  IAPIService,
  APIServiceSuccess,
  APIServiceFailure,
  APIServiceResponse,
  FFMPEGFilter,
} from "../types";
// We'll need to investigate whether or not there's a library with this type
// predefined somewhere, but for now we'll just stub out the parts that we use.
interface ITauri {
  event: {
    // eslint-disable-next-line  @typescript-eslint/ban-types
    listen: (event: string, fn: Function) => void;
  },
  tauri: {
    invoke: <T = void, D = any>(eventName: string, data?: D) => Promise<T>;
  },
}

declare global {
  interface Window {
    __TAURI_INTERNALS__: ITauri | undefined;
  }
}

export const TAURI = window.__TAURI_INTERNALS__ || null;
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
  return buildServiceSuccess(
    new Array(20).fill(null).map((_, i) => ({ name: i.toString() }))
  );
}

let TauriService: IAPIService = {
  getServiceName,
  displayServiceInformation,
  getAllFilters,
};

export default TauriService;

