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
    return { data: [...this.categories] };
  }

  async create(data, user) {
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

  async update(id, data, user) {
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

  async delete(id, user) {
    if (user.role !== 'SUPER_ADMIN') {
      throw new Error('Sizda bu amalni bajarish huquqi yo\'q');
    }

    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Turkum topilmadi');

    this.categories.splice(index, 1);
    this.save();
    return { data: {} };
  }
}

export default new CrimeCategoryService();
