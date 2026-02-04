import { persons as mockPersons, admins as mockAdmins } from '../data/mockData';

// Bu service hozircha mockdata ishlatadi
// Keyinchalik API ulangandan keyin faqat shu faylni o'zgartirish kifoya

class PersonService {
  constructor() {
    // LocalStorage dan ma'lumotlarni yuklash
    const savedPersons = localStorage.getItem('persons');
    this.persons = savedPersons ? JSON.parse(savedPersons) : [...mockPersons];
  }

  // Ma'lumotlarni saqlash
  saveToLocalStorage() {
    localStorage.setItem('persons', JSON.stringify(this.persons));
  }

  // Barcha shaxslarni olish (role bo'yicha filtrlangan)
  async getAll(user) {
    // Keyinchalik API: return axios.get('/persons', { params: { userId: user.id } })

    let filteredPersons = [...this.persons];

    if (user.role === 'MAHALLA_INSPECTOR') {
      // Mahalla inspektori faqat o'zi qo'shganlarni ko'radi
      filteredPersons = filteredPersons.filter(p => p.registeredBy === user.id);
    } else if (user.role === 'JQB_ADMIN') {
      // JQB admin faqat o'z tumanini ko'radi
      filteredPersons = filteredPersons.filter(p => p.districtId === user.districtId);
    }
    // Super Admin hamma narsani ko'radi

    return { data: filteredPersons };
  }

  // Ishlovdagi shaxslarni olish
  async getInProcess(user) {
    // Keyinchalik API: return axios.get('/persons/in-process', { params: { userId: user.id } })

    let filteredPersons = this.persons.filter(p => p.inProcess);

    if (user.role === 'JQB_ADMIN') {
      filteredPersons = filteredPersons.filter(p => p.districtId === user.districtId);
    }

    return { data: filteredPersons };
  }

  // Shaxs qo'shish
  async create(personData, user) {
    // Keyinchalik API: return axios.post('/persons', { ...personData, userId: user.id })

    const newPerson = {
      id: Math.max(...this.persons.map(p => p.id), 0) + 1,
      ...personData,
      registeredBy: user.id,
      registeredByName: `${user.firstName} ${user.lastName}`,
      registeredByPhone: user.phoneNumber,
      registeredAt: new Date().toISOString(),
      inProcess: false,
      processedBy: null,
      processedByName: null,
      processedAt: null
    };

    this.persons.push(newPerson);
    this.saveToLocalStorage();

    return { data: newPerson };
  }

  // Shaxsni tahrirlash (faqat o'zi qo'shganini)
  async update(id, personData, user) {
    // Keyinchalik API: return axios.put(`/persons/${id}`, { ...personData, userId: user.id })

    const index = this.persons.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Shaxs topilmadi');
    }

    const person = this.persons[index];

    // Ruxsat tekshirish
    if (user.role === 'MAHALLA_INSPECTOR' && person.registeredBy !== user.id) {
      throw new Error('Siz faqat o\'z qo\'shgan shaxslaringizni tahrirlashingiz mumkin');
    }

    if (user.role === 'JQB_ADMIN' && person.districtId !== user.districtId) {
      throw new Error('Siz faqat o\'z tumaningiz shaxslarini tahrirlashingiz mumkin');
    }

    this.persons[index] = { ...person, ...personData };
    this.saveToLocalStorage();

    return { data: this.persons[index] };
  }

  // Shaxsni ishlovga qo'shish (JQB va Super Admin)
  async addToProcess(personId, user) {
    // Keyinchalik API: return axios.post(`/persons/${personId}/add-to-process`, { userId: user.id })

    if (user.role === 'MAHALLA_INSPECTOR') {
      throw new Error('Sizda bu amalni bajarish huquqi yo\'q');
    }

    const index = this.persons.findIndex(p => p.id === personId);
    if (index === -1) {
      throw new Error('Shaxs topilmadi');
    }

    const person = this.persons[index];

    if (user.role === 'JQB_ADMIN' && person.districtId !== user.districtId) {
      throw new Error('Siz faqat o\'z tumaningiz shaxslarini ishlovga qo\'shishingiz mumkin');
    }

    this.persons[index] = {
      ...person,
      inProcess: true,
      processedBy: user.id,
      processedByName: `${user.firstName} ${user.lastName}`,
      processedAt: new Date().toISOString()
    };

    this.saveToLocalStorage();

    return { data: this.persons[index] };
  }

  // Shaxsni ishlovdan chiqarish (faqat Super Admin)
  async removeFromProcess(personId, user) {
    // Keyinchalik API: return axios.post(`/persons/${personId}/remove-from-process`, { userId: user.id })

    if (user.role !== 'SUPER_ADMIN') {
      throw new Error('Sizda bu amalni bajarish huquqi yo\'q');
    }

    const index = this.persons.findIndex(p => p.id === personId);
    if (index === -1) {
      throw new Error('Shaxs topilmadi');
    }

    this.persons[index] = {
      ...this.persons[index],
      inProcess: false,
      processedBy: null,
      processedByName: null,
      processedAt: null
    };

    this.saveToLocalStorage();

    return { data: this.persons[index] };
  }

  // Qidirish
  async search(filters, user) {
    // Keyinchalik API: return axios.get('/persons/search', { params: { ...filters, userId: user.id } })

    let results = [...this.persons];

    // Role bo'yicha filtr
    if (user.role === 'MAHALLA_INSPECTOR') {
      results = results.filter(p => p.registeredBy === user.id);
    } else if (user.role === 'JQB_ADMIN') {
      results = results.filter(p => p.districtId === user.districtId);
    }

    // Qidirish filtrlari
    if (filters.firstName) {
      results = results.filter(p =>
        p.firstName.toLowerCase().includes(filters.firstName.toLowerCase())
      );
    }

    if (filters.lastName) {
      results = results.filter(p =>
        p.lastName.toLowerCase().includes(filters.lastName.toLowerCase())
      );
    }

    if (filters.passportSerial || filters.passportNumber) {
      if (filters.passportSerial) {
        results = results.filter(p =>
          p.passportSerial.toLowerCase() === filters.passportSerial.toLowerCase()
        );
      }
      if (filters.passportNumber) {
        results = results.filter(p =>
          p.passportNumber.includes(filters.passportNumber)
        );
      }
    }

    if (filters.districtId) {
      results = results.filter(p => p.districtId === parseInt(filters.districtId));
    }

    if (filters.mahallaId) {
      results = results.filter(p => p.mahallaId === parseInt(filters.mahallaId));
    }

    if (filters.crimeCategoryId) {
      results = results.filter(p => p.crimeCategoryId === parseInt(filters.crimeCategoryId));
    }

    if (filters.crimeTypeId) {
      results = results.filter(p => p.crimeTypeId === parseInt(filters.crimeTypeId));
    }

    return { data: results };
  }

  // ID bo'yicha shaxs olish
  async getById(id) {
    // Keyinchalik API: return axios.get(`/persons/${id}`)

    const person = this.persons.find(p => p.id === id);
    if (!person) {
      throw new Error('Shaxs topilmadi');
    }

    return { data: person };
  }

  // Tuman bo'yicha statistika
  async getStatsByDistrict(districtId) {
    // Keyinchalik API: return axios.get(`/persons/stats/district/${districtId}`)

    const districtPersons = this.persons.filter(p => p.districtId === districtId);
    const inProcessPersons = districtPersons.filter(p => p.inProcess);

    return {
      data: {
        total: districtPersons.length,
        inProcess: inProcessPersons.length
      }
    };
  }

  // Umumiy statistika
  async getOverallStats() {
    // Keyinchalik API: return axios.get('/persons/stats')

    return {
      data: {
        total: this.persons.length,
        inProcess: this.persons.filter(p => p.inProcess).length
      }
    };
  }
}

export default new PersonService();
