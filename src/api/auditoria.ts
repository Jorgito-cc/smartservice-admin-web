import { api } from "./axios";
import type { AuditoriaLog } from "../types/auditoriaLogType";

export const getAuditoriaLogs = async (): Promise<AuditoriaLog[]> => {
  const res = await api.get("/auditoria");
  return res.data;
};
