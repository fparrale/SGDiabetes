import { motion } from 'framer-motion';

function FeedbackModal({ isCorrect, correctAnswer, feedback, onNext }) {
    
    // Configuración de colores/iconos según si acertó o no
    const theme = isCorrect ? {
        container: "bg-green-100 border-green-300 text-green-900",
        button: "bg-green-600 hover:bg-green-700 shadow-green-500/40",
        icon: "bi-check-circle-fill text-green-600",
        title: "¡Correcto!",
    } : {
        container: "bg-red-100 border-red-300 text-red-900",
        button: "bg-red-600 hover:bg-red-700 shadow-red-500/40",
        icon: "bi-x-circle-fill text-red-600",
        title: "Incorrecto",
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`w-full max-w-2xl mx-3 md:mx-4 rounded-xl md:rounded-2xl border-2 md:border-4 shadow-xl md:shadow-2xl flex flex-col overflow-hidden max-h-[80vh] md:max-h-[85vh] ${theme.container}`}
        >
            
            {/* --- CABECERA --- */}
            <div className="flex flex-col items-center py-3 px-4 md:pt-8 md:pb-2 md:px-8 shrink-0">
                <div className="mb-1">
                    <i className={`bi ${theme.icon} text-4xl md:text-6xl drop-shadow-sm`}></i>
                </div>
                <h2 className="text-xl md:text-3xl font-extrabold uppercase tracking-wide">
                    {theme.title}
                </h2>
            </div>

            {/* --- CUERPO ---*/}
            <div className="flex-1 overflow-y-auto px-4 py-1 md:py-2 md:px-8 w-full text-center scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                
                {!isCorrect && (
                    <div className="bg-white/60 border border-red-200 p-2 md:p-3 rounded-lg md:rounded-xl mb-3 md:mb-4 w-full shadow-sm backdrop-blur-sm">
                        <p className="text-xs md:text-sm uppercase font-bold text-red-800 mb-1">
                            La respuesta correcta era:
                        </p>
                        <p className="text-base md:text-xl font-bold text-red-900 leading-tight">
                            {correctAnswer}
                        </p>
                    </div>
                )}

                <p className="text-base md:text-lg font-medium leading-snug md:leading-relaxed">
                    {feedback}
                </p>
            </div>

            {/* --- PIE --- */}
            <div className="p-4 md:p-8 pt-2 md:pt-4 flex justify-center shrink-0 bg-gradient-to-t from-inherit to-transparent z-10">
                <motion.button 
                    onClick={onNext}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`py-2 px-8 md:py-3 md:px-10 text-base md:text-lg font-bold rounded-full shadow-md md:shadow-lg transition-all duration-200 flex items-center gap-2 ${theme.button}`}
                >
                    Siguiente
                    <i className="bi bi-arrow-right-circle-fill"></i>
                </motion.button>
            </div>

        </motion.div>
    );
}

export default FeedbackModal;