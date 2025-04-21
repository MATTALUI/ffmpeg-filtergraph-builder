import type { IAPIService } from "../types";
import UnsupportedService from "./unsupported.service";
import TauriService, { TAURI_INSTANCE } from "./tauri.service";

let APIService: IAPIService = UnsupportedService;
if (TAURI_INSTANCE) APIService = TauriService;

APIService.displayServiceInformation();

export default APIService;
