import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import Fondo from "../assets/Fondo.png";
// 1. IMPORTAMOS RECHARTS PARA LOS GRÁFICOS
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

const TutorP = ({ onLogout }) => {
  
  const [vista, setVista] = useState("preguntas"); 

  const [preguntasIA, setPreguntasIA] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState({});
  const [loadingIA, setLoadingIA] = useState(false);

  const [estadisticas, setEstadisticas] = useState({ topErrores: [], topAciertos: [] });
  const [loadingStats, setLoadingStats] = useState(false);

  // 2. ESTADO PARA CONTROLAR EL MODAL DE DETALLES
  const [preguntaDetalle, setPreguntaDetalle] = useState(null); // Guarda la pregunta seleccionada para ver el gráfico

  const [historial, setHistorial] = useState([]);

  // Excel
  const [file, setFile] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [successColor, setSuccessColor] = useState("text-green-600");
  
  const fileInputRef = useRef(null);

  /* ===============================
      HISTORIAL
  =============================== */
  const cargarHistorial = async () => {
    try {
      const res = await fetch("http://franklinparrales.es/SGDiabetesBackend/api/getHistory.php");
      const data = await res.json();
      setHistorial(data);
      setVista("historial");
    } catch {
      alert("Error al cargar historial");
    }
  };

/* ===============================
    ESTADÍSTICAS
=============================== */
const cargarEstadisticas = async () => {
  setLoadingStats(true);
  try {
      const res = await fetch("http://franklinparrales.es/SGDiabetesBackend/api/getStatistics.php"); 
      const data = await res.json();
      
      setEstadisticas(data);
      setVista("estadisticas");
  } catch (error) {
      console.error(error);
      alert("Error al cargar estadísticas. Revisa la consola.");
  } finally {
      setLoadingStats(false);
  }
};

/* ===============================
      GENERAR PREGUNTAS CON IA
  =============================== */
  const generarPreguntasIA = async () => {
  setLoadingIA(true);
  setPreguntasIA([]);
  setSeleccionadas({});

  try {
    const res = await fetch(
      "http://franklinparrales.es/SGDiabetesBackend/api/getQuestion.php?action=generar&cantidad=20"
    );
    const data = await res.json();
    setPreguntasIA(data);
    setVista("preguntas");
  } catch {
    alert("Error al generar preguntas con IA");
  } finally {
    setLoadingIA(false);
  }
};

const guardarSeleccionadas = async () => {
  const preguntasParaGuardar = preguntasIA.filter(
    (_, index) => seleccionadas[index]
  );

  if (preguntasParaGuardar.length === 0) {
    alert("Selecciona al menos una pregunta");
    return;
  }

  const res = await fetch("http://franklinparrales.es/SGDiabetesBackend/api/uploadQuestions.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ preguntas: preguntasParaGuardar, origen: "Gemini" }), 
  });

  const data = await res.json();
  alert(data.message);

  setPreguntasIA([]);
  setSeleccionadas({});
};

// **FUNCIÓN PARA VOLVER A LA VISTA DE PREGUNTAS Y LIMPIAR EL ESTADO DE SUBIDA**
  const volverAVistaPreguntas = () => {
    setVista("preguntas");
    setFile(null);
    setUploadError("");
    setUploadSuccess("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };


  /* ===============================
      EXCEL
  =============================== */
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setUploadError("");
    setUploadSuccess("");

    if (!selectedFile) return;

    const isXlsx =
      selectedFile.name.endsWith(".xlsx") ||
      selectedFile.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    if (!isXlsx) {
      setUploadError("Solo se permiten archivos .xlsx");
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
  };

  const subirArchivo = () => {
  if (!file) {
    setUploadError("Selecciona un archivo primero.");
    setTimeout(() => setUploadError(""), 3000);
    return;
  }

  setUploadError("");
  setUploadSuccess("");

  const reader = new FileReader();
  reader.onload = async (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    const preguntas = XLSX.utils.sheet_to_json(hoja);

    // 🔒 VALIDACIÓN DE ARCHIVO VACÍO
    if (!preguntas || preguntas.length === 0) {
      setUploadError("El archivo Excel está vacío.");
      setTimeout(() => setUploadError(""), 3000);
      return;
    }

    // 🔒 COLUMNAS OBLIGATORIAS
    const columnasObligatorias = [
      "pregunta",
      "opcion1",
      "opcion2",
      "opcion3",
      "opcion4",
      "correcta",
      "dificultad",
      "feedback_correct",
      "feedback_incorrect",
    ];

    const columnasExcel = Object.keys(preguntas[0]);
    const columnasFaltantes = columnasObligatorias.filter(
      (col) => !columnasExcel.includes(col)
    );

    if (columnasFaltantes.length > 0) {
      setUploadError(
        `El archivo no tiene las siguientes columnas obligatorias: ${columnasFaltantes.join(", ")}`
      );
      setTimeout(() => setUploadError(""), 3000);
      return;
    }

    // 🔒 VALIDAR CONTENIDO BÁSICO
    const preguntasInvalidas = preguntas.filter(
      (p) =>
        !p.pregunta ||
        !p.opcion1 ||
        !p.opcion2 ||
        !p.opcion3 ||
        !p.opcion4 ||
        !p.correcta
    );

    if (preguntasInvalidas.length > 0) {
      setUploadError(
        "El archivo contiene filas incompletas. Verifique que todas las preguntas estén completas."
      );
      setTimeout(() => setUploadError(""), 3000); 
      return;
    }

    try {
      const res = await fetch("http://franklinparrales.es/SGDiabetesBackend/api/uploadQuestions.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preguntas, origen: "Excel" }),
      });

      const data = await res.json();

      if (data.insertadas > 0 && data.duplicadas === 0) {
        setSuccessColor("text-green-600");
        setUploadSuccess("Preguntas cargadas correctamente.");

      } else if (data.insertadas === 0 && data.duplicadas > 0) {
        setSuccessColor("text-amber-600");
        setUploadSuccess("Todas las preguntas ya existían y fueron omitidas.");

      } else if (data.insertadas > 0 && data.duplicadas > 0) {
        setSuccessColor("text-amber-600");
        setUploadSuccess("Algunas preguntas ya existían y fueron omitidas, las demás se cargaron correctamente.");

      } else {
        setUploadError("El archivo no contiene preguntas válidas.");
        setTimeout(() => setUploadError(""), 3000);
        return; 
      }

      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setUploadSuccess(""), 3000);
    } catch {
      setUploadError("Error al subir archivo");
      setTimeout(() => setUploadError(""), 3000);
    }
  };

  reader.readAsArrayBuffer(file);
};

  /* ===============================
      RENDER
  =============================== */
  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4"
      style={{ backgroundImage: `url(${Fondo})` }}
    >
      <div className="w-full max-w-6xl bg-gray-100 rounded-xl shadow-2xl p-6 md:p-10">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Panel del Tutor
          </h1>
          <button 
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
          >
            Cerrar sesión
          </button>
        </div>

        {/* BOTONES SUPERIORES */}
        <div className="mt-6 flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex gap-3 flex-wrap">
            <button
            onClick={generarPreguntasIA}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg"
            >
            🤖 Generar 20 preguntas con IA
            </button>

            <button
              onClick={() => setVista("subir")}
              className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-lg"
            >
              📄 Subir un Excel
            </button>
          </div>

          <button
            onClick={() => setVista("menu_actividad")}
            className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-3 rounded-lg"
          >
            📊 Ver actividad de los estudiantes
          </button>
        </div>

        {/* CONTENIDO BLANCO */}
        <div className="mt-8 bg-white rounded-xl p-6 min-h-[300px] shadow-inner relative">

          {/* PREGUNTAS */}
          {vista === "preguntas" && (
            <>
                {loadingIA && <p className="italic">Generando preguntas...</p>}

                {preguntasIA.length === 0 && !loadingIA && (
                <p className="text-gray-500 italic">
                    Presiona el botón para generar preguntas con IA.
                </p>
                )}

                <div className="space-y-4">
                {preguntasIA.map((p, index) => (
                    <div
                    key={index}
                    className="border rounded-lg p-4 bg-gray-50"
                    >
                    <div className="flex items-start gap-3">
                        <input
                        type="checkbox"
                        checked={!!seleccionadas[index]}
                        onChange={() =>
                            setSeleccionadas({
                            ...seleccionadas,
                            [index]: !seleccionadas[index],
                            })
                        }
                        className="mt-1"
                        />

                        <div>
                        <p className="font-semibold">
                            {p.pregunta}
                        </p>
                        <ul className="list-disc ml-5 text-sm text-gray-700">
                            <li>{p.opcion1}</li>
                            <li>{p.opcion2}</li>
                            <li>{p.opcion3}</li>
                            <li>{p.opcion4}</li>
                        </ul>

                        <p className="text-xs mt-1">
                            <b>Dificultad:</b> {p.dificultad}
                        </p>
                        </div>
                    </div>
                    </div>
                ))}
                </div>

                {preguntasIA.length > 0 && (
                <button
                    onClick={guardarSeleccionadas}
                    className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
                >
                    💾 Guardar preguntas seleccionadas
                </button>
                )}
            </>
            )}

          {/* SUBIR EXCEL */}
          {vista === "subir" && (
            <div className="max-w-md">
              <h2 className="font-bold mb-4">Subir archivo</h2>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                className="mb-6 w-full" 
              />

              {/* MUESTRA ERRORES (ROJO) */}
              {uploadError && (
                <p className="text-red-600 font-bold mb-2 p-2 bg-red-100 rounded border border-red-400">
                  ⚠️ {uploadError}
                </p>
              )}

              {/* MUESTRA ÉXITO O ADVERTENCIAS (VERDE O AMARILLO) */}
              {uploadSuccess && (
                <p className={`${successColor} font-bold mb-2 p-2 bg-gray-50 rounded border`}>
                  {uploadSuccess}
                </p>
              )}

              {/* CONTENEDOR DE BOTONES */}
              <div className="flex gap-6 mt-4"> 
                <button
                  onClick={subirArchivo}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
                >
                  Subir archivo
                </button>
                
                {/* BOTÓN DE REGRESAR */}
                <button
                  onClick={volverAVistaPreguntas}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
                >
                  Regresar
                </button>
              </div>
            </div>
          )}

          {/* =======================================================
                NUEVO: MENÚ ACTIVIDAD
              ======================================================= */}
          {vista === "menu_actividad" && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
              <h2 className="text-xl font-bold mb-8 text-gray-700">Opciones de Actividad</h2>
              
              <div className="flex flex-col md:flex-row gap-6 mb-12">
                {/* Botón 1: Ver Historial */}
                <button
                  onClick={cargarHistorial}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-xl text-lg font-semibold shadow-md transition transform hover:scale-105"
                >
                  📜 Historial de Actividad
                </button>

                {/* Botón 2: Ver Aciertos/Errores */}
                <button
                  onClick={cargarEstadisticas}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 rounded-xl text-lg font-semibold shadow-md transition transform hover:scale-105"
                >
                  📈 Aciertos vs Errores
                </button>
              </div>

              {/* Botón 3: Regresar */}
              <div className="absolute bottom-6 right-6">
                <button
                    onClick={() => setVista("preguntas")}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg shadow-sm"
                >
                    ⬅ Regresar
                </button>
              </div>
            </div>
          )}

          {/* =======================================================
                MODIFICADO: VISTA ESTADÍSTICAS (LIMITADO A 10 Y GRÁFICO)
              ======================================================= */}
          {vista === "estadisticas" && (
            <div className="h-full relative">
              <h2 className="text-xl font-bold mb-6 text-gray-800 text-center">Estadísticas de Preguntas</h2>

              {loadingStats ? (
                <p className="text-center italic text-gray-500">Cargando datos...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* === COLUMNA 1: ERRORES === */}
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
                    <h3 className="text-lg font-bold text-red-700 mb-4 text-center border-b border-red-200 pb-2">
                      ❌ Preguntas más equivocadas
                    </h3>

                    {estadisticas.topErrores.length === 0 ? (
                      <p className="text-center text-gray-500 text-sm">No hay datos de errores aún.</p>
                    ) : (
                      <ul className="space-y-3">
                        {estadisticas.topErrores.slice(0, 10).map((item, idx) => (
                          <li 
                            key={idx} 
                            className="bg-white p-3 rounded shadow-sm border border-red-100 flex justify-between items-center gap-4"
                          >
                            <span className="text-gray-800 text-sm text-left flex-1">
                              {item.pregunta}
                            </span>
                            
                            {/* BOTÓN DETALLES (Sin mostrar el número) */}
                            <button 
                                onClick={() => setPreguntaDetalle({...item, tipo: 'error'})}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition shadow shrink-0"
                            >
                                📊 Ver Detalles
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* === COLUMNA 2: ACIERTOS === */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm">
                    <h3 className="text-lg font-bold text-green-700 mb-4 text-center border-b border-green-200 pb-2">
                      ✅ Preguntas con más aciertos
                    </h3>

                    {estadisticas.topAciertos.length === 0 ? (
                      <p className="text-center text-gray-500 text-sm">No hay datos de aciertos aún.</p>
                    ) : (
                      <ul className="space-y-3">
                        {estadisticas.topAciertos.slice(0, 10).map((item, idx) => (
                          <li 
                            key={idx} 
                            className="bg-white p-3 rounded shadow-sm border border-green-100 flex justify-between items-center gap-4"
                          >
                            <span className="text-gray-800 text-sm text-left flex-1">
                              {item.pregunta}
                            </span>
                            
                            {/* BOTÓN DETALLES (Nuevo para aciertos) */}
                            <button 
                                onClick={() => setPreguntaDetalle({...item, tipo: 'acierto'})}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition shadow shrink-0"
                            >
                                📊 Ver Detalles
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={() => setVista("menu_actividad")}
                className="mt-8 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                Volver al menú
              </button>

              {/* =====================================================
                   MODAL (POPUP) ACTUALIZADO
                 ===================================================== */}
              {preguntaDetalle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-6 relative animate-fade-in-up flex flex-col max-h-[90vh]">
                        {/* Botón cerrar X */}
                        <button 
                            onClick={() => setPreguntaDetalle(null)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl font-bold"
                        >
                            &times;
                        </button>

                        <h3 className={`text-xl font-bold mb-2 pr-8 ${preguntaDetalle.tipo === 'error' ? 'text-red-700' : 'text-green-700'}`}>
                            {preguntaDetalle.tipo === 'error' ? 'Detalle de Errores' : 'Detalle de Aciertos'}
                        </h3>
                        <p className="text-gray-600 mb-4 italic border-l-4 pl-3 border-gray-400">
                            "{preguntaDetalle.pregunta}"
                        </p>

                        {/* GRÁFICO */}
                        <div className="h-[250px] w-full shrink-0">
                            {preguntaDetalle.distribucion && preguntaDetalle.distribucion.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={preguntaDetalle.distribucion}
                                        margin={{ top: 10, right: 30, left: 0, bottom: 50 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis 
                                            dataKey="opcion" 
                                            interval={0} 
                                            angle={-15} 
                                            textAnchor="end" 
                                            tick={{fontSize: 11}} 
                                            height={60}
                                        />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip cursor={{fill: '#f3f4f6'}} />
                                        
                                        {/* barSize controla el grosor de la barra */}
                                        <Bar 
                                            dataKey="cantidad" 
                                            name="Cantidad" 
                                            radius={[4, 4, 0, 0]} 
                                            barSize={40}  
                                            fill={preguntaDetalle.tipo === 'error' ? '#ef4444' : '#22c55e'}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center bg-gray-50 rounded text-gray-400">
                                    No hay datos de gráfica disponibles.
                                </div>
                            )}
                        </div>

                        {/* LISTA DE NOMBRES */}
                        <div className="mt-4 flex-1 overflow-hidden flex flex-col">
                            <h4 className="font-bold text-gray-700 mb-2 text-sm uppercase tracking-wide">
                                {preguntaDetalle.tipo === 'error' 
                                    ? 'Jugadores que se equivocaron:' 
                                    : 'Jugadores que acertaron:'}
                            </h4>
                            
                            <div className="overflow-y-auto border rounded-lg bg-gray-50 p-3 flex-1">
                                {preguntaDetalle.jugadores && preguntaDetalle.jugadores.length > 0 ? (
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {preguntaDetalle.jugadores.map((nombre, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                                <span className={`w-2 h-2 rounded-full ${preguntaDetalle.tipo === 'error' ? 'bg-red-400' : 'bg-green-400'}`}></span>
                                                {nombre}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 italic text-sm">No se registraron nombres de jugadores.</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 text-right">
                            <button 
                                onClick={() => setPreguntaDetalle(null)}
                                className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded-lg text-sm"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
              )}

            </div>
          )}

          {/* HISTORIAL */}
          {vista === "historial" && (
            <>
              <h2 className="font-bold mb-4">Historial de estudiantes</h2>

              <div className="overflow-x-auto">
                <table className="w-full border">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="p-2">#</th>
                      <th className="p-2">Nombre</th>
                      <th className="p-2">Puntaje</th>
                      <th className="p-2">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center p-6 text-gray-500">
                          No hay registros
                        </td>
                      </tr>
                    ) : (
                      historial.map((h, i) => (
                        <tr key={i} className="border-t text-center">
                          <td className="p-2">{i + 1}</td>
                          <td className="p-2">{h.nombre_jugador}</td>
                          <td className="p-2">{h.puntaje}</td>
                          <td className="p-2">{h.jugado_en}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <button
                onClick={() => setVista("menu_actividad")} 
                className="mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
              >
                Salir
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorP;
