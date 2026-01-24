"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export default function NewsNewPage() {
  const router = useRouter();
  const { user, addNews, addToOfflineQueue } = useAppStore((state) => ({
    user: state.user,
    addNews: state.addNews,
    addToOfflineQueue: state.addToOfflineQueue,
  }));
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !body.trim()) {
      alert("Completa el titulo y el contenido de la novedad.");
      return;
    }

    addNews({
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      title: title.trim(),
      summary: body.trim().slice(0, 140),
      author: user?.name ?? "Admin",
    });
    addToOfflineQueue({
      type: "draft",
      title: `Novedad: ${title.trim()}`,
    });
    void fetch("/api/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        summary: body.trim().slice(0, 140),
        author: user?.name ?? "Admin",
      }),
    });
    router.push("/news");
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-[#171216] dark:text-gray-100 min-h-screen">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center p-4 justify-between max-w-lg mx-auto">
          <Link
            className="text-primary flex size-10 shrink-0 items-center justify-center cursor-pointer"
            href="/news"
          >
            <span className="material-symbols-outlined">close</span>
          </Link>
          <h2 className="text-[#171216] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
            Nueva Novedad
          </h2>
          <div className="flex w-10 items-center justify-end">
            <Link className="text-primary text-sm font-bold leading-normal tracking-[0.015em] shrink-0 cursor-pointer" href="/news">
              Cancelar
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-lg mx-auto pb-32">
        <div className="px-4 pt-6">
          <h3 className="text-[#171216] dark:text-white tracking-tight text-2xl font-extrabold leading-tight">
            Contenido de la Noticia
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Redacta el comunicado oficial para el territorio.</p>
        </div>
        <form
          className="mx-4 mt-4 p-4 bg-white dark:bg-[#1f1e20] rounded-xl ios-shadow space-y-4"
          id="news-form"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-1">
            <label className="text-[#171216] dark:text-gray-200 text-sm font-semibold leading-normal px-1" htmlFor="news-title">
              Titulo de la Noticia
            </label>
            <input
              id="news-title"
              className="form-input flex w-full rounded-lg text-[#171216] dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary border border-[#e4dce3] dark:border-gray-700 bg-transparent h-12 placeholder:text-[#85667f] p-3 text-base"
              placeholder="Ej. Actualizacion de Protocolos"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[#171216] dark:text-gray-200 text-sm font-semibold leading-normal px-1" htmlFor="news-body">
              Cuerpo del Mensaje
            </label>
            <textarea
              id="news-body"
              className="form-input flex w-full resize-none rounded-lg text-[#171216] dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary border border-[#e4dce3] dark:border-gray-700 bg-transparent min-h-[160px] placeholder:text-[#85667f] p-3 text-base"
              placeholder="Escriba el comunicado aqui..."
              value={body}
              onChange={(event) => setBody(event.target.value)}
            ></textarea>
          </div>
        </form>
        <div className="px-4 pt-8 pb-2">
          <h3 className="text-[#171216] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
            Segmentacion y Visibilidad
          </h3>
          <p className="text-gray-500 text-xs mt-1 uppercase font-bold tracking-wider">Definicion de Alcance</p>
        </div>
        <div className="mx-4 bg-white dark:bg-[#1f1e20] rounded-xl ios-shadow divide-y divide-gray-100 dark:divide-gray-800">
          <div className="p-4">
            <label className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Seleccionar Rama</span>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">OBLIGATORIO</span>
              </div>
              <select className="form-select w-full rounded-lg border-[#e4dce3] dark:border-gray-700 bg-transparent text-gray-600 dark:text-gray-300 h-12 focus:ring-primary focus:border-primary">
                <option value="">Seleccione una opcion...</option>
                <option value="madre">Madre</option>
                <option value="pyme">PyME</option>
                <option value="deportes">Deportes</option>
                <option value="profesional">Profesional</option>
              </select>
            </label>
          </div>
          <div className="p-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Territorio Destino</span>
              <div className="flex flex-wrap gap-2 py-1">
                <div className="flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-full text-xs font-medium">
                  Norte
                  <span className="material-symbols-outlined text-sm cursor-pointer">cancel</span>
                </div>
                <div className="flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-full text-xs font-medium">
                  Centro-Sur
                  <span className="material-symbols-outlined text-sm cursor-pointer">cancel</span>
                </div>
                <button className="flex items-center gap-1 border-2 border-dashed border-[#e4dce3] dark:border-gray-700 text-gray-400 px-3 py-1.5 rounded-full text-xs font-medium" type="button">
                  <span className="material-symbols-outlined text-sm">add</span> Anadir
                </button>
              </div>
            </div>
          </div>
          <div className="p-4">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-3">Nivel de Visibilidad</span>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-2 p-2 border border-primary bg-primary/5 rounded-lg text-primary text-xs font-bold" type="button">
                <span className="material-symbols-outlined text-base">groups</span> Todos
              </button>
              <button className="flex items-center justify-center gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 text-xs font-bold" type="button">
                <span className="material-symbols-outlined text-base">admin_panel_settings</span> Admins
              </button>
              <button className="flex items-center justify-center gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 text-xs font-bold" type="button">
                <span className="material-symbols-outlined text-base">badge</span> Colab
              </button>
              <button className="flex items-center justify-center gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 text-xs font-bold" type="button">
                <span className="material-symbols-outlined text-base">account_tree</span> Rama
              </button>
            </div>
          </div>
        </div>
        <div className="px-4 pt-8 pb-2 flex justify-between items-center">
          <h3 className="text-[#171216] dark:text-white text-lg font-bold leading-tight">Biblioteca Tecnica</h3>
          <button className="text-primary text-sm font-bold flex items-center gap-1" type="button">
            <span className="material-symbols-outlined text-lg">attachment</span> Adjuntar
          </button>
        </div>
        <div className="mx-4 p-4 bg-white dark:bg-[#1f1e20] rounded-xl ios-shadow">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 p-3 bg-background-light dark:bg-background-dark rounded-lg border border-gray-100 dark:border-gray-800">
              <div className="size-10 bg-red-100 text-red-600 rounded flex items-center justify-center">
                <span className="material-symbols-outlined">picture_as_pdf</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">manual_usuario_v2.pdf</p>
                <p className="text-[10px] text-gray-500 uppercase">2.4 MB • Biblioteca</p>
              </div>
              <span className="material-symbols-outlined text-gray-400 cursor-pointer hover:text-red-500">delete</span>
            </div>
            <p className="text-center text-[11px] text-[#85667f] italic py-2">Solo archivos permitidos de la biblioteca central.</p>
          </div>
        </div>
        <div className="px-4 pt-8 pb-2">
          <h3 className="text-[#171216] dark:text-white text-lg font-bold">Configuracion Extra</h3>
        </div>
        <div className="mx-4 mb-8 bg-white dark:bg-[#1f1e20] rounded-xl ios-shadow">
          <div className="p-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Lectura Obligatoria</span>
              <span className="text-xs text-gray-400">Exige confirmacion del usuario</span>
            </div>
            <div className="relative inline-flex items-center cursor-pointer">
              <input defaultChecked className="sr-only peer" type="checkbox" value="" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </div>
          </div>
        </div>
      </main>
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-background-dark/90 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800 p-4 pb-8 z-50">
        <div className="max-w-lg mx-auto">
          <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2" type="submit" form="news-form">
            <span className="material-symbols-outlined">send</span>
            Publicar Novedad
          </button>
        </div>
      </div>
    </div>
  );
}
