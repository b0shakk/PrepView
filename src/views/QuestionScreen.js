import React, { useState, useEffect, useRef } from "react";
import CircularButton from "../components/CircularButton/CircularButton";
import RecButton from "../components/RecButton/RecButton";
import { report } from "../components/RecButton/RecButton";
import ScoreCard from "../components/ScoreCard/ScoreCard";
import { jsPDF } from "jspdf";

import "./QuestionScreen.css";

function QuestionScreen(props) {
  const [timerstart, timerreset] = useState([1]);

  const reset = () => {
    window.location.reload();
    timerreset(timerstart + 1);
  };

  const addPagination = () => {
    const doc = new jsPDF();
    let newLineCounter = 0,
      currPageNumber = 2;
    let currPageText = "";
    for (let i = 0; i < report.length; i++) {
      if (report[i] == "\n") newLineCounter++;
      if (newLineCounter == 40) {
        doc.text(currPageText, 10, 20);
        doc.addPage();
        doc.setPage(currPageNumber);
        currPageNumber++;
        currPageText = "";
        newLineCounter = 0;
      } else currPageText = currPageText + report[i];
    }
    doc.text(currPageText, 10, 20);
    doc.save("report.pdf");
  };
  const endInterview = async () => {
    addPagination();
    timerreset(timerstart + 1);
  };

  useEffect(() => {}, []);
  useEffect(() => {}, [timerstart]);

  return (
    <div className="question-screen">
      <RecButton className="rec-button-1">Record</RecButton>
      <CircularButton className="circular-button-1" onClick={() => reset()}>
        Reset
      </CircularButton>
      <CircularButton
        className="circular-button-3"
        onClick={() => endInterview()}
      >
        End
      </CircularButton>
      {/* <a href="http://foolbecool.me/feedbackreport.github.io/"> */}
      {/* </a> */}

      <div>
        <br></br>
        <p className="feedbackTitle">Feedback</p>
      </div>
      {<ScoreCard />}
    </div>
  );
}

export default QuestionScreen;
