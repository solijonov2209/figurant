import { axiosInstance, USE_MOCK_DATA, API_ENDPOINTS } from '../config/api.config';
import { persons as mockPersons } from '../data/mockData';

class PersonService {
  constructor() {
    // LocalStorage dan ma'lumotlarni yuklash (faqat mock data uchun)
    const savedPersons = localStorage.getItem('persons');
    this.persons = savedPersons ? JSON.parse(savedPersons) : [...mockPersons];
  }

  // Ma'lumotlarni saqlash (faqat mock data uchun)
  saveToLocalStorage() {
    localStorage.setItem('persons', JSON.stringify(this.persons));
  }

  // Barcha shaxslarni olish (role bo'yicha filtrlangan)
  async getAll(user) {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      let filteredPersons = [...this.persons];

      if (user.role === 'MAHALLA_INSPECTOR') {
        filteredPersons = filteredPersons.filter(p => p.registeredBy === user.id);
      } else if (user.role === 'JQB_ADMIN') {
        filteredPersons = filteredPersons.filter(p => p.districtId === user.districtId);
      }

      return { data: filteredPersons };
    }

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.OFFENDERS.BASE);
      // Pagination bo'lsa, results ni olish
      const data = response.data.results || response.data;
      return { data: Array.isArray(data) ? data : [] };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.detail || 'Shaxslarni yuklashda xatolik');
    }
  }

  // Ishlovdagi shaxslarni olish
  async getInProcess(user) {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      let filteredPersons = this.persons.filter(p => p.inProcess);

      if (user.role === 'JQB_ADMIN') {
        filteredPersons = filteredPersons.filter(p => p.districtId === user.districtId);
      }

      return { data: filteredPersons };
    }

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.OFFENDERS.BASE, {
        params: { in_process: true }
      });
      const data = response.data.results || response.data;
      const inProcessPersons = Array.isArray(data) ? data.filter(p => p.in_process || p.inProcess) : [];
      return { data: inProcessPersons };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.detail || 'Ishlovdagi shaxslarni yuklashda xatolik');
    }
  }

  // Shaxs qo'shish
  async create(personData, user) {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
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

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.OFFENDERS.BASE, {
        ...personData,
        registered_by: user.id
      });
      return { data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.message
        || error.response?.data?.detail
        || JSON.stringify(error.response?.data)
        || 'Shaxs qo\'shishda xatolik';
      throw new Error(errorMsg);
    }
  }

  // Shaxsni tahrirlash (faqat o'zi qo'shganini)
  async update(id, personData, user) {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
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

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.put(
        API_ENDPOINTS.OFFENDERS.BY_ID(id),
        {
          ...personData,
          updated_by: user.id
        }
      );
      return { data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.message
        || error.response?.data?.detail
        || JSON.stringify(error.response?.data)
        || 'Shaxsni tahrirlashda xatolik';
      throw new Error(errorMsg);
    }
  }

  // Shaxsni ishlovga qo'shish (JQB va Super Admin)
  async addToProcess(personId, user) {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
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

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.OFFENDERS.ADD_TO_PROCESS(personId),
        { user_id: user.id }
      );
      return { data: response.data };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.detail || 'Ishlovga qo\'shishda xatolik');
    }
  }

  // Shaxsni ishlovdan chiqarish (faqat Super Admin)
  async removeFromProcess(personId, user) {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
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

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.OFFENDERS.REMOVE_FROM_PROCESS(personId),
        { user_id: user.id }
      );
      return { data: response.data };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.detail || 'Ishlovdan chiqarishda xatolik');
    }
  }

  // Qidirish
  async search(filters, user) {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
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

    // Real API bilan ishlash
    try {
      // Swagger da search endpoint parametrlari:
      // first_name, last_name, passport, district, quarter, crime_category, crime
      const params = {
        first_name: filters.firstName,
        last_name: filters.lastName,
        passport: filters.passportSerial && filters.passportNumber
          ? `${filters.passportSerial}${filters.passportNumber}`
          : undefined,
        district: filters.districtId,
        quarter: filters.mahallaId,
        crime_category: filters.crimeCategoryId,
        crime: filters.crimeTypeId
      };

      // Undefined qiymatlarni o'chirish
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const response = await axiosInstance.get(API_ENDPOINTS.OFFENDERS.SEARCH, { params });
      const data = response.data.results || response.data;
      return { data: Array.isArray(data) ? data : [] };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.detail || 'Qidirishda xatolik');
    }
  }

  // ID bo'yicha shaxs olish
  async getById(id) {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      const person = this.persons.find(p => p.id === id);
      if (!person) {
        throw new Error('Shaxs topilmadi');
      }

      return { data: person };
    }

    // Real API bilan ishlash
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.OFFENDERS.BY_ID(id));
      return { data: response.data };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.detail || 'Shaxsni yuklashda xatolik');
    }
  }

  // Tuman bo'yicha statistika
  async getStatsByDistrict(districtId) {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      const districtPersons = this.persons.filter(p => p.districtId === districtId);
      const inProcessPersons = districtPersons.filter(p => p.inProcess);

      return {
        data: {
          total: districtPersons.length,
          inProcess: inProcessPersons.length
        }
      };
    }

    // Real API bilan ishlash
    // API da tuman bo'yicha statistika yo'q, barcha offenders ni olish
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.OFFENDERS.BASE, {
        params: { district: districtId }
      });
      const data = response.data.results || response.data;
      const districtPersons = Array.isArray(data) ? data : [];
      const inProcessPersons = districtPersons.filter(p => p.in_process || p.inProcess);

      return {
        data: {
          total: districtPersons.length,
          inProcess: inProcessPersons.length
        }
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.detail || 'Statistikani yuklashda xatolik');
    }
  }

  // Umumiy statistika
  async getOverallStats() {
    if (USE_MOCK_DATA) {
      // Mock data bilan ishlash
      return {
        data: {
          total: this.persons.length,
          inProcess: this.persons.filter(p => p.inProcess).length
        }
      };
    }

    // Real API bilan ishlash
    try {
      // Statistika endpoint dan olish
      const response = await axiosInstance.get(API_ENDPOINTS.USERS.STATISTICS.ADMIN_AND_OFFENDERS_COUNT);
      return { data: response.data };
    } catch (error) {
      // Agar statistika endpoint ishlamasa, barcha offenders ni olish
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.OFFENDERS.BASE);
        const data = response.data.results || response.data;
        const persons = Array.isArray(data) ? data : [];
        const inProcessCount = persons.filter(p => p.in_process || p.inProcess).length;

        return {
          data: {
            total: persons.length,
            inProcess: inProcessCount
          }
        };
      } catch (err) {
        throw new Error(err.response?.data?.message || err.response?.data?.detail || 'Statistikani yuklashda xatolik');
      }
    }
  }
}

export default new PersonService();
