// bryan sukidi

import { replaceProfanities } from 'no-profanity';

import { db } from "./firebase";
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  collection,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getPerformance, trace } from "firebase/performance";

const perf = getPerformance();

// Fetch a user's document from the database by email (for chasers and targets)
export const fetchUserDocByEmail = async (email) => {
  try {
    const userRef = doc(db, "data", email);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    return { userRef, userDoc, userData };
  } catch (error) {
    console.log(error);
  }
};

// add test user based off params (will remove)
export const addTestUser = async (
  firstName,
  lastName,
  email,
  year,
  livingStatus,
  chaser,
  target
) => {
  try {
    const userData = {
      firstName: firstName,
      lastName: lastName,
      class: year,
      "d/b": livingStatus,
      chaser: chaser,
      target: target,
      alive: true,
      tags: 0,
    };

    const userRef = doc(db, "data", email);
    await setDoc(userRef, userData);
  } catch (error) {
    alert(error.message);
  }
};

const submitLastWords = async (email, fullName, lw) => {
  try {
    // create a new document in the "lastWords" collection
    const cleanedLW = replaceProfanities(lw);
    const lastWordsRef = doc(collection(db, "lastWords"), email);
    await setDoc(lastWordsRef, {
      Author: fullName,
      Lw: cleanedLW,
      TimeStamp: serverTimestamp(),
    });
  } catch (error) {
    alert(error.message);
    console.log(error);
  }
};

// Tag the current authenticated user out
export const tagOut = async (email) => {
  try {
    // Get the current user
    // format the email the same way it is in the db
    const formattedEmail = email.replace(/^([^@]+)/, (m) =>
      m
        .split("_")
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join("_")
    );
    const user = await fetchUserDocByEmail(formattedEmail);
    const userData = user.userData;

    // If the user is already out, either get last names or return
    if (userData.alive === false) {
      if (userData.lastWords == "") {
        let lastWords = prompt("Please type in your last words");
        if (lastWords === null || lastWords === undefined || lastWords === "") {
          alert("Please type your last words and try again.");
          return;
        }

        //reupdate user data with last words
        const fullName = userData.firstName + " " + userData.lastName;
        await submitLastWords(email, fullName, lastWords);
        userData.lastWords = replaceProfanities(lastWords);
        await setDoc(user.userRef, userData);
        alert("Your last words have been entered.");
        return true;
      } else {
        alert("You are already out!");
        return false;
      }
    }

    // Get the user's chaser
    const chaser = await fetchUserDocByEmail(formatEmail(userData.chaser));
    const chaserData = chaser.userData;

    const target = await fetchUserDocByEmail(formatEmail(userData.target));
    const targetData = target.userData;

    // Update necessary fields
    userData.alive = false;
    chaserData.tags += 1;
    chaserData.target = formatEmail(userData.target);
    targetData.chaser = formatEmail(userData.chaser);

    // Post changes to database
    const answer = window.confirm("Are you sure you want to tag out?");

    if (answer) {
      await setDoc(user.userRef, userData);
      await setDoc(chaser.userRef, chaserData);
      await setDoc(target.userRef, targetData)
      // Get the user's last words
      let lastWords = prompt("Please type in your last words");
      if (lastWords === null || lastWords === undefined || lastWords === "") {
        alert("Please type your last words and try again.");
      }

      //reupdate user data with last words
      const fullName = userData.firstName + " " + userData.lastName;
      await submitLastWords(email, fullName, lastWords);
      userData.lastWords = replaceProfanities(lastWords);
      await setDoc(user.userRef, userData);
      return true;
    } else {
      alert("Cancelled.");
      return false;
    }
  } catch (error) {
    alert(error.message);
    console.log(error);
    return false;
  }
};

export const getLastWords = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "lastWords"));

    const allLastWords = [];
    querySnapshot.forEach((doc) => {
      allLastWords.push(doc.data());
    });

    allLastWords.sort((a, b) => b.TimeStamp.seconds - a.TimeStamp.seconds);

    return allLastWords;
  } catch (error) {
    console.log(error);
  }
};

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export const getUsers = async () => {
  const dbTrace = trace(perf, "database_fetch_users");
  dbTrace.start();
  try {
    const querySnapshot = await getDocs(collection(db, "data"));
    let allUsers = [];
    querySnapshot.forEach((doc) => {
      allUsers.push(doc.data());
    });

    allUsers = shuffle(allUsers);

    const aliveUsers = allUsers.filter((user) => user.alive);
    const sortedUsers = aliveUsers
      .slice()
      .sort((a, b) => {
        if (b.tags !== a.tags) {
          return b.tags - a.tags;
        } else {
          return b.alive - a.alive;
        }
      })
      .slice(0, 20);

    const classTags = allUsers.reduce((acc, user) => {
      const class1 = user.class;
      const tags = user.tags;
      acc[class1] = (acc[class1] || 0) + tags;
      console.log(acc);
      return acc;
    }, {});

    // const dormTags = allUsers.reduce((acc, user) => {
    //   const dorm = user.dorm;
    //   const tags = user.tags;
    //   acc[dorm] = (acc[dorm] || 0) + tags;
    //   return acc;
    // }, {});

    let dormTags = allUsers.reduce((acc, user) => {
      const dorm = user.dorm;
      const tags = user.tags;
      const name = user.firstName + " " + user.lastName;
      if (!acc[dorm]) {
        acc[dorm] = { totalTags: 0, topTagger: null };
      }
      acc[dorm].totalTags += tags;
      if (!acc[dorm].topTagger || acc[dorm].topTagger.tags < tags) {
        acc[dorm].topTagger = { name, tags };
      }
      return acc;
    }, {});

    dormTags = Object.entries(dormTags).map(
      ([dorm, { totalTags, topTagger }]) => ({ dorm, totalTags, topTagger })
    );
    dormTags.sort((a, b) => b.totalTags - a.totalTags);
    dormTags = dormTags.reduce((acc, { dorm, totalTags, topTagger }) => {
      acc[dorm] = { totalTags, topTagger };
      return acc;
    }, {});

    const numAlive = aliveUsers.length;
    dbTrace.stop();
    return { allUsers, sortedUsers, classTags, dormTags, numAlive };
  } catch (error) {
    dbTrace.stop();
    console.log(error);
  }
};

function formatEmail(email) {
  return email.replace(/^([^@]+)/, (m) =>
    m
      .split("_")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("_")
  );
}
