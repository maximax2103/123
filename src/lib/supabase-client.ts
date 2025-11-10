import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../utils/supabase/info";

// Создаем единственный экземпляр клиента
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);
