# Command line tool for Azure Blob backups

A fairly simple node.js command line tool for snapshotting all files/blobs periodically in given containers within a Storage Account.

## Usage

```
node blobSnapshot.js --account=storageaccount --key=XXX --containers=container1,container2
```

## How it works

Using the `@azure/storage-blob` npm package, the script contacts the given Storage Account and iterates through all files in containers set in ENV variable `containers`

This function does not delete old snapshots, that needs to be configured in the Storage Account's `Lifecycle Management`.

Also, it's recommended to enable `Soft Delete` for the Storage Account to achieve full backup-like functionality.

## Configuration

You can set up the configuration via ENV variables instead of command line arguments too:

1. `AZ_STORAGE_ACCOUNT`: The Storage Account name
2. `AZ_STORAGE_ACCOUNT_KEY`: one of the access keys for the Storage Account
3. `AZ_STORAGE_CONTAINERS`: A comma separated list of containers

## Example Lifecycle Management rule to remove old snapshots automatically

This goes into the storage account's Lifecycle Management.

Delete snapsots older than 14 days:
```javascript
{
    "rules": [
        {
            "enabled": true,
            "name": "snapshotRule",
            "type": "Lifecycle",
            "definition": {
                "actions": {
                    "snapshot": {
                        "delete": {
                            "daysAfterCreationGreaterThan": 14
                        }
                    }
                },
                "filters": {
                    "blobTypes": [
                        "blockBlob"
                    ]
                }
            }
        }
    ]
}
```