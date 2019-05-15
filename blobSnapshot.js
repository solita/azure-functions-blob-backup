const {
    Aborter,
    BlobURL,
    ContainerURL,
    ServiceURL,
    StorageURL,
    SharedKeyCredential,
  } = require("@azure/storage-blob");

  const argv = require('yargs').argv;



/**
 * Snapshot all blobs in a given container
 */
async function main() {
  
  // Get account credentials from prod ENV / or DEV local.settings.json
  const account = argv.account || process.env.AZ_STORAGE_ACCOUNT;
  const accountKey = argv.key || process.env.AZ_STORAGE_ACCOUNT_KEY;

  // Use SharedKeyCredential with storage account and account key
  const sharedKeyCredential = new SharedKeyCredential(account, accountKey);

  // Use sharedKeyCredential to create a pipeline
  const pipeline = StorageURL.newPipeline(sharedKeyCredential);

  // Get service and container URLs
  const serviceURL = new ServiceURL(
    `https://${account}.blob.core.windows.net`,
    pipeline
  );
  
  // Split and trim the comma separated container list to an array
  const containers = (argv.containers || process.env.AZ_STORAGE_CONTAINERS).split(",").map(item => item.trim());

  // Go through the list of containers
  for (const container of containers) {
    
    console.log(`Starting to snapshot all files/blobs in a container named '${container}'`);
    const sourceURL = ContainerURL.fromServiceURL(serviceURL, container);

    // Loop through all blobs (files) in the given container, marker style as MicroSoft recommends
    let marker = undefined;
    let blobCount = 0;
    do {
      const listBlobsResponse = await sourceURL.listBlobFlatSegment(
        Aborter.none,
        marker,
      );
  
      marker = listBlobsResponse.nextMarker;
  
      for (const blob of listBlobsResponse.segment.blobItems) {
        const sourceBlobURL = BlobURL.fromContainerURL(sourceURL, blob.name);

        // Do the actual snapshot or fail trying
        try {
          const snapshot = await sourceBlobURL.createSnapshot(Aborter.none);
          console.log(`${blob.name}: ${snapshot.snapshot}`);
          blobCount++;
        } catch (error) {
          console.log(error);
        }
      }
    } while (marker);
    console.log(`Did snapshots for ${blobCount} files/blobs in a container '${container}'`)
  }
};

main().then(() => {
  console.log('Done.');
}).catch(err => {
  console.log(err.message);
});