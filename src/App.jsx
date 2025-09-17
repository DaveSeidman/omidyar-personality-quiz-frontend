import React, { useState, useEffect, useRef } from 'react';
import { shuffle } from './utils';
import Typewriter from 'typewriter-effect';
import questions from './assets/data/questions.json';
import backgroundVideo from './assets/videos/background1.mp4';
import logo from './assets/images/logo.svg';

import './index.scss';

const App = () => {
  const [questionIndex, setQuestionIndex] = useState(-1);
  const [responses, setResponses] = useState([]);
  const [persona, setPersona] = useState();

  const questionTimer = useRef();
  const questionsRef = useRef();

  const timeoutRef = useRef();
  const IDLE_DELAY = 60000;

  const questionTypewriters = useRef([]);
  const optionTypewriters = useRef({});

  const start = () => {
    setQuestionIndex(0);
    setResponses([]);
    setPersona();
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
      console.log('calculate persona here');
      // axios.post('http://localhost:8000/persona', { responses }).then(res => {
      //   setPersona(res.data);
      // });
    }
  }, [responses.length]);

  useEffect(() => {
    if (questionIndex >= 0) {
      questionTypewriters.current[questionIndex]?.start();

      const questionEl =
        questionsRef.current?.children[questionIndex];
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
            className={`questions-question ${i > questionIndex ? 'hidden' : ''
              } ${i === questionIndex ? '' : 'disabled'}`}
          >
            <h1 className="questions-question-text">
              <Typewriter
                onInit={(tw) => {
                  questionTypewriters.current[i] = tw;
                  tw.typeString(question.text).callFunction(() => {
                    console.log('Finished question:', question.text);

                    // animate options in render order
                    question.options.forEach((_, order) => {
                      setTimeout(() => {
                        optionTypewriters.current[`${i}-${order}`]?.start();
                      }, order * 1200);
                    });
                  });
                }}
                options={{
                  autoStart: false,
                  delay: 60,
                }}
              />
            </h1>

            <div className="questions-question-options">
              {question.options.map((option, order) => (
                <button
                  key={`${question.id}-${option.id}`}
                  data-index={i}
                  data-id={option.id}
                  data-order={order + 1}
                  className={`questions-question-options-option ${responses[i]?.id === option.id ? 'selected' : ''
                    }`}
                  onClick={addResponse}
                >
                  <Typewriter
                    onInit={(tw) => {
                      optionTypewriters.current[`${i}-${order}`] = tw;
                      tw.typeString(option.text).callFunction(() => {
                        console.log('Finished option:', option.text);
                      });
                    }}
                    options={{
                      autoStart: false,
                      delay: 40,
                    }}
                  />
                </button>
              ))
              }
            </div>
          </div>
        ))}
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
