import "./globals.css";
import Nav from "../components/Nav";

export const metadata = {
  title: "Asistencia · Registro de clases",
  description: "Pasa la lista de tus cursos de forma rápida y visual"
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#5B5BE9" />
      </head>
      <body className="bg-paper text-ink antialiased">
        <main className="mx-auto max-w-lg px-4 pb-32 pt-6 min-h-screen">
          {children}
        </main>
        <Nav />
      </body>
    </html>
  );
}
