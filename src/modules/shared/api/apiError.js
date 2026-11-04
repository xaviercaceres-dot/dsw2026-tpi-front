const defaultMessages = {
  400: 'Los datos enviados no son válidos.',
  401: 'La sesión expiró o las credenciales no son válidas.',
  403: 'No tenés permisos para realizar esta operación.',
  404: 'El recurso solicitado no existe.',
  409: 'La operación entra en conflicto con datos existentes.',
  429: 'Se alcanzó el límite de solicitudes. Intentá nuevamente más tarde.',
  500: 'Ocurrió un error interno. Intentá nuevamente.',
};

function getApiError(error) {
  const status = error.response?.status;
  const payload = error.response?.data;

  return {
    status,
    code: payload?.errorCode,
    message:
      payload?.message ||
      defaultMessages[status] ||
      (error.request
        ? 'No se pudo conectar con el backend.'
        : 'Ocurrió un error inesperado.'),
    details: Array.isArray(payload?.details) ? payload.details : [],
  };
}

export { getApiError };
