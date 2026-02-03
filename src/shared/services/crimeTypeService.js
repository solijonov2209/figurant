import { crimeTypes as mockCrimeTypes } from '../data/crimeTypes';

// Bu service hozircha mockdata ishlatadi
// Keyinchalik API ulangandan keyin faqat shu faylni o'zgartirish kifoya

class CrimeTypeService {
  constructor() {
    const saved = localStorage.getItem('crimeTypes');
    const parsed = saved ? JSON.parse(saved) : null;
    // Eski ma'lumotlarda categoryId yo'q bo'lsa, mockdata qaytarish (migration)
    this.crimeTypes = (parsed && parsed[0] && parsed[0].categoryId) ? parsed : [...mockCrimeTypes];
  }

  // Ma'lumotlarni saqlash
  saveToLocalStorage() {
    localStorage.setItem('crimeTypes', JSON.stringify(this.crimeTypes));
  }

  // Barcha jinoyat turlarini olish
  async getAll() {
    return { data: [...this.crimeTypes] };
  }

  // Turkum (categoryId) bo'yicha jinoyat turlarini olish
  async getByCategoryId(categoryId) {
    const filtered = this.crimeTypes.filter(ct => ct.categoryId === categoryId);
    return { data: filtered };
  }

  // ID bo'yicha jinoyat turini olish
  async getById(id) {
    const crimeType = this.crimeTypes.find(ct => ct.id === id);
    if (!crimeType) {
      throw new Error('Jinoyat turi topilmadi');
    }
    return { data: crimeType };
  }

  // Jinoyat turi qo'shish (faqat Super Admin)
  async create(crimeTypeData, user) {
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
