"use server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { DefinitionItem, TabType, TargetItem } from "../types/user-types";

export async function addNewDefinition(data: {
  type: Omit<TabType, "Users" | "Target">;
  value: string;
}): Promise<DefinitionItem> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    if (session.user.role !== "admin") throw new Error("Forbidden");

    const newDefinition = await prisma.definition.create({
      data: {
        name: data.type.toString(),
        value: data.value,
        create_time: new Date(),
      },
    });

    return {
      id: newDefinition.id,
      name: newDefinition.value as string,
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to create definition");
  }
}

export async function editDefinition(data: {
  id: number;
  value: string;
}): Promise<DefinitionItem> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    if (session.user.role !== "admin") throw new Error("Forbidden");

    const existing = await prisma.definition.findUnique({
      where: { id: data.id },
    });
    if (!existing) throw new Error("Definition not found");

    const updatedDefinition = await prisma.definition.update({
      where: {
        id: data.id,
      },
      data: {
        value: data.value,
      },
    });

    return {
      id: updatedDefinition.id,
      name: updatedDefinition.value as string,
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to update definition");
  }
}

export async function deleteDefinition(data: {
  id: number;
}): Promise<DefinitionItem> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    if (session.user.role !== "admin") throw new Error("Forbidden");

    const existing = await prisma.definition.findUnique({
      where: { id: data.id },
    });
    if (!existing) throw new Error("Definition not found");

    const deletedDefinition = await prisma.definition.delete({
      where: {
        id: data.id,
      },
    });

    return {
      id: deletedDefinition.id,
      name: deletedDefinition.value as string,
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to delete definition");
  }
}

export async function addNewTarget(data: {
  trainingType: string;
  value: string;
  userId: number;
  sourceId:string;
}): Promise<TargetItem> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    if (session.user.role !== "admin") throw new Error("Forbidden");

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });
    if (!user) throw new Error("User not found");

    const targetName = `target:training-${data.trainingType};user:${data.userId};sourceid:${data.sourceId}`;

    const newTarget = await prisma.definition.create({
      data: {
        name: targetName,
        value: data.value,
        create_time: new Date(),
      },
    });

    const source = await prisma.news_source.findUnique({where:{id:parseInt(data?.sourceId)}})

    return {
      sourceId:source?.id.toString() as string,
      sourceName:source?.name as string,
      id: newTarget.id,
      trainingType: data.trainingType,
      value: newTarget.value as string,
      user: user.name,
      userId: data.userId,
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to create target");
  }
}

export async function editTarget(data: {
  trainingType: string;
  value: string;
  id: number;
  userId: number;
  sourceId:string;
}): Promise<TargetItem> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    if (session.user.role !== "admin") throw new Error("Forbidden");

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });
    if (!user) throw new Error("User not found");

    const targetName = `target:training-${data.trainingType};user:${data.userId};sourceid:${data.sourceId}`;

    const updatedTarget = await prisma.definition.update({
      where: {
        id: data.id,
      },
      data: {
        name: targetName,
        value: data.value,
      },
    });

    const source = await prisma.news_source.findUnique({where:{id:parseInt(data?.sourceId)}})

    return {
      id: updatedTarget.id,
      sourceId:source?.id.toString() as string,
      sourceName:source?.name as string,
      trainingType: data.trainingType,
      value: updatedTarget.value as string,
      user: user.name,
      userId: data.userId,
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to update target");
  }
}
