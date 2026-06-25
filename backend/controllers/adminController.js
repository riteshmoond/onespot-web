const Admin = require("../models/Admin");
const Banner = require("../models/Banner");
const Cms = require("../models/Cms");
const Doctor = require("../models/Doctor");
const Faq = require("../models/Faq");
const Diagnosis = require("../models/Diagnosis");
const Testimonial = require("../models/Testimonial");
const Gallery = require("../models/Gallery");
const Service = require("../models/Service");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const path = require("path");

const removeBannerImage = (imagePath) => {
  if (!imagePath) return;

  const normalizedPath = imagePath.replace(/^\/+/, "");
  const fullPath = path.join(__dirname, "..", normalizedPath);

  fs.unlink(fullPath, () => {});
};

const isValidBannerStatus = (status) => ["active", "inactive"].includes(status);
const isValidStatus = (status) => ["active", "inactive"].includes(status);
const isValidGender = (gender) => ["male", "female"].includes(gender);

const parseFeatures = (features) => {
  if (!features) return [];

  if (Array.isArray(features)) {
    return features.map((feature) => String(feature).trim()).filter(Boolean);
  }

  try {
    const parsed = JSON.parse(features);
    return Array.isArray(parsed)
      ? parsed.map((feature) => String(feature).trim()).filter(Boolean)
      : [];
  } catch (_error) {
    return String(features)
      .split(",")
      .map((feature) => feature.trim())
      .filter(Boolean);
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is missing",
      });
    }

    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      token,
      message: "Login successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const listBanners = async (_req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      banners,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addBanner = async (req, res) => {
  try {
    const { name, status = "active", order = 0 } = req.body;

    if (!name || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Name and image are required",
      });
    }

    if (!isValidBannerStatus(status)) {
      removeBannerImage(`/uploads/banners/${req.file.filename}`);

      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive",
      });
    }

    const banner = await Banner.create({
      name: name.trim(),
      image: `/uploads/banners/${req.file.filename}`,
      status,
      order: Number(order) || 0,
    });

    res.status(201).json({
      success: true,
      message: "Banner added successfully",
      banner,
    });
  } catch (error) {
    if (req.file) {
      removeBannerImage(`/uploads/banners/${req.file.filename}`);
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const editBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);

    if (!banner) {
      if (req.file) {
        removeBannerImage(`/uploads/banners/${req.file.filename}`);
      }

      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    const { name, status, order } = req.body;
    const previousImage = banner.image;

    if (status !== undefined && !isValidBannerStatus(status)) {
      if (req.file) {
        removeBannerImage(`/uploads/banners/${req.file.filename}`);
      }

      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive",
      });
    }

    if (name !== undefined) banner.name = name.trim();
    if (status !== undefined) banner.status = status;
    if (order !== undefined) banner.order = Number(order) || 0;
    if (req.file) banner.image = `/uploads/banners/${req.file.filename}`;

    await banner.save();

    if (req.file) {
      removeBannerImage(previousImage);
    }

    res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      banner,
    });
  } catch (error) {
    if (req.file) {
      removeBannerImage(`/uploads/banners/${req.file.filename}`);
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndDelete(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    removeBannerImage(banner.image);

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteBanners = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Banner ids are required",
      });
    }

    const banners = await Banner.find({ _id: { $in: ids } });

    if (banners.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No banners found",
      });
    }

    await Banner.deleteMany({ _id: { $in: ids } });
    banners.forEach((banner) => removeBannerImage(banner.image));

    res.status(200).json({
      success: true,
      message: "Banners deleted successfully",
      deletedCount: banners.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const listCmsPages = async (_req, res) => {
  try {
    const pages = await Cms.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      pages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addCmsPage = async (req, res) => {
  try {
    const { name, key, status = "active", content } = req.body;

    if (!name || !key || !content) {
      return res.status(400).json({
        success: false,
        message: "Name, key and content are required",
      });
    }

    if (!isValidStatus(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive",
      });
    }

    const page = await Cms.create({
      name: name.trim(),
      key: key.trim(),
      status,
      content,
    });

    res.status(201).json({
      success: true,
      message: "CMS page added successfully",
      page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const editCmsPage = async (req, res) => {
  try {
    const { id } = req.params;
    const page = await Cms.findById(id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "CMS page not found",
      });
    }

    const { name, key, status, content } = req.body;

    if (status !== undefined && !isValidStatus(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive",
      });
    }

    if (name !== undefined) page.name = name.trim();
    if (key !== undefined) page.key = key.trim();
    if (status !== undefined) page.status = status;
    if (content !== undefined) page.content = content;

    await page.save();

    res.status(200).json({
      success: true,
      message: "CMS page updated successfully",
      page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const deleteCmsPage = async (req, res) => {
  try {
    const { id } = req.params;
    const page = await Cms.findByIdAndDelete(id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "CMS page not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "CMS page deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const listDoctors = async (_req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addDoctor = async (req, res) => {
  try {
    const {
      name,
      department,
      gender,
      position,
      aboutDoctor,
      opdDays,
      sundayTiming,
      dailyTime,
      features,
    } = req.body;

    if (
      !name ||
      !department ||
      !gender ||
      !position ||
      !aboutDoctor ||
      !opdDays ||
      !sundayTiming ||
      !dailyTime ||
      !req.file
    ) {
      if (req.file) {
        removeBannerImage(`/uploads/doctors/${req.file.filename}`);
      }

      return res.status(400).json({
        success: false,
        message: "All doctor fields and image are required",
      });
    }

    if (!isValidGender(gender)) {
      removeBannerImage(`/uploads/doctors/${req.file.filename}`);

      return res.status(400).json({
        success: false,
        message: "Gender must be male or female",
      });
    }

    const doctor = await Doctor.create({
      name: name.trim(),
      image: `/uploads/doctors/${req.file.filename}`,
      department: department.trim(),
      gender,
      position: position.trim(),
      aboutDoctor,
      opdDays: opdDays.trim(),
      sundayTiming: sundayTiming.trim(),
      dailyTime: dailyTime.trim(),
      features: parseFeatures(features),
    });

    res.status(201).json({
      success: true,
      message: "Doctor added successfully",
      doctor,
    });
  } catch (error) {
    if (req.file) {
      removeBannerImage(`/uploads/doctors/${req.file.filename}`);
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const editDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id);

    if (!doctor) {
      if (req.file) {
        removeBannerImage(`/uploads/doctors/${req.file.filename}`);
      }

      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const {
      name,
      department,
      gender,
      position,
      aboutDoctor,
      opdDays,
      sundayTiming,
      dailyTime,
      features,
    } = req.body;
    const previousImage = doctor.image;

    if (gender !== undefined && !isValidGender(gender)) {
      if (req.file) {
        removeBannerImage(`/uploads/doctors/${req.file.filename}`);
      }

      return res.status(400).json({
        success: false,
        message: "Gender must be male or female",
      });
    }

    if (name !== undefined) doctor.name = name.trim();
    if (department !== undefined) doctor.department = department.trim();
    if (gender !== undefined) doctor.gender = gender;
    if (position !== undefined) doctor.position = position.trim();
    if (aboutDoctor !== undefined) doctor.aboutDoctor = aboutDoctor;
    if (opdDays !== undefined) doctor.opdDays = opdDays.trim();
    if (sundayTiming !== undefined) doctor.sundayTiming = sundayTiming.trim();
    if (dailyTime !== undefined) doctor.dailyTime = dailyTime.trim();
    if (features !== undefined) doctor.features = parseFeatures(features);
    if (req.file) doctor.image = `/uploads/doctors/${req.file.filename}`;

    await doctor.save();

    if (req.file) {
      removeBannerImage(previousImage);
    }

    res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      doctor,
    });
  } catch (error) {
    if (req.file) {
      removeBannerImage(`/uploads/doctors/${req.file.filename}`);
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findByIdAndDelete(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    removeBannerImage(doctor.image);

    res.status(200).json({
      success: true,
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const listFaqs = async (_req, res) => {
  try {
    const faqs = await Faq.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      faqs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: "Question and answer are required",
      });
    }

    const faq = await Faq.create({
      question: question.trim(),
      answer: answer.trim(),
    });

    res.status(201).json({
      success: true,
      message: "FAQ added successfully",
      faq,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const editFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await Faq.findById(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    const { question, answer } = req.body;

    if (question !== undefined) faq.question = question.trim();
    if (answer !== undefined) faq.answer = answer.trim();

    await faq.save();

    res.status(200).json({
      success: true,
      message: "FAQ updated successfully",
      faq,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await Faq.findByIdAndDelete(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "FAQ deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const listDiagnoses = async (_req, res) => {
  try {
    const diagnoses = await Diagnosis.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      diagnoses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addDiagnosis = async (req, res) => {
  try {
    const { name, doctorName, doctorPosition, features } = req.body;

    if (!name || !req.file) {
      if (req.file) {
        removeBannerImage(`/uploads/diagnosis/${req.file.filename}`);
      }

      return res.status(400).json({
        success: false,
        message: "Diagnosis name and image are required",
      });
    }

    const diagnosis = await Diagnosis.create({
      name: name.trim(),
      image: `/uploads/diagnosis/${req.file.filename}`,
      doctorName: (doctorName || "").trim(),
      doctorPosition: (doctorPosition || "").trim(),
      features: parseFeatures(features),
    });

    res.status(201).json({
      success: true,
      message: "Diagnosis added successfully",
      diagnosis,
    });
  } catch (error) {
    if (req.file) {
      removeBannerImage(`/uploads/diagnosis/${req.file.filename}`);
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const editDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;
    const diagnosis = await Diagnosis.findById(id);

    if (!diagnosis) {
      if (req.file) {
        removeBannerImage(`/uploads/diagnosis/${req.file.filename}`);
      }

      return res.status(404).json({
        success: false,
        message: "Diagnosis not found",
      });
    }

    const { name, doctorName, doctorPosition, features } = req.body;
    const previousImage = diagnosis.image;

    if (name !== undefined) diagnosis.name = name.trim();
    if (doctorName !== undefined) diagnosis.doctorName = doctorName.trim();
    if (doctorPosition !== undefined) diagnosis.doctorPosition = doctorPosition.trim();
    if (features !== undefined) diagnosis.features = parseFeatures(features);
    if (req.file) diagnosis.image = `/uploads/diagnosis/${req.file.filename}`;

    await diagnosis.save();

    if (req.file) {
      removeBannerImage(previousImage);
    }

    res.status(200).json({
      success: true,
      message: "Diagnosis updated successfully",
      diagnosis,
    });
  } catch (error) {
    if (req.file) {
      removeBannerImage(`/uploads/diagnosis/${req.file.filename}`);
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;
    const diagnosis = await Diagnosis.findByIdAndDelete(id);

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        message: "Diagnosis not found",
      });
    }

    removeBannerImage(diagnosis.image);

    res.status(200).json({
      success: true,
      message: "Diagnosis deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const listTestimonials = async (_req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      testimonials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addTestimonial = async (req, res) => {
  try {
    const { customerName, location, diagnose, status, message } = req.body;

    if (!customerName || !message || !req.file) {
      if (req.file) {
        removeBannerImage(`/uploads/testimonials/${req.file.filename}`);
      }

      return res.status(400).json({
        success: false,
        message: "Customer name, message, and image are required",
      });
    }

    if (status && !["active", "inactive"].includes(status)) {
      removeBannerImage(`/uploads/testimonials/${req.file.filename}`);

      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive",
      });
    }

    const testimonial = await Testimonial.create({
      customerName: customerName.trim(),
      image: `/uploads/testimonials/${req.file.filename}`,
      location: (location || "").trim(),
      diagnose: (diagnose || "").trim(),
      status: status || "active",
      message: message.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Testimonial added successfully",
      testimonial,
    });
  } catch (error) {
    if (req.file) {
      removeBannerImage(`/uploads/testimonials/${req.file.filename}`);
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const editTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      if (req.file) {
        removeBannerImage(`/uploads/testimonials/${req.file.filename}`);
      }

      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    const { customerName, location, diagnose, status, message } = req.body;
    const previousImage = testimonial.image;

    if (status !== undefined && !["active", "inactive"].includes(status)) {
      if (req.file) {
        removeBannerImage(`/uploads/testimonials/${req.file.filename}`);
      }

      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive",
      });
    }

    if (customerName !== undefined) testimonial.customerName = customerName.trim();
    if (location !== undefined) testimonial.location = location.trim();
    if (diagnose !== undefined) testimonial.diagnose = diagnose.trim();
    if (status !== undefined) testimonial.status = status;
    if (message !== undefined) testimonial.message = message.trim();
    if (req.file) testimonial.image = `/uploads/testimonials/${req.file.filename}`;

    await testimonial.save();

    if (req.file) {
      removeBannerImage(previousImage);
    }

    res.status(200).json({
      success: true,
      message: "Testimonial updated successfully",
      testimonial,
    });
  } catch (error) {
    if (req.file) {
      removeBannerImage(`/uploads/testimonials/${req.file.filename}`);
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findByIdAndDelete(id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    removeBannerImage(testimonial.image);

    res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const listGallery = async (_req, res) => {
  try {
    const gallery = await Gallery.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      gallery,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addGallery = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });
    }

    const gallery = await Gallery.create({
      image: `/uploads/gallery/${req.file.filename}`,
    });

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      gallery,
    });
  } catch (error) {
    if (req.file) {
      removeBannerImage(`/uploads/gallery/${req.file.filename}`);
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const gallery = await Gallery.findByIdAndDelete(id);

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: "Gallery image not found",
      });
    }

    removeBannerImage(gallery.image);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully from gallery",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const listServices = async (_req, res) => {
  try {
    const services = await Service.find().sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addService = async (req, res) => {
  try {
    const { name, status, order, shortDescription } = req.body;

    if (!name || !shortDescription || !req.file) {
      if (req.file) {
        removeBannerImage(`/uploads/services/${req.file.filename}`);
      }

      return res.status(400).json({
        success: false,
        message: "Service name, short description, and image are required",
      });
    }

    if (status && !["active", "inactive"].includes(status)) {
      removeBannerImage(`/uploads/services/${req.file.filename}`);

      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive",
      });
    }

    const service = await Service.create({
      name: name.trim(),
      image: `/uploads/services/${req.file.filename}`,
      status: status || "active",
      order: Number(order) || 0,
      shortDescription: shortDescription.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Service added successfully",
      service,
    });
  } catch (error) {
    if (req.file) {
      removeBannerImage(`/uploads/services/${req.file.filename}`);
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const editService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);

    if (!service) {
      if (req.file) {
        removeBannerImage(`/uploads/services/${req.file.filename}`);
      }

      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const { name, status, order, shortDescription } = req.body;
    const previousImage = service.image;

    if (status !== undefined && !["active", "inactive"].includes(status)) {
      if (req.file) {
        removeBannerImage(`/uploads/services/${req.file.filename}`);
      }

      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive",
      });
    }

    if (name !== undefined) service.name = name.trim();
    if (status !== undefined) service.status = status;
    if (order !== undefined) service.order = Number(order) || 0;
    if (shortDescription !== undefined) service.shortDescription = shortDescription.trim();
    if (req.file) service.image = `/uploads/services/${req.file.filename}`;

    await service.save();

    if (req.file) {
      removeBannerImage(previousImage);
    }

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      service,
    });
  } catch (error) {
    if (req.file) {
      removeBannerImage(`/uploads/services/${req.file.filename}`);
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    removeBannerImage(service.image);

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteServices = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or empty IDs array",
      });
    }

    const services = await Service.find({ _id: { $in: ids } });

    for (const service of services) {
      removeBannerImage(service.image);
    }

    await Service.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      message: "Selected services deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  loginAdmin,
  listBanners,
  addBanner,
  editBanner,
  deleteBanner,
  deleteBanners,
  listCmsPages,
  addCmsPage,
  editCmsPage,
  deleteCmsPage,
  listDoctors,
  addDoctor,
  editDoctor,
  deleteDoctor,
  listFaqs,
  addFaq,
  editFaq,
  deleteFaq,
  listDiagnoses,
  addDiagnosis,
  editDiagnosis,
  deleteDiagnosis,
  listTestimonials,
  addTestimonial,
  editTestimonial,
  deleteTestimonial,
  listGallery,
  addGallery,
  deleteGallery,
  listServices,
  addService,
  editService,
  deleteService,
  deleteServices,
};
