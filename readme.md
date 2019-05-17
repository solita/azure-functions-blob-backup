# Azure Function for Blob snapshots

A fairly simple node.js Azure Function for snapshotting all files/blobs periodically in given containers within a Storage Account

## How it works

Using the `@azure/storage-blob` npm package, the script contacts the given Storage Account and iterates through all files in containers configured in Azure Function's `Application Settings`. This is a crontab style timed process (see `function.json`).

This function does not delete old snapshots, that needs to be configured in the Storage Account's `Lifecycle Management`.

Also, it's recommended to enable `Soft Delete` for the Storage Account to achieve full backup-like functionality.

## Configuration

The Azure Function needs to have three `Application Settings` set up:

1. `account`: The Storage Account name
2. `accountKey`: one of the access keys for the Storage Account
3. `containers`: A comma separated list of containers

For a `TimerTrigger` to work, you provide a schedule in the form of a cron expression in `function.json`. Azure Functions use **6 part** cron expressions, so for example once per hour is `0 0 * * * *`.

See this for reference: https://codehollow.com/2017/02/azure-functions-time-trigger-cron-cheat-sheet/

## Deployment

I've used VSCode for this during development: https://code.visualstudio.com/tutorials/functions-extension/getting-started
Remember to run `npm install` before deploying.

## Example Lifecycle Management rule

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
