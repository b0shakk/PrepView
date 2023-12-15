import React, { useState, useEffect, useRef } from "react";
import CircularButton from "../components/CircularButton/CircularButton";
import RecButton from "../components/RecButton/RecButton";
import { report } from "../components/RecButton/RecButton";
import { questionFeedback } from "components/ScoreCard/ScoreCard";
import ScoreCard from "../components/ScoreCard/ScoreCard";
import { jsPDF } from "jspdf";

import "./QuestionScreen.css";

function QuestionScreen(props) {
  const [timerstart, timerreset] = useState([1]);

  const reset = () => {
    window.location.reload();
    timerreset(timerstart + 1);
  };

  const addLastFeedback = () => {
    let finalReport = report + "\n\nFeedback: ";
    for (let i = 0, counter = 1; i < questionFeedback.length; i++, counter++) {
      if (
        (counter % 70 >= 60 && questionFeedback[i] == " ") ||
        questionFeedback[i] == "\n"
      ) {
        finalReport = finalReport + "\n";
        counter = 0;
      } else finalReport = finalReport + questionFeedback[i];
    }
    return finalReport;
  };

  const addPagination = () => {
    let finalReport = addLastFeedback();
    const doc = new jsPDF();
    let newLineCounter = 0,
      currPageNumber = 2;
    let currPageText = "";
    for (let i = 0; i < finalReport.length; i++) {
      if (finalReport[i] == "\n") newLineCounter++;
      if (newLineCounter == 40) {
        doc.text(currPageText, 10, 20);
        doc.addPage();
        doc.setPage(currPageNumber);
        currPageNumber++;
        currPageText = "";
        newLineCounter = 0;
      } else currPageText = currPageText + finalReport[i];
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
      <div>
        <br></br>
        <p className="feedbackTitle">Feedback</p>
      </div>
      {<ScoreCard />}
    </div>
  );
}

export default QuestionScreen;
