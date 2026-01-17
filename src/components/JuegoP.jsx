import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Question from './Preguntas';
import FeedbackModal from './Retroalimentacion';

function JuegoP({ onGameEnd, playerName }) {

    // --- ESTADOS PRINCIPALES ---
    const [lives, setLives] = useState(3);
    const [score, setScore] = useState(0);
    const [gameHistory, setGameHistory] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [totalQuestions] = useState(15);
    const [startTime, setStartTime] = useState(null);

    // --- Racha ---
    const [streak, setStreak] = useState(0);
    const [isStreakActive, setIsStreakActive] = useState(false);

    // --- UI / feedback ---
    const [isLoading, setIsLoading] = useState(true);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [feedbackInfo, setFeedbackInfo] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState('');
    const historyRef = useRef(gameHistory);
    const isSavingRef = useRef(false);

    useEffect(() => {
        historyRef.current = gameHistory;
    }, [gameHistory]);

    const currentQuestion = questions.length > 0 ? questions[currentIndex] : null;
    const displayQuestionCount = currentIndex + 1;

    // ============================
    // Cargar las 15 preguntas mezcladas
    // ============================
    useEffect(() => {
        let isMounted = true;

        const loadQuestions = async () => {
            setIsLoading(true);

            try {

                const url = `http://localhost:8000/Questions.php?player=${encodeURIComponent(playerName)}`;

                const response = await fetch(url, {
                    method: 'GET', 
                    headers: { 
                        'Content-Type': 'application/json' 
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }

                const data = await response.json();

                if (isMounted && Array.isArray(data) && data.length > 0) {
                    setQuestions(data);
                    setStartTime(Date.now()); 
                } else {
                    console.warn("⚠️ No se recibieron preguntas o el array está vacío");
                }

            } catch (error) {
                console.error("❌ Error cargando preguntas:", error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        if (playerName) {
            loadQuestions();
        }

        return () => { isMounted = false };
    }, [playerName]); 

    // ============================
    // Guardar progreso final
    // ============================
    const saveFinalProgress = async (tiempoTotal = null) => {
        if (isSavingRef.current) return;
        isSavingRef.current = true;

        const finalHistory = historyRef.current;
        
        if (tiempoTotal === null && startTime) {
            const endTime = Date.now();
            tiempoTotal = Math.floor((endTime - startTime) / 1000);
        }

        try {
            await fetch('http://localhost:8000/saveProgress.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playerName,
                    score,
                    tiempo_total: tiempoTotal,
                    history: finalHistory
                })
            });
        } catch (error) {
            console.error("❌ Error guardando:", error);
            isSavingRef.current = false;
        }
    };

    // ============================
    // Verificar respuesta
    // ============================
    const handleAnswer = (selectedOption) => {
        if (showFeedback || !currentQuestion) return;

        const correct = selectedOption === currentQuestion.correct_answer;

        if (correct) {
            setStreak(prev => prev + 1);

            if (streak + 1 >= 3) {
                setIsStreakActive(true);
            }

            setScore(prev => prev + (isStreakActive ? 20 : 10));
            setIsCorrect(true);
            setFeedbackInfo(currentQuestion.feedback_correct);

        } else {
            setStreak(0);
            setIsStreakActive(false);
            setLives(prevLives => {
                const newLives = prevLives - 1;
                return newLives < 0 ? 0 : newLives;
            });

            setIsCorrect(false);
            setFeedbackInfo(currentQuestion.feedback_incorrect);
            setCorrectAnswer(currentQuestion.correct_answer);
        }

        setGameHistory(prev => [...prev, {
            question: currentQuestion.question,
            selectedOption,
            correctAnswer: currentQuestion.correct_answer,
            isCorrect: correct,
            difficulty: currentQuestion.difficulty
        }]);

        setShowFeedback(true);
    };

    // ============================
    // Avanzar a siguiente pregunta o terminar
    // ============================
    const handleNextQuestion = async () => {
        setShowFeedback(false);
        if (lives <= 0) {
            await saveFinalProgress();
            onGameEnd(score);
            return;
        }
        if (currentIndex >= totalQuestions - 1) {
            await saveFinalProgress();
            onGameEnd(score);
            return;
        }
        setCurrentIndex(prev => prev + 1);
    };

    // ============================
    // Render de vidas ❤️
    // ============================
    const renderLives = () => {
        return Array.from({ length: 3 }).map((_, i) => (
            <motion.span
                key={i}
                animate={{ scale: i < lives ? 1 : 0.8, opacity: i < lives ? 1 : 0.3 }}
                className={`text-2xl drop-shadow-md ${i < lives ? 'grayscale-0' : 'grayscale'}`}
            >
                ❤️
            </motion.span>
        ));
    };

    return (
        <div className="min-h-screen w-full bg-[#0a192f] flex items-center justify-center p-4 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-5xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            >

                {/* HEADER */}
                <header className="bg-white">
                    <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 p-6 text-center border-b-4 border-blue-800">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-widest uppercase drop-shadow-md">
                            Campo de Conocimiento
                        </h1>
                        <p className="text-blue-100 font-medium mt-2 text-lg">
                            Conocimientos generales sobre la diabetes
                        </p>
                    </div>

                    <div className="bg-[#0f2a4d] text-blue-50 p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-white/10 shadow-inner">

                        {/* Jugador */}
                        <div className="flex items-center gap-2 text-lg">
                            <i className="bi bi-person-circle text-2xl text-cyan-400"></i>
                            <span>Jugador: <span className="font-bold text-white">{playerName}</span></span>
                        </div>

                        {/* 🔥 Racha */}
                        <div className="flex items-center gap-2">
                            <span className="text-blue-200">Racha:</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider
                                ${isStreakActive ? 'bg-orange-500' : 'bg-gray-500'} text-white shadow-sm`}
                            >
                                {streak} {isStreakActive && "🔥"}
                            </span>
                        </div>

                        {/* Puntaje */}
                        <div className="flex items-center gap-2 bg-blue-900/50 px-4 py-1 rounded-lg border border-blue-700">
                            <span>🏆 Puntaje:</span>
                            <span className="font-bold text-yellow-400 text-xl">{score}</span>
                        </div>

                        {/* Vidas */}
                        <div className="flex items-center gap-3">
                            <span className="text-blue-200">Vidas:</span>
                            <div className="flex gap-1">{renderLives()}</div>
                        </div>

                        {/* Contador de preguntas */}
                        <div className="text-sm text-blue-300 font-mono bg-black/20 px-3 py-1 rounded">
                            Pregunta {displayQuestionCount} / {totalQuestions}
                        </div>
                    </div>
                </header>

                {/* MAIN CONTENT */}
                <main className="flex-grow bg-blue-50 p-6 md:p-12 min-h-[450px] flex flex-col justify-center items-center relative">

                    {/* Loading */}
                    {isLoading && (
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-blue-800 font-semibold text-xl animate-pulse">Cargando Preguntas...</p>
                        </div>
                    )}

                    {/* Pregunta */}
                    {!isLoading && currentQuestion && !showFeedback && (
                        <div className="w-full max-w-3xl">
                            <Question
                                key={currentQuestion.question}
                                questionData={currentQuestion}
                                onAnswerSubmit={handleAnswer}
                            />
                        </div>
                    )}
                    <AnimatePresence>
                        {showFeedback && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                                <FeedbackModal
                                    isCorrect={isCorrect}
                                    correctAnswer={correctAnswer}
                                    feedback={feedbackInfo}
                                    onNext={handleNextQuestion}
                                />
                            </div>
                        )}
                    </AnimatePresence>

                </main>
            </motion.div>
        </div>
    );
}
 
export default JuegoP;