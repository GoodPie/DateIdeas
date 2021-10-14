// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, where, query, getDocs } from "firebase/firestore";
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
const analytics = getAnalytics();
const firestore = getFirestore();

const dateIdeasRef = collection(firestore, "date-ideas");

/**
 * Gets a list of items
 * @param {number} budget Budget ID (1 - 3, 1 being the lowest)
 * @returns {Promise<void>}
 */
const getRandomBudget = async (budget) => {
    const q = query(dateIdeasRef, where("budget", "==", budget));
    const querySnapshot = await getDocs(q);
    const itemCount = querySnapshot.size;
    const itemIndex = Math.floor(Math.random() * itemCount);

    let chosenItem = null;
    let count = 0;
    querySnapshot.forEach((doc) => {

        if (itemIndex === count) chosenItem = doc.data()['idea'];
        count += 1;
    });

    document.getElementById("data-idea-content").innerHTML = chosenItem;
    MicroModal.show('date-idea-modal');
}

document.addEventListener("DOMContentLoaded", async function(event) {

    MicroModal.init({
        onShow: modal => console.info(`${modal.id} is shown`), // [1]
        onClose: modal => console.info(`${modal.id} is hidden`), // [2]
        openTrigger: 'data-custom-open', // [3]
        closeTrigger: 'data-custom-close', // [4]
        openClass: 'is-open', // [5]
        disableScroll: true, // [6]
        disableFocus: false, // [7]
        awaitOpenAnimation: false, // [8]
        awaitCloseAnimation: false, // [9]
        debugMode: true // [10]
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