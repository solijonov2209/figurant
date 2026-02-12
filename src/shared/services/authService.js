import { axiosInstance, USE_MOCK_DATA, API_ENDPOINTS, setAuthToken, clearAuthToken } from '../config/api.config';
import { admins as mockAdmins } from '../data/mockData';

class AuthService {
  // Login
  async login(username, password) {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      const admin = mockAdmins.find(
        (a) => a.username === username && a.password === password
      );

      if (admin) {
        const token = `mock_token_${admin.id}_${Date.now()}`;
        setAuthToken(token);

        const userData = {
          id: admin.id,
          username: admin.username,
          firstName: admin.firstName,
          lastName: admin.lastName,
          phoneNumber: admin.phoneNumber,
          role: admin.role,
          districtId: admin.districtId,
          districtName: admin.districtName,
          mahallaId: admin.mahallaId,
          mahallaName: admin.mahallaName
        };

        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, data: userData };
      }

      return { success: false, error: "Login yoki parol noto'g'ri" };
    }

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, {
        username,
        password
      });

      // Response strukturasi: { token: "...", user: {...} }
      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error("Noto'g'ri response strukturasi");
      }

      setAuthToken(token);
      localStorage.setItem('user', JSON.stringify(user));

      return { success: true, data: user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.detail || "Login yoki parol noto'g'ri"
      };
    }
  }

  // Logout
  async logout() {
    // API da logout endpoint yo'q, shunchaki tokenni o'chiramiz
    clearAuthToken();
    localStorage.removeItem('user');
    return { success: true };
  }

  // Foydalanuvchi ma'lumotlarini tekshirish
  async me() {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      const userData = localStorage.getItem('user');
      if (userData) {
        return { success: true, data: JSON.parse(userData) };
      }
      return { success: false };
    }

    // Real API bilan ishlash - /users/profile/ endpoint
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.AUTH.PROFILE);

      // Response array bo'lsa, birinchi elementni olish
      const user = Array.isArray(response.data) && response.data.length > 0
        ? response.data[0]
        : response.data;

      localStorage.setItem('user', JSON.stringify(user));
      return { success: true, data: user };
    } catch (error) {
      clearAuthToken();
      localStorage.removeItem('user');
      return { success: false };
    }
  }

  // Joriy foydalanuvchini olish
  getCurrentUser() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }
}

export default new AuthService();
