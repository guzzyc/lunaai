"use server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function insertCleaningFeedback(
  likeValue: number,
  newsId: number
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const existingFeedback = await prisma.news_training.findFirst({
    where: {
      news_id: newsId,
      user_id: userId,
    },
  });

  if (existingFeedback) {
    await prisma.news_training.update({
      where: { id: existingFeedback.id },
      data: {
        like: likeValue,
        time_stamp: new Date(),
      },
    });
  } else {
    await prisma.news_training.create({
      data: {
        news_id: newsId,
        user_id: userId,
        like: likeValue,
        time_stamp: new Date(),
      },
    });
  }

  //delete from bad news list
  await prisma.news_bad_log.deleteMany({
    where:{
      news_id:newsId,
      user_id:userId
    }
  })
}

export async function saveFeedback(content: string, newsId: number) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const userId = session.user.id;

  const existing = await prisma.news_training.findFirst({
    where: {
      news_id: newsId,
      user_id: userId,
    },
    orderBy: { id: "desc" },
  });

  if (existing && existing.feedback === null) {
    return prisma.news_training.update({
      where: { id: existing.id },
      data: {
        feedback: content
      },
    });
  }

  return prisma.news_training.create({
    data: {
      news_id: newsId,
      user_id: userId,
      feedback: content,
      time_stamp: new Date(),
    },
  });
}
