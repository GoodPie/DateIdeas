// Import the functions you need from the SDKs you need
import {initializeApp} from "firebase/app";

import {collection, getDocs, addDoc, doc, getFirestore, query, where} from "firebase/firestore";
import { GoogleAuthProvider, getAuth, signInWithPopup,onAuthStateChanged } from "firebase/auth";
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
const provider = new GoogleAuthProvider();
const firestore = getFirestore();


onAuthStateChanged(getAuth(), (user) => {
    if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        // ...
    } else {
        // User is signed out
        // ...
    }
});

const dateIdeasRef = collection(firestore, "date-ideas");

let cacheInvalidated = false;
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

    if (fetchedResults[budget].length > 0 && !cacheInvalidated) {
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

    cacheInvalidated = false;
    getRandomResultFromCache(budget);

}

/**
 * Fetches and displays the random date idea, depending on budget, from the cached firebase results
 * @param {number} budget Index to fetch the cached results
 */
const getRandomResultFromCache = (budget) => {

    // Ensure that we don't immediately repeat an idea
    let randomIndex = Math.floor(Math.random() * fetchedResults[budget].length);
    while(randomIndex === lastIndex && fetchedResults[budget].length > 1) {
        randomIndex = Math.floor(Math.random() * fetchedResults[budget].length);
        console.log(randomIndex);
    }

    lastIndex = randomIndex;
    document.getElementById("data-idea-content").innerHTML = fetchedResults[budget][randomIndex];
    MicroModal.show('date-idea-modal', {
        onClose: function(_this, elm, e) {
            e.preventDefault();
            e.stopPropagation();
        }

    });
}

/**
 * Logs the user in with Google
 */
const loginWithGoogle = (callback) => {
    const auth = getAuth();
    signInWithPopup(auth, provider)
        .then((result) => {

            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;

            // The signed-in user info.
            const user = result.user;
            if (user !== null) callback();

        }).catch((error) => {
            console.error(error);
        });
}

/**
 * Checks if the user is signed in already
 * @returns {boolean}
 */
const isUserSignedIn = () => {
    const auth = getAuth();
    return auth.currentUser !== null;
}

const showAddDateIdea = () => {
    MicroModal.show('date-idea-add-modal', {
        onClose: function(_this, elm, e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

        }
    });
}

/**
 * Initialize the document
 */
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

    document.getElementById("fab").addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isUserSignedIn()) {
            loginWithGoogle(showAddDateIdea);
        } else {
            showAddDateIdea();
        }

    });

    document.getElementById("add-date-idea").addEventListener("click",  async () => {
        if (!isUserSignedIn()) return;

        const idea = document.getElementById("idea").value;
        const budget = document.getElementById("budget").value;

        await addDoc(collection(firestore, "date-ideas"), {
            idea: idea,
            budget: parseInt(budget)
        });

        document.getElementById("idea").value = "";
        cacheInvalidated = true;
        MicroModal.close("date-idea-add-modal")
    })
});


