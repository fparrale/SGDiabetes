import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function ResultadoJ({ score, playerName, onPlayAgain, onExit }) {
    const [ranking, setRanking] = useState([]);

    // ============================
    // Obtener Ranking desde backend
    // ============================
    useEffect(() => {
        fetch("http://localhost:8000/getRanking.php")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setRanking(data);
                } else {
                    console.error("El formato de datos no es un array:", data);
                }
            })
            .catch((err) => console.error("ERROR ranking:", err));
    }, []);

    const getFeedbackMessage = () => {
        if (score >= 120) return "¡Eres un experto en diabetes!";
        if (score >= 70) return "¡Buen trabajo! Tienes buenos conocimientos.";
        return "¡Buen intento! Sigue aprendiendo para mejorar.";
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, x: 50 },
        show: { opacity: 1, x: 0 }
    };

    const getInitials = (name) => {
        if (!name) return "??";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    // ============================
    // Formatear tiempo (segundos → mm:ss)
    // ============================
    const formatTime = (seconds) => {
        if (seconds === null || seconds === undefined) return "--:--";
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, "0")}`;
    };

    return (
        <div className="min-h-screen w-full bg-[#0a192f] flex items-center justify-center p-4 font-sans">

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-6"
            >

                {/* ==============================
                   COLUMNA IZQUIERDA - Resultados
                ===============================*/}
                <div className="flex flex-col items-center text-center">

                    <h2 className="text-4xl md:text-5xl font-black text-[#0f2a4d] mb-2 uppercase">
                        ¡Juego Terminado!
                    </h2>

                    <p className="text-lg text-gray-600 mb-6">
                        {getFeedbackMessage()} <br />
                        <span className="font-semibold text-blue-600">{playerName}</span>
                    </p>

                    {/* PUNTAJE */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                        className="bg-white p-10 rounded-3xl shadow-xl border-4 border-blue-100 mb-10 relative overflow-hidden w-full max-w-xs"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-cyan-300"></div>

                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
                            Puntaje Final
                        </p>

                        <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-cyan-500">
                            {score}
                        </div>

                        <div className="flex justify-center gap-2 mt-4 text-yellow-400 text-2xl">
                            <i className="bi bi-star-fill"></i>
                            <i className="bi bi-star-fill"></i>
                            <i className="bi bi-star-fill"></i>
                        </div>
                    </motion.div>

                    {/* BOTONES */}
                    <motion.button
                        onClick={onPlayAgain}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-[#0a1f3a] hover:bg-[#1e4a7d] text-white font-bold py-4 px-10 rounded-xl shadow-lg border-2 border-[#58c4f5] transition-all mb-4"
                    >
                        <i className="bi bi-arrow-counterclockwise text-xl mr-2"></i>
                        Jugar de Nuevo
                    </motion.button>

                    <motion.button
                        onClick={onExit}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl shadow-md border-2 border-red-300 transition-all"
                    >
                        <i className="bi bi-door-open-fill text-xl mr-2"></i>
                        Salir
                    </motion.button>
                </div>

                {/* ============================
                   COLUMNA DERECHA - Ranking
                ============================ */}
                <div className="bg-[#0f1b36] rounded-xl shadow-xl p-6 max-h-[550px] overflow-y-auto 
                    scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-blue-900">

                    <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-center gap-2">
                        🏆 TOP 10 PUNTAJES
                    </h3>

                    <motion.ul
                        key={ranking.length}
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="flex flex-col gap-3"
                    >
                        {ranking.length === 0 ? (
                            <p className="text-gray-400 text-center mt-10">Cargando puntajes...</p>
                        ) : (
                            ranking.slice(0, 10).map((player, index) => {
                                const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
                                const isCurrent = player.nombre_jugador === playerName;

                                return (
                                    <motion.li
                                        key={index}
                                        variants={item}
                                        className="flex items-center gap-3 p-3 rounded-lg shadow-md"
                                        style={{
                                            backgroundColor: isCurrent
                                                ? "rgba(59,130,246,0.25)"
                                                : "#0a1a33",
                                            borderLeft: `6px solid ${
                                                medalColors[index] || "transparent"
                                            }`
                                        }}
                                    >
                                        {/* POSICIÓN */}
                                        <span className="text-white font-bold w-6 text-center">
                                            {index + 1}.
                                        </span>

                                        {/* AVATAR */}
                                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                                            {getInitials(player.nombre_jugador)}
                                        </div>

                                        {/* NOMBRE */}
                                        <span className="text-white font-semibold flex-1 text-sm md:text-base truncate">
                                            {player.nombre_jugador || "Anónimo"}
                                        </span>

                                        {/* PUNTAJE + TIEMPO */}
                                        <div className="flex flex-col items-end">
                                            <span className="text-cyan-300 font-bold text-lg">
                                                {player.puntaje}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                ⏱ {formatTime(player.tiempo_total)}
                                            </span>
                                        </div>
                                    </motion.li>
                                );
                            })
                        )}
                    </motion.ul>
                </div>

            </motion.div>
        </div>
    );
}

export default ResultadoJ;
