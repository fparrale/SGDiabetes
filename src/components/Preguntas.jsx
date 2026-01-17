import { motion } from 'framer-motion'; 

function Question({ questionData, onAnswerSubmit }) {
  
  if (!questionData) {
    return (
        <div className="flex justify-center items-center p-10">
            <p className="text-gray-500 text-lg animate-pulse"></p>
        </div>
    );
  }

  return (
    // --- CONTENEDOR PRINCIPAL ---
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-4xl mx-auto mx-2 md:mx-auto bg-gradient-to-br from-white to-green-50 border-2 border-green-200 border-t-4 border-t-green-500 rounded-xl p-4 md:p-10 shadow-xl"
    >
      
      {/* --- TÍTULO DE LA PREGUNTA --- */}
      <div className="mb-4 md:mb-8 flex items-start gap-3 md:gap-4">
        <span className="text-2xl md:text-4xl filter drop-shadow-sm select-none pt-1">
            ❓
        </span> 
        <h2 className="text-xl md:text-3xl font-bold text-green-900 leading-tight">
          {questionData.question}
        </h2>
      </div>
      
      {/* --- GRILLA DE OPCIONES --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
        {questionData.options.map((option, index) => (
          <motion.button 
            key={index}
            onClick={() => onAnswerSubmit(option)}
            whileHover={{ scale: 1.02, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group w-full flex items-center gap-3 md:gap-4 p-3 md:p-5 text-left bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-green-500 hover:bg-green-50 transition-all duration-200"
          >
            <span className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-gray-300 bg-gray-50 group-hover:border-green-500 group-hover:bg-green-200 transition-colors duration-200"></span>
            <span className="text-base md:text-lg font-medium text-gray-700 group-hover:text-green-900 leading-snug">
                {option}
            </span>
          </motion.button>
        ))}
      </div>

    </motion.div>
  );
}

export default Question;