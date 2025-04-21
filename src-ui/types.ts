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

export type FFMPEGFilter = {
  name: string;
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
