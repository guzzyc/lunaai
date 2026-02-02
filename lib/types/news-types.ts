import { user as User } from "@/app/generated/prisma/client";
import {
  getArticles,
  getNextCenterNews,
} from "../queries/article";
import { getCompanies, getCompanyNewses, getTasks } from "../queries/company";
import { geteNewsSources } from "../queries/definition";

export interface FilterGroup {
  name: string;
  options: string[];
}

export type CompanyNewsItem = {
  id: number | null;
  published_date: Date | null;
  author: string | null;
  url: string | null;
  header: string | null;
  portal: string | null;
};
export type NewsSearchItem = {
  source:NewsSourceType;
  date:Date;
  title:string
}

export type ArticlesArrayType = Awaited<ReturnType<typeof getArticles>>;
export type TrainedArticleType = ArticlesArrayType extends (infer T)[] ? T : never;
export type ArticleType = Awaited<ReturnType<typeof getNextCenterNews>>;
export type NewsesArrayType = Awaited<ReturnType<typeof getCompanyNewses>>;
// export type TrainingsArrayType = Awaited<ReturnType<typeof getTrainings>>;
export type CompanyArrayType = Awaited<ReturnType<typeof getCompanies>>;
export type CompanyType = CompanyArrayType extends (infer T)[] ? T : never;
export type TasksArrayType = Awaited<ReturnType<typeof getTasks>>;
export type SingleTaskType = TasksArrayType extends (infer T)[] ? T : never;
export type NewsSourcesArrayType = Awaited<ReturnType<typeof geteNewsSources>>;
export type NewsSourceType = NewsSourcesArrayType extends (infer T)[] ? T : never;
