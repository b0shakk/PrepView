import React from "react";
import "./RecButton.css";
import { CohereClient } from "cohere-ai";
import TranscribedTemplate from "../../views/globals";
import { questionFeedback } from "components/ScoreCard/ScoreCard";
const axios = require("axios");

const backend_path = "http://127.0.0.1:5000/transcribe";

export const cohere = new CohereClient({
  token: "jcDwCna5a0Lcq21ccTNNFe86J2LdYUx0AQQqJlBs",
});

export var Transcribed = new TranscribedTemplate(
  undefined,
  undefined,
  undefined
);

export var TOPIC = "";
export var CURR_Q = "";

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

Continue this conversation in the form of a transcript, do not include narrator comments, the candidate is Malcolm. Only generate conversion and ask one question at a time.
Eric: What job title are you applying for?
Malcolm:`;

export var report = "Question: What job title are you applying for?\n\n";

class RecButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: "not started",
      button_name: "Record",
      question: "What job title are you applying for?",
      button_text: "Ready to start your interview? Press record to begin!",
    };

    this.audioChunks = [];

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      this.handlerFunction(stream);
    });

    this.assembly = axios.create({
      baseURL: "https://api.assemblyai.com/v2",
      headers: {
        authorization: "9a5a49872617470188698664380c2cce",
        "content-type": "application/json",
        //"transfer-encoding": "chunked",
      },
    });
    this.handleClick = this.handleClick.bind(this);
  }

  audioChunks = [];

  handlerFunction(stream) {
    this.rec = new MediaRecorder(stream, { type: "video/webm" });
    this.rec.ondataavailable = (e) => {
      this.audioChunks.push(e.data);
      if (this.rec.state === "inactive") {
        let blob = new Blob(this.audioChunks, { type: this.rec.mimeType });
        let myUrl = URL.createObjectURL(blob);
        this.sendData(blob);
      }
    };
  }

  async getNextQ(prompt) {
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
    return response;
  }

  addToReport(text, type) {
    let temp = "";
    if (type == 1) temp = "Answer: ";
    else if (type == 0) temp = "Question: ";
    else if (type == 2) temp = "Feedback: ";
    for (let i = 0, counter = 1; i < text.length; i++, counter++) {
      if ((counter % 75 >= 65 && text[i] == " ") || text[i] == "\n") {
        temp = temp + "\n";
        counter = 0;
      } else temp = temp + text[i];
    }
    report = report + temp + "\n\n";
  }

  nextQuestion() {
    this.setState({
      question: "Fetching your question...",
      button_text: Transcribed.text,
    });
    console.log("Text: " + Transcribed.text);
    prompt = prompt + Transcribed.text;
    if (TOPIC == "") {
      TOPIC = Transcribed.text;
    }
    prompt = prompt + "\n";
    prompt = prompt + "Eric:";
    let question_p = this.getNextQ(prompt).then((resp) => {
      let question = resp.generations[0].text;
      // console.log("Original Question: ", question);
      const paragraphs = question.split("Malcolm:");
      if (paragraphs.length > 0) {
        question = paragraphs[0];
      } else {
        question = paragraphs;
      }
      prompt = prompt + question;
      if (question.slice(-1) !== "\n") {
        prompt = prompt + "\n";
      }
      console.log("Fetched question: ", question);
      prompt = prompt + "Malcolm:";

      if (questionFeedback.length > 0) {
        this.addToReport(questionFeedback, 2);
        this.addToReport(question, 0);
        this.addToReport(Transcribed.text, 1);
      } else {
        this.addToReport(Transcribed.text, 1);
      }

      CURR_Q = question;
      this.setState({
        question: question,
      });
    });
  }

  sendData(blob) {
    var reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    reader.onloadend = (event) => {
      var data = reader.result;
      var url_p = this.assembly.post("/upload", data).then((res) => {
        return res.data["upload_url"];
      });
      var pending_response = url_p
        .then((url) => {
          return this.assembly
            .post("/transcript", {
              audio_url: url,
              disfluencies: true,
            })
            .then((res) => {
              return res.data;
            });
        })
        .then(async (pending_response) => {
          var id = pending_response.id;
          let flag = true;
          while (flag) {
            var status = this.assembly
              .get(`/transcript/${id}`)
              .then((res) => res.data);
            const status_resp = await status;
            flag = status_resp.status !== "completed";
            if (!flag) {
              Transcribed.text = status_resp.text;
              Transcribed.words = status_resp.words;
              Transcribed.duration = status_resp.audio_duration;
            }
            if (status_resp.status === "error") {
              break;
            }
          }
          this.audioChunks = [];
          console.log("Starting to fetch questions...");
          this.nextQuestion();
          this.setState({
            button_name: "Record",
          });
        });
    };
  }

  handleClick() {
    if (this.state.status === "not started") {
      this.setState({
        status: "recording",
        button_name: "Stop",
      });
      this.rec.start();
    } else if (this.state.status === "recording") {
      this.setState({
        status: "not started",
        button_name: "Wait",
        button_text: "Hold Up!",
        question:
          "Good going! Please wait while our NLP model converts your speech to text",
      });
      this.rec.stop();
    } else if (this.state.status === "done") {
      this.setState({
        status: "not started",
      });
    }
  }

  render() {
    return (
      <>
        <div>
          <div>
            <h2 className="headline">Question: </h2>
          </div>
          <div>
            <h1 className="title">{this.state.question}</h1>
          </div>

          <div className="answer">
            <p>{this.state.button_text}</p>
          </div>
        </div>
        <div className={"rec-button"} onClick={this.handleClick}>
          <div> {this.state.button_name} </div>
        </div>
      </>
    );
  }
}

export default RecButton;
