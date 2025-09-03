import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Client } from "@gradio/client";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.static(__dirname)); // Para servir archivos como el HTML

// 🔧 Función profesional para mejorar prompts - SIEMPRE mejora cualquier prompt
function mejorarPrompt(promptUsuario) {
  // Si el prompt está vacío, retorna mensaje básico
  if (!promptUsuario || promptUsuario.trim() === '') {
    return "imagen artística de alta calidad";
  }

  // Detectar elementos clave en el prompt original
  const elementos = analizarPrompt(promptUsuario);
  
  // SIEMPRE expandir detalles, sin importar el contenido
  const promptMejorado = expandirDetalles(promptUsuario, elementos);
  
  return promptMejorado;
}

// 🔍 Función para analizar el contenido del prompt original
function analizarPrompt(prompt) {
  const texto = prompt.toLowerCase();
  
  return {
    tienePersonajes: /personaje|character|persona|figura|héroe|protagonista|hombre|mujer|niño|niña|gente|people/.test(texto),
    tieneEstilo: /estilo|style|arte|artistic|diseño|design|realista|cartoon|anime/.test(texto),
    tieneEscena: /fondo|background|escena|ambiente|entorno|lugar|casa|ciudad|bosque|playa/.test(texto),
    tieneColores: /color|bright|oscuro|vivid|palette|tono|rojo|azul|verde|amarillo/.test(texto),
    tieneCalidad: /calidad|quality|resolución|hd|4k|alta|detalle/.test(texto),
    tieneTexto: /texto|text|letras|palabras|título|escribir|diga|dice|que diga/.test(texto),
    esAnimado: /animad|cartoon|anime|dibujo|ilustración|caricatura/.test(texto),
    esObjeto: /objeto|cosa|elemento|item|producto/.test(texto),
    esAnimal: /animal|perro|gato|león|pájaro|pez|mascota/.test(texto),
    esLugar: /lugar|sitio|ubicación|paisaje|montaña|mar|río/.test(texto),
    esTarjeta: /tarjeta|invitacion|invitación|card|invitation/.test(texto),
    esDeporte: /f1|formula|futbol|basketball|deporte|racing|carrera|auto|carro/.test(texto),
    tieneNombre: /juan|david|maria|carlos|sofia|nombre|que diga/.test(texto)
  };
}

// ✨ Función para expandir detalles - SIEMPRE agrega mejoras
function expandirDetalles(promptOriginal, elementos) {
  let mejoras = [];
  
  // Mejoras específicas para tarjetas de invitación
  if (elementos.esTarjeta) {
    mejoras.push("diseño festivo y atractivo para invitación");
    if (elementos.tieneNombre || elementos.tieneTexto) {
      mejoras.push("con tipografía clara y legible destacando el nombre");
    }
  }
  
  // Mejoras específicas para deportes/F1
  if (elementos.esDeporte) {
    mejoras.push("con elementos temáticos deportivos y colores vibrantes");
    mejoras.push("diseño dinámico y energético");
  }
  
  // Mejoras específicas según el contenido detectado
  if (elementos.tienePersonajes) {
    mejoras.push("con detalles faciales expresivos y proporciones bien definidas");
  }
  
  if (elementos.tieneEstilo || elementos.esAnimado) {
    mejoras.push("con líneas suaves y sombreado profesional");
  }
  
  if (elementos.tieneEscena || elementos.esLugar) {
    mejoras.push("con elementos de profundidad y composición equilibrada");
  }
  
  if (elementos.tieneColores) {
    mejoras.push("con paleta cromática armoniosa y contrastes apropiados");
  }
  
  if (elementos.esAnimal) {
    mejoras.push("con características anatómicas realistas y expresión natural");
  }
  
  if (elementos.esObjeto) {
    mejoras.push("con texturas detalladas y iluminación realista");
  }
  
  if (elementos.tieneTexto && !elementos.esTarjeta) {
    mejoras.push("con tipografía legible y bien integrada en la composición");
  }
  
  // MEJORAS UNIVERSALES que se aplican SIEMPRE
  if (mejoras.length === 0) {
    // Si no se detectó nada específico, agregar mejoras generales
    mejoras.push("con alta calidad visual y detalles nítidos");
    mejoras.push("con composición profesional y iluminación equilibrada");
  }
  
  // Agregar mejoras técnicas universales
  mejoras.push("renderizado en alta resolución");
  mejoras.push("estilo artístico refinado");
  
  // SIEMPRE retornar el prompt mejorado
  return `${promptOriginal}, ${mejoras.join(', ')}.`;
}

// 🎯 Función específica para el ejemplo de tarjeta de cumpleaños
function mejorarPromptCumpleanos(promptUsuario) {
  const base = `Tarjeta de invitación animada para fiesta. Personaje estilo ${promptUsuario}`;
  
  const mejoras = [
    "con expresión alegre y gestos celebratorios",
    "fondo colorido con elementos festivos como globos y confeti", 
    "estilo infantil con colores vibrantes y formas suaves",
    "texto 'Feliz cumpleaños Juan' con tipografía festiva y legible",
    "composición equilibrada en alta calidad",
    "estilo cartoon con líneas definidas y sombreado suave",
    "iluminación cálida que resalte los elementos principales"
  ].join(', ');
  
  return `${base}, ${mejoras}.`;
}

// 🏠 HTML principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 🧠 Endpoint de generación de imagen
app.post("/api/generate", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Falta el prompt" });

  console.log("🟡 Prompt recibido:", prompt);
  const promptMejorado = mejorarPrompt(prompt);
  console.log("🟢 Prompt mejorado:", promptMejorado);

  try {
    const client = await Client.connect("black-forest-labs/FLUX.1-schnell");

    const result = await client.predict("/infer", {
      prompt: promptMejorado,
      seed: 0,
      randomize_seed: true,
      width: 512,
      height: 512,
      num_inference_steps: 4,
    });

    console.log("✅ Imagen generada:", result.data[0]);
    res.json({ output: [result.data[0]] });

  } catch (error) {
    console.error("❌ Error al generar imagen:", error);
    res.status(500).json({ error: "No se pudo generar imagen desde HF Space" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});