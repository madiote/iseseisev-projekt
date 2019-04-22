/* jshint esversion:6 */

function forceHttps() {
    // Ensures that the Greeny page is loaded over HTTPS - https://stackoverflow.com/a/4597085
    if (window.location.href.indexOf("greeny.cs.tlu.ee") != -1) {
        if (location.protocol == 'http:') {
            location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
        }
    }
}

window.onload = function () {
    forceHttps();
};

window.addEventListener("online", function () {
    console.log("Sa oled netis!");
});

window.addEventListener("offline", function () {
    console.log("Nett on otsas!");
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', {
        scope: '/'
    }).then(function (sw) {
        console.log("SW olemas!");
    }).catch(function () {
        console.log("SW ebaõnnestus!");
    });
}