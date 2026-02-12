import { axiosInstance, USE_MOCK_DATA, API_ENDPOINTS } from '../config/api.config';
import { districts as mockDistricts, mahallas as mockMahallas } from '../data/mockData';

class DistrictService {
  // Barcha tumanlarni olish
  async getAll() {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      return { data: mockDistricts };
    }

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.DISTRICTS.BASE);
      return { data: response.data };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Tumanlarni yuklashda xatolik');
    }
  }

  // ID bo'yicha tumanni olish
  async getById(id) {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      const district = mockDistricts.find(d => d.id === id);
      if (!district) {
        throw new Error('Tuman topilmadi');
      }
      return { data: district };
    }

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.get(`${API_ENDPOINTS.DISTRICTS.BASE}/${id}`);
      return { data: response.data };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Tumanni yuklashda xatolik');
    }
  }

  // Tuman mahallalarini olish
  async getMahallas(districtId) {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      const mahallas = mockMahallas.filter(m => m.districtId === districtId);
      return { data: mahallas };
    }

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.DISTRICTS.MAHALLAS(districtId)
      );
      return { data: response.data };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Mahallalarni yuklashda xatolik');
    }
  }

  // Barcha mahallalarni olish
  async getAllMahallas() {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      return { data: mockMahallas };
    }

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.get(`${API_ENDPOINTS.DISTRICTS.BASE}/mahallas`);
      return { data: response.data };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Mahallalarni yuklashda xatolik');
    }
  }

  // ID bo'yicha mahalla olish
  async getMahallaById(id) {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      const mahalla = mockMahallas.find(m => m.id === id);
      if (!mahalla) {
        throw new Error('Mahalla topilmadi');
      }
      return { data: mahalla };
    }

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.get(`${API_ENDPOINTS.DISTRICTS.BASE}/mahallas/${id}`);
      return { data: response.data };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Mahallani yuklashda xatolik');
    }
  }
}

export default new DistrictService();
