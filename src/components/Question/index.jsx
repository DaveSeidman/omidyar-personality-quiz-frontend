import React, { useRef } from "react";
import Typewriter from "typewriter-effect";

const Question = ({ question, index, active, onAnswer }) => {
  // store refs to typewriter instances for each answer
  const answerTypewriters = useRef([]);

  return (
    <div
      className={`questions-question ${!active ? "hidden disabled" : ""
        }`}
    >
      <h1 className="questions-question-text">
        <Typewriter
          onInit={(typewriter) => {
            console.log('init', question.id)
            typewriter
              .typeString(question.text)
              .callFunction(() => {
                // when the question finishes, sequentially start answers
                answerTypewriters.current.forEach((tw, order) => {
                  setTimeout(() => {
                    tw && tw.start();
                  }, order * 1200); // stagger
                });
              })
              .start();
          }}
          options={{ delay: 50 }}
        />
      </h1>

      <div className="questions-question-options">
        {question.options.map((option, order) => (
          <button
            key={`${question.id}-${option.id}`}
            data-index={index}
            data-id={option.id}
            data-order={order + 1}
            className="questions-question-options-option"
            onClick={onAnswer}
          >
            <Typewriter
              onInit={(typewriter) => {
                // keep reference so we can start() later
                answerTypewriters.current[order] = typewriter;
                typewriter.typeString(option.text).pauseFor(1000);
              }}
              options={{
                delay: 40,
                autoStart: false, // don’t run until question is done
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Question;
