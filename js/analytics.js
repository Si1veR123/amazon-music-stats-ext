import { openDB } from "./lib/idb.js";
import {DBName, schema, playsStore, asinToTrack} from "./storageInterface.js";

async function allPlaysSince(minTime) {
    var db = await openDB(DBName, 1, schema);
    var plays = db.transaction(playsStore).store;

    var allPlays = [];

    for await (const cursor of plays.iterate()) {
        if (cursor.value.time > minTime) {
            allPlays.push(cursor.value)
        }
    }

    return allPlays
}

function countFrequency(elements, getValue) {
    // getValue is a function that takes an element from 'elements' and returns the value to count
    var count = {}

    for (let e of elements) {
        let currentCount = count[getValue(e)];
        if (currentCount === undefined) {
            count[getValue(e)] = 1;
        } else {
            count[getValue(e)] = currentCount+1;
        }
    }
    return count
}

export async function mostPlayedTrack(timeAgoSeconds) {
    let minTime = Date.now()/1000 - timeAgoSeconds;
    let allPlays = await allPlaysSince(minTime);
    if (allPlays.length == 0) {
        return null
    }

    var playCount = countFrequency(allPlays, (e) => e.asin);

    let maxPlays = Math.max(...Object.values(playCount));
    return [await asinToTrack(Object.keys(playCount).sort((a, b) => playCount[b] - playCount[a])[0]), maxPlays]
}

export async function mostPlayedByIndex(timeAgoSeconds, index) {
    // index doesn't actually have to be an index on the DB, just any value on a Track

    let minTime = Date.now()/1000 - timeAgoSeconds;
    let allPlays = await allPlaysSince(minTime);

    if (allPlays.length == 0) {
        return null
    }

    let allTracks = []

    let db = await openDB(DBName, 1, schema);
    for (let play of allPlays) {
        allTracks.push(await asinToTrack(play.asin, db))
    }

    let playCount = countFrequency(allTracks, (e) => e[index])
    let maxPlays = Math.max(...Object.values(playCount));
    return [Object.keys(playCount).sort((a, b) => playCount[b] - playCount[a])[0], maxPlays]
} 
