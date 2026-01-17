import React, { useState } from "react";
import Bienvenida from "./components/Bienvenida"; 
import JuegoP from "./components/JuegoP";       
import ResultadoJ from "./components/ResultadoJ"; 
import TutorP from "./components/TutorP";
import Fondo from "./assets/Fondo.png";

function App() {
    const [pantalla, setPantalla] = useState("inicio");
    const [nombreJugador, setNombreJugador] = useState("");
    const [puntajeFinal, setPuntajeFinal] = useState(0);

    const bgImagen = {
        backgroundImage: `url(${Fondo})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "bottom",
        backgroundSize: "cover",
        position: "relative",
    };

    const manejarInicio = (nombre) => {
        setNombreJugador(nombre);
        setPantalla("juego");
    };

    const manejarFin = (puntaje) => {
        setPuntajeFinal(puntaje);
        setPantalla("final");
    };

    const reiniciar = () => {
        setPuntajeFinal(0);
        setPantalla("juego");
    };

    const manejarSalida = () => {
        setNombreJugador(""); 
        setPuntajeFinal(0);
        setPantalla("inicio");
    };
    
    const manejarLoginMaestro = () => {
        setPantalla("tutor");
    };

    return (
        <div
            style={pantalla === "inicio" ? bgImagen : {}}
            className="flex justify-center overflow-hidden min-h-screen font-sans"
        >
            
            {/* --- PANTALLA 1: BIENVENIDA (Login) --- */}
            {pantalla === "inicio" && (
                <Bienvenida 
                    onStartGame={manejarInicio}
                    onLoginMaestro={manejarLoginMaestro}
                />
            )}

            {/* --- PANTALLA 2: JUEGO (Tablero) --- */}
            {pantalla === "juego" && (
                <div className="w-full">
                    <JuegoP 
                        playerName={nombreJugador} 
                        onGameEnd={manejarFin} 
                    />
                </div>
            )}

            {/* --- PANTALLA 3: RESULTADO --- */}
            {pantalla === "final" && (
                <div className="w-full">
                    <ResultadoJ 
                        score={puntajeFinal} 
                        playerName={nombreJugador} 
                        onPlayAgain={reiniciar} 
                        onExit={manejarSalida}
                    />
                </div>
            )}

            {/* --- PANTALLA 4: PANEL TUTOR --- */}
            {pantalla === "tutor" && (
                <div className="w-full">
                    <TutorP onLogout={manejarSalida} />
                </div>
            )}

        </div>
    );
}

export default App;
