const express = require("express");
const router = express.Router();

const {
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
} = require("../controllers/adminController");
const adminAuth = require("../middleware/adminAuth");
const uploadBanner = require("../middleware/uploadBanner");
const uploadDoctor = require("../middleware/uploadDoctor");
const uploadDiagnosis = require("../middleware/uploadDiagnosis");
const uploadTestimonial = require("../middleware/uploadTestimonial");
const uploadGallery = require("../middleware/uploadGallery");
const uploadService = require("../middleware/uploadService");

const handleBannerUpload = (req, res, next) => {
  uploadBanner.single("image")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next();
  });
};

const handleDoctorUpload = (req, res, next) => {
  uploadDoctor.single("image")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next();
  });
};

const handleDiagnosisUpload = (req, res, next) => {
  uploadDiagnosis.single("image")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next();
  });
};

const handleTestimonialUpload = (req, res, next) => {
  uploadTestimonial.single("image")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next();
  });
};

const handleGalleryUpload = (req, res, next) => {
  uploadGallery.single("image")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next();
  });
};

const handleServiceUpload = (req, res, next) => {
  uploadService.single("image")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next();
  });
};

router.post("/login", loginAdmin);
router.get("/banners", adminAuth, listBanners);
router.post("/banners", adminAuth, handleBannerUpload, addBanner);
router.put("/banners/:id", adminAuth, handleBannerUpload, editBanner);
router.delete("/banners", adminAuth, deleteBanners);
router.delete("/banners/:id", adminAuth, deleteBanner);
router.get("/cms", adminAuth, listCmsPages);
router.post("/cms", adminAuth, addCmsPage);
router.put("/cms/:id", adminAuth, editCmsPage);
router.delete("/cms/:id", adminAuth, deleteCmsPage);
router.get("/doctors", adminAuth, listDoctors);
router.post("/doctors", adminAuth, handleDoctorUpload, addDoctor);
router.put("/doctors/:id", adminAuth, handleDoctorUpload, editDoctor);
router.delete("/doctors/:id", adminAuth, deleteDoctor);
router.get("/faqs", adminAuth, listFaqs);
router.post("/faqs", adminAuth, addFaq);
router.put("/faqs/:id", adminAuth, editFaq);
router.delete("/faqs/:id", adminAuth, deleteFaq);

router.get("/diagnoses", adminAuth, listDiagnoses);
router.post("/diagnoses", adminAuth, handleDiagnosisUpload, addDiagnosis);
router.put("/diagnoses/:id", adminAuth, handleDiagnosisUpload, editDiagnosis);
router.delete("/diagnoses/:id", adminAuth, deleteDiagnosis);

router.get("/testimonials", adminAuth, listTestimonials);
router.post("/testimonials", adminAuth, handleTestimonialUpload, addTestimonial);
router.put("/testimonials/:id", adminAuth, handleTestimonialUpload, editTestimonial);
router.delete("/testimonials/:id", adminAuth, deleteTestimonial);

router.get("/gallery", adminAuth, listGallery);
router.post("/gallery", adminAuth, handleGalleryUpload, addGallery);
router.delete("/gallery/:id", adminAuth, deleteGallery);

router.get("/services", adminAuth, listServices);
router.post("/services", adminAuth, handleServiceUpload, addService);
router.put("/services/:id", adminAuth, handleServiceUpload, editService);
router.delete("/services", adminAuth, deleteServices);
router.delete("/services/:id", adminAuth, deleteService);

module.exports = router;
