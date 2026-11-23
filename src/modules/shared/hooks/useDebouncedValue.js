import { useEffect, useState } from 'react';

// Devuelve el valor recién cuando dejó de cambiar durante "delay" ms (evita un pedido por tecla).
export function useDebouncedValue(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default useDebouncedValue;
