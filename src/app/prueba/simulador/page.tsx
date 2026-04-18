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

  // NORMATIVA
  { cat: 'Normativa', q: '¿Cuántos viajes mínimos debe realizar un permisario por mes para mantener su permiso activo?', opts: ['5 viajes', '10 viajes', '20 viajes', 'No hay mínimo establecido'], ans: 1, exp: 'La normativa exige un mínimo de 10 viajes por mes. Si no se cumple, el permisario puede perder la habilitación.' },
  { cat: 'Normativa', q: '¿Cuántos permisarios puede haber como máximo en el sistema de Montevideo?', opts: ['1.000', '2.500', '4.000', 'No hay límite'], ans: 2, exp: 'El cupo máximo del sistema es de 4.000 permisarios activos simultáneamente en Montevideo.' },
  { cat: 'Normativa', q: '¿El vehículo puede estar registrado a nombre de un familiar del permisario?', opts: ['Sí, de cualquier familiar directo', 'Sí, solo del cónyuge con poder notarial', 'No, debe estar obligatoriamente a nombre del propio permisario', 'Sí, con autorización de la IM'], ans: 2, exp: 'El vehículo debe estar registrado a nombre del permisario. No admite excepciones.' },
  { cat: 'Normativa', q: '¿Cuántos conductores adicionales se pueden registrar en un mismo permiso?', opts: ['Ninguno, solo el permisario puede conducir', 'Solo uno, y debe ser familiar hasta 2° grado de consanguinidad', 'Hasta dos, sin restricción de parentesco', 'Hasta tres con autorización especial'], ans: 1, exp: 'Se permite solo un conductor adicional, familiar hasta segundo grado de consanguinidad (hijo, padre, hermano, cónyuge).' },
  { cat: 'Normativa', q: '¿Qué pasa si el aspirante no presenta los requisitos dentro del plazo de la convocatoria?', opts: ['Se le otorga prórroga automática de 30 días', 'Paga una multa y sigue en lista', 'Es descartado definitivamente de la lista de aspirantes', 'Pasa al final de la lista pero no se va'], ans: 2, exp: 'Si no cumple en el plazo indicado, el aspirante es descartado de la lista y pierde su lugar definitivamente.' },
  { cat: 'Normativa', q: '¿Con qué frecuencia mínima debe el permisario revisar su buzón de notificaciones electrónico de la IM?', opts: ['Cada semana', 'Al menos una vez al mes', 'Cada 15 días', 'Solo cuando la IM lo contacte por otro medio'], ans: 1, exp: 'La IM notifica todo por el domicilio electrónico. No revisarlo puede provocar la suspensión del permiso.' },
  { cat: 'Normativa', q: '¿Qué organismo emite y regula el permiso para operar como permisario en Montevideo?', opts: ['El Ministerio de Transporte (MTOP)', 'La Intendencia de Montevideo a través de la Unidad Administración de Transporte', 'Uber o Cabify directamente', 'La Dirección Nacional de Tránsito'], ans: 1, exp: 'Es la Intendencia de Montevideo, a través de la Unidad Administración de Transporte (UAT), quien otorga y regula el permiso.' },
  { cat: 'Normativa', q: '¿La categoría E requiere examen práctico para obtenerla?', opts: ['Sí, siempre es obligatorio', 'No, está exonerada del práctico si la licencia anterior no está vencida más de 2 años', 'Solo si la academia lo solicita', 'Depende de la cantidad de años de experiencia'], ans: 1, exp: 'La categoría E no requiere examen práctico, siempre que la licencia no esté vencida por más de 2 años. Solo se rinde el teórico.' },

  // VEHÍCULO
  { cat: 'Vehículo', q: '¿Cuál es la antigüedad máxima permitida para un vehículo 100% eléctrico destinado al transporte de pasajeros?', opts: ['5 años', '6 años', '8 años', '10 años'], ans: 3, exp: 'Los vehículos eléctricos tienen un tope de 10 años de antigüedad. Para vehículos a combustión, el límite es de 6 años.' },
  { cat: 'Vehículo', q: '¿Cuál es la antigüedad máxima para vehículos a combustión usados como permisario?', opts: ['4 años', '6 años', '8 años', '10 años'], ans: 1, exp: 'Los vehículos a combustión tienen un máximo de 6 años de antigüedad para poder registrarse como permisario.' },
  { cat: 'Vehículo', q: '¿Dónde debe estar empadronado el vehículo para operar como permisario en Montevideo?', opts: ['En cualquier departamento del país', 'En el departamento de residencia del permisario', 'En Montevideo', 'No hay requisito de empadronamiento'], ans: 2, exp: 'El vehículo debe estar empadronado en Montevideo para poder operar en el departamento.' },
  { cat: 'Vehículo', q: '¿El seguro obligatorio de automotores (SOA) es suficiente para operar como permisario?', opts: ['Sí, el SOA cubre todo lo necesario', 'No, se necesita póliza adicional con cobertura de transporte de pasajeros', 'Solo si el vehículo es eléctrico', 'Sí, combinado con el carné de salud'], ans: 1, exp: 'El SOA no es suficiente. Se requiere póliza específica con Responsabilidad Civil Pasajeros y RC Extracontractual.' },
  { cat: 'Vehículo', q: '¿Cuál es el monto mínimo de cobertura por persona en la póliza del permisario?', opts: ['500.000 UI', '1.000.000 UI', '1.500.000 UI por cobertura', '3.000.000 UI'], ans: 2, exp: 'Cada cobertura debe tener mínimo 1.500.000 UI por persona lesionada o muerta.' },
  { cat: 'Vehículo', q: '¿Cuál de estas NO es una planta habilitada por la IM para la Inspección Técnica Vehicular?', opts: ['Autotest — La Paz 1970', 'AutoOK — Larrañaga 3347', 'Autodiagnóstico — Av. San Martín 3140', 'Autovision — Av. Italia 3800'], ans: 3, exp: 'Las plantas habilitadas son Autotest, AutoOK y Autodiagnóstico. Autovision no existe como planta habilitada.' },

  // DOCUMENTACIÓN
  { cat: 'Documentación', q: '¿El carné de salud laboral puede presentarse en fotocopia?', opts: ['Sí, con firma del médico actuante', 'Sí, certificada por escribano público', 'No, debe presentarse el original', 'Solo si la fotocopia está legalizada'], ans: 2, exp: 'El carné de salud laboral debe presentarse en original. No se aceptan fotocopias de ningún tipo.' },
  { cat: 'Documentación', q: '¿Qué certifica el Certificado de la Ley 19.889?', opts: ['Que el conductor no tiene multas de tránsito', 'No inscripción en el registro nacional de violadores y abusadores sexuales', 'Que el conductor tiene antecedentes penales limpios', 'Que la empresa está habilitada por BPS'], ans: 1, exp: 'La Ley 19.889 creó el registro de violadores y abusadores sexuales. El certificado acredita que la persona no figura en dicho registro.' },
  { cat: 'Documentación', q: '¿Qué es el Formulario 6906 de BPS y por qué se necesita?', opts: ['Es el formulario para registrar el vehículo en la IM', 'Certifica la inscripción y situación tributaria del contribuyente ante BPS', 'Es el comprobante de pago del canon mensual a la IM', 'Es la declaración de viajes ante DGI'], ans: 1, exp: 'El Formulario 6906 es emitido por BPS y certifica la situación del contribuyente. Es requerido para el alta del permiso.' },
  { cat: 'Documentación', q: '¿Qué es el domicilio electrónico (GUB.UY) y por qué lo pide la IM?', opts: ['Es una dirección de email cualquiera', 'Es el buzón oficial digital a través del cual la IM notifica al permisario todo lo relevante', 'Es solo para pagar impuestos online', 'Es el usuario de la app de Uber o Cabify'], ans: 1, exp: 'El domicilio electrónico en GUB.UY es el canal oficial de comunicación entre la IM y el permisario. Es obligatorio tenerlo.' },

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
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function PruebaPage() {
  const [cat, setCat] = useState('Todas')
  const [mode, setMode] = useState<'practice' | 'exam'>('practice')
  const [appMode, setAppMode] = useState<AppMode>('quiz')
  const [motivation, setMotivation] = useState<string | null>(null)
  const [questionKey, setQuestionKey] = useState(0) // for animation reset

  const buildSession = useCallback((questions: Question[]): SessionState => ({
    session: shuffle(questions).slice(0, Math.min(25, questions.length)),
    idx: 0,
    answered: false,
    score: { total: 0, correct: 0, wrong: 0 },
    wrongQuestions: [],
    done: false,
  }), [])

  const [state, setState] = useState<SessionState>(() => {
    const pool = ALL_QUESTIONS
    return buildSession(pool)
  })

  const getPool = useCallback((category: string) => {
    if (category === 'Todas') return ALL_QUESTIONS
    return ALL_QUESTIONS.filter(q => q.cat === category)
  }, [])

  const newSession = useCallback((category: string = cat, keepMode: AppMode = 'quiz') => {
    const pool = getPool(category)
    setState(buildSession(pool))
    setAppMode(keepMode)
    setMotivation(null)
    setQuestionKey(k => k + 1)
  }, [cat, getPool, buildSession])

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

  const handleMode = (m: 'practice' | 'exam') => {
    setMode(m)
    newSession(cat, 'quiz')
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
      return { ...prev, answered: true, score: newScore, wrongQuestions: newWrong }
    })
  }, [])

  const handleNext = useCallback(() => {
    setState(prev => {
      if (prev.idx < prev.session.length - 1) {
        setQuestionKey(k => k + 1)
        setMotivation(null)
        return { ...prev, idx: prev.idx + 1, answered: false }
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
        return { ...prev, idx: prev.idx - 1, answered: false }
      }
      return prev
    })
  }, [])

  const { session, idx, answered, score, wrongQuestions, done } = state
  const q = session[idx]
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

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center rounded-2xl border border-white/10 backdrop-blur-sm p-6"
          style={{ background: 'rgba(255,255,255,0.07)' }}
        >
          <div className="text-5xl mb-2">🚗</div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {appMode === 'review' ? 'Repaso de errores' : 'Simulador — Licencia Categoría E'}
          </h1>
          <p className="text-white/60 text-sm">
            {appMode === 'review'
              ? `Practicando ${session.length} preguntas que respondiste mal`
              : 'Transporte de pasajeros · Uber / Cabify · Montevideo'}
          </p>
        </motion.div>

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
            {/* Category tabs */}
            <div className="flex gap-2 flex-wrap">
              {CATS.map(c => (
                <button
                  key={c}
                  onClick={() => handleCat(c)}
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

            {/* Mode + shuffle */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white/70 text-xs font-medium">Modo:</span>
              {(['practice', 'exam'] as const).map(m => (
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
                  {m === 'practice' ? 'Práctica' : 'Examen'}
                </button>
              ))}
              <button
                onClick={() => newSession(cat, 'quiz')}
                className="ml-auto px-3 py-1.5 rounded-full text-xs font-semibold border border-white/30 text-white/80 hover:bg-white/20 transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                🔀 Nuevas 25
              </button>
            </div>
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

                  {/* Options */}
                  <div className="space-y-2.5">
                    {q.opts.map((opt, i) => {
                      let style = ''
                      if (!answered) {
                        style = 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                      } else if (i === q.ans) {
                        style = mode === 'exam'
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-800 opacity-80'
                          : 'border-emerald-400 bg-emerald-50 text-emerald-800'
                      } else if (i !== q.ans) {
                        style = 'border-gray-200 bg-gray-50 opacity-50'
                      }

                      const letterStyle = answered && i === q.ans
                        ? 'bg-emerald-400 text-white'
                        : answered && i !== q.ans
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
                          {answered && i === q.ans && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-auto text-emerald-500 font-bold flex-shrink-0"
                            >
                              ✓
                            </motion.span>
                          )}
                        </motion.button>
                      )
                    })}
                  </div>

                  {/* Explanation */}
                  <AnimatePresence>
                    {answered && mode === 'practice' && (
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
