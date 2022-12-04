
function currentTrackDetails() {
    let shadowParent = document.querySelector("#transport > div > music-horizontal-item");
    let shadowRoot = chrome.dom.openOrClosedShadowRoot(shadowParent);
    let data = shadowRoot.querySelectorAll("music-link");

    return {
        "name": data[0].innerText,
        "artist": data[1].innerText,
        // TODO: not always album, sometimes is *artist* station, or other
        "album": data[2].innerText
    }
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request == "currenttrack") {
            sendResponse(
                currentTrackDetails()
            )
        }
    }
)
