import { axiosInstance, USE_MOCK_DATA, API_ENDPOINTS, setAuthToken, clearAuthToken } from '../config/api.config';
import { admins as mockAdmins } from '../data/mockData';

class AuthService {
  // Login
  async login(username, password) {
    console.log('🔍 Login attempt:', { username, password, USE_MOCK_DATA });
    console.log('📋 Available admins:', mockAdmins.map(a => ({ login: a.login, role: a.role })));

    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      const admin = mockAdmins.find(
        (a) => a.login === username && a.password === password
      );

      console.log('👤 Found admin:', admin ? 'YES' : 'NO', admin);

      if (admin) {
        const token = `mock_token_${admin.id}_${Date.now()}`;
        setAuthToken(token);

        const userData = {
          id: admin.id,
          username: admin.login, // login ni username sifatida qaytarish
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
        console.log('✅ Login successful:', userData);
        return { success: true, data: userData };
      }

      console.log('❌ Login failed: wrong credentials');
      return { success: false, error: "Login yoki parol noto'g'ri" };
    }

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, {
        username,
        password
      });

      const { token, user } = response.data;

      setAuthToken(token);
      localStorage.setItem('user', JSON.stringify(user));

      return { success: true, data: user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login yoki parol noto'g'ri"
      };
    }
  }

  // Logout
  async logout() {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      clearAuthToken();
      localStorage.removeItem('user');
      return { success: true };
    }

    // Real API bilan ishlash
    try {
      await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
      clearAuthToken();
      localStorage.removeItem('user');
      return { success: true };
    } catch (error) {
      // Logout xatosi bo'lsa ham local ma'lumotlarni o'chirish
      clearAuthToken();
      localStorage.removeItem('user');
      return { success: true };
    }
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

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.AUTH.ME);
      const user = response.data;

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
