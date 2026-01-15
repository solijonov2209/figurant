// Bu service hisobotlarni PDF va Excel formatda yuklash uchun
// Hozircha oddiy CSV formatda yuklanadi, keyinchalik to'liq PDF va Excel qo'shiladi

class ReportService {
  // Shaxslar ro'yxatini CSV formatda yuklash
  exportToCSV(persons, filename = 'hisobot.csv') {
    // CSV header
    const headers = [
      'ID',
      'Familiya',
      'Ism',
      'Otasining ismi',
      'Tug\'ilgan sana',
      'Pasport seria',
      'Pasport raqam',
      'Avtomobil',
      'Tuman',
      'Mahalla',
      'Qo\'shimcha ma\'lumot',
      'Ro\'yxatga olgan',
      'Ro\'yxatga olgan telefon',
      'Ro\'yxatga olingan vaqt',
      'Ishlovda',
      'Ishlovga qo\'shgan',
      'Ishlovga qo\'shilgan vaqt'
    ];

    // CSV rows
    const rows = persons.map(p => [
      p.id,
      p.lastName,
      p.firstName,
      p.middleName,
      p.birthDate,
      p.passportSerial,
      p.passportNumber,
      p.carInfo || '',
      p.districtName,
      p.mahallaName,
      p.additionalInfo || '',
      p.registeredByName,
      p.registeredByPhone,
      new Date(p.registeredAt).toLocaleString('uz-UZ'),
      p.inProcess ? 'Ha' : 'Yo\'q',
      p.processedByName || '',
      p.processedAt ? new Date(p.processedAt).toLocaleString('uz-UZ') : ''
    ]);

    // CSV matn yaratish
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // BOM qo'shish (UTF-8 for Excel)
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    // Faylni yuklash
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }

  // Excel formatda yuklash (hozircha CSV)
  async exportToExcel(persons, filename = 'hisobot.xlsx') {
    // Keyinchalik: xlsx kutubxonasi bilan to'liq Excel fayl yaratish
    // Hozircha CSV formatda yuklaymiz
    this.exportToCSV(persons, filename.replace('.xlsx', '.csv'));
  }

  // PDF formatda yuklash
  async exportToPDF(persons, filename = 'hisobot.pdf') {
    // Keyinchalik: jsPDF kutubxonasi bilan to'liq PDF yaratish
    // Hozircha oddiy HTML print qilamiz

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Hisobot</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body { font-family: Arial, sans-serif; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
      th { background-color: #4CAF50; color: white; }
      tr:nth-child(even) { background-color: #f2f2f2; }
      h1 { text-align: center; color: #333; }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write('<h1>Shaxslar ro\'yxati</h1>');
    printWindow.document.write('<table>');

    // Table header
    printWindow.document.write('<thead><tr>');
    printWindow.document.write('<th>№</th>');
    printWindow.document.write('<th>F.I.O</th>');
    printWindow.document.write('<th>Tug\'ilgan sana</th>');
    printWindow.document.write('<th>Pasport</th>');
    printWindow.document.write('<th>Tuman</th>');
    printWindow.document.write('<th>Mahalla</th>');
    printWindow.document.write('<th>Ishlovda</th>');
    printWindow.document.write('</tr></thead>');

    // Table body
    printWindow.document.write('<tbody>');
    persons.forEach((p, index) => {
      printWindow.document.write('<tr>');
      printWindow.document.write(`<td>${index + 1}</td>`);
      printWindow.document.write(`<td>${p.lastName} ${p.firstName} ${p.middleName}</td>`);
      printWindow.document.write(`<td>${p.birthDate}</td>`);
      printWindow.document.write(`<td>${p.passportSerial} ${p.passportNumber}</td>`);
      printWindow.document.write(`<td>${p.districtName}</td>`);
      printWindow.document.write(`<td>${p.mahallaName}</td>`);
      printWindow.document.write(`<td>${p.inProcess ? 'Ha' : 'Yo\'q'}</td>`);
      printWindow.document.write('</tr>');
    });
    printWindow.document.write('</tbody></table>');

    printWindow.document.write('</body></html>');
    printWindow.document.close();

    // Print dialog ochish
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }

  // Tuman bo'yicha hisobot
  async generateDistrictReport(districtId, persons, format = 'csv') {
    const districtPersons = persons.filter(p => p.districtId === districtId);

    if (districtPersons.length === 0) {
      throw new Error('Bu tumanda ma\'lumot yo\'q');
    }

    const districtName = districtPersons[0].districtName;
    const filename = `${districtName}_hisobot`;

    if (format === 'pdf') {
      await this.exportToPDF(districtPersons, `${filename}.pdf`);
    } else if (format === 'excel') {
      await this.exportToExcel(districtPersons, `${filename}.xlsx`);
    } else {
      this.exportToCSV(districtPersons, `${filename}.csv`);
    }
  }

  // Ishlovdagi shaxslar hisoboti
  async generateInProcessReport(persons, format = 'csv') {
    const inProcessPersons = persons.filter(p => p.inProcess);

    if (inProcessPersons.length === 0) {
      throw new Error('Ishlovdagi shaxslar yo\'q');
    }

    const filename = 'ishlovdagi_shaxslar_hisobot';

    if (format === 'pdf') {
      await this.exportToPDF(inProcessPersons, `${filename}.pdf`);
    } else if (format === 'excel') {
      await this.exportToExcel(inProcessPersons, `${filename}.xlsx`);
    } else {
      this.exportToCSV(inProcessPersons, `${filename}.csv`);
    }
  }

  // Umumiy hisobot
  async generateOverallReport(persons, format = 'csv') {
    if (persons.length === 0) {
      throw new Error('Ma\'lumot yo\'q');
    }

    const filename = 'umumiy_hisobot';

    if (format === 'pdf') {
      await this.exportToPDF(persons, `${filename}.pdf`);
    } else if (format === 'excel') {
      await this.exportToExcel(persons, `${filename}.xlsx`);
    } else {
      this.exportToCSV(persons, `${filename}.csv`);
    }
  }
}

export default new ReportService();
