import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { DefinitionItem, TargetItem, User } from "../types/user-types";

export async function getCategories(): Promise<DefinitionItem[]> {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  const data = await prisma.definition.findMany({
    where: { name: "Category" },
  });

  const categories = data.map((category) => ({
    id: category.id,
    name: category.value,
  }));

  return categories as DefinitionItem[];
}

export async function getIndustries(): Promise<DefinitionItem[]> {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  const data = await prisma.definition.findMany({
    where: { name: "Industry" },
  });

  const industries = data.map((industry) => ({
    id: industry.id,
    name: industry.value,
  }));

  return industries as DefinitionItem[];
}

export async function getTags(): Promise<DefinitionItem[]> {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  const data = await prisma.definition.findMany({
    where: { name: "Tag" },
  });

  const tags = data.map((tag) => ({
    id: tag.id,
    name: tag.value,
  }));

  return tags as DefinitionItem[];
}

export async function getTaskTypes(): Promise<DefinitionItem[]> {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  const data = await prisma.definition.findMany({
    where: { name: "TaskType" },
  });

  const taskTypes = data.map((type) => ({
    id: type.id,
    name: type.value,
  }));

  return taskTypes as DefinitionItem[];
}

export async function getTargets(): Promise<TargetItem[]> {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  const data = await prisma.definition.findMany({
    where: {
      name: {
        startsWith: "target:",
      },
    },
  });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  const userMap = new Map(users.map((u) => [String(u.id), u.name]));

  const targets = await Promise.all(data.map(async (def) => {
    const name = def.name ?? "";
    const [targetPart = "", userPart = "", sourcePart = ""] = name.split(";");

    const trainingType = targetPart.replace("target:training-", "");
    const userId = userPart.replace("user:", "");
    const sourceId = sourcePart.replace("sourceid:","")

    let source;
    if(sourceId){
      source = await prisma.news_source.findUnique({where:{id:parseInt(sourceId)}})
    }

    return {
      id: def.id,
      user: userMap.get(userId) ?? "Unknown",
      userId: Number(userId),
      trainingType,
      value: def.value,
      sourceId:source && source.id.toString() as string,
      sourceName:source && source.name as string,
    } as TargetItem;
  }));

  return targets;
}


export async function geteNewsSources() {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  const news_sources = await prisma.news_source.findMany({
  });

  return news_sources
}
