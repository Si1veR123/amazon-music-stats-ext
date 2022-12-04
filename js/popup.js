import { mostPlayedTrack, mostPlayedByIndex } from "./analytics.js";
import { saveData } from "./saveData.js";
import { DBName } from "./storageInterface.js";

var mainFilterState = {
    "time": 1,
    "type": 0
}

var timeFilterCycle = {"This day": 24*3600, "This week": 24*3600*7, "This month": 24*3600*7*31, "This year": 24*3600*365, "All time": Date.now()};
var typeFilterCycle = ["song", "album", "artist"];

async function updateMostPlayedSong(timeAgoSeconds) {
    // update the stats text for the most played song in the past 'timeAgoSeconds'
    let playedData = await mostPlayedTrack(timeAgoSeconds);

    if (!playedData) {return}

    let track = playedData[0];
    let amount = playedData[1];
    // TODO: handle playedData == null
    
    let el = document.getElementById("stats-info-container");
    el.innerHTML = "<p><b>" + track.name + "</b> - " + track.artist + "</p><p>Played " + amount + " times</p>";
}

async function updateMostPlayedByIndex(timeAgoSeconds, index) {
    // update the stats text for the most played of any type (album, artist etc.) in the past 'timeAgoSeconds'
    let playedData = await mostPlayedByIndex(timeAgoSeconds, index);

    if (!playedData) {return}

    let typeValue = playedData[0];
    let amount = playedData[1];

    let el = document.getElementById("stats-info-container");

    var extra = "";
    if (index == "album") {
       extra = "Songs " 
    }
    el.innerHTML = "<p><b>" + typeValue + "</b></p><p>" + extra + "Played " + amount + " times</p>";
}

function changeMainFilterState(type) {
    // increment or wrap around the index for the mainFilterState
    if (type == "time") {
        let times = Object.keys(timeFilterCycle);
        mainFilterState.time = (mainFilterState.time+1)%times.length;
    } else {
        mainFilterState.type = (mainFilterState.type+1)%typeFilterCycle.length;
    }
}

function changeMainFilterDisplay() {
    // update the text that shows the current filter
    let timeText = document.getElementById("stats-time");
    timeText.innerText = Object.keys(timeFilterCycle)[mainFilterState.time];

    let typeText = document.getElementById("stats-type");
    typeText.innerText = typeFilterCycle[mainFilterState.type];
}

async function displayCurrentFilter() {
    // use mainFilterState to update results to DOM
    let timeSeconds = Object.values(timeFilterCycle)[mainFilterState.time];
    if (mainFilterState.type == 0) {
        // song
        updateMostPlayedSong(timeSeconds);
    } else {
        updateMostPlayedByIndex(timeSeconds, typeFilterCycle[mainFilterState.type]);
    }

    changeMainFilterDisplay();
}

function timeFilterClicked() {
    changeMainFilterState("time");
    displayCurrentFilter();
}

function typeFilterClicked() {
    changeMainFilterState("type");
    displayCurrentFilter();
}

function destroyData() {
    if (confirm("This will delete all activity data. Are you sure you want to proceed?")) {
        indexedDB.deleteDatabase(DBName);
    }
}

displayCurrentFilter();
document.getElementById("stats-time").parentElement.addEventListener("click", timeFilterClicked);
document.getElementById("stats-type").parentElement.addEventListener("click", typeFilterClicked);

document.getElementById("download-button").addEventListener("click", saveData);
document.getElementById("delete-button").addEventListener("click", destroyData);
