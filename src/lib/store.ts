"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  User, Task, Report, Alert, Kpis, Draft, Project
} from "./types";

// Announcement Types
export interface Announcement {
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  isActive: boolean;
}

export interface QueuedMutation {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  payload: any;
  timestamp: number;
  retryCount: number;
  title: string; // User-friendly description of the action
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

  reports: Report[];
  setReports: (reports: Report[]) => void;
  addReport: (report: Report) => void;

  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  markAlertAsRead: (id: string) => void;

  users: User[];
  addUser: (user: User) => void;

  drafts: Draft[];
  addDraft: (draft: Draft) => void;
  removeDraft: (id: string) => void;

  projects: Project[];
  setProjects: (projects: Project[]) => void;

  // Offline Queue
  offlineQueue: QueuedMutation[];
  addToOfflineQueue: (item: Omit<QueuedMutation, 'id' | 'timestamp' | 'retryCount'>) => void;
  removeFromOfflineQueue: (id: string) => void;
  clearOfflineQueue: () => void;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  setSyncStatus: (status: 'idle' | 'syncing' | 'error' | 'success') => void;

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

      reports: [],
      setReports: (reports) => set({ reports }),
      addReport: (report) => set((state) => ({ reports: [report, ...state.reports] })),

      alerts: [],
      setAlerts: (alerts) => set({ alerts }),
      addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
      markAlertAsRead: (id) => set((state) => ({
        alerts: state.alerts.map((a) => a.id === id ? { ...a, isRead: true } : a)
      })),

      users: [],
      addUser: (user) => set((state) => ({ users: [user, ...state.users] })),

      drafts: [],
      addDraft: (draft) => set((state) => ({ drafts: [draft, ...state.drafts] })),
      removeDraft: (id) => set((state) => ({ drafts: state.drafts.filter((d) => d.id !== id) })),

      projects: [],
      setProjects: (projects) => set({ projects }),

      // Offline
      offlineQueue: [],
      addToOfflineQueue: (item) => set((state) => ({
        offlineQueue: [
          ...state.offlineQueue,
          {
            ...item,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            retryCount: 0
          }
        ]
      })),
      removeFromOfflineQueue: (id) => set((state) => ({ offlineQueue: state.offlineQueue.filter((i) => i.id !== id) })),
      clearOfflineQueue: () => set({ offlineQueue: [] }),
      syncStatus: 'idle',
      setSyncStatus: (status) => set({ syncStatus: status }),

      // KPIs
      kpis: {
        activeAlerts: 0,
        pendingTasks: 0,
        projects: 0,
        coverage: 0,
        reports: 0,
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
