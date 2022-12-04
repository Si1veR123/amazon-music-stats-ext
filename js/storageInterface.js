// exports functions used to interact with storage for the extension
// indexed db is used

import { openDB } from "./lib/idb.js";

export const DBName = "amazon-music-tracker-db";
export const detailsStore = "details";
export const playsStore = "plays";

export const schema = {
    upgrade(db) {
        // details store
        // contains Track objects
        // currently has {asin, name, artist, features, album, genre, length}
        var details = db.createObjectStore(detailsStore, {
            keyPath: "asin"
        });

        var plays = db.createObjectStore(playsStore, {
            autoIncrement: true
        });
    }
}

export async function trackExistsCheck(asin) {
    var db = await openDB(DBName, 1, schema);
    // returns promise
    return db.getKey(detailsStore, asin);
}

export async function newTrackDetails(track) {
    var db = await openDB(DBName, 1, schema);
    try {
        await db.add(detailsStore, track);
    } catch (error) {
        // exists already
        if (error.name == "ConstraintError") {
            return
        }
        throw error
    }
}

export async function newPlay(asin) {
    let unixTime = Math.floor(Date.now() / 1000)

    let data = {
        "time": unixTime,
        "asin": asin
    }

    var db = await openDB(DBName, 1, schema);
    await db.add(playsStore, data);
}

export async function asinToTrack(asin, db) {
    if (db === undefined) {
        var db = await openDB(DBName, 1, schema);
    }
    let track = await db.get(detailsStore, asin);
    return track;
}
