import React from "react";
import "./StatsPage.css";
import { getUsers } from "../config/utils";
import { useState, useEffect } from "react";
import fireGif from "../Assets/Remove Background.gif";

function StatsPage() {
  const [leaderBoard, setLeaderBoard] = useState([]);
  const [dormStats, setDormStats] = useState({});
  const [ClassStats, setClassStats] = useState({});
  const [numberAlive, setNumberAlive] = useState(0);

  // fix firebase error: quota exceeded

  useEffect(() => {
    async function fetchData() {
      const { sortedUsers, classTags, dormTags, numAlive } = await getUsers();

      console.log(sortedUsers)

      setLeaderBoard(sortedUsers);
      setDormStats(dormTags);
      setClassStats(classTags);
      setNumberAlive(numAlive);

      console.log("fetching data");
    }

    fetchData();
  }, []);

  function toTitleCase(str) {
    return str.replace(/\w\S*/g, txt =>
      txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
    );
  }

  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date().getTime();
      const targetDate = new Date("November 11, 2025 11:20:00").getTime();
      const distance = targetDate - now;
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="StatsPage Page">
      {/* <img src={fireGif} className="fire"></img> */}
      <div className="columns">
        <div className="column-1">
          <h1>Leaderboard</h1>
          <ul className="leaderboard">
            {leaderBoard.slice(0, 20).map((entry, idx) => {
              return (
                <li className="leaderboard-person" key={entry.target}>
                  <div className="place-and-title">
                    <p className="place">{idx + 1}</p>
                    <div className="">
                      <h3
                        style={{
                          color: entry.alive
                            ? "var(--primary-color)"
                            : "var(--secondary-color",
                        }}
                      >
                        {entry.firstName} {entry.lastName} {entry.alive ? '' : ' (Dead)'}
                      </h3>
                      <p>
                        {toTitleCase(entry.class)}
                      </p>
                    </div>
                  </div>
                  <h2 className="num-tags">{entry.tags}</h2>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="column-2">
          <h1>Countdown</h1>
          <div className="timer">
            <h1 className="countdown">{countdown}</h1>
            <p className="numAlive">
              <span className="special-red">{numberAlive} </span>
            people left
            </p>
          </div>
          <div className="row-1">
            <h1>Dorms</h1>

            <div className="dorms">
              {Object.entries(dormStats)
                .filter(([dorm]) => dorm !== "day")
                .map(([dorm, { totalTags, topTagger }]) => (
                  <div key={dorm} className="dorm">
                    <h3>{toTitleCase(dorm)}</h3>
                    <p>Total Dorm Tags: {totalTags}</p>

                    {topTagger && (
                      <p className="lead-tagger-p">
                        <span className="top-tagger">{topTagger.name}</span> is
                        leading with {topTagger.tags} tag(s)
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>

          <div className="row-2">
            <h1>Classes</h1>
            <div className="class">
              {Object.entries(ClassStats).map(([class1, tags]) => (
                <div key={class1} className="dorm">
                  <h3
                    style={{
                      color: {
                        blue: "#4e79d1",
                        green: "#59a14f",
                        orange: "#e69f00",
                        pink: "#ff9da7",
                        purple: "#6e34eb",
                        red: "#eb3449",
                      }[class1],
                    }}
                  >
                    {toTitleCase(class1)}
                  </h3>
                  <p>Total Class Tags: {tags}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="Stats-Card"></div>
    </div>
  );
}

export default StatsPage;
