import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { modeRandomTie, shuffle } from './utils';
import questions from './assets/data/questions.json';
import backgroundVideo from './assets/videos/background1.mp4';

import './index.scss';

const App = () => {

  const [questionIndex, setQuestionIndex] = useState(null);
  const [responses, setResponses] = useState([]);
  const [attract, setAttract] = useState(true);
  const [persona, setPersona] = useState();
  const questionTimer = useRef();

  const timeoutRef = useRef();
  const TIMEOUT_DELAY = 20000;
  const TIMEOUT_DURATION = 5000; // use this only if we want an "are you still there?" screen

  const start = () => {
    setQuestionIndex(0);
    setResponses([]);
    setPersona();
    questions.forEach(question => {
      question.options = shuffle(question.options);
    });
  }

  const addResponse = (e) => {
    const startedAt = questionTimer.current ?? performance.now();
    const delay = Math.max(0, Math.round(performance.now() - startedAt));
    questionTimer.current = null;
    const answerId = e.target.getAttribute('data-id')
    const answerPersona = e.target.getAttribute('data-persona');
    const order = parseInt(e.target.getAttribute('data-order'));
    const index = e.target.getAttribute('data-index')

    setResponses(prev => {
      const next = [...prev];
      next[index] = { persona: answerPersona, order, delay };
      return next;
    });

    setQuestionIndex(questionIndex + 1);
  }

  const idleTimeout = () => {
    setAttract(true);
  }

  const resetIdleTimeout = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(idleTimeout, TIMEOUT_DELAY);
  }

  useEffect(() => {
    questionTimer.current = performance.now();

    if (responses.length === questions.length) {
      axios.post('http://localhost:8000/persona', { responses }).then(res => {
        console.log(res.data)
        setPersona(res.data);
      })
    }
  }, [responses.length])

  useEffect(() => {
    addEventListener('click', resetIdleTimeout);
    return (() => {
      removeEventListener('click', resetIdleTimeout);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    })
  })

  return (
    <div className='app'>
      <div className={`background ${questionIndex !== null && questionIndex >= 0 ? 'hidden' : ''}`}>
        <video src={backgroundVideo} muted loop autoPlay playsInline />
      </div>
      <div className="questions">
        {questions.map((question, i) => (
          <div
            key={question.id}
            className={`questions-question ${i === questionIndex ? 'active' : ''}`}
          >
            <h1 className="questions-question-text">{question.text}</h1>
            <div className="questions-question-options">
              {question.options.map((option, order) => (
                <button
                  key={option.id}
                  data-index={i}
                  data-id={option.id}
                  data-persona={option.persona}
                  data-order={order + 1}
                  style={{ transitionDelay: `${(order + 1) / 2}s` }}
                  className="questions-question-options-option"
                  onClick={addResponse}
                >{option.image
                  ? (<img src={option.image} />)
                  : (<p>{option.text}</p>)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={`results ${questionIndex >= questions.length ? '' : 'hidden'}`}>
        <h1 className="results-title">Congratulations...</h1>
        <div className="results-subtitle">
          <p>{`You are the`}</p><p className="bold">{persona?.name}</p></div>
        <div className="results-poem">{
          persona?.poem?.map(line => (
            <p className="results-poem-line" dangerouslySetInnerHTML={{ __html: line }} />
          ))}
        </div>
        <button
          className="restart"
          onClick={start}
        >
          Restart
        </button>
      </div>
      <button
        className={`start ${questionIndex === null ? '' : 'hidden'}`}
        onClick={start}
      >
        Begin
      </button>
    </div>
  );
}


export default App;
