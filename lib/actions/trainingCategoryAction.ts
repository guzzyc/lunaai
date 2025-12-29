"use server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function applyTrainingFilters(
  filterIds: string[],
  newsId: number
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const categoryValue = filterIds.join(",");

  // find existing training record
  const existing = await prisma.news_training.findFirst({
    where: {
      news_id: newsId,
      user_id: userId,
    },
  });

  if (existing) {
    return prisma.news_training.update({
      where: { id: existing.id },
      data: {
        category: categoryValue,
        time_stamp: new Date(),
      },
    });
  }
}
