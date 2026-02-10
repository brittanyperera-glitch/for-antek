import { useState, useRef, useEffect, useCallback } from 'react'
import { Vinyl } from './Vinyl.jsx'
import { LiquidBackground } from './LiquidBackground.jsx'
import DecryptedText from './components/DecryptedText.jsx'
import { GiftBox } from './components/GiftBox.jsx'
import { HeartsGame } from './components/HeartsGame.jsx'
import { EarnedPresent } from './components/EarnedPresent.jsx'

const VALENTINE_INTRO_LINES = [
  'Welcome.',
  'Today, on February 14th,',
  'I introduce',
  'your Valentine\'s gift.',
]

const QUESTION_1 = {
  text: 'What bar did we NOT have our first kiss?',
  options: [
    'Bam Bam',
    'Fever',
    'Broma top floor',
    'Broma bottom floor',
    'Infernos',
  ],
  correctIndex: 2, // Broma top floor
  correctMessage: 'corrreeeect. best swerve award goes to brittany perera',
  wrongMessage: 'NO! were you that drunk?',
}

const QUESTION_2 = {
  text: "what is britt's favourite gelato flavour?",
  options: [
    'kinder bueno',
    'fragola',
    'dark chocolate',
    'mango',
    'pistachio',
    'hazelnut',
  ],
  correctIndex: 4, // pistachio
  correctMessage: 'i scream you scream we all scream for gelato',
  wrongMessage: 'do you even know me?',
}

const QUESTION_3 = {
  text: "what's brittany's favourite track on the antek soundboard?",
  options: [
    "'yihs'",
    'sucks2suck',
    'skill issue',
    'mooorning beautiful',
    'kawshie',
    "hardly know 'er",
  ],
  correctIndex: 0, // 'yihs'
  correctMessage: "the og. the 'yihs' to my 'nawhr'",
  wrongMessages: [
    '', // index 0 is correct, unused
    'sucks2getitwrong',
    "seems like you're the one with the skill issue",
    'give me 5 more minutes please please',
    'a fantastic one. but sadly nope',
    "so you dont know me? i get it. dickhead",
  ],
}

const QUESTION_4 = {
  type: 'rank',
  text: "rank brittany's favourite cards (top is smash, bottom can get in the bin):",
  items: [
    'potatoes',
    'yorkshire pudding',
    'bread',
    'pasta',
    'noodles',
    'rice',
  ],
  correctOrder: [
    'yorkshire pudding',
    'bread',
    'noodles',
    'potatoes',
    'pasta',
    'rice',
  ],
  correctMessage: "you're right. but i never said it was my favourite thing i've put in my mouth",
  wrongMessages: [
    'pasta la vista',
    'no BJs for you',
    'get in the bin yourself',
    'potat-NO!',
    'get a (carb)load of this!',
  ],
}

const QUESTION_5 = {
  text: "what was the first sentence in brittany's personal statement",
  options: [
    "it was brunellesci's dome that sent me on this path",
    'it all started in florence',
    "i grew up always asking 'why?'",
    'I found Engineering where least expected to',
    'what is Engineering?',
    "they told me i wouldn't be able to do it",
  ],
  correctIndex: 3, // I found Engineering where least expected to
  correctMessage: "it's cringe i know. got me in though",
  wrongMessages: [
    'the path to being dissappointed in your answer',
    'starts with cringe',
    "why? like why do you know nothing about me",
    '', // index 3 is correct, unused
    'what is that answer my guy',
    "who the fuck is 'they' dude. think about it",
  ],
}

const QUESTION_6 = {
  type: 'slider',
  text: 'how many chickens are we having?',
  min: 1,
  max: 10,
  correctValue: 4,
  correctMessage: 'teeeenage mutant ninja chickenssss',
  wrongMessageTooMany: "that's too many eggs!",
  wrongMessageTooFew: "that's not enough eggs!",
}

const QUESTION_7 = {
  text: 'who loves the other more?',
  options: ['Brittany', 'Antek'],
  correctIndex: 0, // Brittany
  correctMessage: 'told you so',
  wrongMessage: "you're delusional. (you can't refuse to answer)",
}

const QUESTION_8 = {
  type: 'text',
  text: 'how long are we going to be together?',
  correctAnswer: 'forever',
  correctMessage: 'forever +14',
  wrongMessage: 'try again',
}

const QUIZ_QUESTIONS = [QUESTION_1, QUESTION_2, QUESTION_3, QUESTION_4, QUESTION_5, QUESTION_6, QUESTION_7, QUESTION_8]

const SECTIONS = [
  {
    id: 'welcome',
    isWelcome: true,
  },
  {
    id: 'game',
    isGame: true,
  },
]

function Section({
  section,
  audioRef,
  isActive,
  welcomeContinued,
  onWelcomeContinue,
  quizQuestionIndex,
  question1Selected,
  question1Feedback,
  onQuestion1Select,
  onQuestion1TryAgain,
  question2Selected,
  question2Feedback,
  onQuestion2Select,
  onQuestion2TryAgain,
  question3Selected,
  question3Feedback,
  onQuestion3Select,
  onQuestion3TryAgain,
  question4Order,
  question4Feedback,
  question4WrongMessage,
  question4DraggedIndex,
  onQuestion4DragStart,
  onQuestion4DragEnd,
  onQuestion4Reorder,
  onQuestion4Submit,
  onQuestion4TryAgain,
  question5Selected,
  question5Feedback,
  onQuestion5Select,
  onQuestion5TryAgain,
  question6Value,
  question6Feedback,
  onQuestion6Change,
  onQuestion6Submit,
  onQuestion6TryAgain,
  question7Selected,
  question7Feedback,
  onQuestion7Select,
  onQuestion7TryAgain,
  question8Value,
  question8Feedback,
  onQuestion8Change,
  onQuestion8Submit,
  onQuestion8TryAgain,
  onAdvanceToNextQuestion,
  onNextQuestion,
  sectionIndex,
  onGameComplete,
  proceedToNextLevelClicked,
  onProceedToNextLevelClick,
}) {
  useEffect(() => {
    const audio = audioRef?.current
    if (!audio) return
    if (section.trackSrc && isActive) {
      audio.src = section.trackSrc
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [isActive, section.trackSrc, audioRef])

  if (section.isWelcome) {
    const showQuestion = welcomeContinued
    const question = QUIZ_QUESTIONS[quizQuestionIndex]
    const isRankQuestion = question.type === 'rank'
    const isSliderQuestion = question.type === 'slider'
    const isTextQuestion = question.type === 'text'
    const selected = quizQuestionIndex === 0 ? question1Selected : quizQuestionIndex === 1 ? question2Selected : quizQuestionIndex === 2 ? question3Selected : quizQuestionIndex === 4 ? question5Selected : quizQuestionIndex === 6 ? question7Selected : null
    const feedback = quizQuestionIndex === 0 ? question1Feedback : quizQuestionIndex === 1 ? question2Feedback : quizQuestionIndex === 2 ? question3Feedback : quizQuestionIndex === 3 ? question4Feedback : quizQuestionIndex === 4 ? question5Feedback : quizQuestionIndex === 5 ? question6Feedback : quizQuestionIndex === 6 ? question7Feedback : question8Feedback
    const isCorrect = feedback === 'correct'
    const isWrong = feedback === 'wrong'
    const wrongMessage = isRankQuestion && isWrong
      ? question4WrongMessage
      : isSliderQuestion && isWrong
        ? (question6Value > question.correctValue ? question.wrongMessageTooMany : question.wrongMessageTooFew)
        : question.wrongMessages && !isRankQuestion
          ? question.wrongMessages[selected]
          : question.wrongMessage
    const isLastQuestion = quizQuestionIndex === QUIZ_QUESTIONS.length - 1
    const onSelect = quizQuestionIndex === 0 ? onQuestion1Select : quizQuestionIndex === 1 ? onQuestion2Select : quizQuestionIndex === 2 ? onQuestion3Select : quizQuestionIndex === 4 ? onQuestion5Select : quizQuestionIndex === 6 ? onQuestion7Select : () => {}
    const onTryAgain = quizQuestionIndex === 0 ? onQuestion1TryAgain : quizQuestionIndex === 1 ? onQuestion2TryAgain : quizQuestionIndex === 2 ? onQuestion3TryAgain : quizQuestionIndex === 3 ? onQuestion4TryAgain : quizQuestionIndex === 4 ? onQuestion5TryAgain : quizQuestionIndex === 5 ? onQuestion6TryAgain : quizQuestionIndex === 6 ? onQuestion7TryAgain : onQuestion8TryAgain

    const handleRankDragStart = (e, fromIndex) => {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', String(fromIndex))
      onQuestion4DragStart && onQuestion4DragStart(fromIndex)
    }
    const handleRankDragEnd = () => {
      onQuestion4DragEnd && onQuestion4DragEnd()
    }
    const handleRankDrop = (e, toIndex) => {
      e.preventDefault()
      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10)
      if (Number.isNaN(fromIndex) || fromIndex === toIndex) return
      const newOrder = [...question4Order]
      const [item] = newOrder.splice(fromIndex, 1)
      newOrder.splice(toIndex, 0, item)
      onQuestion4Reorder(newOrder)
    }
    const handleRankDragOver = (e) => e.preventDefault()

    return (
      <div className="section section-welcome" data-section={section.id}>
        {!welcomeContinued && (
          <h1 className="welcome-hero__text">Welcome to your Valentine&apos;s Gift</h1>
        )}
        {!welcomeContinued ? (
          <button
            type="button"
            className="welcome-hero__go"
            onClick={onWelcomeContinue}
            aria-label="Continue"
          >
            <span className="welcome-hero__arrow" aria-hidden>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </span>
            <span className="welcome-hero__go-text">GO!</span>
          </button>
        ) : (
          <div className="section-welcome__content use-shiny-text">
            <p className="welcome-hero__message">Answer the following questions to reveal your prize</p>
            {showQuestion && (
              <div className="welcome-quiz">
                <p className="welcome-quiz__question">{question.text}</p>
                {isRankQuestion ? (
                  <>
                    <p className="welcome-quiz__rank-hint">Top = smash, bottom = can get in the bin</p>
                    <ul className="welcome-quiz__rank-list" aria-label="Drag to reorder">
                      {question4Order.map((item, index) => (
                        <li
                          key={`${item}-${index}`}
                          className={`welcome-quiz__rank-item${question4DraggedIndex === index ? ' welcome-quiz__rank-item--dragging' : ''}`}
                          draggable={feedback == null}
                          onDragStart={(e) => handleRankDragStart(e, index)}
                          onDragEnd={handleRankDragEnd}
                          onDragOver={handleRankDragOver}
                          onDrop={(e) => handleRankDrop(e, index)}
                        >
                          <span className="welcome-quiz__rank-num">{index + 1}</span>
                          <span className="welcome-quiz__rank-label">{item}</span>
                        </li>
                      ))}
                    </ul>
                    {feedback == null && (
                      <div className="welcome-quiz__rank-actions">
                        <button
                          type="button"
                          className="welcome-quiz__submit-btn"
                          onClick={onQuestion4Submit}
                        >
                          Submit your answer
                        </button>
                        <button
                          type="button"
                          className="welcome-quiz__skip-btn"
                          onClick={onAdvanceToNextQuestion}
                          aria-label="Skip this question"
                        >
                          Skip question
                        </button>
                      </div>
                    )}
                  </>
                ) : isSliderQuestion ? (
                  <>
                    <div className="welcome-quiz__slider-wrap">
                      <input
                        type="range"
                        min={question.min}
                        max={question.max}
                        value={question6Value}
                        onChange={(e) => onQuestion6Change(Number(e.target.value))}
                        disabled={feedback != null}
                        className="welcome-quiz__slider"
                        aria-valuemin={question.min}
                        aria-valuemax={question.max}
                        aria-valuenow={question6Value}
                        aria-label="Number of chickens"
                      />
                      <span className="welcome-quiz__slider-value" aria-live="polite">
                        {question6Value}
                      </span>
                    </div>
                    {feedback == null && (
                      <button
                        type="button"
                        className="welcome-quiz__submit-btn"
                        onClick={onQuestion6Submit}
                      >
                        Submit your answer
                      </button>
                    )}
                  </>
                ) : isTextQuestion ? (
                  <>
                    <input
                      type="text"
                      value={question8Value}
                      onChange={(e) => onQuestion8Change(e.target.value)}
                      disabled={feedback != null}
                      className="welcome-quiz__text-input"
                      placeholder="Type your answer..."
                      aria-label="Your answer"
                      autoComplete="off"
                    />
                    {feedback == null && (
                      <button
                        type="button"
                        className="welcome-quiz__submit-btn"
                        onClick={onQuestion8Submit}
                      >
                        Submit your answer
                      </button>
                    )}
                  </>
                ) : (
                  <ol className="welcome-quiz__options">
                    {question.options.map((label, index) => {
                      const optionSelected = selected === index
                      const correct = index === question.correctIndex
                      const optionCorrect = optionSelected && isCorrect && correct
                      const optionWrong = optionSelected && isWrong
                      const isYihsOption = question === QUESTION_3 && index === 0
                      return (
                        <li key={index}>
                          <button
                            type="button"
                            className={`welcome-quiz__option ${optionCorrect ? 'welcome-quiz__option--correct' : ''} ${optionWrong ? 'welcome-quiz__option--wrong' : ''}`}
                            onClick={() => selected == null && onSelect(index)}
                            disabled={selected != null}
                            aria-pressed={optionSelected}
                            aria-disabled={selected != null}
                          >
                            <span className="welcome-quiz__option-label">
                              <span className="welcome-quiz__option-num">{index + 1}.</span>{' '}
                              {isYihsOption ? <em>&apos;yihs&apos;</em> : label}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ol>
                )}
                {isWrong && (
                  <>
                    <p className="welcome-quiz__wrong-message">{wrongMessage}</p>
                    <button
                      type="button"
                      className="welcome-quiz__try-again"
                      onClick={onTryAgain}
                    >
                      Try again
                    </button>
                  </>
                )}
                {isCorrect && (
                  <>
                    <p className="welcome-quiz__correct-message">{question.correctMessage}</p>
                    {isLastQuestion && proceedToNextLevelClicked && (
                      <p className="welcome-quiz__hearts-message" aria-live="polite">
                        collect 5 hearts to proceed
                      </p>
                    )}
                    <button
                      type="button"
                      className="welcome-quiz__next-btn"
                      onClick={isLastQuestion ? onProceedToNextLevelClick : onAdvanceToNextQuestion}
                      aria-label={
                        isLastQuestion
                          ? (proceedToNextLevelClicked ? 'Go to game' : 'Proceed to the next level')
                          : 'Next question'
                      }
                    >
                      <span className="welcome-quiz__next-arrow" aria-hidden>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 5v14M19 12l-7 7-7-7" />
                        </svg>
                      </span>
                      <span className="welcome-quiz__next-label">
                        {isLastQuestion
                          ? (proceedToNextLevelClicked ? 'Go' : 'proceed to the next level.')
                          : 'Next question'}
                      </span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  if (section.isGame) {
    return (
      <div className="section section-game" data-section={section.id}>
        <h1 className="section-game__title">Recreate the first meal you cooked me</h1>
        <HeartsGame onComplete={onGameComplete ?? (() => {})} />
      </div>
    )
  }

  if (section.isValentineIntro) {
    return (
      <div className="section section-valentine use-shiny-text" data-section={section.id}>
        <div className="valentine-intro">
          {section.lines.map((line, i) => (
            <p key={i} className="valentine-intro__line">
              <DecryptedText
                text={line}
                animateOn="view"
                revealDirection="start"
                sequential
                useOriginalCharsOnly={false}
                speed={45}
                maxIterations={12}
                className="decrypted-revealed"
                parentClassName="decrypted-parent"
                encryptedClassName="decrypted-encrypted"
              />
            </p>
          ))}
          <p className="valentine-intro__prompt">Answer the following questions to reveal your gift.</p>
          <GiftBox />
        </div>
      </div>
    )
  }

  if (section.isOutro) {
    return (
      <div className="section section-text use-shiny-text" data-section={section.id}>
        <h1 className="section-title">{section.title}</h1>
        {section.subtitle && <p className="section-subtitle">{section.subtitle}</p>}
      </div>
    )
  }

  return (
    <div className="section section-record use-shiny-text" data-section={section.id}>
      <div className="section-content">
        <Vinyl isSpinning={isActive} />
        <div className="section-copy">
          <h2 className="record-title">{section.title}</h2>
          {section.imageUrl && (
            <img src={section.imageUrl} alt="" className="record-image" />
          )}
          <p className="record-explanation">{section.explanation}</p>
        </div>
      </div>
    </div>
  )
}

const BACKGROUND_MUSIC_SRC = '/TV%20girl%20-%20lovers%20rock%20instrumental.mp3'
const GAME_LEVEL_MUSIC_SRC = '/UPBEAT%20video%20game%20music%20pt.%202%20%E2%9C%A8.mp3'
const CORRECT_ANSWER_SOUND_SRC = '/CORRECT%20ANSWER%20SOUND%20EFFECT%20_%20NO%20COPYRIGHT.mp3'
const WRONG_ANSWER_SOUND_SRC = '/Nope%20sound%20effect.mp3'

const SOUND_EFFECT_URLS = [
  CORRECT_ANSWER_SOUND_SRC,
  WRONG_ANSWER_SOUND_SRC,
  '/Cartoon%20Jump%20Sound%20Effect.mp3',
  '/Cartoon%20Splat%20sound%20effect.mp3',
  '/Mario%20Coin%20Sound%20-%20Sound%20Effect%20%28HD%29.mp3',
]

export default function App() {
  const sectionRefs = useRef([])
  const audioRef = useRef(null)
  const backgroundMusicRef = useRef(null)
  const gameLevelMusicRef = useRef(null)
  const correctAnswerSoundRef = useRef(null)
  const wrongAnswerSoundRef = useRef(null)

  useEffect(() => {
    SOUND_EFFECT_URLS.forEach((src) => {
      const a = new Audio(src)
      a.preload = 'auto'
      a.load()
    })
  }, [])

  const playCorrectAnswerSound = useCallback(() => {
    const el = correctAnswerSoundRef.current
    if (!el) return
    el.volume = 0.5
    el.currentTime = 0
    el.play().catch(() => {})
  }, [])

  const playWrongAnswerSound = useCallback(() => {
    const el = wrongAnswerSoundRef.current
    if (!el) return
    el.volume = 0.5
    el.currentTime = 0
    el.play().catch(() => {})
  }, [])
  const [activeIndex, setActiveIndex] = useState(0)
  const [welcomeContinued, setWelcomeContinued] = useState(false)
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0)
  const [question1Selected, setQuestion1Selected] = useState(null)
  const [question1Feedback, setQuestion1Feedback] = useState(null)
  const [question2Selected, setQuestion2Selected] = useState(null)
  const [question2Feedback, setQuestion2Feedback] = useState(null)
  const [question3Selected, setQuestion3Selected] = useState(null)
  const [question3Feedback, setQuestion3Feedback] = useState(null)
  const [question4Order, setQuestion4Order] = useState(() => [...QUESTION_4.items])
  const [question4Feedback, setQuestion4Feedback] = useState(null)
  const [question4WrongMessage, setQuestion4WrongMessage] = useState(null)
  const [question4DraggedIndex, setQuestion4DraggedIndex] = useState(null)
  const [question4DraggedItem, setQuestion4DraggedItem] = useState(null)
  const [question5Selected, setQuestion5Selected] = useState(null)
  const [question5Feedback, setQuestion5Feedback] = useState(null)
  const [question6Value, setQuestion6Value] = useState(QUESTION_6.min)
  const [question6Feedback, setQuestion6Feedback] = useState(null)
  const [question7Selected, setQuestion7Selected] = useState(null)
  const [question7Feedback, setQuestion7Feedback] = useState(null)
  const [question8Value, setQuestion8Value] = useState('')
  const [question8Feedback, setQuestion8Feedback] = useState(null)
  const [proceedToNextLevelClicked, setProceedToNextLevelClicked] = useState(false)
  const [gameLevelActive, setGameLevelActive] = useState(false)
  const [gamePhase, setGamePhase] = useState('hearts') // 'hearts' | 'present'
  const [trackListingActive, setTrackListingActive] = useState(false)

  const handleQuestion1Select = (index) => {
    setQuestion1Selected(index)
    const correct = index === QUESTION_1.correctIndex
    if (correct) playCorrectAnswerSound()
    else playWrongAnswerSound()
    setQuestion1Feedback(correct ? 'correct' : 'wrong')
  }

  const handleQuestion1TryAgain = () => {
    setQuestion1Selected(null)
    setQuestion1Feedback(null)
  }

  const handleQuestion2Select = (index) => {
    setQuestion2Selected(index)
    const correct = index === QUESTION_2.correctIndex
    if (correct) playCorrectAnswerSound()
    else playWrongAnswerSound()
    setQuestion2Feedback(correct ? 'correct' : 'wrong')
  }

  const handleQuestion2TryAgain = () => {
    setQuestion2Selected(null)
    setQuestion2Feedback(null)
  }

  const handleQuestion3Select = (index) => {
    setQuestion3Selected(index)
    const correct = index === QUESTION_3.correctIndex
    if (correct) playCorrectAnswerSound()
    else playWrongAnswerSound()
    setQuestion3Feedback(correct ? 'correct' : 'wrong')
  }

  const handleQuestion3TryAgain = () => {
    setQuestion3Selected(null)
    setQuestion3Feedback(null)
  }

  const handleQuestion4DragStart = (index) => {
    setQuestion4DraggedIndex(index)
    setQuestion4DraggedItem((prev) => {
      const order = question4Order || []
      return order[index] ?? null
    })
  }

  const handleQuestion4DragEnd = () => {
    setQuestion4DraggedIndex(null)
    setQuestion4DraggedItem(null)
  }

  const handleQuestion4DragOver = (overIndex) => {
    if (question4DraggedItem == null) return
    const currentIndex = question4Order.indexOf(question4DraggedItem)
    if (currentIndex === -1 || currentIndex === overIndex) return
    const newOrder = [...question4Order]
    const [moved] = newOrder.splice(currentIndex, 1)
    newOrder.splice(overIndex, 0, moved)
    setQuestion4Order(newOrder)
  }

  const handleQuestion4Reorder = (newOrder) => {
    setQuestion4Order(newOrder)
  }

  const handleQuestion4Submit = () => {
    const correct =
      question4Order.length === QUESTION_4.correctOrder.length &&
      question4Order.every((item, i) => item === QUESTION_4.correctOrder[i])
    if (correct) {
      playCorrectAnswerSound()
      setQuestion4Feedback('correct')
    } else {
      playWrongAnswerSound()
      setQuestion4Feedback('wrong')
      setQuestion4WrongMessage(
        QUESTION_4.wrongMessages[Math.floor(Math.random() * QUESTION_4.wrongMessages.length)]
      )
    }
  }

  const handleQuestion4TryAgain = () => {
    setQuestion4Order([...QUESTION_4.items])
    setQuestion4Feedback(null)
    setQuestion4WrongMessage(null)
  }

  const handleQuestion5Select = (index) => {
    setQuestion5Selected(index)
    const correct = index === QUESTION_5.correctIndex
    if (correct) playCorrectAnswerSound()
    else playWrongAnswerSound()
    setQuestion5Feedback(correct ? 'correct' : 'wrong')
  }

  const handleQuestion5TryAgain = () => {
    setQuestion5Selected(null)
    setQuestion5Feedback(null)
  }

  const handleQuestion6Change = (value) => {
    setQuestion6Value(value)
  }

  const handleQuestion6Submit = () => {
    const correct = question6Value === QUESTION_6.correctValue
    if (correct) playCorrectAnswerSound()
    setQuestion6Feedback(correct ? 'correct' : 'wrong')
  }

  const handleQuestion6TryAgain = () => {
    setQuestion6Value(QUESTION_6.min)
    setQuestion6Feedback(null)
  }

  const handleQuestion7Select = (index) => {
    setQuestion7Selected(index)
    const correct = index === QUESTION_7.correctIndex
    if (correct) playCorrectAnswerSound()
    else playWrongAnswerSound()
    setQuestion7Feedback(correct ? 'correct' : 'wrong')
  }

  const handleQuestion7TryAgain = () => {
    setQuestion7Selected(null)
    setQuestion7Feedback(null)
  }

  const handleQuestion8Change = (value) => {
    setQuestion8Value(value)
  }

  const handleQuestion8Submit = () => {
    const correct =
      question8Value.trim().toLowerCase() === QUESTION_8.correctAnswer.toLowerCase()
    if (correct) playCorrectAnswerSound()
    else playWrongAnswerSound()
    setQuestion8Feedback(correct ? 'correct' : 'wrong')
  }

  const handleQuestion8TryAgain = () => {
    setQuestion8Value('')
    setQuestion8Feedback(null)
  }

  const handleAdvanceToNextQuestion = () => {
    setQuizQuestionIndex((i) => i + 1)
  }

  const handleNextQuestion = () => {
    const nextSection = sectionRefs.current[1]
    if (nextSection) nextSection.scrollIntoView({ behavior: 'smooth' })
  }

  const handleProceedToNextLevelClick = () => {
    if (!proceedToNextLevelClicked) {
      setProceedToNextLevelClicked(true)
    } else {
      setGameLevelActive(true)
    }
  }

  const visibleSections = SECTIONS.filter((section) => section.id !== 'game')

  useEffect(() => {
    const observers = visibleSections.map((_, i) => {
      const el = sectionRefs.current[i]
      if (!el) return () => {}
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveIndex(i)
        },
        { threshold: 0.5 }
      )
      observer.observe(el)
      return () => observer.disconnect()
    })
    return () => observers.forEach((clean) => clean())
  }, [])

  // Background music: plays on welcome; stops during hearts game; resumes (lovers rock) for cooking/shopping game
  useEffect(() => {
    const bg = backgroundMusicRef.current
    if (!bg) return
    bg.volume = 0.25
    bg.loop = true
    bg.play().catch(() => {})
  }, [])

  useEffect(() => {
    const bg = backgroundMusicRef.current
    if (!bg) return
    if (gameLevelActive) {
      if (gamePhase === 'hearts' || trackListingActive) {
        bg.pause()
      } else {
        bg.play().catch(() => {})
      }
    } else if (activeIndex === 1) {
      bg.pause()
    } else if (activeIndex === 0) {
      bg.play().catch(() => {})
    }
  }, [activeIndex, gameLevelActive, gamePhase, trackListingActive])

  // Game level music: plays only during hearts game, for half the track then stops
  useEffect(() => {
    const gameMusic = gameLevelMusicRef.current
    if (!gameMusic) return
    const heartsActive = gameLevelActive && gamePhase === 'hearts'
    if (!heartsActive) {
      gameMusic.pause()
      return
    }
    gameMusic.volume = 0.35
    gameMusic.loop = false
    gameMusic.currentTime = 0
    gameMusic.play().catch(() => {})

    const stopAtHalf = () => {
      const d = gameMusic.duration
      if (Number.isFinite(d) && d > 0 && gameMusic.currentTime >= d / 2) {
        gameMusic.pause()
        gameMusic.currentTime = 0
        gameMusic.removeEventListener('timeupdate', stopAtHalf)
      }
    }
    gameMusic.addEventListener('timeupdate', stopAtHalf)
    return () => {
      gameMusic.removeEventListener('timeupdate', stopAtHalf)
      gameMusic.pause()
    }
  }, [gameLevelActive, gamePhase])

  // Start background music on first user interaction if autoplay was blocked
  useEffect(() => {
    if (!welcomeContinued) return
    const bg = backgroundMusicRef.current
    if (!bg) return
    bg.volume = 0.25
    bg.play().catch(() => {})
  }, [welcomeContinued])

  const isNextLevelView = proceedToNextLevelClicked

  if (gameLevelActive) {
    return (
      <div className="app app--game-level">
        <LiquidBackground />
        <audio ref={audioRef} />
        <audio ref={backgroundMusicRef} src={BACKGROUND_MUSIC_SRC} preload="auto" />
        <audio ref={gameLevelMusicRef} src={GAME_LEVEL_MUSIC_SRC} preload="auto" />
        <audio ref={correctAnswerSoundRef} src={CORRECT_ANSWER_SOUND_SRC} preload="auto" />
        <audio ref={wrongAnswerSoundRef} src={WRONG_ANSWER_SOUND_SRC} preload="auto" />
        <section className="section section-game section-game--full" data-section="game">
          {gamePhase === 'hearts' ? (
            <>
              <h1 className="section-game__title">Recreate the first meal you cooked me</h1>
              <HeartsGame onComplete={() => setGamePhase('present')} />
            </>
          ) : (
            <EarnedPresent onShowTrackListing={() => setTrackListingActive(true)} />
          )}
        </section>
      </div>
    )
  }

  return (
    <div className={`app${isNextLevelView ? ' app--next-level' : ''}`}>
      <LiquidBackground />
      <audio ref={audioRef} />
      <audio ref={backgroundMusicRef} src={BACKGROUND_MUSIC_SRC} preload="auto" />
      <audio ref={gameLevelMusicRef} src={GAME_LEVEL_MUSIC_SRC} preload="auto" />
      <audio ref={correctAnswerSoundRef} src={CORRECT_ANSWER_SOUND_SRC} preload="auto" />
      <audio ref={wrongAnswerSoundRef} src={WRONG_ANSWER_SOUND_SRC} preload="auto" />
      {visibleSections.map((section, index) => (
        <section
          key={section.id}
          ref={(el) => (sectionRefs.current[index] = el)}
          className="section section-snap"
          data-section={section.id}
        >
          <Section
            section={section}
            audioRef={audioRef}
            isActive={activeIndex === index}
            sectionIndex={index}
            onGameComplete={undefined}
            welcomeContinued={welcomeContinued}
            onWelcomeContinue={() => setWelcomeContinued(true)}
            quizQuestionIndex={quizQuestionIndex}
            question1Selected={question1Selected}
            question1Feedback={question1Feedback}
            onQuestion1Select={handleQuestion1Select}
            onQuestion1TryAgain={handleQuestion1TryAgain}
            question2Selected={question2Selected}
            question2Feedback={question2Feedback}
            onQuestion2Select={handleQuestion2Select}
            onQuestion2TryAgain={handleQuestion2TryAgain}
            question3Selected={question3Selected}
            question3Feedback={question3Feedback}
            onQuestion3Select={handleQuestion3Select}
            onQuestion3TryAgain={handleQuestion3TryAgain}
            question4Order={question4Order}
            question4Feedback={question4Feedback}
            question4WrongMessage={question4WrongMessage}
            question4DraggedIndex={question4DraggedIndex}
            onQuestion4DragStart={handleQuestion4DragStart}
            onQuestion4DragEnd={handleQuestion4DragEnd}
            onQuestion4Reorder={handleQuestion4Reorder}
            onQuestion4Submit={handleQuestion4Submit}
            onQuestion4TryAgain={handleQuestion4TryAgain}
            question5Selected={question5Selected}
            question5Feedback={question5Feedback}
            onQuestion5Select={handleQuestion5Select}
            onQuestion5TryAgain={handleQuestion5TryAgain}
            question6Value={question6Value}
            question6Feedback={question6Feedback}
            onQuestion6Change={handleQuestion6Change}
            onQuestion6Submit={handleQuestion6Submit}
            onQuestion6TryAgain={handleQuestion6TryAgain}
            question7Selected={question7Selected}
            question7Feedback={question7Feedback}
            onQuestion7Select={handleQuestion7Select}
            onQuestion7TryAgain={handleQuestion7TryAgain}
            question8Value={question8Value}
            question8Feedback={question8Feedback}
            onQuestion8Change={handleQuestion8Change}
            onQuestion8Submit={handleQuestion8Submit}
            onQuestion8TryAgain={handleQuestion8TryAgain}
            onAdvanceToNextQuestion={handleAdvanceToNextQuestion}
            onNextQuestion={handleNextQuestion}
            proceedToNextLevelClicked={proceedToNextLevelClicked}
            onProceedToNextLevelClick={handleProceedToNextLevelClick}
          />
        </section>
      ))}
    </div>
  )
}
