import { axiosInstance, USE_MOCK_DATA, API_ENDPOINTS } from '../config/api.config';
import { crimeCategories as mockCategories } from '../data/crimeCategories';

class CrimeCategoryService {
  constructor() {
    const saved = localStorage.getItem('crimeCategories');
    this.categories = saved ? JSON.parse(saved) : [...mockCategories];
  }

  save() {
    localStorage.setItem('crimeCategories', JSON.stringify(this.categories));
  }

  async getAll() {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      return { data: [...this.categories] };
    }

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.CRIME_CATEGORIES.BASE);
      const data = response.data.results || response.data;
      return { data: Array.isArray(data) ? data : [] };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.detail || 'Turkumlarni yuklashda xatolik');
    }
  }

  async create(data, user) {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      if (user.role !== 'SUPER_ADMIN') {
        throw new Error('Sizda bu amalni bajarish huquqi yo\'q');
      }

      if (this.categories.find(c => c.name.toLowerCase() === data.name.toLowerCase())) {
        throw new Error('Bu turkum allaqachon mavjud');
      }

      const newCategory = {
        id: Math.max(...this.categories.map(c => c.id), 0) + 1,
        name: data.name,
        createdAt: new Date().toISOString()
      };

      this.categories.push(newCategory);
      this.save();
      return { data: newCategory };
    }

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.CRIME_CATEGORIES.BASE, {
        name: data.name
      });
      return { data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.message
        || error.response?.data?.detail
        || error.response?.data?.name?.[0]
        || 'Turkum qo\'shishda xatolik';
      throw new Error(errorMsg);
    }
  }

  async update(id, data, user) {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      if (user.role !== 'SUPER_ADMIN') {
        throw new Error('Sizda bu amalni bajarish huquqi yo\'q');
      }

      const index = this.categories.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Turkum topilmadi');

      if (data.name && data.name !== this.categories[index].name) {
        if (this.categories.find(c => c.name.toLowerCase() === data.name.toLowerCase())) {
          throw new Error('Bu turkum allaqachon mavjud');
        }
      }

      this.categories[index] = { ...this.categories[index], ...data };
      this.save();
      return { data: this.categories[index] };
    }

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.put(
        API_ENDPOINTS.CRIME_CATEGORIES.BY_ID(id),
        { name: data.name }
      );
      return { data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.message
        || error.response?.data?.detail
        || error.response?.data?.name?.[0]
        || 'Turkumni tahrirlashda xatolik';
      throw new Error(errorMsg);
    }
  }

  async delete(id, user) {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      if (user.role !== 'SUPER_ADMIN') {
        throw new Error('Sizda bu amalni bajarish huquqi yo\'q');
      }

      const index = this.categories.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Turkum topilmadi');

      this.categories.splice(index, 1);
      this.save();
      return { data: {} };
    }

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.delete(
        API_ENDPOINTS.CRIME_CATEGORIES.BY_ID(id)
      );
      return { data: response.data || {} };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.detail || 'Turkumni o\'chirishda xatolik');
    }
  }
}

export default new CrimeCategoryService();
