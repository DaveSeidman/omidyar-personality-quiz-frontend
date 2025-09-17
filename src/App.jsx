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
  const [fullscreen, setFullscreen] = useState(false);

  const questionTimer = useRef();
  const questionsRef = useRef();

  const timeoutRef = useRef();
  const IDLE_DELAY = 60000;

  const handleFullscreenChange = (e) => {
    // console.log(e)
    // const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement ||

    setFullscreen(document.fullscreenElement !== null)
  }

  const start = () => {
    setQuestionIndex(0);
    setResponses([]);
    setPersonality({});
    questions.forEach((q) => {
      q.options = shuffle(q.options); // still shuffle their order
    });

    if (!fullscreen) {
      document.documentElement.webkitRequestFullScreen();
      setFullscreen(true);
    }
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
    setPersonality({})
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
    }
  }, [responses.length]);

  useEffect(() => {
    if (questionIndex >= 0) {
      const questionEl = questionsRef.current?.children[questionIndex];
      setTimeout(() => {
        questionEl?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, [questionIndex]);

  useEffect(() => {
    addEventListener('click', resetIdleTimeout);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      removeEventListener('click', resetIdleTimeout);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);

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
          <h1 className="questions-results-text"><><span>Congratulations!</span><span>Based on your answers you've matched with the</span><span class="accent">{personality.name}</span><span>!</span></></h1>
          <h2 className="questions-results-text">{personality.description}</h2>
          <h2 className="questions-results-text">
            <>
              <span>Ask your bartender for a</span>
              <span className="accent">{`${personality.drink} 🍹`}</span>
            </>
          </h2>
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
