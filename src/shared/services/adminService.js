import { admins as mockAdmins } from '../data/mockData';

// Bu service hozircha mockdata ishlatadi
// Keyinchalik API ulangandan keyin faqat shu faylni o'zgartirish kifoya

class AdminService {
  constructor() {
    // LocalStorage dan ma'lumotlarni yuklash
    const savedAdmins = localStorage.getItem('admins');
    this.admins = savedAdmins ? JSON.parse(savedAdmins) : [...mockAdmins];
  }

  // Ma'lumotlarni saqlash
  saveToLocalStorage() {
    localStorage.setItem('admins', JSON.stringify(this.admins));
  }

  // Login
  async login(login, password) {
    // Keyinchalik API: return axios.post('/auth/login', { login, password })

    const admin = this.admins.find(a => a.login === login && a.password === password);

    if (!admin) {
      throw new Error('Login yoki parol xato');
    }

    // Parolni o'chirish (xavfsizlik uchun)
    const { password: _, ...adminWithoutPassword } = admin;

    return { data: adminWithoutPassword };
  }

  // Barcha adminlarni olish (faqat Super Admin)
  async getAll(user) {
    // Keyinchalik API: return axios.get('/admins')

    if (user.role !== 'SUPER_ADMIN') {
      throw new Error('Sizda bu amalni bajarish huquqi yo\'q');
    }

    // Parollarni o'chirish
    const adminsWithoutPasswords = this.admins.map(({ password, ...admin }) => admin);

    return { data: adminsWithoutPasswords };
  }

  // JQB adminlarni olish (faqat Super Admin)
  async getJQBAdmins(user) {
    // Keyinchalik API: return axios.get('/admins/jqb')

    if (user.role !== 'SUPER_ADMIN') {
      throw new Error('Sizda bu amalni bajarish huquqi yo\'q');
    }

    const jqbAdmins = this.admins.filter(a => a.role === 'JQB_ADMIN');
    const adminsWithoutPasswords = jqbAdmins.map(({ password, ...admin }) => admin);

    return { data: adminsWithoutPasswords };
  }

  // Mahalla inspektorlarni olish (Super Admin va JQB)
  async getMahallaInspectors(user) {
    // Keyinchalik API: return axios.get('/admins/mahalla', { params: { userId: user.id } })

    if (user.role === 'MAHALLA_INSPECTOR') {
      throw new Error('Sizda bu amalni bajarish huquqi yo\'q');
    }

    let inspectors = this.admins.filter(a => a.role === 'MAHALLA_INSPECTOR');

    // JQB admin faqat o'z tumanini ko'radi
    if (user.role === 'JQB_ADMIN') {
      inspectors = inspectors.filter(a => a.districtId === user.districtId);
    }

    const inspectorsWithoutPasswords = inspectors.map(({ password, ...admin }) => admin);

    return { data: inspectorsWithoutPasswords };
  }

  // Admin qo'shish (faqat Super Admin)
  async create(adminData, user) {
    // Keyinchalik API: return axios.post('/admins', { ...adminData, createdBy: user.id })

    if (user.role !== 'SUPER_ADMIN') {
      throw new Error('Sizda bu amalni bajarish huquqi yo\'q');
    }

    // Login mavjudligini tekshirish
    const existingAdmin = this.admins.find(a => a.login === adminData.login);
    if (existingAdmin) {
      throw new Error('Bu login band');
    }

    const newAdmin = {
      id: Math.max(...this.admins.map(a => a.id), 0) + 1,
      ...adminData,
      createdAt: new Date().toISOString()
    };

    this.admins.push(newAdmin);
    this.saveToLocalStorage();

    // Parolni o'chirish
    const { password, ...adminWithoutPassword } = newAdmin;

    return { data: adminWithoutPassword };
  }

  // Adminni tahrirlash (faqat Super Admin)
  async update(id, adminData, user) {
    // Keyinchalik API: return axios.put(`/admins/${id}`, { ...adminData, updatedBy: user.id })

    if (user.role !== 'SUPER_ADMIN') {
      throw new Error('Sizda bu amalni bajarish huquqi yo\'q');
    }

    const index = this.admins.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('Admin topilmadi');
    }

    // Login o'zgartirilayotgan bo'lsa, mavjudligini tekshirish
    if (adminData.login && adminData.login !== this.admins[index].login) {
      const existingAdmin = this.admins.find(a => a.login === adminData.login);
      if (existingAdmin) {
        throw new Error('Bu login band');
      }
    }

    this.admins[index] = { ...this.admins[index], ...adminData };
    this.saveToLocalStorage();

    // Parolni o'chirish
    const { password, ...adminWithoutPassword } = this.admins[index];

    return { data: adminWithoutPassword };
  }

  // Adminni o'chirish (faqat Super Admin)
  async delete(id, user) {
    // Keyinchalik API: return axios.delete(`/admins/${id}`)

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

  // ID bo'yicha admin olish
  async getById(id) {
    // Keyinchalik API: return axios.get(`/admins/${id}`)

    const admin = this.admins.find(a => a.id === id);
    if (!admin) {
      throw new Error('Admin topilmadi');
    }

    // Parolni o'chirish
    const { password, ...adminWithoutPassword } = admin;

    return { data: adminWithoutPassword };
  }
}

export default new AdminService();
