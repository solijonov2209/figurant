import { crimeTypes as mockCrimeTypes } from '../data/crimeTypes';

// Bu service hozircha mockdata ishlatadi
// Keyinchalik API ulangandan keyin faqat shu faylni o'zgartirish kifoya

class CrimeTypeService {
  constructor() {
    // LocalStorage dan ma'lumotlarni yuklash
    const savedCrimeTypes = localStorage.getItem('crimeTypes');
    this.crimeTypes = savedCrimeTypes ? JSON.parse(savedCrimeTypes) : [...mockCrimeTypes];
  }

  // Ma'lumotlarni saqlash
  saveToLocalStorage() {
    localStorage.setItem('crimeTypes', JSON.stringify(this.crimeTypes));
  }

  // Barcha jinoyat turlarini olish
  async getAll() {
    // Keyinchalik API: return axios.get('/crime-types')
    return { data: [...this.crimeTypes] };
  }

  // ID bo'yicha jinoyat turini olish
  async getById(id) {
    // Keyinchalik API: return axios.get(`/crime-types/${id}`)
    const crimeType = this.crimeTypes.find(ct => ct.id === id);
    if (!crimeType) {
      throw new Error('Jinoyat turi topilmadi');
    }
    return { data: crimeType };
  }

  // Jinoyat turi qo'shish (faqat Super Admin)
  async create(crimeTypeData, user) {
    // Keyinchalik API: return axios.post('/crime-types', crimeTypeData)

    if (user.role !== 'SUPER_ADMIN') {
      throw new Error('Sizda bu amalni bajarish huquqi yo\'q');
    }

    // Mavjudligini tekshirish
    const exists = this.crimeTypes.find(ct =>
      ct.name.toLowerCase() === crimeTypeData.name.toLowerCase()
    );

    if (exists) {
      throw new Error('Bu jinoyat turi allaqachon mavjud');
    }

    const newCrimeType = {
      id: Math.max(...this.crimeTypes.map(ct => ct.id), 0) + 1,
      name: crimeTypeData.name,
      createdAt: new Date().toISOString()
    };

    this.crimeTypes.push(newCrimeType);
    this.saveToLocalStorage();

    return { data: newCrimeType };
  }

  // Jinoyat turini tahrirlash (faqat Super Admin)
  async update(id, crimeTypeData, user) {
    // Keyinchalik API: return axios.put(`/crime-types/${id}`, crimeTypeData)

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

  // Jinoyat turini o'chirish (faqat Super Admin)
  async delete(id, user) {
    // Keyinchalik API: return axios.delete(`/crime-types/${id}`)

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
}

export default new CrimeTypeService();
