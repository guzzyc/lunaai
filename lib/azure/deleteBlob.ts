import { containerClient } from "./azureBlob";

export async function deleteBlob(documentId: number) {
  const blobClient = containerClient.getBlockBlobClient(
    documentId.toString()
  );

  const response = await blobClient.deleteIfExists();

  if (response.succeeded) {
    console.log(`Blob ${documentId} deleted successfully.`);
  } else {
    console.log(`Blob ${documentId} did not exist or could not be deleted.`);
  }

  return response.succeeded;
}