import React from "react";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import { fetchUserDocByEmail, getLastWords, tagOut } from "../config/utils";
import { replaceProfanities } from 'no-profanity';
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import { signOut } from "firebase/auth";

function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [target, setTarget] = useState(null);
  const [allLastWords, setAllLastWords] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // console.log("HomePage:", authUser.email);
        const formattedEmail = authUser.email.replace(/^([^@]+)/, (m) =>
          m
            .split("_")
            .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
            .join("_")
        );

        if (authUser.email.endsWith("milton.edu")) {
          const { userData } = await fetchUserDocByEmail(formattedEmail);
          const targetData = await fetchUserDocByEmail(userData?.target);
          const lastWords = await getLastWords();

          const cleanedLastWords = lastWords.map(entry => ({
          ...entry,
          Lw: replaceProfanities(entry.Lw)
          }));

          setUser(userData);
          console.log(targetData);
          setTarget(targetData.userData);
          setAllLastWords(cleanedLastWords);

          console.log(lastWords);
        } else {
            navigate("/login")
        }
      } else {
          navigate("/login");
        }
    });
  }, [auth.currentUser]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log(error);
    }
  };

  const Profile = () => {
    return (
      <>
        <h1>Profile</h1>

        <div className="UserCard">
          <img className="photo" src={auth.currentUser?.photoURL} alt="" />
          <h2>
            {user?.firstName} {user?.lastName}
          </h2>
        </div>

        <div className="Cards">
          <div className="Card" onClick={() => tagOut(auth.currentUser.email)}>
            <h3 className="tagOut">Tag Out</h3>
          </div>

          <div className="Card">
            <h3>Tag Count</h3>
            <p className="number">{user?.tags}</p>
          </div>
        </div>

        <div className="Card">
          <h3>Target</h3>
          <p>
            {target?.firstName} {target?.lastName}
          </p>
        </div>

        <button className="log-out-button" onClick={handleSignOut}>
          Log Out
        </button>
      </>
    );
  };

  const LastWords = () => {
    return (
      <div className="last-words-section">
        <h1>Last Words</h1>
        <ul className="last-words">
          {allLastWords.map((entry) => {
            return (
              <li className="last-word-card" key={entry.Author}>
                <p className="message">{entry.Lw}</p>
                <p className="author">{entry.Author}</p>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div className="HomePage Page">
      <Profile />
      <LastWords />
      <div className="footer"></div>
    </div>
  );
}

export default HomePage;
