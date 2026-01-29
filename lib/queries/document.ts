import { prisma } from "@/lib/prisma";

export async function getCompanyDocuments(companyId: number) {
  const links = await prisma.company_document.findMany({
    where: { comp_id: companyId },
  });

  if (links.length === 0) return [];

  const documents = await prisma.document.findMany({
    where: {
      id: {
        in: links.map((l) => l.doc_id),
      },
    },
  });

  return documents.map((doc) => ({
    id: doc.id,
    name: doc.name,
  }));
}
