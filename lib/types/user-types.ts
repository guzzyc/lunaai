import { NewsSourceType } from "./news-types";

export type UserRole = 'admin' | 'user' | '';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface DefinitionItem {
  id?: number;
  name: string;
}

export interface TargetItem {
  id?: number;
  user?: string;
  userId?: number;
  trainingType:string;
  sourceId:string;
  sourceName:string;
  value:string
}

export type TabType = 'Users' | 'Category' | 'Industry' | 'TaskType' | 'Tag' | 'Target' | 'Country';