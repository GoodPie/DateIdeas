// Import the functions you need from the SDKs you need
import {initializeApp} from "firebase/app";

import {getFirestore, collection, where, query, orderBy,  getDocs, limit } from "firebase/firestore";
import MicroModal from 'micromodal';

import "./app.css";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBMv8sHbDCR-7d8QmFu825noTPxSQZ-2uI",
    authDomain: "date-night-picker.firebaseapp.com",
    projectId: "date-night-picker",
    storageBucket: "date-night-picker.appspot.com",
    messagingSenderId: "548851229771",
    appId: "1:548851229771:web:0e55076b9013138c7f19ce",
    measurementId: "G-QQ39YGG8NE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore();

const dateIdeasRef = collection(firestore, "date-ideas");

let lastIndex = null; // Use the last index to prevent duplicates one after the other
const fetchedResults = {
    1: [],
    2: [],
    3: [],
}

/**
 * Gets a list of items
 * @param {number} budget Budget ID (1 - 3, 1 being the lowest)
 * @returns {Promise<void>}
 */
const getRandomBudget = async (budget) => {

    if (fetchedResults[budget].length > 0) {
        // We have cached results
        getRandomResultFromCache(budget);
        return;
    }

    // Only really want to query once to reduce the read count
    // As the list is relatively small, reading all entries once isn't that expensive
    // and as there's no nice way to fetch a random index, this is the way that makes most sense to me
    const q = query(dateIdeasRef, where("budget", "==", budget));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        fetchedResults[budget].push(doc.data()['idea']);
    });

    getRandomResultFromCache(budget);

}

/**
 * Fetches and displays the random date idea, depending on budget, from the cached firebase results
 * @param {number} budget Index to fetch the cached results
 */
const getRandomResultFromCache = (budget) => {

    let randomIndex = Math.floor(Math.random() * fetchedResults[budget].length);
    while(randomIndex === lastIndex && fetchedResults[budget].length > 1) {
        randomIndex = Math.floor(Math.random() * fetchedResults[budget].length);
        console.log(randomIndex);
    }

    lastIndex = randomIndex;
    const chosenIdea = fetchedResults[budget][randomIndex];

    document.getElementById("data-idea-content").innerHTML = chosenIdea;
    MicroModal.show('date-idea-modal', {
        onClose: function(_this, elm, e) {
            e.preventDefault();
            e.stopPropagation();
        }

    });
}

document.addEventListener("DOMContentLoaded", async function (event) {

    MicroModal.init({
        openTrigger: 'data-custom-open', // [3]
        closeTrigger: 'data-custom-close', // [4]
        openClass: 'is-open', // [5]
        disableScroll: true, // [6]
        disableFocus: false, // [7]
        awaitOpenAnimation: true, // [8]
        awaitCloseAnimation: true, // [9]
        debugMode: false // [10]
    });

    const buttons = document.getElementsByClassName("date-night-button");
    for (let i = 0; i < buttons.length; i++) {
        buttons.item(i).addEventListener("click", () => {
            const budgetId = buttons.item(i).dataset.budgetId;
            getRandomBudget(parseInt(budgetId));
        });
    }
}
);


// Service worker initialization
const CACHE_NAME = 'date-picker-cache';
const urlsToCache = [
    '/',
    '/app.js',
];

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}

self.addEventListener('install', function(event) {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});
