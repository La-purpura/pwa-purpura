"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Re-importing types from fixtures (now only for types, data is DB-driven)
import {
  User, Task, Incident, Alert, Kpis, Draft, Project, Report
} from "./types";

// Announcement Types
export interface Announcement {
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  isActive: boolean;
}

interface AppState {
  // Auth
  user: (User & { permissions?: string[] }) | null;
  setUser: (user: (User & { permissions?: string[] }) | null) => void;
  logout: () => Promise<void>;

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

  // UI State
  territoryFilter: { section: string; district: string | null };
  setTerritoryFilter: (filter: { section: string; district: string | null }) => void;

  // Global Broadcast System
  globalAnnouncement: Announcement | null;
  setGlobalAnnouncement: (announcement: Announcement | null) => void;
  isBroadcastModalOpen: boolean;
  setBroadcastModalOpen: (isOpen: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth: Always starts null until login or hydrated
      user: null,
      setUser: (user) => set({ user }),
      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
          set({ user: null });
        } catch (error) {
          console.error("Logout failed:", error);
          set({ user: null });
        }
      },

      // Collections: Always empty initially, populated by API
      tasks: [],
      setTasks: (tasks) => set({ tasks }),
      addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),

      incidents: [],
      setIncidents: (incidents) => set({ incidents }),
      addIncident: (incident) => set((state) => ({ incidents: [incident, ...state.incidents] })),

      alerts: [],
      setAlerts: (alerts) => set({ alerts }),
      addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
      markAlertAsRead: (id) => set((state) => ({
        alerts: state.alerts.map((a) => a.id === id ? { ...a, isRead: true } : a)
      })),

      reports: [],

      users: [],
      addUser: (user) => set((state) => ({ users: [user, ...state.users] })),

      drafts: [],
      addDraft: (draft) => set((state) => ({ drafts: [draft, ...state.drafts] })),
      removeDraft: (id) => set((state) => ({ drafts: state.drafts.filter((d) => d.id !== id) })),

      projects: [],
      setProjects: (projects) => set({ projects }),

      // Offline
      offlineQueue: [],
      addToOfflineQueue: (item) => set((state) => ({ offlineQueue: [...state.offlineQueue, item] })),
      removeFromOfflineQueue: (id) => set((state) => ({ offlineQueue: state.offlineQueue.filter((i) => i.id !== id) })),
      clearOfflineQueue: () => set({ offlineQueue: [] }),

      // KPIs: Real 0 initially
      kpis: {
        activeAlerts: 0,
        pendingTasks: 0,
        projects: 0,
        coverage: 0,
        incidents: 0,
      },
      updateKpis: (newKpis) => set((state) => ({ kpis: { ...state.kpis, ...newKpis } })),

      // UI State
      territoryFilter: { section: "all", district: null },
      setTerritoryFilter: (filter) => set({ territoryFilter: filter }),

      // Broadcast Defaults
      globalAnnouncement: null,
      setGlobalAnnouncement: (announcement) => set({ globalAnnouncement: announcement }),
      isBroadcastModalOpen: false,
      setBroadcastModalOpen: (isOpen) => set({ isBroadcastModalOpen: isOpen }),
    }),
    {
      name: "lp-pwa-storage",
    }
  )
);
