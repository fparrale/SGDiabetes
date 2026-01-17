import { useState, useRef } from "react";
import Personaje from "../assets/Personaje.png";
import Logo from "../assets/Logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { slideUp, slideInFromSide } from "../utility/animation";

const CardWrapper = ({ children, className, variants = slideUp(0.3) }) => (
  <motion.div
    variants={variants}
    initial="initial"
    animate="animate"
    className={`p-8 rounded-3xl shadow-2xl max-w-md w-full ${className}`}
  >
    {children}
  </motion.div>
);

const PrimaryButton = ({ children, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`w-full font-bold py-3 rounded-lg mb-3 text-white ${className}`}
  >
    {children}
  </button>
);

const SecondaryButton = ({ children, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`w-full font-bold py-3 rounded-lg ${className}`}
  >
    {children}
  </button>
);

const InputField = ({ value, onChange, placeholder, type = "text", className = "", inputRef }) => (
  <input
    ref={inputRef}
    type={type}
    placeholder={placeholder}
    onChange={onChange}
    maxLength={type === "text" ? 50 : undefined}
    className={`w-full px-4 py-3 rounded-lg border focus:outline-none ${className}`}
  />
);

// Componente para Errores (Rojo)
const ErrorMessage = ({ msg }) => (
  <AnimatePresence>
    {msg && (
      <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="text-white text-sm font-semibold bg-red-600/40 p-2 rounded text-center"
      >
        {msg}
      </motion.p>
    )}
  </AnimatePresence>
);

// -----------------------
// VALIDACIÓN
// -----------------------
const validarNombre = (nombre) => {
  if (!nombre.trim()) return "Por favor, ingresa tu nombre y apellido.";
  const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
  if (!soloLetras.test(nombre)) return "Por favor solo ingrese letras y espacios.";
  if (nombre.trim().split(/\s+/).length < 2) return "Por favor, ingresa el apellido también.";
  return "";
};

// -----------------------
// COMPONENTE PRINCIPAL
// -----------------------
const Bienvenida = ({ onStartGame, onLoginMaestro }) => {
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const [rol, setRol] = useState("");
  const [maestro, setMaestro] = useState({
    acceso: false,
    password: "",
    error: "",
  });

  // -----------------------
  // HANDLERS
  // -----------------------
  const handleInputChange = (e) => {
    const valor = e.target.value;
    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
    if (soloLetras.test(valor)) {
      setNombre(valor);
      if (error) setError("");
    }
  };

  const handleIniciar = () => {
    const errorMsg = validarNombre(nombre);
    if (errorMsg) return setError(errorMsg);
    setError("");
    onStartGame(nombre);
  };

const validarPassword = () => {
    if (maestro.password === '2026') {
      setMaestro({ ...maestro, error: null });
      onLoginMaestro();
    } else {
      setMaestro({ ...maestro, error: 'Contraseña no válida. Inténtelo otra vez.'});
    }
  };

  const handleChange = (e) => {
    setMaestro({ ...maestro, [e.target.name]: e.target.value, error: null }); 
  };

  // -----------------------
  // RENDER
  // -----------------------
  return (
    <section className="flex justify-center mt-36 md:mt-20">
      <div className="grid grid-cols-1 md:grid-cols-2 items-center">
        {/* LADO IZQUIERDO */}
        <div className="p-10 sm:p-10 md:p-15 lg:p-30 xl:p-36 flex flex-col justify-center">
          <motion.img
            variants={slideUp(0.2)}
            initial="initial"
            animate="animate"
            src={Logo}
            alt="logo del Juego"
            className="w-full max-w-sm mb-6"
          />

          {/* Selección de rol */}
          {!rol && (
            <CardWrapper className="bg-[#4F749E] bg-opacity-90 border-4 border-[#91BFF0]">
              <p className="text-white text-lg mb-6 font-medium">Selecciona tu rol para continuar:</p>
              <PrimaryButton onClick={() => setRol("estudiante")} className="bg-[#3B73EB] hover:bg-[#3B4DBB]">
                Estudiante
              </PrimaryButton>
              <PrimaryButton onClick={() => setRol("maestro")} className="bg-[#2DC2B8] hover:bg-[#6CC4B1]">
                Maestro
              </PrimaryButton>
            </CardWrapper>
          )}

          {/* Estudiante */}
          {rol === "estudiante" && (
            <CardWrapper className="bg-[#3EA4FF] bg-opacity-90 border-4 border-[#3EB5FF]">
              <p className="text-white text-lg mb-6 font-medium">
               ¡Bienvenido, estudiante! Ingresa tus datos para comenzar.
              </p>

              <InputField
                value={nombre}
                onChange={handleInputChange}
                placeholder="Nombre y Apellido"
                className="bg-[#4F749E] text-white placeholder-gray-200 border border-[#A3C9A8] mb-1"
              />

              <div className="min-h-[2rem] mb-2">
                <ErrorMessage msg={error} />
              </div>

              <PrimaryButton onClick={handleIniciar} className="bg-[#285DFA] hover:bg-[#435DFA] mb-3">
                INICIAR JUEGO
              </PrimaryButton>

              <SecondaryButton
                onClick={() => { setRol(""); setNombre(""); setError(""); }}
                className="bg-[#CCE9E7] hover:bg-[#A7D7D3] text-[#1A3A4A]"
              >
                Regresar
              </SecondaryButton>
            </CardWrapper>
          )}

          {/* Maestro - Login */}
            {rol === "maestro" && !maestro.acceso && (
            <CardWrapper className="bg-[#2892FA] bg-opacity-90 border-4 border-[#0974FF] min-h-[250px] p-6 flex flex-col justify-center items-center">
              <p className="text-white text-lg mb-6 font-medium">Ingrese la contraseña:</p>
              
              <InputField
                type="password"
                placeholder="Contraseña"
                value={maestro.password}
                onChange={(e) =>
                  setMaestro({ ...maestro, password: e.target.value, error: "" }) 
                }
                className="bg-[#356587] text-white mb-2 w-full"
              />

                <div className="min-h-[2rem] mb-2">
                <ErrorMessage msg={maestro.error} />
                </div>

              <PrimaryButton 
                onClick={validarPassword} 
                className="bg-[#4F8F6D] hover:bg-[#3E6F55] w-full" 
              >
                Entrar
              </PrimaryButton>

              <SecondaryButton
                onClick={() => {
                  setRol("");
                  setMaestro({ ...maestro, password: "", error: "" }); 
                }}
                className="bg-[#4DBDE3] hover:bg-[#5E9AEB] text-white w-full"
              >
                Regresar
              </SecondaryButton>
            </CardWrapper>
          )}

          {/* Maestro - Panel Principal */}
          {rol === "maestro" && maestro.acceso && panelMaestro}
        </div>

        {/* LADO DERECHO */}
        <motion.div
          variants={slideInFromSide("right", 0.5)}
          initial="initial"
          animate="animate"
          className="p-10 sm:p-10 md:p-15 lg:p-30 xl:p-36 flex justify-center"
        >
          <img
            src={Personaje}
            alt="Personaje del juego"
            className="max-h-[500px] object-contain"
          />
        </motion.div>
        </div>
    </section>
  );
};

export default Bienvenida;