import { districts as mockDistricts, mahallas as mockMahallas } from '../data/mockData';

// Bu service hozircha mockdata ishlatadi
// Keyinchalik API ulangandan keyin faqat shu faylni o'zgartirish kifoya

class DistrictService {
  // Barcha tumanlarni olish
  async getAll() {
    // Keyinchalik API: return axios.get('/districts')
    return { data: mockDistricts };
  }

  // ID bo'yicha tumanni olish
  async getById(id) {
    // Keyinchalik API: return axios.get(`/districts/${id}`)
    const district = mockDistricts.find(d => d.id === id);
    if (!district) {
      throw new Error('Tuman topilmadi');
    }
    return { data: district };
  }

  // Tuman mahallalarini olish
  async getMahallas(districtId) {
    // Keyinchalik API: return axios.get(`/districts/${districtId}/mahallas`)
    const mahallas = mockMahallas.filter(m => m.districtId === districtId);
    return { data: mahallas };
  }

  // Barcha mahallalarni olish
  async getAllMahallas() {
    // Keyinchalik API: return axios.get('/mahallas')
    return { data: mockMahallas };
  }

  // ID bo'yicha mahalla olish
  async getMahallaById(id) {
    // Keyinchalik API: return axios.get(`/mahallas/${id}`)
    const mahalla = mockMahallas.find(m => m.id === id);
    if (!mahalla) {
      throw new Error('Mahalla topilmadi');
    }
    return { data: mahalla };
  }
}

export default new DistrictService();
