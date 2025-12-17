import { vi } from 'vitest';

// Mock Firestore functions
export const mockFirestore = {
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  addDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
};

// Mock Auth functions
export const mockAuth = {
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  updateProfile: vi.fn(),
  currentUser: null,
};

// Mock Storage functions
export const mockStorage = {
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
};

// Helper to create mock document snapshot
export function createMockDocSnapshot(data: any, exists = true) {
  return {
    exists: () => exists,
    data: () => data,
    id: data?.id || 'mock-id',
    ref: { id: data?.id || 'mock-id' },
  };
}

// Helper to create mock query snapshot
export function createMockQuerySnapshot(docs: any[]) {
  return {
    empty: docs.length === 0,
    size: docs.length,
    docs: docs.map((data) => createMockDocSnapshot(data)),
    forEach: (callback: (doc: any) => void) => {
      docs.forEach((data) => callback(createMockDocSnapshot(data)));
    },
  };
}

// Reset all mocks
export function resetFirebaseMocks() {
  Object.values(mockFirestore).forEach((fn) => {
    if (typeof fn === 'function' && 'mockClear' in fn) {
      fn.mockClear();
    }
  });
  Object.values(mockAuth).forEach((fn) => {
    if (typeof fn === 'function' && 'mockClear' in fn) {
      fn.mockClear();
    }
  });
  Object.values(mockStorage).forEach((fn) => {
    if (typeof fn === 'function' && 'mockClear' in fn) {
      fn.mockClear();
    }
  });
}
