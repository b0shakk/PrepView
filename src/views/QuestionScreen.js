import React, { useState, useEffect, useRef } from "react";
import MainButton from "../components/Button/Button";
import Timer from "../components/Timer/Timer";
import CircularButton from "../components/CircularButton/CircularButton";
import RecButton from "../components/RecButton/RecButton";
import ScoreCard from "../components/ScoreCard/ScoreCard";
import { Transcribed } from "../components/RecButton/RecButton";
import { CohereClient } from "cohere-ai";
import "./QuestionScreen.css";
var prompt = `Eric is an interviewer asking questions to a interview candidate. Eric usually asks questions that build upon the last response that the candidate gave, but can also change the topic and ask a more general question. Questions should be short max 40 words, well-phrased, and use key information from the candidates last response. 
Provide interview questions to the candidate.
Following are two examples, continue the third conversation.

Example 1, The candidate is Grant.
Eric: What job title are you applying for?
Grant: Software Engineer 
Eric: What are your thoughts on the role of testing in software engineering? 
Grant: I think a comprehensive testing suite is an important part of any project. In my past internship at Amazon I wrote a suite of automated tests for their home assistant devices.
Eric: What framework did you use to create automated tests? Was it difficult to le arn?
Grant: I used the Robot framework in Python. It wasn't too difficult to learn, since my mentor was able to guide me through it.
Eric: Great, can you tell me more about what you were writing the tests for?

Example2, The candidate is William.
Eric: What job title are you applying for?
William: Machine Learning Engineer 
Eric: What is overfitting? How can you prevent it? 
William: Overfitting is when your model finds spurious correlations in your training dataset that lead to poor generalization and poor accuracy in the testing dataset.
Eric: Name a time that you encountered overfitting and overcame it.
William: I recently had difficulty with overfitting when doing image classification. I was able to prevent it through strong regularization and data augmentation.
Eric: Why does data augmentation help with overfitting?
William: It can help the model rely on more general features which remain under some set of transformations, while spurious features are destroyed under certain transformations.
Eric: What is the difference between supervised and unsupervised learning?

Continue this conversation, the candidate is Malcolm. (do not provide a description of the situation and ask one or two questions at a time)
Eric: What job title are you applying for?
Malcolm:`;

export var TOPIC = "";
export var CURR_Q = "";

function QuestionScreen(props) {
  const { title } = props;
  const first_question = "What job title are you applying for?";
  const [question, setQuestion] = useState(first_question);
  const [questions, setQuestions] = useState([first_question]);
  const [timerstart, timerreset] = useState([1]);

  //   const cohere = require("cohere-ai");
  //   cohere.init("jcDwCna5a0Lcq21ccTNNFe86J2LdYUx0AQQqJlBs");

  const cohere = new CohereClient({
    token: "jcDwCna5a0Lcq21ccTNNFe86J2LdYUx0AQQqJlBs",
  });

  const initialText = "Waiting for input...";
  const [buttonText, setButtonText] = useState(initialText);

  // function handleClick() {
  //   setButtonText(Transcribed.text);

  //   setTimeout(() => {
  //     setButtonText(initialText);
  //   }, 5000); // 👈️ change text back after 1 second
  // }

  async function getNextQ(prompt) {
    // const response_p = await cohere.generate('large', {
    //     prompt: prompt,
    //     max_tokens: 120,
    //     temperature: 0.6,
    //     p: 0.5,
    //     stop_sequences: ['Malcolm:']
    // })
    console.log("Fetching question...");
    const response = await cohere.generate({
      model: "command",
      prompt,
      max_tokens: 300,
      temperature: 0.9,
      stop_sequences: ["Malcolm: "],
      //   end_sequences: ["Malcolm: "],
      return_likelihoods: "NONE",
    });
    console.log(response);
    // if(response) {
    console.log("Fetched question");
    // }else{
    // console.log("Fetched question");
    // }
    // console.log(`Preiction: ${response.generations[0].text}`);

    return response;
  }

  const next_question = () => {
    setButtonText(Transcribed.text);
    //console.log(prompt, Transcribed)
    //console.log("okay")
    prompt = prompt + Transcribed.text;
    if (TOPIC == "") {
      TOPIC = Transcribed.text;
    }

    prompt = prompt + "\n";
    prompt = prompt + "Eric:";
    let question_p = getNextQ(prompt).then((resp) => {
      let question = resp.generations[0].text;
      console.log("Original Question: ", question);
      const paragraphs = question.split("Malcolm: ");
      if (paragraphs.length > 0) {
        question = paragraphs[0];
      } else {
        question = paragraphs;
      }
      //console.log(resp)
      //console.log("okay2")
      prompt = prompt + question;
      if (question.slice(-1) !== "\n") {
        prompt = prompt + "\n";
      }

      console.log("Hmm: ", question);
      prompt = prompt + "Malcolm:";
      //console.log(prompt)
      //console.log("okay3")
      CURR_Q = question;
      setQuestion(question);
    });
  };

  const reset = () => {
    timerreset(timerstart + 1);
  };

  const both = () => {
    reset();
    next_question();
  };

  useEffect(() => {}, []);

  useEffect(() => {}, [timerstart]);

  return (
    <div className="question-screen">
      <div>
        <h1 className="headline">Question: </h1>
      </div>
      <div>
        <h1 className="title">{question}</h1>
      </div>

      <div className="answer">
        <p>{buttonText}</p>
      </div>

      {/* <Timer initialSeconds={60} index={timerstart} /> */}
      <MainButton className="title-1" onClick={() => next_question()}>
        Next Question
      </MainButton>
      <CircularButton className="circular-button-1" onClick={() => reset()}>
        Reset
      </CircularButton>
      <RecButton className="rec-button-1">Record</RecButton>
      <a href="http://foolbecool.me/feedbackreport.github.io/">
        <CircularButton className="circular-button-3" onClick={() => reset()}>
          End
        </CircularButton>
      </a>

      {/* <ProgressBar bgcolsr="red" scoreName="idk" completed={65}/> */}
      <div>
        <br></br>
        <p className="feedbackTitle">Feedback</p>
      </div>
      {<ScoreCard />}
      {/* <CircularButton className="circular-button-3" onClick={() => next_question()}>End</CircularButton> */}
    </div>
  );
}

export default QuestionScreen;
