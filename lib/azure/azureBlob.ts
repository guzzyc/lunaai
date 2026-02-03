import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;
const AZURE_STORAGE_CONTAINER_NAME =
  process.env.AZURE_STORAGE_CONTAINER_NAME;

if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw new Error(
    "Missing AZURE_STORAGE_CONNECTION_STRING in environment variables"
  );
}
if (!AZURE_STORAGE_CONTAINER_NAME) {
  throw new Error(
    "Missing AZURE_STORAGE_CONTAINER_NAME in environment variables"
  );
}

const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);

export const containerClient: ContainerClient =
  blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER_NAME);

// check container exists
(async () => {
  const exists = await containerClient.exists();
  if (!exists) {
    console.log(
      `Container "${AZURE_STORAGE_CONTAINER_NAME}" does not exist. Creating...`
    );
    await containerClient.create();
  }
})();
