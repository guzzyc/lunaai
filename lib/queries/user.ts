import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { User } from "../types/user-types";
import { getWeekStart } from "../utils";

export interface WeeklyTargetProgress {
  completedTargets: number;
  totalTargets: number;
}

type GetUsersResult = {
  ok: boolean;
  error: "UNAUTHORIZED" | "FORBIDDEN" | null;
  users: User[];
};

export async function getUsers(): Promise<GetUsersResult> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return { ok: false, error: "UNAUTHORIZED", users: [] };
  }
  const userRole = session.user.role;

  if (userRole !== "admin") {
    return { ok: false, error: "FORBIDDEN", users: [] };
  }

  const data = await prisma.user.findMany({});

  const users = data.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }));

  return {
    ok: true,
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role as "admin" | "user",
    })),
    error: null,
  };
}

export async function getWeeklyTargetProgress(
  trainingType: "classifying" | "cleaning" = "cleaning"
): Promise<WeeklyTargetProgress> {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }
  const userId = session.user.id;
  const targetName = `target:training-${trainingType};user:${userId}`;

  const targetData = await prisma.definition.findFirst({
    where: {
      name: {
        startsWith:targetName
      },
    },
  });
  const totalWeeklyTargets =
    (targetData?.value && parseInt(targetData?.value)) || 0;
  const weekStart = getWeekStart();

  const completedCleaningTargets = await prisma.news_training.count({
    where: {
      user_id: userId,
      time_stamp: {
        gte: weekStart,
      },
      like: {
        not: null,
      },
    },
  });

  const completedClassifyingTargets = await prisma.news_training.count({
    where: {
      user_id: userId,
      time_stamp: {
        gte: weekStart,
      },
      category: {
        not: null,
      },
    },
  });

  return {
    completedTargets:
      trainingType === "cleaning"
        ? completedCleaningTargets
        : completedClassifyingTargets,
    totalTargets: totalWeeklyTargets,
  };
}
