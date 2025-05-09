export type Node = {
  id: string;
  name: string;
  x: number;
  y: number;
  inputs: Array<string | null>;
  outputs: Array<string | null>;
};

export type MouseDownValues = {
  mouseX: number;
  mouseY: number;
  originalX: number;
  originalY: number;
};

export type FFMPEGFilterInputOutput = {
  name: string;
  stream_type: "video" | "audio";
};

export type FFMPEGFilter = {
  name: string;
  timeline_support: boolean;
  slice_threading: boolean;
  command_support: boolean;
  description: string;
  inputs: FFMPEGFilterInputOutput[];
  outputs: FFMPEGFilterInputOutput[];
};

export type APIServiceBase = {
  service: string;
}

export type APIServiceSuccess<T> = APIServiceBase & {
  success: true;
  error: null;
  data: T;
}
export type APIServiceFailure = APIServiceBase & {
  success: false;
  error: string;
  data: null;
}

export type APIServiceMeta<T> = APIServiceSuccess<T> | APIServiceFailure;

export type APIServiceResponse<T> = Promise<APIServiceMeta<T>>;
export interface IAPIService {
  /**
   * Returns the name of the service
   * */
  getServiceName: () => string;
  /**
   * A utility function that will display a brief description of a service
   * mostly used for debugging which services are being applied in which
   * environments
   * */
  displayServiceInformation: () => boolean;
  /**
   * 
   */
  getAllFilters: () => APIServiceResponse<FFMPEGFilter[]>
};
