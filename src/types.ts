export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  province: string;
  gender: string;
  bio?: string;
  avatar?: string;
}

export interface FriendRequest {
  id: number;
  sender_id: number;
  name: string;
  province: string;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
}

export const PROVINCES = [
  "Cabo Delgado",
  "Gaza",
  "Inhambane",
  "Manica",
  "Maputo (Cidade)",
  "Maputo (Província)",
  "Nampula",
  "Niassa",
  "Sofala",
  "Tete",
  "Zambézia"
];
