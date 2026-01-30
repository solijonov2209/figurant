const Person = require('../models/Person');

// @desc    Create new person
// @route   POST /api/persons
// @access  Private (All roles)
exports.createPerson = async (req, res, next) => {
  try {
    // Ro'yxatga oluvchi ma'lumotlarini qo'shish
    req.body.registeredBy = req.user.id;
    req.body.registeredByName = req.user.fullName;
    req.body.registeredByPhone = req.user.phoneNumber;

    const person = await Person.create(req.body);

    res.status(201).json({
      success: true,
      data: person
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all persons
// @route   GET /api/persons
// @access  Private
exports.getAllPersons = async (req, res, next) => {
  try {
    let query = {};

    // Role-based filtering
    if (req.user.role === 'JQB_ADMIN') {
      query.districtId = req.user.districtId;
    } else if (req.user.role === 'MAHALLA_INSPECTOR') {
      query.mahallaId = req.user.mahallaId;
    }

    const persons = await Person.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: persons.length,
      data: persons
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get persons in process
// @route   GET /api/persons/in-process
// @access  Private
exports.getPersonsInProcess = async (req, res, next) => {
  try {
    let query = { inProcess: true };

    // Role-based filtering
    if (req.user.role === 'JQB_ADMIN') {
      query.districtId = req.user.districtId;
    } else if (req.user.role === 'MAHALLA_INSPECTOR') {
      query.mahallaId = req.user.mahallaId;
    }

    const persons = await Person.find(query).sort({ processedAt: -1 });

    res.status(200).json({
      success: true,
      count: persons.length,
      data: persons
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single person
// @route   GET /api/persons/:id
// @access  Private
exports.getPerson = async (req, res, next) => {
  try {
    const person = await Person.findById(req.params.id);

    if (!person) {
      return res.status(404).json({
        success: false,
        message: 'Shaxs topilmadi'
      });
    }

    // Check access permission
    if (req.user.role === 'JQB_ADMIN' &&
        person.districtId.toString() !== req.user.districtId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Ruxsat yo\'q'
      });
    }

    if (req.user.role === 'MAHALLA_INSPECTOR' &&
        person.mahallaId.toString() !== req.user.mahallaId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Ruxsat yo\'q'
      });
    }

    res.status(200).json({
      success: true,
      data: person
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search persons
// @route   GET /api/persons/search
// @access  Private
exports.searchPersons = async (req, res, next) => {
  try {
    const { firstName, lastName, passportSerial, passportNumber, districtId, mahallaId } = req.query;

    let query = {};

    // Role-based filtering
    if (req.user.role === 'JQB_ADMIN') {
      query.districtId = req.user.districtId;
    } else if (req.user.role === 'MAHALLA_INSPECTOR') {
      query.mahallaId = req.user.mahallaId;
    }

    // Search filters
    if (firstName) {
      query.firstName = { $regex: firstName, $options: 'i' };
    }
    if (lastName) {
      query.lastName = { $regex: lastName, $options: 'i' };
    }
    if (passportSerial) {
      query.passportSerial = passportSerial.toUpperCase();
    }
    if (passportNumber) {
      query.passportNumber = passportNumber;
    }
    if (districtId && req.user.role === 'SUPER_ADMIN') {
      query.districtId = districtId;
    }
    if (mahallaId && (req.user.role === 'SUPER_ADMIN' || req.user.role === 'JQB_ADMIN')) {
      query.mahallaId = mahallaId;
    }

    const persons = await Person.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: persons.length,
      data: persons
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add person to process
// @route   PUT /api/persons/:id/add-to-process
// @access  Private (SUPER_ADMIN, JQB_ADMIN)
exports.addToProcess = async (req, res, next) => {
  try {
    const person = await Person.findById(req.params.id);

    if (!person) {
      return res.status(404).json({
        success: false,
        message: 'Shaxs topilmadi'
      });
    }

    if (person.inProcess) {
      return res.status(400).json({
        success: false,
        message: 'Shaxs allaqachon ishlovda'
      });
    }

    person.inProcess = true;
    person.processedAt = new Date();
    person.processedBy = req.user.id;
    person.processedByName = req.user.fullName;

    await person.save();

    res.status(200).json({
      success: true,
      data: person
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove person from process
// @route   PUT /api/persons/:id/remove-from-process
// @access  Private (SUPER_ADMIN only)
exports.removeFromProcess = async (req, res, next) => {
  try {
    const person = await Person.findById(req.params.id);

    if (!person) {
      return res.status(404).json({
        success: false,
        message: 'Shaxs topilmadi'
      });
    }

    if (!person.inProcess) {
      return res.status(400).json({
        success: false,
        message: 'Shaxs ishlovda emas'
      });
    }

    person.inProcess = false;
    person.processedAt = null;
    person.processedBy = null;
    person.processedByName = null;

    await person.save();

    res.status(200).json({
      success: true,
      data: person
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete person
// @route   DELETE /api/persons/:id
// @access  Private (SUPER_ADMIN only)
exports.deletePerson = async (req, res, next) => {
  try {
    const person = await Person.findById(req.params.id);

    if (!person) {
      return res.status(404).json({
        success: false,
        message: 'Shaxs topilmadi'
      });
    }

    await person.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
