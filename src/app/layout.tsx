import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plataforma EXCOBA",
  description:
    "Plataforma de estudio, práctica y simuladores para el examen EXCOBA de la UAQ.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-paper text-ink font-body antialiased">
        {children}
      </body>
    </html>
  );
}
