import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { definition as Definition } from "@/app/generated/prisma/client";
import { getNextActiveSource } from "./user";

export type SearchNewsParams = {
  sourceId?: number;
  fromDate?: Date;
  toDate?: Date;
  // industryId?: number;
  // categoryId?: number;
  // companyId?: number;
  page?: number;
};

export async function getArticles(
  trainingType: "classifying" | "cleaning" = "cleaning",
  cursor?: number,
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const userTarget = await prisma.definition.findFirst({
    where: {
      name: { startsWith: `target:training-${trainingType};user:${userId}` },
    },
  });

  const sourceIdStr = userTarget?.name
    ?.split(";")
    .find((part) => part.startsWith("sourceid:"))
    ?.split(":")[1];

  const sourceId = sourceIdStr ? Number(sourceIdStr) : null;

  // if (!sourceId) return [];

  const trainingRows = await prisma.news_training.findMany({
    take: 50,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
    where: {
      user_id: userId,
      news_id: { not: null },
      news: {
        is: {
          // news_source_id: sourceId,
          invalid: 0,
        },
      },
      ...(trainingType === "classifying" ? { category: { not: null } } : {}),
    },
    orderBy: {
      id: "desc",
    },
    include: {
      news: {
        include: {
          news_source: true,
          company_news: {
            include: { company: true },
          },

          news_training: {
            where: { user_id: userId },
            select: {
              news_id: true,
              category: true,
              user_id: true,
              like: true,
              feedback: true,
              id: true,
            },
          },
        },
      },
    },
  });

  console.log("rowwwwww", trainingRows.length);

  const seen = new Set<number>();
  const news = trainingRows
    .map((row) => row.news)
    .filter((n): n is NonNullable<typeof n> => n !== null)
    .filter((n) => {
      if (seen.has(n.id)) return false;
      seen.add(n.id);
      return true;
    });

  return news;
}

export async function getFilters() {
  const categories = await prisma.definition.findMany({
    where: { name: "Category" },
  });
  const industries = await prisma.definition.findMany({
    where: { name: "Industry" },
  });
  const countries = await prisma.definition.findMany({
    where: { name: "Country" },
  });

  return {
    categories,
    industries,
    countries,
  };
}

export async function getOrigins() {
  const origins = await prisma.definition.findMany({
    where: { name: "Origin" },
  });

  return {
    origins,
  };
}

export async function getStatuses() {
  const statuses = await prisma.definition.findMany({
    where: { name: "Status" },
  });

  return {
    statuses,
  };
}

export async function getTags() {
  const tags = await prisma.definition.findMany({
    where: { name: "Tag" },
  });

  return {
    tags,
  };
}

export async function getWidth(
  trainingType: "classifying" | "cleaning" = "cleaning",
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const leftName = `width:training-${trainingType}-left;user:${userId}`;
  const rightName = `width:training-${trainingType}-right;user:${userId}`;

  const [leftDef, rightDef] = await Promise.all([
    prisma.definition.findFirst({ where: { name: leftName } }),
    prisma.definition.findFirst({ where: { name: rightName } }),
  ]);

  return {
    leftWidth: leftDef as Definition,
    rightWidth: rightDef as Definition,
  };
}

export async function getFeedbacks(newsId: number) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const userId = session.user.id;

  const rows = await prisma.news_training.findMany({
    where: {
      news_id: newsId,
      // user_id: userId,
      feedback: { not: null },
    },
    orderBy: { time_stamp: "asc" },
    select: { feedback: true, time_stamp: true, user_id: true },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  return rows.map((r) => ({
    user: user?.name ?? "Unknown User",
    date: r.time_stamp,
    content: r.feedback as string,
  }));
  
}

export async function getNextCenterNews() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const userId = session.user.id;

  // const userWeeklyTargets = await getWeeklyTargetProgressForSource("cleaning")
  // const isTargetReached = userWeeklyTargets.completedTargets >= userWeeklyTargets.totalTargets

  // if(isTargetReached){
  //   return null
  // }

  // const userTarget = await prisma.definition.findFirst({
  //   where: {
  //     name: { startsWith: `target:training-cleaning;user:${userId}` },
  //   },
  // });

  const activeSource = await getNextActiveSource("cleaning");
  const sourceId = activeSource?.sourceId;
  if (!sourceId) return null;

  // const sourceIdStr = userTarget?.name
  //   ?.split(";")
  //   .find((part) => part.startsWith("sourceid:"))
  //   ?.split(":")[1];

  // const sourceId = sourceIdStr ? Number(sourceIdStr) : null;

  // if (!sourceId) {
  //   return null;
  // }

  // Get min & max id for this source
  const result = await prisma.news.aggregate({
    _min: { id: true },
    _max: { id: true },
    where: {
      news_source_id: sourceId,
      invalid: 0,
    },
  });

  const minId = result._min.id;
  const maxId = result._max.id;

  if (!minId || !maxId) return null;

  // generate random id
  const randomId = Math.floor(Math.random() * (maxId - minId + 1)) + minId;

  // const nextCleaningNews = await prisma.news.findFirst({
  //   where: {
  //     NOT: {
  //       news_training: {
  //         some: { user_id: userId },
  //       },
  //     },
  //     news_source_id: sourceId,
  //   },
  //   orderBy: { id: "asc" },
  //   include: {
  //     company_news: { include: { company: true } },
  //     news_source: true,
  //   },
  // });

  const randomNews = await prisma.news.findFirst({
    where: {
      id: { gte: randomId },
      news_source_id: sourceId,
      invalid: 0,
      NOT: {
        news_training: {
          some: { user_id: userId },
        },
      },
    },
    orderBy: { id: "asc" },
    include: {
      company_news: { include: { company: true } },
      news_source: true,
    },
  });

  if (!randomNews) {
    return null;
  }

  //fill the bad news log
  await prisma.news_bad_log.create({
    data: {
      user_id: userId,
      news_id: randomNews.id,
      show_date: new Date(),
    },
  });

  return randomNews;
}

export async function getNextClassifyingNews() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const userId = session.user.id;

  // const userWeeklyTargets = await getWeeklyTargetProgress("classifying")
  // const isTargetReached = userWeeklyTargets.completedTargets >= userWeeklyTargets.totalTargets

  // if(isTargetReached){
  //   return null
  // }

  // const userTarget = await prisma.definition.findFirst({
  //   where: {
  //     name: { startsWith: `target:training-classifying;user:${userId}` },
  //   },
  // });

  const activeSource = await getNextActiveSource("classifying");
  const sourceId = activeSource?.sourceId;
  if (!sourceId) return null;

  // const sourceIdStr = userTarget?.name
  //   ?.split(";")
  //   .find((part) => part.startsWith("sourceid:"))
  //   ?.split(":")[1];

  // const sourceId = sourceIdStr ? Number(sourceIdStr) : null;

  // if (!sourceId) {
  //   return null;
  // }

  const nextClassifyingNews = await prisma.news_training.findFirst({
    where: {
      like: {
        equals: 3,
      },
      category: null,
      user_id: userId,
      news: {
        is: {
          news_source_id: sourceId,
          invalid: 0,
          for_classifying: {
            equals: 1,
          },
        },
      },
    },
    include: { news: true },
  });

  if (!nextClassifyingNews) {
    return null;
  }

  const nextNews = await prisma.news.findFirst({
    where: {
      id: nextClassifyingNews?.news_id as number,
    },
    orderBy: { id: "asc" },
    include: {
      company_news: { include: { company: true } },
      news_source: true,
      news_training: {
        where: {
          id: nextClassifyingNews?.id,
          user_id: userId,
        },
      },
    },
  });

  return nextNews;
}

export async function searchNews(params: SearchNewsParams = {}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const pageSize = 10;
  const page = params.page ?? 1;
  const skip = (page - 1) * pageSize;

  // -----------------------------
  // news-level filters
  // -----------------------------
  const newsWhere: any = {
    invalid: 0,

    ...(params.sourceId && {
      news_source_id: params.sourceId,
    }),

    ...(params.fromDate || params.toDate
      ? {
          published_date: {
            ...(params.fromDate && { gte: params.fromDate }),
            ...(params.toDate && { lte: params.toDate }),
          },
        }
      : {}),

    // ...(params.industryId && {
    //   industry_id: params.industryId,
    // }),

    // ...(params.companyId && {
    //   company_news: {
    //     some: {
    //       company_id: params.companyId,
    //     },
    //   },
    // }),
  };

  // -----------------------------
  // training-level filters
  // -----------------------------
  // const trainingWhere: any = {
  //   user_id: userId,
  //   news_id: { not: null },

  //   ...(trainingType === "classifying"
  //     ? { category: { not: null } }
  //     : {}),

  //   ...(params.categoryId && {
  //     category: params.categoryId,
  //   }),
  // };

  const rows = await prisma.news_training.findMany({
    where: {
      // ...trainingWhere,
      news: {
        is: newsWhere,
      },
    },
    orderBy: { id: "desc" },
    take: pageSize,
    skip,
    include: {
      news: {
        include: {
          news_source: true,
          company_news: {
            include: { company: true },
          },
          news_training: {
            where: { user_id: userId },
            select: {
              id: true,
              category: true,
              like: true,
              feedback: true,
            },
          },
        },
      },
    },
  });

  // -----------------------------
  // de-duplicate news
  // -----------------------------
  const seen = new Set<number>();
  const data = rows
    .map((r) => r.news)
    .filter((n): n is NonNullable<typeof n> => n !== null)
    .filter((n) => {
      if (seen.has(n.id)) return false;
      seen.add(n.id);
      return true;
    });

  return {
    page,
    pageSize,
    count: data.length,
    data,
  };
}
