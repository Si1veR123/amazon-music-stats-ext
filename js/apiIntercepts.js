import { Track } from "./track.js";
import { newTrackDetails, newPlay, trackExistsCheck } from "./storageInterface.js";

function bin2String(array) {
    var result = "";
    for (var i = 0; i < array.length; i++) {
        result += String.fromCharCode(array[i]);
    }
    return result;
}

function parseRequestBody(requestDetails) {
    let rawRequest = new Uint8Array(requestDetails.requestBody.raw[0].bytes);
    let unparsedJson = bin2String(rawRequest);
    return JSON.parse(unparsedJson);
}

export function interceptReq(requestDetails) {
    if (requestDetails.url.endsWith("playbackStarted")) {
        // New song has started playing
        let json = parseRequestBody(requestDetails);
        let metrics = JSON.parse(json.metricsInfo);
        // Retrieve track's ASIN from request body
        let audioTrackAsin = metrics.audioTrackASIN;
        
        // If ASIN doesn't exist in track details database, add it.
        trackExistsCheck(audioTrackAsin).then((exists) => {
            if (!exists) {
                // send a message to the content script to scrape the track details.
                chrome.tabs.sendMessage(requestDetails.tabId, "currenttrack").then((response) => {
                    let track = new Track(audioTrackAsin, response.name, response.artist, [], response.album, null, metrics.trackDurationSeconds);
                    newTrackDetails(track);
                });
            }
        })
    }

    if (requestDetails.url.endsWith("playbackStopped") || requestDetails.url.endsWith("next") || requestDetails.url.endsWith("playbackFinished")) {
        // a track has stopped playing
        let json = parseRequestBody(requestDetails);
        let progress = JSON.parse(json.mediaState).progressInMilliSeconds;
        let audioTrackAsin = JSON.parse(json.metricsInfo).audioTrackASIN;

        // if progress is over 30 seconds, count as play
        // TODO: use scrubbing events to ensure 30 seconds has played. currently scrubbing to 30 seconds counts as a play.  
        if (progress >= 30000) {
            newPlay(audioTrackAsin);
        }
    }
}