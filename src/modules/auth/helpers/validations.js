// Mismas reglas que valida el backend (CrossCutting/Helpers/ValidationsExtensions y AuthenticationService).
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const DNI_PATTERN = /^\d{7,8}$/;
export const PASSWORD_MIN_LENGTH = 8;
