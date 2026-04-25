'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── PREGUNTAS ────────────────────────────────────────────────────────────────

type Question = {
  cat: string
  q: string
  opts: string[]
  ans: number
  exp: string
}

const ALL_QUESTIONS: Question[] = [
  // REGLAMENTARIAS
  { cat: 'Reglamentarias', q: '¿Qué debe hacer el conductor con taxímetro durante el turno oficialmente aceptado?', opts: ['Estacionar donde quiera esperando llamadas', 'Circular o estacionar en lugares autorizados con bandera "LIBRE" levantada y descubierta, atento a pasajeros', 'Permanecer en la terminal hasta que lo llamen', 'Circular sin bandera hasta encontrar pasajero'], ans: 1, exp: 'El conductor con taxímetro debe estar activo: circular o estacionar en lugares habilitados con la bandera LIBRE visible para que los pasajeros puedan tomarlo.' },
  { cat: 'Reglamentarias', q: '¿En qué casos pueden subir perros a los vehículos de transporte de pasajeros?', opts: ['Nunca están permitidos los animales', 'Solo si el perro es pequeño y va en una bolsa', 'Solo cuando acompañen a pasajeros con discapacidad visual (perros guía)', 'Si el pasajero paga un extra por el animal'], ans: 2, exp: 'La única excepción para subir animales es cuando son perros guía que acompañan a pasajeros con discapacidad visual.' },
  { cat: 'Reglamentarias', q: '¿Cuándo se puede transportar equipaje o bultos en el vehículo destinado a transporte de pasajeros?', opts: ['Solo en el baúl, no en el habitáculo', 'Siempre que quepan en el asiento trasero', 'Solo cuando el dueño del equipaje se encuentre en el vehículo al mismo tiempo', 'No se permite ningún tipo de bulto'], ans: 2, exp: 'El equipaje puede transportarse únicamente cuando el pasajero dueño del mismo está en el vehículo. No se pueden hacer envíos sin el pasajero.' },

  // TERMINALES
  { cat: 'Terminales', q: '¿Cuáles son las vías más directas para llegar al Aeropuerto Internacional de Carrasco desde Montevideo?', opts: ['Ruta 1 y Ruta 5', 'Camino Carrasco y Av. Italia, o Anillo Perimetral', 'Bv. Artigas y Ruta 8', 'Av. 18 de Julio y Rambla'], ans: 1, exp: 'Las vías más directas al Aeropuerto de Carrasco son Camino Carrasco junto con Av. Italia, o bien el Anillo Perimetral.' },
  { cat: 'Terminales', q: '¿Dónde se ubica la Terminal 3 Cruces (ómnibus interdepartamentales)?', opts: ['Galicia y Río Branco', 'Yacaré y Rambla 25 de Agosto', 'Bv. Artigas y Salvador Ferrer Serra', '25 de Mayo y Maciel'], ans: 2, exp: 'La Terminal 3 Cruces, principal terminal de ómnibus interdepartamentales de Montevideo, se encuentra en Bv. Artigas y Salvador Ferrer Serra.' },
  { cat: 'Terminales', q: '¿Dónde se ubica la Terminal Río Branco (ómnibus interdepartamentales)?', opts: ['Galicia y Río Branco', 'Bv. Artigas y Salvador Ferrer Serra', 'Av. Italia y Las Heras', 'Camino Carrasco y Ruta 8'], ans: 0, exp: 'La Terminal Río Branco se encuentra en la esquina de Galicia y Río Branco.' },
  { cat: 'Terminales', q: '¿Dónde se encuentra el Puerto de Montevideo — Terminal de Pasajeros?', opts: ['25 de Mayo y Maciel', 'Yacaré y Rambla 25 de Agosto de 1825', 'Bv. Artigas y Francisco Canaro', 'Av. Italia y Las Heras'], ans: 1, exp: 'La Terminal de Pasajeros del Puerto de Montevideo está ubicada en Yacaré y Rambla 25 de Agosto de 1825.' },

  // HOSPITALES
  { cat: 'Hospitales', q: '¿En qué calles se encuentra el Hospital Italiano?', opts: ['Av. Italia y Las Heras', 'Jorge Canning y Bv. Artigas', 'Larravide y Asilo', 'Av. Millán y Santa Fé'], ans: 1, exp: 'El Hospital Italiano está en Jorge Canning esquina Bv. Artigas.' },
  { cat: 'Hospitales', q: '¿Dónde está ubicado el Hospital Español?', opts: ['Av. José Pedro Varela y Bv. Batlle', 'Av. Gral. Garibaldi y Pando', '25 de Mayo y Maciel', 'Jorge Canning y Bv. Artigas'], ans: 1, exp: 'El Hospital Español se encuentra en Av. Gral. Garibaldi esquina Pando.' },
  { cat: 'Hospitales', q: '¿En qué esquina está el Hospital de Clínicas?', opts: ['Bv. Artigas y Francisco Canaro', 'Av. Millán y Santa Fé', 'Av. Italia y Las Heras', 'Larravide y Morelli'], ans: 2, exp: 'El Hospital de Clínicas (dependiente de la UdelaR) está en Av. Italia y Las Heras.' },
  { cat: 'Hospitales', q: '¿Dónde se encuentra el Hospital Maciel?', opts: ['Cno. Colman y Guanahany', '25 de Mayo y Maciel', 'Sambucetti y Av. Gral. Garibaldi', 'Larravide y Asilo'], ans: 1, exp: 'El Hospital Maciel está en 25 de Mayo esquina Maciel, en el barrio Ciudad Vieja.' },
  { cat: 'Hospitales', q: '¿En qué calles está el Hospital Militar?', opts: ['Av. 8 de Octubre y Mariano Moreno', 'Bv. Artigas y Francisco Canaro', 'Av. Millán y Santa Fé', '25 de Mayo y Maciel'], ans: 0, exp: 'El Hospital Militar se ubica en Av. 8 de Octubre esquina Mariano Moreno.' },
  { cat: 'Hospitales', q: '¿Dónde se encuentra el Sanatorio Banco de Seguros?', opts: ['Larravide y Asilo', 'Av. Italia y Las Heras', 'Av. José Pedro Varela y Bv. Batlle y Ordóñez', 'Av. 8 de Octubre y Mariano Moreno'], ans: 2, exp: 'El Sanatorio Banco de Seguros (BSE) está en Av. José Pedro Varela esquina Bv. Batlle y Ordóñez.' },
  { cat: 'Hospitales', q: '¿En qué esquina está el Hospital Pasteur?', opts: ['Larravide y Asilo', 'Larravide y Morelli', 'Bv. Artigas y Francisco Canaro', 'Cno. Colman y Guanahany'], ans: 0, exp: 'El Hospital Pasteur se encuentra en Larravide y Asilo.' },
  { cat: 'Hospitales', q: '¿Dónde está el Hospital Piñeyro del Campo?', opts: ['Larravide y Asilo', 'Larravide y Morelli', 'Av. 8 de Octubre y Mariano Moreno', 'Jorge Canning y Bv. Artigas'], ans: 1, exp: 'El Hospital Piñeyro del Campo está en Larravide esquina Morelli. Es muy cercano al Pasteur — ambos en Larravide.' },
  { cat: 'Hospitales', q: '¿Dónde se ubica el Hospital Pereyra Rossell?', opts: ['Av. Millán y Santa Fé', 'Bv. Artigas y Francisco Canaro', 'Cno. Colman y Guanahany', 'Av. Italia y Las Heras'], ans: 1, exp: 'El Hospital Pereyra Rossell (pediátrico y maternidad) está en Bv. Artigas esquina Francisco Canaro.' },
  { cat: 'Hospitales', q: '¿En qué esquina está el Hospital Saint Bois?', opts: ['Av. 8 de Octubre y Mariano Moreno', 'Av. Millán y Santa Fé', 'Cno. Colman y Guanahany', 'Bv. Artigas y Francisco Canaro'], ans: 2, exp: 'El Hospital Saint Bois se encuentra en Cno. Colman y Guanahany, en la periferia norte de Montevideo.' },
  { cat: 'Hospitales', q: '¿Dónde se encuentra el Hospital Vilardebó?', opts: ['Av. Millán y Santa Fé', 'Larravide y Asilo', '25 de Mayo y Maciel', 'Bv. Batlle y Ordóñez y José Pedro Varela'], ans: 0, exp: 'El Hospital Vilardebó (salud mental) está en Av. Millán esquina Santa Fé.' },
  { cat: 'Hospitales', q: '¿En qué calles está el Hospital Policial?', opts: ['Cno. Colman y Guanahany', 'Av. Millán y Santa Fé', 'Bv. Batlle y Ordóñez y José Pedro Varela', 'Jorge Canning y Bv. Artigas'], ans: 2, exp: 'El Hospital Policial se encuentra en Bv. Batlle y Ordóñez esquina José Pedro Varela.' },

  // POLICÍA
  { cat: 'Policía', q: '¿Dónde se encuentra la Jefatura de Policía de Montevideo?', opts: ['San José y Yí', 'San José y Paraguay', '25 de Mayo y Maciel', 'Bv. Artigas y Cufré'], ans: 0, exp: 'La Jefatura de Policía de Montevideo está en San José y Yí.' },
  { cat: 'Policía', q: '¿En qué calles está la Comisaría de la Mujer?', opts: ['San José y Yí', 'San José y Paraguay', 'Paysandú y Yí', 'Miguelete e Inca'], ans: 1, exp: 'La Comisaría de la Mujer se encuentra en San José y Paraguay.' },
  { cat: 'Policía', q: '¿Dónde está la Comisaría de la Seccional 1ª?', opts: ['25 de Mayo y Pérez Castellano', 'Zelmar Michelini y Maldonado', 'Paysandú y Yí', 'Miguelete e Inca'], ans: 0, exp: 'La Seccional 1ª está en 25 de Mayo y Pérez Castellano, en Ciudad Vieja.' },
  { cat: 'Policía', q: '¿En qué esquina está la Comisaría de la Seccional 2ª?', opts: ['Paysandú y Yí', 'Zelmar Michelini y Maldonado', '25 de Mayo y Pérez Castellano', 'Joaquín de Salterain y Canelones'], ans: 1, exp: 'La Seccional 2ª se ubica en Zelmar Michelini y Maldonado.' },
  { cat: 'Policía', q: '¿Dónde se encuentra la Comisaría de la Seccional 3ª?', opts: ['Miguelete e Inca', 'Paysandú y Yí', '25 de Mayo y Pérez Castellano', 'Av. Agraciada y Coronel Tajes'], ans: 1, exp: 'La Seccional 3ª está en Paysandú y Yí.' },
  { cat: 'Policía', q: '¿En qué calles está la Comisaría de la Seccional 4ª?', opts: ['Paysandú y Yí', 'Joaquín de Salterain y Canelones', 'Miguelete e Inca', 'Félix Olmedo y Valentín Gómez'], ans: 2, exp: 'La Seccional 4ª se encuentra en Miguelete e Inca.' },
  { cat: 'Policía', q: '¿Dónde está la Comisaría de la Seccional 5ª?', opts: ['Av. Agraciada y Coronel Tajes', 'Miguelete e Inca', 'Joaquín de Salterain y Canelones', 'Av. Millán y Molinos de Raffo'], ans: 2, exp: 'La Seccional 5ª está en Joaquín de Salterain y Canelones.' },
  { cat: 'Policía', q: '¿En qué esquina está la Comisaría de la Seccional 6ª?', opts: ['Félix Olmedo y Valentín Gómez', 'Av. Agraciada y Coronel Tajes', 'Av. Millán y Molinos de Raffo', 'Sambucetti y Av. Gral. Garibaldi'], ans: 1, exp: 'La Seccional 6ª se ubica en Av. Agraciada y Coronel Tajes.' },
  { cat: 'Policía', q: '¿Dónde se encuentra la Comisaría de la Seccional 7ª?', opts: ['Av. Millán y Molinos de Raffo', 'Sambucetti y Av. Gral. Garibaldi', 'Félix Olmedo y Valentín Gómez', 'Gabriel Pereira y Libertad'], ans: 2, exp: 'La Seccional 7ª está en Félix Olmedo y Valentín Gómez.' },
  { cat: 'Policía', q: '¿En qué calles está la Comisaría de la Seccional 8ª?', opts: ['Sambucetti y Av. Gral. Garibaldi', 'Av. Millán y Molinos de Raffo', 'Gabriel Pereira y Libertad', 'Velsen y Santiago de Anca'], ans: 1, exp: 'La Seccional 8ª se encuentra en Av. Millán y Molinos de Raffo.' },
  { cat: 'Policía', q: '¿Dónde está la Comisaría de la Seccional 9ª?', opts: ['Gabriel Pereira y Libertad', 'Sambucetti y Av. Gral. Garibaldi', 'Av. Millán y Pierre Fossey', 'Bv. Artigas y Cufré'], ans: 1, exp: 'La Seccional 9ª está en Sambucetti y Av. Gral. Garibaldi.' },
  { cat: 'Policía', q: '¿En qué esquina está la Comisaría de la Seccional 10ª?', opts: ['Bv. Artigas y Cufré', 'Gabriel Pereira y Libertad', 'Av. Millán y Pierre Fossey', 'Velsen y Santiago de Anca'], ans: 1, exp: 'La Seccional 10ª se ubica en Gabriel Pereira y Libertad.' },
  { cat: 'Policía', q: '¿Dónde se encuentra la Comisaría de la Seccional 11ª?', opts: ['Av. Italia y Almirón', 'Velsen y Santiago de Anca', 'Av. 8 de octubre y Gobernador de Viana', 'Carreras Nacionales y Calamet'], ans: 1, exp: 'La Seccional 11ª está en Velsen y Santiago de Anca.' },
  { cat: 'Policía', q: '¿En qué calles está la Comisaría de la Seccional 12ª?', opts: ['Velsen y Santiago de Anca', 'Bv. Artigas y Cufré', 'Av. Millán y Pierre Fossey', 'Camino Maldonado y Roma'], ans: 2, exp: 'La Seccional 12ª se encuentra en Av. Millán y Pierre Fossey.' },
  { cat: 'Policía', q: '¿Dónde está la Comisaría de la Seccional 13ª?', opts: ['Carreras Nacionales y Calamet', 'Bv. Artigas y Cufré', 'Av. Italia y Almirón', 'Aparicio Saravia y Martirené'], ans: 1, exp: 'La Seccional 13ª está en Bv. Artigas y Cufré.' },
  { cat: 'Policía', q: '¿En qué esquina está la Comisaría de la Seccional 14ª?', opts: ['Av. 8 de octubre y Gobernador de Viana', 'Av. Italia y Almirón', 'Carreras Nacionales y Calamet', 'Giannino Castiglioni y Camino Repetto'], ans: 1, exp: 'La Seccional 14ª se ubica en Av. Italia y Almirón.' },
  { cat: 'Policía', q: '¿Dónde está la Comisaría de la Seccional 15ª?', opts: ['Carreras Nacionales y Calamet', 'Aparicio Saravia y Martirené', 'Av. 8 de octubre y Gobernador de Viana', 'Av. Luis Batlle Berres y La Balsa'], ans: 2, exp: 'La Seccional 15ª está en Av. 8 de octubre y Gobernador de Viana.' },
  { cat: 'Policía', q: '¿En qué calles está la Comisaría de la Seccional 16ª?', opts: ['Giannino Castiglioni y Camino Repetto', 'Carreras Nacionales y Calamet', 'Av. Luis Batlle Berres y La Balsa', 'Albérico Passadore y Plaza Vidiella'], ans: 1, exp: 'La Seccional 16ª se encuentra en Carreras Nacionales y Calamet.' },
  { cat: 'Policía', q: '¿Dónde está la Comisaría de la Seccional 17ª?', opts: ['Albérico Passadore y Plaza Vidiella', 'Aparicio Saravia y Martirené', 'Camino Melilla y Peabody', 'Av. Carlos María Ramírez y Carlos de la Vega'], ans: 1, exp: 'La Seccional 17ª está en Aparicio Saravia y Martirené.' },
  { cat: 'Policía', q: '¿En qué esquina está la Comisaría de la Seccional 18ª?', opts: ['Av. Luis Batlle Berres y La Balsa', 'Av. Carlos María Ramírez y Carlos de la Vega', 'Giannino Castiglioni y Camino Repetto', 'Camino Melilla y Peabody'], ans: 2, exp: 'La Seccional 18ª se ubica en Giannino Castiglioni y Camino Repetto.' },
  { cat: 'Policía', q: '¿Dónde está la Comisaría de la Seccional 19ª?', opts: ['Av. Luis Batlle Berres y La Balsa', 'Av. Carlos María Ramírez y Carlos de la Vega', 'Albérico Passadore y Plaza Vidiella', 'Prusia y Río de Janeiro'], ans: 1, exp: 'La Seccional 19ª está en Av. Carlos María Ramírez y Carlos de la Vega.' },
  { cat: 'Policía', q: '¿En qué calles está la Comisaría de la Seccional 20ª?', opts: ['Albérico Passadore y Plaza Vidiella', 'Av. Luis Batlle Berres y La Balsa', 'Camino Melilla y Peabody', 'Prusia y Río de Janeiro'], ans: 1, exp: 'La Seccional 20ª se encuentra en Av. Luis Batlle Berres y La Balsa.' },
  { cat: 'Policía', q: '¿Dónde está la Comisaría de la Seccional 21ª?', opts: ['Camino Melilla y Peabody', 'Prusia y Río de Janeiro', 'Albérico Passadore y Plaza Vidiella', 'Av. Luis Batlle Berres y Camino del Fortín'], ans: 2, exp: 'La Seccional 21ª está en Albérico Passadore y Plaza Vidiella.' },
  { cat: 'Policía', q: '¿En qué esquina está la Comisaría de la Seccional 22ª?', opts: ['Prusia y Río de Janeiro', 'Camino Melilla y Peabody', 'Av. Luis Batlle Berres y Camino del Fortín', 'Giannino Castiglioni y Camino Repetto'], ans: 1, exp: 'La Seccional 22ª se ubica en Camino Melilla y Peabody.' },
  { cat: 'Policía', q: '¿Dónde está la Comisaría de la Seccional 23ª?', opts: ['Prusia y Río de Janeiro', 'Av. Luis Batlle Berres y Camino del Fortín', 'Camino Melilla y Peabody', 'Albérico Passadore y Plaza Vidiella'], ans: 1, exp: 'La Seccional 23ª está en Av. Luis Batlle Berres y Camino del Fortín.' },
  { cat: 'Policía', q: '¿En qué calles está la Comisaría de la Seccional 24ª?', opts: ['Av. Luis Batlle Berres y Camino del Fortín', 'Camino Maldonado y Roma', 'Prusia y Río de Janeiro', 'Camino Melilla y Peabody'], ans: 2, exp: 'La Seccional 24ª se encuentra en Prusia y Río de Janeiro.' },
  { cat: 'Policía', q: '¿Dónde se encuentra la Policía Nacional de Tránsito?', opts: ['San José y Yí', 'Carreras Nacionales y Calamet', 'Camino Maldonado y Roma', 'Bv. Artigas y Cufré'], ans: 2, exp: 'La Policía Nacional de Tránsito tiene su sede en Camino Maldonado y Roma.' },

  // SEGURIDAD VIAL
  { cat: 'Seguridad vial', q: '¿Cuál es la tolerancia de alcohol en sangre para conductores profesionales?', opts: ['0.3 g/l (igual que para particulares)', '0.5 g/l', '0.8 g/l', 'Cero — tolerancia absoluta'], ans: 3, exp: 'Para conductores profesionales (categoría E incluida) la tolerancia es CERO. Cualquier valor positivo es infracción.' },
  { cat: 'Seguridad vial', q: '¿Qué mide la espirometría en el control de alcoholemia?', opts: ['Alcohol en sangre mediante extracción', 'Alcohol en el aire espirado a través del espirómetro', 'Nivel de glucosa en sangre', 'Capacidad pulmonar del conductor'], ans: 1, exp: 'La espirometría mide el alcohol presente en el aire espirado. Es un método no invasivo con un espirómetro.' },
  { cat: 'Seguridad vial', q: '¿Cuál es la sanción mínima para un conductor profesional que da positivo en alcohol por primera vez?', opts: ['Una multa económica sin suspensión', 'Suspensión inmediata de la licencia más multa, de 6 meses a 1 año', 'Solo un apercibimiento en el expediente', 'Multa y 30 días de suspensión'], ans: 1, exp: 'La sanción es la suspensión inmediata de la licencia y una multa. El período va de 6 meses a 1 año en la primera reincidencia.' },
  { cat: 'Seguridad vial', q: '¿Se puede acelerar la eliminación del alcohol del organismo tomando café o agua?', opts: ['Sí, el café estimula el hígado', 'Sí, el agua lo diluye y se elimina más rápido', 'No, el cuerpo lo procesa a su ritmo y no se puede acelerar', 'Sí, el ejercicio físico lo elimina más rápido'], ans: 2, exp: 'El alcohol se elimina solo a través del hígado, la orina, el sudor y los pulmones. No se puede acelerar el proceso.' },
  { cat: 'Seguridad vial', q: '¿Qué distancia mínima de separación lateral hay que dejar al adelantar a un ciclista?', opts: ['0.5 metros', '1 metro', '1.5 metros', '2 metros'], ans: 2, exp: 'Al adelantar a un ciclista se deben dejar al menos 1,5 metros de espacio lateral.' },
  { cat: 'Seguridad vial', q: '¿Cuándo tienen preferencia los vehículos de emergencia (ambulancias, bomberos)?', opts: ['Siempre, en cualquier circunstancia', 'Solo cuando usan señales sonoras', 'Solo cuando usan señales luminosas', 'Cuando usan señales SONORAS y LUMINOSAS al mismo tiempo'], ans: 3, exp: 'Los vehículos de emergencia tienen preferencia únicamente cuando usan señales sonoras Y luminosas al mismo tiempo.' },
  { cat: 'Seguridad vial', q: 'Al acercarse un vehículo de emergencia, ¿se puede detener el auto en una intersección?', opts: ['Sí, detenerse en la intersección para dejarle espacio', 'No, las intersecciones nunca deben bloquearse — acercarse al borde más próximo', 'Sí, si es la única opción disponible', 'Solo si hay semáforo en rojo'], ans: 1, exp: 'Las intersecciones nunca deben bloquearse. Hay que acercarse al borde más próximo sin bloquear cruces.' },
  { cat: 'Seguridad vial', q: '¿Qué hay que hacer al percibir animales sueltos en la vía?', opts: ['Tocar bocina para ahuyentarlos y seguir a velocidad normal', 'Esquivarlos rápidamente cambiando de carril', 'Disminuir la velocidad inmediatamente y estar atento, deteniéndose si es necesario', 'Solo prestar atención si es de noche'], ans: 2, exp: 'Ante animales sueltos hay que disminuir la velocidad de inmediato. Detenerse si la situación lo requiere.' },

  // MANTENIMIENTO
  { cat: 'Mantenimiento', q: '¿Qué indica la zona verde del tacómetro?', opts: ['Que el motor está sobrecalentado', 'El mayor rendimiento del motor — menor consumo y mejor empuje', 'Que hay que cambiar de marcha hacia abajo', 'Que se está al límite de velocidad'], ans: 1, exp: 'La zona verde indica el rango de RPM de mayor rendimiento: mejor empuje y menor consumo. Siempre conviene conducir en esa zona.' },
  { cat: 'Mantenimiento', q: '¿Qué indica la zona roja del tacómetro?', opts: ['Zona de máximo rendimiento', 'Zona segura de alta velocidad', 'Zona peligrosa donde el motor puede dañarse y el consumo sube mucho', 'Zona de ralentí correcto'], ans: 2, exp: 'La zona roja indica exceso de revoluciones. Puede dañar el motor y aumenta considerablemente el consumo.' },
  { cat: 'Mantenimiento', q: '¿Con el motor en qué estado se debe comprobar el nivel de aceite?', opts: ['Con el motor caliente y en marcha', 'Con el motor frío y el vehículo en llano', 'Con el motor recién apagado tras un viaje', 'No importa el estado del motor'], ans: 1, exp: 'El nivel de aceite debe comprobarse con el motor frío y el vehículo en llano, para obtener una lectura precisa.' },
  { cat: 'Mantenimiento', q: '¿Qué profundidad mínima deben tener las ranuras del neumático?', opts: ['0.8 mm', '1.6 mm', '2.5 mm', '3 mm'], ans: 1, exp: 'Las ranuras deben tener al menos 1,6 mm de profundidad. Por debajo de ese valor el neumático debe reemplazarse.' },
  { cat: 'Mantenimiento', q: '¿Qué pasa si la correa de cigüeñal se afloja o rompe?', opts: ['Solo afecta al sistema de frenos', 'Provoca el recalentamiento del motor', 'El vehículo queda sin dirección', 'Solo aumenta el consumo de combustible'], ans: 1, exp: 'La correa de cigüeñal mueve la bomba de agua. Si se rompe, el motor se recalienta (sobrecalentamiento).' },

  // ÓMNIBUS Y ESCOLAR
  { cat: 'Ómnibus y escolar', q: '¿Es obligatorio el uso de cinturón en vehículos de transporte colectivo en rutas nacionales?', opts: ['Solo para el conductor', 'Solo para el conductor y los pasajeros del primer asiento', 'Para todos los pasajeros sentados y el conductor', 'No es obligatorio en ómnibus'], ans: 2, exp: 'En servicios de mediana y larga distancia o rutas nacionales, el cinturón es obligatorio para todos los pasajeros y el conductor.' },
  { cat: 'Ómnibus y escolar', q: '¿Puede el conductor de ómnibus hablar con los pasajeros si hay un guarda a bordo?', opts: ['Sí, sin restricciones', 'Solo en paradas', 'No, debe estar atento a su función específica de conducción', 'Solo si los pasajeros le hablan primero'], ans: 2, exp: 'Cuando hay guarda a bordo, el conductor no puede hablar con el público. Debe concentrarse en conducir.' },
  { cat: 'Ómnibus y escolar', q: 'En el transporte escolar, ¿dónde debe realizarse obligatoriamente el ascenso y descenso de los niños?', opts: ['Sobre la calzada, junto al vehículo', 'Sobre la acera, nunca sobre la calzada', 'En cualquier lugar seguro que elija el conductor', 'Depende de lo que indique la institución'], ans: 1, exp: 'El ascenso y descenso en transporte escolar SIEMPRE debe hacerse sobre la acera, nunca sobre la calzada.' },
  { cat: 'Ómnibus y escolar', q: '¿Está permitido fumar en el vehículo cuando se conducen pasajeros?', opts: ['Sí, si el pasajero lo permite', 'Sí, solo con las ventanas abiertas', 'No, está prohibido fumar mientras se conduzcan pasajeros', 'Solo en distancias cortas'], ans: 2, exp: 'Está expresamente prohibido fumar cuando se conduzcan pasajeros, tanto en ómnibus como en transporte escolar.' },
  { cat: 'Ómnibus y escolar', q: '¿Puede el conductor de ómnibus dar marcha atrás normalmente?', opts: ['Sí, sin restricciones si tiene espejos retrovisores', 'No, solo en casos absolutamente imprescindibles', 'Sí, si hay guarda que lo asista', 'Solo en terminales habilitadas'], ans: 1, exp: 'El conductor de ómnibus no debe dar marcha atrás salvo en casos absolutamente imprescindibles.' },

  // MERCANCÍAS PELIGROSAS
  { cat: 'Mercancías peligrosas', q: '¿Se pueden transportar viajeros en vehículos que lleven mercancías peligrosas?', opts: ['Sí, si el viaje es corto', 'Sí, si van en compartimento separado', 'No, está prohibido excepto el personal del propio vehículo', 'Solo si las mercancías están debidamente embaladas'], ans: 2, exp: 'Está prohibido transportar viajeros en vehículos con mercancías peligrosas. Solo puede ir el personal propio del vehículo.' },
  { cat: 'Mercancías peligrosas', q: '¿Qué color tiene el panel de seguridad de mercancías peligrosas?', opts: ['Rojo con números blancos', 'Naranja con números negros', 'Amarillo con números negros', 'Blanco con números rojos'], ans: 1, exp: 'El panel de seguridad es naranja con números negros. El numero superior indica el riesgo y el inferior el número ONU.' },
  { cat: 'Mercancías peligrosas', q: '¿Cuál es la clase 3 de mercancías peligrosas?', opts: ['Explosivos', 'Gases inflamables', 'Líquidos inflamables', 'Materias radiactivas'], ans: 2, exp: 'La clase 3 corresponde a Líquidos inflamables. Los explosivos son clase 1, los gases clase 2, y los radiactivos clase 7.' },
  { cat: 'Mercancías peligrosas', q: '¿Qué forma tienen las etiquetas de riesgo de mercancías peligrosas?', opts: ['Circulares con fondo rojo', 'Cuadradas con borde negro', 'En forma de losange (rombo) con fondo de color según la clase', 'Triangulares con número en el centro'], ans: 2, exp: 'Las etiquetas tienen forma de losange (rombo rotado 45°) con diferentes colores según la clase de peligro.' },

  // SOMNOLENCIA Y FATIGA
  { cat: 'Somnolencia y fatiga', q: '¿Qué debe hacer el conductor al sentir somnolencia mientras conduce?', opts: ['Bajar la velocidad y seguir conduciendo con precaución', 'Detenerse en un lugar seguro y descansar el tiempo necesario', 'Tomar café o bebidas energizantes para mantenerse despierto', 'Abrir las ventanas y continuar hasta el destino'], ans: 1, exp: 'Ante la somnolencia, el conductor debe detenerse en un lugar seguro y descansar el tiempo que sea necesario. En lo posible, evitar dormir en la vía pública.' },
  { cat: 'Somnolencia y fatiga', q: '¿Cuál de estas NO es una causa reconocida de fatiga al conducir según el manual?', opts: ['Exceso de horas de servicio', 'Monotonía del paisaje y horarios irregulares', 'Conducción diurna con buen clima y tráfico fluido', 'Déficit de horas de sueño y manejo nocturno'], ans: 2, exp: 'Las causas de fatiga incluyen: exceso de horas de servicio, déficit de sueño, manejo nocturno, comidas copiosas, ayuno, monotonía del paisaje y horarios irregulares. La conducción diurna con buen clima no figura como causa.' },
  { cat: 'Somnolencia y fatiga', q: '¿Qué se recomienda hacer cuando el conductor siente fatiga?', opts: ['Seguir conduciendo y escuchar música a alto volumen', 'Detenerse en lugar seguro, beber agua y hacer ejercicio físico como caminar', 'Acelerar para llegar más rápido al destino y descansar allí', 'Pasar la conducción a un pasajero hasta recuperarse'], ans: 1, exp: 'Ante la fatiga: detenerse en lugar seguro, beber agua y hacer ejercicio físico como caminar. No continuar conduciendo en ese estado.' },

  // ESPEJOS Y ÁNGULOS MUERTOS
  { cat: 'Espejos y ángulos muertos', q: '¿Por qué los espejos exteriores convexos hacen que otros vehículos parezcan más lejanos de lo que están?', opts: ['Porque tienen mayor ángulo de visión pero hacen que todo se vea más pequeño', 'Porque están diseñados exclusivamente para vehículos de gran porte', 'Porque solo funcionan correctamente de noche', 'Porque distorsionan el color de los vehículos reflejados'], ans: 0, exp: 'Los espejos convexos cubren mayor ángulo de visión pero los vehículos se ven más pequeños que en los planos, por lo que parecen más alejados de lo que están en realidad.' },
  { cat: 'Espejos y ángulos muertos', q: '¿Cuándo se deben observar los espejos retrovisores?', opts: ['Solo al cambiar de carril o al girar', 'Con frecuencia y brevedad, antes de señalizar y realizar maniobras y antes de bajarse del vehículo', 'Únicamente al frenar o detener el vehículo', 'Solo cuando hay tráfico denso detrás'], ans: 1, exp: 'Se debe observar a través de los espejos con frecuencia y brevedad, antes de señalizar y realizar las maniobras y también antes de bajarse del vehículo.' },

  // CARGAS
  { cat: 'Cargas', q: '¿Qué puede ocurrir con una carga mal sujeta durante una frenada brusca?', opts: ['Permanece en su lugar si está bien embalada', 'Se desplaza siempre hacia atrás sin importar el embalaje', 'Puede desplazarse con gran fuerza, dañando ocupantes, vehículo o saliendo despedida', 'Solo afecta al vehículo, nunca a los ocupantes'], ans: 2, exp: 'Las cargas mal sujetas pueden desplazarse con fuerza excepcional en una frenada, provocando daños en los ocupantes, en el vehículo o en la propia carga, que incluso puede perderse o salir despedida.' },
  { cat: 'Cargas', q: 'Al subir una pendiente y acelerar, ¿hacia dónde tiende a desplazarse la carga?', opts: ['Hacia la parte delantera del vehículo', 'Hacia la parte trasera del vehículo', 'Hacia los laterales del compartimento', 'Permanece estática en pendientes ascendentes'], ans: 1, exp: 'Al subir una pendiente y acelerar al mismo tiempo, la carga tiende a desplazarse hacia la parte trasera. En descenso con frenada brusca, tiende a ir hacia la parte delantera.' },
  { cat: 'Cargas', q: '¿Dónde deben colocarse las cargas más pesadas dentro del vehículo?', opts: ['Lo más arriba posible para equilibrar la distribución', 'En la parte trasera del compartimento para facilitar la descarga', 'En la parte más baja posible del vehículo para mejorar la estabilidad', 'En los laterales sin importar la altura'], ans: 2, exp: 'Las cargas más pesadas deben colocarse en la parte más baja posible del vehículo para mejorar su estabilidad. Nunca se deben colocar sobre otras más ligeras.' },
  { cat: 'Cargas', q: '¿Qué tipos de carga NO deben transportarse conjuntamente?', opts: ['Cargas de diferente peso o volumen', 'Materias peligrosas con alimentos, o productos que generen olores con los que se vean afectados por ellos', 'Cargas de diferente tamaño o forma', 'Productos de distinto color o embalaje exterior'], ans: 1, exp: 'No deben cargarse conjuntamente cargas que puedan perjudicarse entre sí: materias peligrosas con alimentos, materias humedecidas con las que se vean afectadas, productos con olores con los que se vean perjudicados por ellos.' },

  // EFECTO TIJERA
  { cat: 'Efecto tijera', q: '¿Qué es el efecto tijera en vehículos con semirremolque?', opts: ['Un sistema de frenado automático de emergencia', 'Un fenómeno que ocurre cuando las fuerzas que actúan sobre la unidad superan la adherencia', 'La maniobra de giro cerrado con semirremolque en ciudad', 'Un tipo de freno auxiliar especial para remolques'], ans: 1, exp: 'El efecto tijera se produce técnicamente cuando las fuerzas que actúan sobre la unidad superan la adherencia de la misma. Sus efectos son inmediatos y en muchos casos catastróficos.' },
  { cat: 'Efecto tijera', q: '¿Qué se debe hacer si comienza a producirse un efecto tijera?', opts: ['Frenar inmediatamente y girar el volante en sentido contrario', 'Desembragar para separar el motor del semirremolque', 'No quitar el pie del acelerador, no frenar, y no desembragar en la medida de lo posible', 'Detener el vehículo de emergencia en el arcén derecho'], ans: 2, exp: 'Ante un efecto tijera: no quitar el pie del acelerador, no frenar, no desembragar en la medida de lo posible, y acelerar si se puede con una relación de cambio que dé fuerza rápidamente.' },
  { cat: 'Efecto tijera', q: '¿Cuál de estas condiciones favorece el efecto tijera?', opts: ['Carga correctamente distribuida y pavimento seco en recta', 'Baja velocidad en carretera recta con buen pavimento', 'Pavimento deslizante, velocidad excesiva en curva, o frenada brusca con bloqueo de ruedas del semirremolque', 'Uso correcto y sincronizado de los frenos auxiliares'], ans: 2, exp: 'Favorecen el efecto tijera: carga mal distribuida con exceso delantero, pavimento deslizante o en mal estado, velocidad excesiva en carretera sinuosa, y frenada brusca con bloqueo de ruedas del semirremolque.' },

  // TACÓGRAFO
  { cat: 'Tacógrafo', q: '¿Para qué tipo de vehículos es obligatorio el tacógrafo?', opts: ['Todos los vehículos de transporte de pasajeros sin excepción', 'Vehículos de más de 18 asientos destinados al transporte colectivo de pasajeros nacionales o internacionales', 'Solo camiones con más de 3.500 kg de carga útil', 'Todos los vehículos con más de 5 años de antigüedad'], ans: 1, exp: 'El tacógrafo es obligatorio para vehículos de más de 18 asientos destinados a servicios de transporte colectivo de pasajeros nacionales o internacionales (Decreto N° 7/982, modificado por Decreto N° 463/95).' },
  { cat: 'Tacógrafo', q: '¿Qué registra el tacógrafo de forma continua?', opts: ['Únicamente la velocidad del vehículo', 'La velocidad, tiempo de marcha, tiempo de detención y distancias recorridas', 'Las aceleraciones y frenadas bruscas', 'La presión de los neumáticos y el nivel de combustible'], ans: 1, exp: 'El tacógrafo registra de modo continuo en discos: velocidad del vehículo, tiempo de marcha, tiempo de detención y distancias recorridas. Los discos deben tener capacidad mínima de 24 horas.' },
  { cat: 'Tacógrafo', q: '¿Con qué frecuencia deben someterse los tacógrafos a inspección de rutina?', opts: ['Cada 3 meses', 'Cada 6 meses', 'Anualmente', 'Cada 2 años'], ans: 1, exp: 'Los tacógrafos serán sometidos a una inspección de rutina cada seis meses y toda vez que se sospeche mal funcionamiento. La inspección es realizada por establecimientos habilitados.' },

  // LUCES Y RETRORREFLECTANTES
  { cat: 'Luces y retrorreflectantes', q: '¿Cuáles son las tres funciones principales de las luces en los vehículos?', opts: ['Adornar, indicar la matrícula y facilitar el estacionamiento', 'Ver, ser vistos e indicar la intención de hacer una maniobra o la existencia de un peligro', 'Solo iluminar la calzada y señalizar giros', 'Indicar velocidad, dirección y tipo de vehículo'], ans: 1, exp: 'Las luces tienen tres funciones: ver, ser vistos e indicar la intención de hacer una maniobra o la existencia de un peligro. También permiten conocer posición, distancia y sentido de circulación de los vehículos.' },
  { cat: 'Luces y retrorreflectantes', q: '¿A qué distancia deben colocarse las balizas (triángulos) en carreteras y caminos cuando un vehículo queda detenido en la calzada?', opts: ['A 15 metros por detrás y adelante del vehículo', 'A 30 metros por detrás y adelante del vehículo', 'A 50 metros por detrás y adelante del vehículo', 'A 100 metros por detrás y adelante del vehículo'], ans: 2, exp: 'En carreteras y caminos, las balizas se colocan a 50 m de la parte posterior y anterior del vehículo. En zonas urbanas y suburbanas (sin suficiente iluminación), la distancia es de 15 m.' },
  { cat: 'Luces y retrorreflectantes', q: '¿A qué distancia se colocan las balizas en zonas urbanas y suburbanas cuando no hay suficiente iluminación?', opts: ['A 5 metros del vehículo', 'A 15 metros del vehículo', 'A 30 metros del vehículo', 'A 50 metros del vehículo'], ans: 1, exp: 'En zonas urbanas y suburbanas sin suficiente iluminación, las balizas se colocan a 15 m de la parte posterior y anterior del vehículo.' },
  { cat: 'Luces y retrorreflectantes', q: '¿Qué equipamiento especial de luces deben tener los vehículos de 2 metros o más de ancho total?', opts: ['Solo luces largas de mayor intensidad que los autos', 'Luces de gálibo, de identificación y demarcadoras, además de las normales', 'Únicamente luces traseras adicionales de color rojo', 'No requieren equipamiento especial si llevan las luces reglamentarias normales'], ans: 1, exp: 'Los vehículos de 2 metros o más de ancho total deben llevar: luces de gálibo (ámbar adelante y rojas atrás), tres de identificación adelante y atrás, y lámparas demarcadoras a cada costado.' },

  // JORNADA LABORAL
  { cat: 'Jornada laboral', q: '¿Cuántas horas consecutivas puede conducir un trabajador sin hacer una pausa?', opts: ['2 horas', '3 horas', '4 horas', '5 horas'], ans: 2, exp: 'Según la Ley 16.039, un trabajador no debiera conducir por un período mayor a cuatro horas sin hacer una pausa.' },
  { cat: 'Jornada laboral', q: '¿Cuál es la duración máxima de conducción por día, incluyendo horas extraordinarias?', opts: ['6 horas', '8 horas', '9 horas', '12 horas'], ans: 2, exp: 'La duración máxima de conducción, comprendidas las horas extraordinarias, no deberá exceder de nueve horas por día ni de cuarenta y ocho horas por semana.' },
  { cat: 'Jornada laboral', q: '¿Cuántas horas de descanso diario deben tener los conductores como mínimo?', opts: ['6 horas consecutivas', '8 horas consecutivas', '10 horas consecutivas', '12 horas consecutivas'], ans: 2, exp: 'El descanso diario de los conductores deberá ser por lo menos de diez horas consecutivas (Ley 16.039).' },

  // SUSPENSIÓN
  { cat: 'Mantenimiento', q: '¿Cuál de estos NO es un efecto de un sistema de suspensión en mal estado?', opts: ['Aumenta la distancia de frenado', 'Provoca desgaste irregular de neumáticos', 'Mejora la estabilidad y el confort de conducción', 'Puede deslumbrar al oscilar las luces durante la marcha'], ans: 2, exp: 'Un sistema de suspensión en mal estado aumenta la distancia de frenado, provoca fatiga más rápida, balanceos en curvas y frenadas, desgaste irregular de neumáticos y puede hacer oscilar las luces. NO mejora la estabilidad.' },
  { cat: 'Mantenimiento', q: '¿Cuáles son algunas causas de desgaste prematuro de neumáticos?', opts: ['Velocidad constante, frenadas suaves y presión correcta de inflado', 'Velocidad de circulación, frenadas bruscas, presión de inflado inadecuada, y alineación/balanceo defectuosos', 'Solo el exceso de carga en el vehículo', 'Únicamente las condiciones climáticas adversas'], ans: 1, exp: 'El desgaste prematuro puede deberse a la velocidad de circulación, las frenadas, la presión de inflado, las condiciones atmosféricas, la carga, la alineación y el balanceo, entre otros factores.' },
  { cat: 'Mantenimiento', q: '¿Qué riesgo implica circular en "punto muerto" (sin cambio puesto) en descensos prolongados?', opts: ['Solo aumenta ligeramente el consumo de combustible', 'Es más inseguro, dificulta el control del vehículo y obliga a usar más los frenos, aumentando su desgaste', 'No genera riesgo adicional si se mantiene una velocidad constante', 'Solo es peligroso en vehículos pesados, no en livianos'], ans: 1, exp: 'Circular en "punto muerto" en descensos hace al vehículo más inseguro, dificulta el control y obliga a utilizar más los frenos (mayor desgaste). Además, supone consumo de combustible sin el beneficio del freno motor.' },

  // CARRIL DE ACELERACIÓN
  { cat: 'Seguridad vial', q: '¿Qué se debe hacer al ingresar a una vía rápida por el carril de aceleración?', opts: ['Ingresar a la velocidad mínima para no alterar el tráfico', 'Detenerse al inicio del carril si no es seguro y elegir el momento correcto antes de llegar al final', 'Tener prioridad sobre los vehículos de la vía rápida al venir del carril de aceleración', 'Ingresar despacio sin necesidad de alcanzar la velocidad de la vía principal'], ans: 1, exp: 'Si no se puede incorporar con seguridad, hay que detenerse al inicio del carril de aceleración, elegir el momento adecuado y luego aumentar la velocidad para ingresar a la vía principal antes de llegar al final del carril.' },

  // LÍMITE DE PASAJEROS
  { cat: 'Seguridad vial', q: '¿Qué documento determina la cantidad máxima de pasajeros autorizados en un vehículo?', opts: ['La libreta de conducir del conductor', 'El DIV (Documento de Identificación Vehicular)', 'El permiso de circulación departamental', 'La tarjeta de circulación emitida por el MTOP'], ans: 1, exp: 'La cantidad máxima de pasajeros autorizados para transportar estará determinada por lo establecido en el DIV (Documento de Identificación Vehicular), tomando en cuenta la existencia del conductor.' },
]

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const CATS = ['Todas', ...Array.from(new Set(ALL_QUESTIONS.map(q => q.cat)))]
const LETTERS = ['A', 'B', 'C', 'D']

// Categorías que vienen del documento oficial → modo examen = respuesta escrita
const DOC_CATS = new Set(['Reglamentarias', 'Terminales', 'Hospitales', 'Policía'])

// Categorías del manual profesional → modo examen = múltiple opción
const MANUAL_CATS = new Set(['Seguridad vial', 'Mantenimiento', 'Ómnibus y escolar', 'Mercancías peligrosas', 'Somnolencia y fatiga', 'Espejos y ángulos muertos', 'Cargas', 'Efecto tijera', 'Tacógrafo', 'Luces y retrorreflectantes', 'Jornada laboral'])

function buildExamQuestions(): Question[] {
  const manualPool = ALL_QUESTIONS.filter(q => MANUAL_CATS.has(q.cat))
  const mc19 = shuffle(manualPool).slice(0, Math.min(19, manualPool.length))
  const pick = (cat: string, n: number) =>
    shuffle(ALL_QUESTIONS.filter(q => q.cat === cat)).slice(0, n)
  return [
    ...mc19,
    ...pick('Reglamentarias', 3),
    ...pick('Terminales', 2),
    ...pick('Hospitales', 2),
    ...pick('Policía', 2),
  ]
}

// ─── FUZZY MATCHING ───────────────────────────────────────────────────────────

const ABBR_GROUPS: string[][] = [
  ['av', 'avenida', 'avda'],
  ['bv', 'bulevar', 'boulevard', 'blvd'],
  ['cno', 'camino'],
  ['gral', 'general'],
  ['dr', 'doctor'],
  ['dra', 'doctora'],
  ['pje', 'pasaje'],
  ['ing', 'ingeniero'],
  ['cnel', 'coronel'],
  ['cte', 'comandante'],
]

const STOP_WORDS = new Set(['y', 'e', 'de', 'del', 'la', 'el', 'los', 'las', 'un', 'una', 'en', 'a', 'con', 'o', 'que', 'se', 'al', 'le'])

function normalizeStr(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,;:'"¿?!¡°ªº()\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function canonicalToken(t: string): string {
  const n = t.replace(/\.$/, '')
  for (const group of ABBR_GROUPS) {
    if (group.includes(n)) return group[0]
  }
  return n
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  const m: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)])
  for (let j = 0; j <= b.length; j++) m[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      m[i][j] = a[i - 1] === b[j - 1]
        ? m[i - 1][j - 1]
        : 1 + Math.min(m[i - 1][j], m[i][j - 1], m[i - 1][j - 1])
    }
  }
  return m[a.length][b.length]
}

function maxEditDist(len: number): number {
  if (len <= 2) return 0
  if (len <= 5) return 1
  return 2
}

function tokenMatches(ansToken: string, inputTokens: string[]): boolean {
  const ca = canonicalToken(ansToken)
  return inputTokens.some(it => {
    const ci = canonicalToken(it)
    if (ca === ci) return true
    return levenshtein(ca, ci) <= maxEditDist(Math.max(ca.length, ci.length))
  })
}

function checkTextAnswer(userInput: string, correctAnswer: string): { correct: boolean; missingParts: string[] } {
  const normInput = normalizeStr(userInput)
  const normAnswer = normalizeStr(correctAnswer)
  const inputTokens = normInput.split(/\s+/).filter(t => t.length > 0)

  // Split answer into "partes" by " y " / " e " for intersection-type answers
  const rawParts = correctAnswer.split(/\s+(?:y|e)\s+/i)
  const missingParts: string[] = []

  for (const part of rawParts) {
    const normPart = normalizeStr(part)
    const partTokens = normPart.split(/\s+/).filter(t => t.length > 1 && !STOP_WORDS.has(t))
    if (partTokens.length === 0) continue
    const partFound = partTokens.every(pt => tokenMatches(pt, inputTokens))
    if (!partFound) missingParts.push(part.trim())
  }

  return { correct: missingParts.length === 0, missingParts }
}

const MOTIVATIONS: Record<number, string[]> = {
  5:  ['¡Arrancaste bien! Seguí así.', '¡Buen comienzo! La libreta ya se siente más cerca.'],
  10: ['¡Ya vas por la mitad! Tu esfuerzo se nota.', '¡Diez preguntas! Eso es constancia.'],
  15: ['¡Excelente! Más de la mitad completada.', '¡Casi llegás! No te detengas ahora.'],
  20: ['¡Solo 5 más! Lo estás logrando.', '¡20 preguntas! Sos imparable.'],
}

function getMotivation(total: number): string | null {
  const msgs = MOTIVATIONS[total]
  if (!msgs) return null
  return msgs[Math.floor(Math.random() * msgs.length)]
}

// ─── TIPOS ────────────────────────────────────────────────────────────────────

type AppMode = 'quiz' | 'review'

interface SessionState {
  session: Question[]
  idx: number
  answered: boolean
  score: { total: number; correct: number; wrong: number }
  wrongQuestions: Question[]
  done: boolean
  textResult: { correct: boolean; missingParts: string[] } | null
  selectedOpt: number | null
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

const EMPTY_SESSION: SessionState = {
  session: [],
  idx: 0,
  answered: false,
  score: { total: 0, correct: 0, wrong: 0 },
  wrongQuestions: [],
  done: false,
  textResult: null,
  selectedOpt: null,
}

export default function PruebaPage() {
  const [cat, setCat] = useState('Todas')
  const [mode, setMode] = useState<'prueba' | 'examen'>('prueba')
  const [appMode, setAppMode] = useState<AppMode>('quiz')
  const [motivation, setMotivation] = useState<string | null>(null)
  const [questionKey, setQuestionKey] = useState(0)
  const [textInput, setTextInput] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const buildSession = useCallback((questions: Question[]): SessionState => ({
    session: shuffle(questions).slice(0, Math.min(25, questions.length)),
    idx: 0,
    answered: false,
    score: { total: 0, correct: 0, wrong: 0 },
    wrongQuestions: [],
    done: false,
    textResult: null,
    selectedOpt: null,
  }), [])

  const [state, setState] = useState<SessionState>(EMPTY_SESSION)

  // Build initial session only on client to avoid SSR/hydration mismatch (Math.random)
  useEffect(() => {
    setState(buildSession(ALL_QUESTIONS))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getPool = useCallback((category: string) => {
    if (category === 'Todas') return ALL_QUESTIONS
    return ALL_QUESTIONS.filter(q => q.cat === category)
  }, [])

  const newSession = useCallback((category: string = cat, keepMode: AppMode = 'quiz', forMode?: 'prueba' | 'examen') => {
    const effectiveMode = forMode ?? mode
    let sessionQuestions: Question[]
    if (effectiveMode === 'examen') {
      sessionQuestions = buildExamQuestions()
    } else {
      sessionQuestions = shuffle(getPool(category)).slice(0, Math.min(25, getPool(category).length))
    }
    setState({
      session: sessionQuestions,
      idx: 0,
      answered: false,
      score: { total: 0, correct: 0, wrong: 0 },
      wrongQuestions: [],
      done: false,
      textResult: null,
      selectedOpt: null,
    })
    setAppMode(keepMode)
    setMotivation(null)
    setQuestionKey(k => k + 1)
  }, [cat, getPool, mode])

  const startReview = useCallback(() => {
    if (state.wrongQuestions.length === 0) return
    setState(buildSession(state.wrongQuestions))
    setAppMode('review')
    setMotivation(null)
    setQuestionKey(k => k + 1)
  }, [state.wrongQuestions, buildSession])

  const handleCat = (c: string) => {
    setCat(c)
    newSession(c, 'quiz')
  }

  const handleMode = (m: 'prueba' | 'examen') => {
    setMode(m)
    newSession(cat, 'quiz', m)
  }

  const handleAnswer = useCallback((optIdx: number) => {
    setState(prev => {
      if (prev.answered || prev.done) return prev
      const q = prev.session[prev.idx]
      const correct = optIdx === q.ans
      const newScore = {
        total: prev.score.total + 1,
        correct: prev.score.correct + (correct ? 1 : 0),
        wrong: prev.score.wrong + (correct ? 0 : 1),
      }
      const newWrong = correct ? prev.wrongQuestions : [...prev.wrongQuestions, q]
      const msg = getMotivation(newScore.total)
      if (msg) setMotivation(msg)
      return { ...prev, answered: true, score: newScore, wrongQuestions: newWrong, textResult: null, selectedOpt: optIdx }
    })
  }, [])

  const handleTextAnswer = useCallback(() => {
    setState(prev => {
      if (prev.answered || prev.done) return prev
      const q = prev.session[prev.idx]
      const result = checkTextAnswer(textInput, q.opts[q.ans])
      const correct = result.correct
      const newScore = {
        total: prev.score.total + 1,
        correct: prev.score.correct + (correct ? 1 : 0),
        wrong: prev.score.wrong + (correct ? 0 : 1),
      }
      const newWrong = correct ? prev.wrongQuestions : [...prev.wrongQuestions, q]
      const msg = getMotivation(newScore.total)
      if (msg) setMotivation(msg)
      return { ...prev, answered: true, score: newScore, wrongQuestions: newWrong, textResult: result }
    })
  }, [textInput])

  const handleNext = useCallback(() => {
    setState(prev => {
      if (prev.idx < prev.session.length - 1) {
        setQuestionKey(k => k + 1)
        setMotivation(null)
        setTextInput('')
        return { ...prev, idx: prev.idx + 1, answered: false, textResult: null, selectedOpt: null }
      } else {
        return { ...prev, done: true }
      }
    })
  }, [])

  const handlePrev = useCallback(() => {
    setState(prev => {
      if (prev.idx > 0) {
        setQuestionKey(k => k + 1)
        setMotivation(null)
        setTextInput('')
        return { ...prev, idx: prev.idx - 1, answered: false, textResult: null, selectedOpt: null }
      }
      return prev
    })
  }, [])

  const { session, idx, answered, score, wrongQuestions, done, textResult, selectedOpt } = state
  const q = session[idx]
  const isTextMode = mode === 'examen' && q && DOC_CATS.has(q.cat)
  const pct = score.total > 0 ? Math.round(score.correct / score.total * 100) : null
  const progressPct = session.length > 0 ? Math.round(score.total / session.length * 100) : 0

  // Result data
  const finalPct = session.length > 0 ? Math.round(score.correct / session.length * 100) : 0
  const resultConfig = finalPct >= 90
    ? { emoji: '🏆', title: '¡Excelente! Estás listo/a', sub: 'Resultado sobresaliente. ¡La libreta ya es tuya!', color: 'text-emerald-600' }
    : finalPct >= 70
    ? { emoji: '👍', title: '¡Buen resultado!', sub: 'Vas muy bien. Repasá las que fallaste para afianzar.', color: 'text-blue-600' }
    : finalPct >= 50
    ? { emoji: '📚', title: 'Hay que repasar un poco más', sub: 'Mirá las respuestas incorrectas y volvé a practicar esas secciones.', color: 'text-amber-600' }
    : { emoji: '💪', title: 'Seguí practicando', sub: 'Con práctica diaria vas a mejorar. ¡Vos podés!', color: 'text-rose-600' }

  return (
    <main className="min-h-screen py-6 px-4" style={{ background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' }}>
      <div className="max-w-2xl mx-auto space-y-4">

        {/* HEADER — solo visible en modo repaso */}
        {appMode === 'review' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center rounded-2xl border border-white/10 backdrop-blur-sm px-6 py-4"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          >
            <p className="text-white font-bold text-sm">
              Repaso de errores · {session.length} preguntas
            </p>
          </motion.div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { val: score.total, label: 'Respondidas', color: 'text-blue-500' },
            { val: score.correct, label: 'Correctas', color: 'text-emerald-500' },
            { val: score.wrong, label: 'Incorrectas', color: 'text-rose-500' },
            { val: pct !== null ? `${pct}%` : '—', label: 'Puntaje', color: 'text-gray-500' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="bg-white/95 rounded-xl p-3 text-center shadow-md"
            >
              <div className={`text-2xl font-extrabold leading-none mb-1 ${s.color}`}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={String(s.val)}
                    initial={{ scale: 1.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="inline-block"
                  >
                    {s.val}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* PROGRESS BAR */}
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #10b981, #34d399)' }}
            initial={{ width: '0%' }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* MOTIVATION TOAST */}
        <AnimatePresence>
          {motivation && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-emerald-500 text-white rounded-xl px-4 py-3 text-sm font-semibold text-center shadow-lg"
            >
              ✨ {motivation}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CONTROLS */}
        {!done && (
          <div className="space-y-2">
            {/* Mode selector */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white/70 text-xs font-medium">Modo:</span>
              {(['prueba', 'examen'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => handleMode(m)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                    mode === m
                      ? 'bg-white text-gray-900 border-white'
                      : 'border-white/30 text-white/80 hover:bg-white/20'
                  }`}
                  style={mode !== m ? { background: 'rgba(255,255,255,0.1)' } : {}}
                >
                  {m === 'prueba' ? 'Prueba' : 'Examen'}
                </button>
              ))}
              {mode === 'prueba' && (
                <button
                  onClick={() => newSession(cat, 'quiz')}
                  className="ml-auto px-3 py-1.5 rounded-full text-xs font-semibold border border-white/30 text-white/80 hover:bg-white/20 transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  🔀 Nuevas 25
                </button>
              )}
              {mode === 'examen' && (
                <button
                  onClick={() => newSession(cat, 'quiz', 'examen')}
                  className="ml-auto px-3 py-1.5 rounded-full text-xs font-semibold border border-white/30 text-white/80 hover:bg-white/20 transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  🔀 Nuevo examen
                </button>
              )}
            </div>

            {/* Filtros — solo en modo Prueba */}
            {mode === 'prueba' && (
              <div>
                <button
                  onClick={() => setShowFilters(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-white/30 text-white/80 hover:bg-white/20 transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  <span>⚙ Filtros</span>
                  {cat !== 'Todas' && (
                    <span className="bg-blue-500 text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold">{cat}</span>
                  )}
                  <motion.span
                    animate={{ rotate: showFilters ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-white/50 text-[10px]"
                  >
                    ▼
                  </motion.span>
                </button>
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div className="flex gap-2 flex-wrap pt-2">
                        {CATS.map(c => (
                          <button
                            key={c}
                            onClick={() => { handleCat(c); setShowFilters(false) }}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                              cat === c
                                ? 'bg-blue-500 border-blue-500 text-white'
                                : 'border-white/30 text-white/80 hover:bg-white/20'
                            }`}
                            style={cat !== c ? { background: 'rgba(255,255,255,0.1)' } : {}}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* QUIZ AREA */}
        {!done ? (
          session.length === 0 ? (
            <div className="text-white/70 text-center py-10">No hay preguntas para esta categoría.</div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={questionKey}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <div className="bg-white rounded-2xl p-6 shadow-2xl">
                  {/* Meta */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Pregunta {idx + 1} de {session.length}
                    </span>
                    <span className="text-[10px] font-semibold bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">
                      {q.cat}
                    </span>
                    {appMode === 'review' && (
                      <span className="text-[10px] font-semibold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
                        Repaso
                      </span>
                    )}
                  </div>

                  {/* Question */}
                  <p className="text-base font-bold text-gray-900 leading-snug mb-5">{q.q}</p>

                  {/* Options — múltiple elección o texto según modo */}
                  {isTextMode ? (
                    <div className="space-y-3">
                      <textarea
                        value={textInput}
                        onChange={e => !answered && setTextInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey && !answered && textInput.trim()) {
                            e.preventDefault()
                            handleTextAnswer()
                          }
                        }}
                        disabled={answered}
                        placeholder="Escribí tu respuesta aquí…"
                        rows={3}
                        className={`w-full resize-none rounded-xl border-2 px-4 py-3 text-sm font-medium text-gray-800 outline-none transition-all duration-200 disabled:cursor-default
                          ${!answered
                            ? 'border-gray-200 bg-gray-50 focus:border-blue-400 focus:bg-white'
                            : textResult?.correct
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                              : 'border-rose-400 bg-rose-50 text-rose-800'
                          }`}
                      />

                      {/* Botón confirmar */}
                      {!answered && (
                        <motion.button
                          onClick={handleTextAnswer}
                          disabled={!textInput.trim()}
                          whileHover={textInput.trim() ? { scale: 1.02 } : {}}
                          whileTap={textInput.trim() ? { scale: 0.98 } : {}}
                          className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                          Confirmar respuesta
                        </motion.button>
                      )}

                      {/* Feedback después de responder */}
                      <AnimatePresence>
                        {answered && textResult && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            {textResult.correct ? (
                              <div className="bg-emerald-50 border-l-4 border-emerald-400 rounded-xl px-4 py-3 text-sm text-emerald-800 font-semibold">
                                ✓ ¡Correcto! La respuesta es: <span className="font-bold">{q.opts[q.ans]}</span>
                              </div>
                            ) : (
                              <div className="bg-rose-50 border-l-4 border-rose-400 rounded-xl px-4 py-3 text-sm text-rose-900 space-y-1.5">
                                <div className="font-bold">✗ Incorrecto</div>
                                {textResult.missingParts.length > 0 && (
                                  <div>
                                    Faltó o es incorrecto:{' '}
                                    <span className="font-bold">{textResult.missingParts.join(' / ')}</span>
                                  </div>
                                )}
                                <div className="pt-1 border-t border-rose-200">
                                  La respuesta correcta es:{' '}
                                  <span className="font-bold">{q.opts[q.ans]}</span>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {q.opts.map((opt, i) => {
                        const isCorrect = i === q.ans
                        const isWrongSelected = answered && i === selectedOpt && selectedOpt !== q.ans
                        let style = ''
                        if (!answered) {
                          style = 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                        } else if (isCorrect) {
                          style = 'border-emerald-400 bg-emerald-50 text-emerald-800'
                        } else if (isWrongSelected) {
                          style = 'border-rose-400 bg-rose-50 text-rose-800'
                        } else {
                          style = 'border-gray-200 bg-gray-50 opacity-40'
                        }

                        const letterStyle = answered && isCorrect
                          ? 'bg-emerald-400 text-white'
                          : answered && isWrongSelected
                          ? 'bg-rose-400 text-white'
                          : answered
                          ? 'bg-gray-200 text-gray-400'
                          : 'bg-gray-200 text-gray-600'

                        return (
                          <motion.button
                            key={i}
                            onClick={() => !answered && handleAnswer(i)}
                            disabled={answered}
                            whileHover={!answered ? { scale: 1.01 } : {}}
                            whileTap={!answered ? { scale: 0.99 } : {}}
                            className={`w-full text-left flex items-start gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-150 text-sm font-medium text-gray-700 disabled:cursor-default ${style}`}
                          >
                            <span className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-extrabold transition-all duration-150 ${letterStyle}`}>
                              {LETTERS[i]}
                            </span>
                            <span className="leading-relaxed">{opt}</span>
                            {answered && isCorrect && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="ml-auto text-emerald-500 font-bold flex-shrink-0"
                              >
                                ✓
                              </motion.span>
                            )}
                            {isWrongSelected && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="ml-auto text-rose-500 font-bold flex-shrink-0"
                              >
                                ✗
                              </motion.span>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                  )}

                  {/* Explanation (solo práctica, solo múltiple opción) */}
                  <AnimatePresence>
                    {answered && mode === 'prueba' && !isTextMode && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 overflow-hidden"
                      >
                        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-xl px-4 py-3 text-sm text-blue-900 leading-relaxed">
                          <span className="font-bold">💡 </span>{q.exp}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-3">
                  <button
                    onClick={handlePrev}
                    disabled={idx === 0}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white/90 border border-white/30 hover:bg-white/20 disabled:opacity-30 disabled:cursor-default transition-all"
                    style={{ background: 'rgba(255,255,255,0.12)' }}
                  >
                    ← Anterior
                  </button>
                  <span className="text-white/60 text-xs font-semibold">
                    {score.total} respondidas · {session.length - idx - 1} restantes
                  </span>
                  <motion.button
                    onClick={handleNext}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 transition-all shadow-lg"
                  >
                    {idx === session.length - 1 ? 'Ver resultado →' : 'Siguiente →'}
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          )
        ) : (
          /* RESULT SCREEN */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-white rounded-2xl p-8 text-center shadow-2xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="text-6xl mb-4"
            >
              {resultConfig.emoji}
            </motion.div>
            <h2 className={`text-2xl font-extrabold mb-2 ${resultConfig.color}`}>{resultConfig.title}</h2>
            <p className="text-gray-500 text-sm mb-6">{resultConfig.sub}</p>

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
              className="text-6xl font-black mb-2"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              {finalPct}%
            </motion.div>

            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-extrabold text-emerald-500">{score.correct}</div>
                <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Correctas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-extrabold text-rose-500">{score.wrong}</div>
                <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Incorrectas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-extrabold text-blue-500">{session.length}</div>
                <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Total</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => newSession(cat, 'quiz')}
                className="px-6 py-3 rounded-xl font-bold text-white text-sm transition-all shadow-lg"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: '0 4px 20px rgba(59,130,246,0.4)' }}
              >
                🔀 Nueva ronda de preguntas
              </motion.button>

              {wrongQuestions.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={startReview}
                  className="px-6 py-3 rounded-xl font-bold text-white text-sm transition-all shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 20px rgba(245,158,11,0.4)' }}
                >
                  📝 Repasar {wrongQuestions.length} errores
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  )
}
