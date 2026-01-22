"use client";

import { useRouter } from "next/navigation";

export default function HelpPage() {
    const router = useRouter();

    const faqs = [
        { q: "¿Cómo creo un relevamiento?", a: "Ve a la pantalla de Inicio y toca el botón 'Nueva Tarea' o usa el escáner QR." },
        { q: "¿Funciona sin internet?", a: "Sí, la PWA guarda tus cambios y los sincroniza cuando recuperas la conexión." },
        { q: "¿Cómo cambio mi contraseña?", a: "Por seguridad, debes solicitarlo al administrador de tu territorio." },
    ];

    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark p-6 pb-24 text-[#171216] dark:text-white">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-2xl font-bold">Ayuda y Soporte</h1>
            </header>

            <div className="space-y-6">
                <section className="bg-primary text-white p-6 rounded-2xl shadow-lg shadow-purple-900/20">
                    <h2 className="text-lg font-bold mb-2">¿Necesitas asistencia inmediata?</h2>
                    <p className="text-sm opacity-90 mb-4">Nuestro equipo de soporte está disponible las 24hs para emergencias operativas.</p>
                    <button className="bg-white text-primary px-4 py-2 rounded-lg font-bold text-sm w-full">
                        Contactar Soporte
                    </button>
                </section>

                <section>
                    <h3 className="font-bold text-lg mb-4">Preguntas Frecuentes</h3>
                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                                <p className="font-bold text-sm text-[#851c74] mb-2">{faq.q}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="size-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <span className="material-symbols-outlined">school</span>
                    </div>
                    <div>
                        <p className="font-bold">Tutoriales en Video</p>
                        <p className="text-xs text-gray-500">Aprende a usar la plataforma</p>
                    </div>
                    <span className="material-symbols-outlined ml-auto text-gray-300">open_in_new</span>
                </section>
            </div>
        </main>
    );
}
