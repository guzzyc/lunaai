import { BlobSASPermissions } from "@azure/storage-blob";
import { containerClient } from "./azureBlob";

export async function getBlobReadUrl(documentId: number) {
  const blobClient = containerClient.getBlockBlobClient(
    documentId.toString()
  );

  return blobClient.generateSasUrl({
    permissions: BlobSASPermissions.parse("r"),
    expiresOn: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  });
}
