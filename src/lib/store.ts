"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  User, Task, Incident, Alert, Kpis, Draft, Project, News, Report,
  mockUserRegular, mockTasks, mockIncidents, mockAlerts, mockKpis, mockDrafts, mockProjects, mockNews, mockUsers, mockReports
} from "./mocks";

interface AppState {
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;

  // Collections
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;

  incidents: Incident[];
  setIncidents: (incidents: Incident[]) => void;
  addIncident: (incident: Incident) => void;

  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  markAlertAsRead: (id: string) => void;

  news: News[];
  addNews: (news: News) => void;

  reports: Report[];

  users: User[];
  addUser: (user: User) => void;

  drafts: Draft[];
  addDraft: (draft: Draft) => void;
  removeDraft: (id: string) => void;

  projects: Project[];
  setProjects: (projects: Project[]) => void;

  // Offline Queue
  offlineQueue: any[];
  addToOfflineQueue: (item: any) => void;
  removeFromOfflineQueue: (id: string) => void;
  clearOfflineQueue: () => void;

  // KPIs
  kpis: Kpis;
  updateKpis: (kpis: Partial<Kpis>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth
      user: null, // Initialize as null for auth guards
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),

      // Collections
      tasks: mockTasks,
      setTasks: (tasks) => set({ tasks }),
      addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),

      incidents: mockIncidents,
      setIncidents: (incidents) => set({ incidents }),
      addIncident: (incident) => set((state) => ({ incidents: [incident, ...state.incidents] })),

      alerts: mockAlerts,
      setAlerts: (alerts) => set({ alerts }),
      addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
      markAlertAsRead: (id) => set((state) => ({
        alerts: state.alerts.map((a) => a.id === id ? { ...a, isRead: true } : a)
      })),

      news: mockNews,
      addNews: (news) => set((state) => ({ news: [news, ...state.news] })),

      reports: mockReports,

      users: mockUsers,
      addUser: (user) => set((state) => ({ users: [user, ...state.users] })),

      drafts: mockDrafts,
      addDraft: (draft) => set((state) => ({ drafts: [draft, ...state.drafts] })),
      removeDraft: (id) => set((state) => ({ drafts: state.drafts.filter((d) => d.id !== id) })),

      projects: mockProjects,
      setProjects: (projects) => set({ projects }),

      // Offline
      offlineQueue: [],
      addToOfflineQueue: (item) => set((state) => ({ offlineQueue: [...state.offlineQueue, item] })),
      removeFromOfflineQueue: (id) => set((state) => ({ offlineQueue: state.offlineQueue.filter((i) => i.id !== id) })),
      clearOfflineQueue: () => set({ offlineQueue: [] }), // Added missing comma and closing brace earlier so careful here

      // KPIs
      kpis: mockKpis,
      updateKpis: (newKpis) => set((state) => ({ kpis: { ...state.kpis, ...newKpis } })),
    }),
    {
      name: "lp-pwa-storage",
    }
  )
);
