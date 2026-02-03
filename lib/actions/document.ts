"use server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { containerClient } from "@/lib/azure/azureBlob";
import { BlobSASPermissions } from "@azure/storage-blob";
import { deleteBlob } from "../azure/deleteBlob";

// export async function uploadDocuments(
//   files: File[],
//   companyId: number
// ) {
//   const session = await getServerSession(authOptions);
//   if (!session) throw new Error("Unauthorized");

//   if (!files || files.length === 0) {
//     throw new Error("No files provided");
//   }

//   if (!companyId) {
//     throw new Error("Invalid company");
//   }

//   const userId = session.user.id;
//   const uploadedDocuments: { id: number; name: string | null }[] = [];

//   for (const file of files) {
//     // 1️⃣ Create document row (DB first)
//     const document = await prisma.document.create({
//       data: {
//         name: file.name,
//         user_id: userId,
//         date_created: new Date(),
//       },
//     });

//     try {
//       // 2️⃣ Upload file to Azure using my_row_id
//       const blobName = document.id.toString();
//       const buffer = Buffer.from(await file.arrayBuffer());

//       const blockBlobClient =
//         containerClient.getBlockBlobClient(blobName);

//       await blockBlobClient.uploadData(buffer, {
//         blobHTTPHeaders: {
//           blobContentType: file.type,
//         },
//       });

//       // 3️⃣ Link document to company
//       await prisma.company_document.create({
//         data: {
//           comp_id: companyId,
//           doc_id: document.id,

//         },
//       });

//       uploadedDocuments.push({
//         id: document.id,
//         name: document.name,
//       });
//     } catch (err) {
//       // 🔴 Cleanup if Azure upload fails
//       await prisma.document.delete({
//         where: { id: document.id },
//       });

//       throw new Error(`Failed to upload file: ${file.name}`);
//     }
//   }

//   return {
//     success: true,
//     documents: uploadedDocuments,
//   };
// }

// create empty document row 
export async function createDocumentPlaceholder(name: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const doc = await prisma.document.create({
    data: {
      name,
      user_id: session.user.id,
      date_created: new Date(),
    },
  });

  return doc.id;
}

export async function deleteDocumentPlaceholder(id: number) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  await prisma.document.delete({
    where:{
      id
    }
  });
}

// get sas upload url
export async function getDocumentUploadUrl(
  documentId: number,
  contentType: string
) {
  const blobClient =
    containerClient.getBlockBlobClient(documentId.toString());

  const permissions = BlobSASPermissions.parse("cw");

  return blobClient.generateSasUrl({
    permissions,
    startsOn: new Date(Date.now() - 5 * 60 * 1000),
    expiresOn: new Date(Date.now() + 10 * 60 * 1000),
    contentType,
  });
}

export async function linkDocumentToCompany(
  companyId: number,
  documentId: number
) {
  await prisma.company_document.create({
    data: {
      comp_id: companyId,
      doc_id: documentId,
    },
  });
}

export async function deleteDocument(documentId: number) {
  const id = Number(documentId);

  if (isNaN(id)) {
    throw new Error(`Invalid ID provided: ${documentId}`);
  }

  // remove company link
  await prisma.company_document.deleteMany({
    where: { doc_id: id },
  });

  // remove document row
  await prisma.document.delete({
    where: { id: id },
  });

  await deleteBlob(id);
}


