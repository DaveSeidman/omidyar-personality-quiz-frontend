import React, { useState, useEffect, useRef } from 'react';
import { modeRandomTie, shuffle } from './utils';
import Typewriter from 'typewriter-effect';
import questions from './assets/data/questions.json';
import personalities from './assets/data/personalities.json';
import backgroundVideo from './assets/videos/background1.mp4';
import Question from './components/Question';
import logo from './assets/images/logo.svg';

import './index.scss';

const App = () => {

  const [questionIndex, setQuestionIndex] = useState(-1);
  const [responses, setResponses] = useState([]);
  // const [attract, setAttract] = useState(true);
  const [persona, setPersona] = useState();
  const questionTimer = useRef();
  const questionsRef = useRef();

  const timeoutRef = useRef();
  const IDLE_DELAY = 60000;
  const IDLE_DURATION = 5000; // use this only if we want an "are you still there?" screen

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
      next[index] = { id: answerId, order, delay };
      return next;
    });

    setQuestionIndex(questionIndex + 1);
  }

  const idleTimeout = () => {
    // setAttract(true);
    setQuestionIndex(-1);
  }

  const resetIdleTimeout = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(idleTimeout, IDLE_DELAY);
  }

  useEffect(() => {
    questionTimer.current = performance.now();

    if (responses.length === questions.length) {
      console.log('calculate persona here')
      // axios.post('http://localhost:8000/persona', { responses }).then(res => {
      //   console.log(res.data)
      //   setPersona(res.data);
      // })
    }
  }, [responses.length])

  useEffect(() => {

    const questionEl = Array.from(questionsRef.current?.children)[questionIndex];
    questionEl?.scrollIntoView({ behavior: 'smooth' });
  }, [questionIndex])

  useEffect(() => {
    addEventListener('click', resetIdleTimeout);
    return (() => {
      removeEventListener('click', resetIdleTimeout);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    })
  }, [])

  return (
    <div className='app'>
      <div className={`background ${questionIndex >= 0 ? 'muted' : ''}`}>
        <video src={backgroundVideo} muted loop autoPlay playsInline />
      </div>
      <div className="questions" ref={questionsRef}>
        {questions.map((question, i) => (
          <div
            key={question.id}
            className={`questions-question ${i > questionIndex ? 'hidden' : ''} ${i === questionIndex ? '' : 'disabled'}`}
          >
            {questions.map((question, i) => (
              <Question
                key={question.id}
                // key={`${question.id}-${questionIndex}`}
                question={question}
                index={i}
                active={i === questionIndex}
                onAnswer={addResponse}
              />
            ))}
          </div>
        ))}

      </div>
      <button
        className={`start ${questionIndex < 0 ? '' : 'hidden'}`}
        onClick={start}
      >
        Begin
      </button>

      <img className='logo' src={logo} />
    </div >
  );
}


export default App;
