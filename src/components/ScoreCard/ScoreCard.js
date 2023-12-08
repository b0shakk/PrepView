import React from "react";
import { scoreText } from "../../Scoring";
import "./ScoreCard.css";
import { TOPIC, CURR_Q } from "../RecButton/RecButton";

var rendered_q = "";
var scores = [(0, "None"), (0, "None"), (0, "None"), (0, "None")];

class ScoreCard extends React.Component {
  componentDidMount() {
    this.interval = setInterval(
      () => this.setState({ time: Date.now() }),
      5000
    );
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }

  addFeedback(feedback) {
    let temp = "Feedback: ";
    for (let i = 0, counter = 1; i < feedback.length; i++, counter++) {
      if ((counter % 75 >= 65 && feedback[i] == " ") || feedback[i] == "\n") {
        temp = temp + "\n";
        counter = 0;
      } else temp = temp + feedback[i];
    }
    report = report + temp + "\n\n";
  }

  render() {
    if (CURR_Q != rendered_q) {
      var scores_p = scoreText(TOPIC, rendered_q);
      rendered_q = CURR_Q;
    } else {
      var feedback = "";
      if (scores[0] === "None") {
        feedback = "Please wait for your feedback";
      } else {
        feedback = feedback + scores[0] + " ";
        feedback = feedback + scores[1] + " ";
        feedback = feedback + scores[2] + " ";
        feedback = feedback + scores[3] + " ";
        // this.addFeedback(feedback);
      }
      return (
        <div>
          <h4 className="feedbacktext feedback">{feedback}</h4>
        </div>
      );
    }

    scores_p.then((scores_new) => {
      scores = scores_new;
      var feedback = "";
      if (scores[0] === "None") {
        feedback = "Please wait for your feedback";
      } else {
        feedback = feedback + scores[0] + " ";
        feedback = feedback + scores[1] + " ";
        feedback = feedback + scores[2] + " ";
        feedback = feedback + scores[3] + " ";
        this.addFeedback(feedback);
      }
      return (
        <div>
          <h4 className="feedbacktext feedback">{feedback}</h4>
        </div>
      );
    });
    return (
      <div>
        <h4 className="feedbacktext feedback">Please wait for your feedback</h4>
      </div>
    );
  }
}

export default ScoreCard;
