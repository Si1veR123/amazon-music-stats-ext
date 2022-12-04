import { interceptReq } from "./apiIntercepts.js";
  
chrome.webRequest.onBeforeRequest.addListener(
    interceptReq,
    {urls: ["https://eu.mesk.skill.music.a2z.com/api/*"]},
    ["requestBody"]
);
