import React, { useState, useEffect, useRef } from 'react';
import { getBestOption, shuffle } from './utils';
import questions from './assets/data/questions.json';
import personalities from './assets/data/personalities.json'
import backgroundVideo from './assets/videos/background1.mp4';
import logo from './assets/images/logo.svg';

import './index.scss';

const App = () => {
  const [questionIndex, setQuestionIndex] = useState(-1);
  const [responses, setResponses] = useState([]);
  const [personality, setPersonality] = useState({});

  const questionTimer = useRef();
  const questionsRef = useRef();

  const timeoutRef = useRef();
  const IDLE_DELAY = 60000;

  const start = () => {
    setQuestionIndex(0);
    setResponses([]);
    setPersonality({});
    questions.forEach((q) => {
      q.options = shuffle(q.options); // still shuffle their order
    });
  };

  const addResponse = (e) => {
    const startedAt = questionTimer.current ?? performance.now();
    const delay = Math.max(0, Math.round(performance.now() - startedAt));
    questionTimer.current = null;

    const answerId = e.target.getAttribute('data-id');
    const order = parseInt(e.target.getAttribute('data-order'));
    const index = parseInt(e.target.getAttribute('data-index'));

    setResponses((prev) => {
      const next = [...prev];
      next[index] = { id: answerId, order, delay };
      return next;
    });

    setQuestionIndex((prev) => prev + 1);
  };

  const idleTimeout = () => {
    setQuestionIndex(-1);
  };

  const resetIdleTimeout = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(idleTimeout, IDLE_DELAY);
  };

  useEffect(() => {
    questionTimer.current = performance.now();

    if (responses.length === questions.length) {
      const bestOption = getBestOption(responses);
      console.log({ bestOption })
      const matchedPersonality = personalities.find(p => p.id === bestOption.id)
      console.log({ matchedPersonality })
      setPersonality(matchedPersonality)
      // axios.post('http://localhost:8000/persona', { responses }).then(res => {
      //   setPersona(res.data);
      // });
    }
  }, [responses.length]);

  useEffect(() => {
    if (questionIndex >= 0) {
      // questionTypewriters.current[questionIndex]?.start();

      const questionEl = questionsRef.current?.children[questionIndex];
      questionEl?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [questionIndex]);

  useEffect(() => {
    addEventListener('click', resetIdleTimeout);
    return () => {
      removeEventListener('click', resetIdleTimeout);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="app">
      <div className={`background ${questionIndex >= 0 ? 'muted' : ''}`}>
        <video src={backgroundVideo} muted loop autoPlay playsInline />
      </div>

      <div className="questions" ref={questionsRef}>
        {questions.map((question, i) => (
          <div
            key={question.id}
            className={`questions-question ${i > questionIndex ? 'hidden' : ''} ${i === questionIndex ? '' : 'disabled'}`}
          >
            <h1 className="questions-question-text">
              {question.text}
            </h1>

            <div className="questions-question-options">
              {question.options.map((option, order) => (
                <button
                  key={`${question.id}-${option.id}`}
                  data-index={i}
                  data-id={option.id}
                  data-order={order + 1}
                  className={`questions-question-options-option ${responses[i]?.id === option.id ? 'selected' : ''}`}
                  onClick={addResponse}
                >
                  {option.text}
                </button>
              ))
              }
            </div>
          </div>
        ))}

        <div className={`questions-results results ${personality.name ? '' : 'hidden'}`}>
          <h1 className="questions-results-text">{`Congratulations! Based on your answers you've matched with the ${personality.name}!`}</h1>
          <h2 className="questions-results-text">{personality.description}</h2>
          <h2 className="questions-results-text">{`Ask your bartender for a: ${personality.drink}`}</h2>
        </div>
      </div>

      <button
        className={`start ${questionIndex < 0 ? '' : 'hidden'}`}
        onClick={start}
      >
        Begin
      </button>

      <img className="logo" src={logo} />
    </div >
  );
};

export default App;
