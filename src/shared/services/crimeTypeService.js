import { axiosInstance, USE_MOCK_DATA, API_ENDPOINTS } from '../config/api.config';
import { crimeTypes as mockCrimeTypes } from '../data/crimeTypes';

class CrimeTypeService {
  constructor() {
    const saved = localStorage.getItem('crimeTypes');
    const parsed = saved ? JSON.parse(saved) : null;
    // Eski ma'lumotlarda categoryId yo'q bo'lsa, mockdata qaytarish (migration)
    this.crimeTypes = (parsed && parsed[0] && parsed[0].categoryId) ? parsed : [...mockCrimeTypes];
  }

  // Ma'lumotlarni saqlash (faqat mock data uchun)
  saveToLocalStorage() {
    localStorage.setItem('crimeTypes', JSON.stringify(this.crimeTypes));
  }

  // Barcha jinoyat turlarini olish
  async getAll() {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      return { data: [...this.crimeTypes] };
    }

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.CRIME_TYPES.BASE);
      const data = response.data.results || response.data;
      return { data: Array.isArray(data) ? data : [] };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.detail || 'Jinoyat turlarini yuklashda xatolik');
    }
  }

  // Turkum (categoryId) bo'yicha jinoyat turlarini olish
  async getByCategoryId(categoryId) {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      const filtered = this.crimeTypes.filter(ct => ct.categoryId === parseInt(categoryId));
      return { data: filtered };
    }

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.CRIME_TYPES.BASE, {
        params: { category: categoryId }
      });
      const data = response.data.results || response.data;
      return { data: Array.isArray(data) ? data : [] };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.detail || 'Jinoyat turlarini yuklashda xatolik');
    }
  }

  // ID bo'yicha jinoyat turini olish
  async getById(id) {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      const crimeType = this.crimeTypes.find(ct => ct.id === id);
      if (!crimeType) {
        throw new Error('Jinoyat turi topilmadi');
      }
      return { data: crimeType };
    }

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.CRIME_TYPES.BY_ID(id));
      return { data: response.data };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.detail || 'Jinoyat turini yuklashda xatolik');
    }
  }

  // Jinoyat turi qo'shish (faqat Super Admin)
  async create(crimeTypeData, user) {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      if (user.role !== 'SUPER_ADMIN') {
        throw new Error('Sizda bu amalni bajarish huquqi yo\'q');
      }

      if (!crimeTypeData.categoryId) {
        throw new Error('Turkum tanlash zarur');
      }

      // Bir turkumda bir xil nom tekshirish
      const exists = this.crimeTypes.find(ct =>
        ct.name.toLowerCase() === crimeTypeData.name.toLowerCase() &&
        ct.categoryId === crimeTypeData.categoryId
      );

      if (exists) {
        throw new Error('Bu jinoyat turi allaqachon mavjud');
      }

      const newCrimeType = {
        id: Math.max(...this.crimeTypes.map(ct => ct.id), 0) + 1,
        name: crimeTypeData.name,
        categoryId: crimeTypeData.categoryId,
        createdAt: new Date().toISOString()
      };

      this.crimeTypes.push(newCrimeType);
      this.saveToLocalStorage();

      return { data: newCrimeType };
    }

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.CRIME_TYPES.BASE, {
        name: crimeTypeData.name,
        category: crimeTypeData.categoryId
      });
      return { data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.message
        || error.response?.data?.detail
        || error.response?.data?.name?.[0]
        || 'Jinoyat turi qo\'shishda xatolik';
      throw new Error(errorMsg);
    }
  }

  // Jinoyat turini tahrirlash (faqat Super Admin)
  async update(id, crimeTypeData, user) {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      if (user.role !== 'SUPER_ADMIN') {
        throw new Error('Sizda bu amalni bajarish huquqi yo\'q');
      }

      const index = this.crimeTypes.findIndex(ct => ct.id === id);
      if (index === -1) {
        throw new Error('Jinoyat turi topilmadi');
      }

      // Ism o'zgartirilayotgan bo'lsa, mavjudligini tekshirish
      if (crimeTypeData.name && crimeTypeData.name !== this.crimeTypes[index].name) {
        const exists = this.crimeTypes.find(ct =>
          ct.name.toLowerCase() === crimeTypeData.name.toLowerCase()
        );
        if (exists) {
          throw new Error('Bu jinoyat turi allaqachon mavjud');
        }
      }

      this.crimeTypes[index] = { ...this.crimeTypes[index], ...crimeTypeData };
      this.saveToLocalStorage();

      return { data: this.crimeTypes[index] };
    }

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.put(
        API_ENDPOINTS.CRIME_TYPES.BY_ID(id),
        {
          name: crimeTypeData.name,
          category: crimeTypeData.categoryId
        }
      );
      return { data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.message
        || error.response?.data?.detail
        || error.response?.data?.name?.[0]
        || 'Jinoyat turini tahrirlashda xatolik';
      throw new Error(errorMsg);
    }
  }

  // Jinoyat turini o'chirish (faqat Super Admin)
  async delete(id, user) {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      if (user.role !== 'SUPER_ADMIN') {
        throw new Error('Sizda bu amalni bajarish huquqi yo\'q');
      }

      const index = this.crimeTypes.findIndex(ct => ct.id === id);
      if (index === -1) {
        throw new Error('Jinoyat turi topilmadi');
      }

      this.crimeTypes.splice(index, 1);
      this.saveToLocalStorage();

      return { data: { success: true } };
    }

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.delete(API_ENDPOINTS.CRIME_TYPES.BY_ID(id));
      return { data: response.data || { success: true } };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.detail || 'Jinoyat turini o\'chirishda xatolik');
    }
  }
}

export default new CrimeTypeService();
