export function withBasePath(src: string) {
    const bp = process.env.NEXT_PUBLIC_BASE_PATH || "";
    return `${bp}${src.startsWith("/") ? src : `/${src}`}`;
}
