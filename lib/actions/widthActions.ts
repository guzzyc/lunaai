"use server";

import { authOptions } from "@/lib/auth";
// import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function saveSidebarWidths(data: {
  leftWidth: number;
  rightWidth: number;
  trainingType: "cleaning" | "classifying";
}) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const leftName = `width:training-${data.trainingType}-left;user:${userId}`;
    const rightName = `width:training-${data.trainingType}-right;user:${userId}`;

    console.log("request width left",leftName,data.leftWidth)
    console.log("request width right",rightName,data.rightWidth)

    const updatedvalue = await prisma.$transaction(
      async (tx) => {
        // left sidebar
        const existingLeft = await tx.definition.findFirst({
          where: { name: leftName },
        });

        if (existingLeft) {
          await tx.definition.update({
            where: { id: existingLeft.id },
            data: { value: data.leftWidth.toString() },
          });
        } else {
          // create new if not existing
          await tx.definition.create({
            data: {
              name: leftName,
              value: data.leftWidth.toString(),
              create_time: new Date(),
            },
          });
        }

        // right sidebar
        const existingRight = await tx.definition.findFirst({
          where: { name: rightName },
        });

        if (existingRight) {
          await tx.definition.update({
            where: { id: existingRight.id },
            data: { value: data.rightWidth.toString() },
          });
        } else {
          await tx.definition.create({
            data: {
              name: rightName,
              value: data.rightWidth.toString(),
            },
          });
        }

        return { existingLeft, existingRight };
      },
      {
        maxWait: 10000,
        timeout: 20000,
      }
    );
    console.log("config saved successfully", updatedvalue);
  } catch (error) {
    console.log("error saving config", error);
    throw new Error("error saving config")
  }
}
