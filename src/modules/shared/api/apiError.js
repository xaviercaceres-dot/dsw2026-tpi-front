// Mensajes por defecto según el código HTTP.
const defaultMessages = {
  400: 'Los datos enviados no son válidos.',
  401: 'La sesión expiró o las credenciales no son válidas.',
  403: 'No tenés permisos para realizar esta operación.',
  404: 'El recurso solicitado no existe.',
  409: 'La operación entra en conflicto con datos existentes.',
  415: 'El formato de la solicitud no es válido.',
  429: 'Se alcanzó el límite de solicitudes. Intentá nuevamente en un minuto.',
  500: 'Ocurrió un error interno. Intentá nuevamente.',
};

// Mensajes del frontend según el errorCode del backend (formato { errorCode, message, details }).
// Se usan cuando el mensaje del backend no es adecuado para mostrarlo al usuario.
const frontendErrorMessage = {
  APPOINTMENT_CONFLICT:
    'El turno seleccionado ya fue reservado por otro paciente. Por favor, elegí otro horario.',
  ENTITY_NOTFOUND: 'El registro solicitado no existe o fue dado de baja.',
  RESOURCE_NOT_FOUND: 'El recurso solicitado no existe.',
  UNHANDLED_ERROR:
    'Ocurrió un error interno en el servidor. Intentá nuevamente.',
};

function getApiError(error, overrides = {}) {
  const status = error.response?.status;
  const payload = error.response?.data;
  const code = payload?.errorCode || payload?.code;
  const details = Array.isArray(payload?.details) ? payload.details : [];

  if (!error.response && !error.request) {
    return {
      status,
      code,
      message: error.message || 'Ocurrió un error inesperado.',
      details,
    };
  }

  const proxyWithoutBackend =
    status >= 500 && (payload === '' || payload === undefined);

  if (!error.response || proxyWithoutBackend) {
    return {
      status,
      code,
      message:
        'No se pudo conectar con el servidor. Verificá que el backend esté en ejecución.',
      details,
    };
  }

  let message =
    overrides[code] ||
    overrides[status] ||
    frontendErrorMessage[code] ||
    payload?.message ||
    defaultMessages[status] ||
    'Ocurrió un error inesperado.';

  const issues = details
    .map((detail) => detail?.issue)
    .filter((issue) => typeof issue === 'string' && issue.length > 3);

  if (code === 'VALIDATION_ERROR' && issues.length > 0 && !overrides[code]) {
    message = issues.join(' ');
  }

  return { status, code, message, details };
}

export { getApiError };
