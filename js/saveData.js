import { openDB } from "./lib/idb.js";
import { DBName, schema, detailsStore, playsStore } from "./storageInterface.js";

// no longer needed
async function ensurePermissions() {
    // check if we have permissions, else request them
    chrome.permissions.contains({
        permissions: ["downloads"]
    },
    (result) => {
        if (result) {
            return true
        } else {
            // request permissions
            chrome.permissions.request({
                permissions: ["downloads"],
            },
            (granted) => {
                if (granted) {
                    return true
                } else {
                    return false
                }
            });
        }
    })
}

export async function saveData() {
    var db = await openDB(DBName, 1, schema);
    // save tracks
    let tracksObjectStore = db.transaction(detailsStore).store;

    // save as an object with {asin: other Track values, ...}
    let tracks = {};
    for await (const cursor of tracksObjectStore.iterate()) {
        // each value is a Track object
        let {asin, ...trackWithoutAsin} = cursor.value;
        tracks[cursor.value.asin] = trackWithoutAsin;
    }

    let tracksFile = new Blob([JSON.stringify(tracks)], {type: "application/json"});
    let tracksFileUrl = URL.createObjectURL(tracksFile);

    let tempATag = document.createElement("a");
    tempATag.setAttribute("download", "tracks");
    tempATag.setAttribute("href", tracksFileUrl);
    tempATag.click();

    // save plays
    let playsObjectStore = db.transaction(playsStore).store;

    let plays = [];
    for await (const cursor of playsObjectStore.iterate()) {
        // each value is {"t": time, "asin": asin}
        plays.push(cursor.value);
    }

    let playsFile = new Blob([JSON.stringify(plays)], {type: "application/json"});
    let playsFileUrl = URL.createObjectURL(playsFile);

    tempATag = document.createElement("a");
    tempATag.setAttribute("download", "plays");
    tempATag.setAttribute("href", playsFileUrl);
    tempATag.click();
}
