import type { IAPIService } from "../types";
import UnsupportedService from "./unsupported.service";
import TauriService, { TAURI } from "./tauri.service";

let APIService: IAPIService = UnsupportedService;
if (TAURI) APIService = TauriService;

APIService.displayServiceInformation();

export default APIService;
