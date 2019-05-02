const {
    Aborter,
    BlobURL,
    ContainerURL,
    ServiceURL,
    StorageURL,
    SharedKeyCredential,
  } = require("@azure/storage-blob");

/**
 * Snapshot all blobs in a given container
 */
module.exports = async function (context) {
  
  // Get account credentials from prod ENV / or DEV local.settings.json
  const account = process.env.account;
  const accountKey = process.env.accountKey;

  // Use SharedKeyCredential with storage account and account key
  const sharedKeyCredential = new SharedKeyCredential(account, accountKey);

  // Use sharedKeyCredential to create a pipeline
  const pipeline = StorageURL.newPipeline(sharedKeyCredential);

  // Get service and container URLs
  const serviceURL = new ServiceURL(
    `https://${account}.blob.core.windows.net`,
    pipeline
  );
  
  const containers = process.env.containers.split(",");

  for (const container of containers) {
    console.log(container);
    const sourceURL = ContainerURL.fromServiceURL(serviceURL, container);

    // Loop through all blobs (files) in the given container, marker style as MicroSoft recommends
    let marker = undefined;
    do {
      const listBlobsResponse = await sourceURL.listBlobFlatSegment(
        Aborter.none,
        marker,
      );
  
      marker = listBlobsResponse.nextMarker;
  
      for (const blob of listBlobsResponse.segment.blobItems) {
        const sourceBlobURL = BlobURL.fromContainerURL(sourceURL, blob.name);
        try {
          const response = await sourceBlobURL.createSnapshot(Aborter.none);
          context.log(response);
        } catch (error) {
          context.log.error(error);
        }
      }
    } while (marker);
  }
};
