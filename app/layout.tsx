import type { Metadata, Viewport } from "next";
import "./styles.css";
export const metadata: Metadata = { title: "CertifyHub | Aprende con propósito", description: "Tu espacio para preparar certificaciones Microsoft.", manifest: "/manifest.webmanifest" };
export const viewport: Viewport = { themeColor: "#111029", width: "device-width", initialScale: 1 };
export default function Layout({children}:{children:React.ReactNode}) { return <html lang="es"><body>{children}</body></html> }
