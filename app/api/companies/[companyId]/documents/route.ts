import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBlobReadUrl } from "@/lib/azure/getBlobReadUrl";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> },
) {
  const resolvedParams = await params;
  const companyIdStr = resolvedParams.companyId;
  console.log("idddddd", companyIdStr);
  const companyId = Number(companyIdStr);

  if (Number.isNaN(companyId)) {
    return NextResponse.json({ error: "Invalid company id" }, { status: 400 });
  }

  const links = await prisma.company_document.findMany({
    where: {
      comp_id: companyId,
    },
  });

  if (links.length === 0) {
    return NextResponse.json([]);
  }

  const documents = await prisma.document.findMany({
    where: {
      id: {
        in: links.map((l) => l.doc_id),
      },
    },
  });

  const files = await Promise.all(
    documents.map(async (document) => {
      if (!document) return null;

      return {
        id: document.id,
        name: document.name,
        url: await getBlobReadUrl(document.id),
        createdAt: document.date_created,
      };
    }),
  );

  return NextResponse.json(files.filter(Boolean));
}
