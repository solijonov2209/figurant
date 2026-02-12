import { axiosInstance, USE_MOCK_DATA, API_ENDPOINTS } from '../config/api.config';
import { admins as mockAdmins } from '../data/mockData';

class AdminService {
  constructor() {
    // LocalStorage dan ma'lumotlarni yuklash (faqat mock data uchun)
    const savedAdmins = localStorage.getItem('admins');
    this.admins = savedAdmins ? JSON.parse(savedAdmins) : [...mockAdmins];
  }

  // Ma'lumotlarni saqlash (faqat mock data uchun)
  saveToLocalStorage() {
    localStorage.setItem('admins', JSON.stringify(this.admins));
  }

  // Barcha adminlarni olish
  async getAll() {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      const adminsWithoutPasswords = this.admins.map(({ password, ...admin }) => admin);
      return { data: adminsWithoutPasswords };
    }

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.USERS.BASE);
      // Pagination bo'lsa, results ni olish
      const data = response.data.results || response.data;
      return { data };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.detail || 'Adminlarni yuklashda xatolik');
    }
  }

  // JQB adminlarni olish (faqat Super Admin)
  async getJQBAdmins(user) {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      if (user.role !== 'SUPER_ADMIN') {
        throw new Error('Sizda bu amalni bajarish huquqi yo\'q');
      }

      const jqbAdmins = this.admins.filter(a => a.role === 'JQB_ADMIN');
      const adminsWithoutPasswords = jqbAdmins.map(({ password, ...admin }) => admin);
      return { data: adminsWithoutPasswords };
    }

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.USERS.BASE, {
        params: { role: 'JQB_ADMIN' }
      });
      const data = response.data.results || response.data;
      const jqbAdmins = Array.isArray(data) ? data.filter(u => u.role === 'JQB_ADMIN') : [];
      return { data: jqbAdmins };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.detail || 'JQB adminlarni yuklashda xatolik');
    }
  }

  // Mahalla inspektorlarni olish (Super Admin va JQB)
  async getMahallaInspectors(user) {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      if (user.role === 'MAHALLA_INSPECTOR') {
        throw new Error('Sizda bu amalni bajarish huquqi yo\'q');
      }

      let inspectors = this.admins.filter(a => a.role === 'MAHALLA_INSPECTOR');

      // JQB admin faqat o'z tumanidagi BARCHA inspektorlarni ko'radi
      if (user.role === 'JQB_ADMIN') {
        inspectors = inspectors.filter(a => a.districtId === user.districtId);
      }

      const inspectorsWithoutPasswords = inspectors.map(({ password, ...admin }) => admin);
      return { data: inspectorsWithoutPasswords };
    }

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.USERS.BASE, {
        params: { role: 'MAHALLA_INSPECTOR' }
      });
      let data = response.data.results || response.data;
      let inspectors = Array.isArray(data) ? data.filter(u => u.role === 'MAHALLA_INSPECTOR') : [];

      // JQB admin faqat o'z tumanidagi inspektorlarni ko'radi
      if (user.role === 'JQB_ADMIN') {
        inspectors = inspectors.filter(i => i.districtId === user.districtId || i.district === user.districtId);
      }

      return { data: inspectors };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.detail || 'Inspektorlarni yuklashda xatolik');
    }
  }

  // Admin qo'shish (Super Admin va JQB Admin)
  async create(adminData, user) {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      // Ruxsat tekshiruvi
      if (user.role === 'MAHALLA_INSPECTOR') {
        throw new Error('Sizda bu amalni bajarish huquqi yo\'q');
      }

      // JQB Admin faqat o'z tumaniga mahalla inspektor qo'sha oladi
      if (user.role === 'JQB_ADMIN') {
        if (adminData.role !== 'MAHALLA_INSPECTOR') {
          throw new Error('Siz faqat mahalla inspektori qo\'sha olasiz');
        }
        if (parseInt(adminData.districtId) !== user.districtId) {
          throw new Error('Siz faqat o\'z tumaningizga inspektor qo\'sha olasiz');
        }
      }

      // Login mavjudligini tekshirish
      const existingAdmin = this.admins.find(a => a.username === adminData.username);
      if (existingAdmin) {
        throw new Error('Bu login band');
      }

      const newAdmin = {
        id: Math.max(...this.admins.map(a => a.id), 0) + 1,
        ...adminData,
        createdBy: user.id,
        createdAt: new Date().toISOString()
      };

      this.admins.push(newAdmin);
      this.saveToLocalStorage();

      const { password, ...adminWithoutPassword } = newAdmin;
      return { data: adminWithoutPassword };
    }

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.USERS.BASE, {
        ...adminData,
        created_by: user.id
      });
      return { data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.message
        || error.response?.data?.detail
        || error.response?.data?.username?.[0]
        || 'Admin qo\'shishda xatolik';
      throw new Error(errorMsg);
    }
  }

  // Adminni tahrirlash
  async update(adminData, user) {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      if (user.role !== 'SUPER_ADMIN') {
        throw new Error('Sizda bu amalni bajarish huquqi yo\'q');
      }

      const index = this.admins.findIndex(a => a.id === adminData.id);
      if (index === -1) {
        throw new Error('Admin topilmadi');
      }

      // Login o'zgartirilayotgan bo'lsa, mavjudligini tekshirish
      if (adminData.username && adminData.username !== this.admins[index].username) {
        const existingAdmin = this.admins.find(a => a.username === adminData.username && a.id !== adminData.id);
        if (existingAdmin) {
          throw new Error('Bu login band');
        }
      }

      this.admins[index] = { ...this.admins[index], ...adminData };
      this.saveToLocalStorage();

      const { password, ...adminWithoutPassword } = this.admins[index];
      return { data: adminWithoutPassword };
    }

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.put(
        API_ENDPOINTS.USERS.BY_ID(adminData.id),
        {
          ...adminData,
          updated_by: user.id
        }
      );
      return { data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.message
        || error.response?.data?.detail
        || error.response?.data?.username?.[0]
        || 'Admin tahrirlashda xatolik';
      throw new Error(errorMsg);
    }
  }

  // Adminni o'chirish (faqat Super Admin)
  async delete(id, user) {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      if (user.role !== 'SUPER_ADMIN') {
        throw new Error('Sizda bu amalni bajarish huquqi yo\'q');
      }

      const index = this.admins.findIndex(a => a.id === id);
      if (index === -1) {
        throw new Error('Admin topilmadi');
      }

      // Super Adminni o'chirish mumkin emas
      if (this.admins[index].role === 'SUPER_ADMIN') {
        throw new Error('Super Adminni o\'chirish mumkin emas');
      }

      this.admins.splice(index, 1);
      this.saveToLocalStorage();

      return { data: { success: true } };
    }

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.delete(API_ENDPOINTS.USERS.BY_ID(id));
      return { data: response.data || { success: true } };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.detail || 'Admin o\'chirishda xatolik');
    }
  }

  // ID bo'yicha admin olish
  async getById(id) {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      const admin = this.admins.find(a => a.id === id);
      if (!admin) {
        throw new Error('Admin topilmadi');
      }

      const { password, ...adminWithoutPassword } = admin;
      return { data: adminWithoutPassword };
    }

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.USERS.BY_ID(id));
      return { data: response.data };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.detail || 'Adminni yuklashda xatolik');
    }
  }

  // Admin statistikasini olish
  async getStats() {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      const totalAdmins = this.admins.length;
      const jqbAdmins = this.admins.filter(a => a.role === 'JQB_ADMIN').length;
      const inspectors = this.admins.filter(a => a.role === 'MAHALLA_INSPECTOR').length;

      return {
        data: {
          total: totalAdmins,
          jqbAdmins,
          inspectors
        }
      };
    }

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.USERS.STATISTICS.ADMIN_AND_OFFENDERS_COUNT);
      return { data: response.data };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.detail || 'Statistikani yuklashda xatolik');
    }
  }
}

export default new AdminService();
