import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Retorna una función envuelta que sólo se ejecuta después de que haya
 * transcurrido `delay` ms sin ser invocada. Útil para búsquedas bajo demanda.
 * La función envuelta retorna una Promise que se resuelve cuando la función
 * original se ejecuta (útil para hacer `await` sobre llamadas debounced).
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number,
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let resolvePromise: ((value: any) => void) | null = null;
    const wrapper = (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
        if (timer) clearTimeout(timer);
        return new Promise((resolve) => {
            resolvePromise = resolve;
            timer = setTimeout(async () => {
                try {
                    const result = await func(...args);
                    resolve(result);
                } catch (err) {
                    resolve(err as any);
                } finally {
                    resolvePromise = null;
                }
            }, delay);
        });
    };
    return wrapper as (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>;
}
