/**
 * Types for Teams/Times management
 */

export interface Time {
  id: string;
  nome: string;
  users?: string[]; // Array of agent IDs
  createdAt?: string;
  updatedAt?: string;
}

