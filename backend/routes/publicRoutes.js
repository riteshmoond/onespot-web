const express = require("express");
const router = express.Router();
const {
  getPublicBanners,
  getPublicServices,
  getPublicDoctors,
  getPublicFaqs,
  getPublicTestimonials,
  getPublicDiagnoses,
  getPublicGallery,
  getPublicCmsPage,
} = require("../controllers/publicController");

router.get("/banners", getPublicBanners);
router.get("/services", getPublicServices);
router.get("/doctors", getPublicDoctors);
router.get("/faqs", getPublicFaqs);
router.get("/testimonials", getPublicTestimonials);
router.get("/diagnoses", getPublicDiagnoses);
router.get("/gallery", getPublicGallery);
router.get("/cms/:slug", getPublicCmsPage);

module.exports = router;
