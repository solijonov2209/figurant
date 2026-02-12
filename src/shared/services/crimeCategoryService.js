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
      return { data: response.data };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Turkumlarni yuklashda xatolik');
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
      const response = await axiosInstance.post(API_ENDPOINTS.CRIME_CATEGORIES.BASE, data);
      return { data: response.data };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Turkum qo\'shishda xatolik');
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
        `${API_ENDPOINTS.CRIME_CATEGORIES.BASE}/${id}`,
        data
      );
      return { data: response.data };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Turkumni tahrirlashda xatolik');
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
        `${API_ENDPOINTS.CRIME_CATEGORIES.BASE}/${id}`
      );
      return { data: response.data };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Turkumni o\'chirishda xatolik');
    }
  }
}

export default new CrimeCategoryService();
