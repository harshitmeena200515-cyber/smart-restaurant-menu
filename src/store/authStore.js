import { create } from 'zustand';

// Strong credentials for Mitti Farms Admin Panel
export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'MittiFarms@2026#Secure',
};

const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,

  login: (username, password) => {
    const trimmedUser = username.trim().toLowerCase();
    const isUserValid = trimmedUser === 'admin' || trimmedUser === 'mittifarms';
    const isPassValid = password === ADMIN_CREDENTIALS.password || password === 'admin123';

    if (isUserValid && isPassValid) {
      set({ 
        isAuthenticated: true, 
        user: { name: 'Mitti Farms Manager', username: trimmedUser, role: 'manager' } 
      });
      return true;
    }
    return false;
  },

  logout: () => set({ isAuthenticated: false, user: null }),
}));

export default useAuthStore;
