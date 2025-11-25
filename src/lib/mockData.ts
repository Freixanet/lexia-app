export const INITIAL_MESSAGE = `Buenas tardes. Soy Lexia, su asistente legal especializado en legislación española.

Puedo ayudarle con:
- Análisis de contratos y demandas.
- Redacción de documentos legales formales.
- Consultas sobre el Código Civil y Penal.

¿En qué puedo asistirle hoy?`;

export const MOCK_RESPONSES = [
    "Entendido. Basándome en el artículo 1255 del Código Civil, las partes pueden establecer los pactos, cláusulas y condiciones que tengan por conveniente, siempre que no sean contrarios a las leyes, a la moral ni al orden público. En este caso, sugiero revisar la cláusula tercera.",
    "Para proceder con esta reclamación, necesitaremos fundamentarla en la Ley de Enjuiciamiento Civil. Recomiendo preparar un escrito formal solicitando la nulidad de las actuaciones.",
    "He analizado el documento. A primera vista, existen indicios de cláusulas abusivas según la Ley General para la Defensa de los Consumidores y Usuarios. Podríamos redactar una carta de requerimiento.",
    "La jurisprudencia reciente del Tribunal Supremo respalda esta interpretación. Procederé a redactar el documento basándome en estos precedentes para asegurar la viabilidad de la demanda."
];

export const getRandomResponse = () => {
    return MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
};
