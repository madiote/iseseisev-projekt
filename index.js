/* jshint esversion:6 */

const rows = 8;
const columns = 10;
const blocks = [1, 2, 3, 4];
const colours = ["#FF9AA2", "#FFB7B2", "#FFDAC1", "#E2F0CB", "#B5EAD7", "#C7CEEA"];

let currentScore;
let bestScore;

function appendBottomRow() {

}

function death() {
    if (currentScore > bestScore) {
        bestScore = currentScore;
    }
}

function restart() {
    currentScore = 0;
    location.reload();
}


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