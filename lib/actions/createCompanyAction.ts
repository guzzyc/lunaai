"use server";

import { prisma } from "@/lib/prisma";
import {
  companySchema,
  CreateCompanyType,
} from "@/lib/validation/company.schema";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function createCompany(input: CreateCompanyType) {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const data = companySchema.parse(input);

  return prisma.company.create({
    data: {
      name: data.name,
      website: data.url || null,
      user_id: userId,
      status_id: Number(data.status),
      origin_id: Number(data.origin),

      tags: data.tags.join(","),

      company_note: {
        create: data.notes
          .filter((n) => n.trim().length > 0)
          .map((note) => ({
            note,
            user_id: userId,
          })),
      },

      company_news: {
        create: data.resourceUrls
          .filter((url) => url.trim().length > 0)
          .map((url) => ({
            news: {
              create: {
                url,
              },
            },
          })),
      },
    },
  });
}
