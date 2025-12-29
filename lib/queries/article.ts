import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { definition as Definition } from "@/app/generated/prisma/client";

export async function getArticles(
  trainingType: "classifying" | "cleaning" = "cleaning"
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const trainedNewsIds = await prisma.news_training.findMany({
    select: { news_id: true },
    where: { news_id: { not: null } },
  });

  const ids = trainedNewsIds.map((n) => n.news_id!);

  const news = await prisma.news.findMany({
    take: 50,
    include: {
      news_source: true,
      company_news: {
        include: { company: true },
      },
      news_training: {
        where: {
          user_id: userId,
        },
        select: {
          news_id: true,
          category: true,
          user_id: true,
          like: true,
        },
      },
    },
    where: {
      id: { in: ids },
    },
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

  return {
    categories,
    industries,
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
  trainingType: "classifying" | "cleaning" = "cleaning"
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

export async function getTrainings() {
  const trainings = await prisma.training.findMany();

  return trainings;
}

export async function getFeedbacks(newsId: number) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const userId = session.user.id;

  const rows = await prisma.news_training.findMany({
    where: {
      news_id: newsId,
      user_id: userId,
      feedback: { not: null },
    },
    orderBy: { time_stamp: "asc" },
    select: { feedback: true },
  });

  return rows.map((r) => r.feedback as string);
}
