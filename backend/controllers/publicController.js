const Banner = require("../models/Banner");
const Service = require("../models/Service");
const Cms = require("../models/Cms");
const Doctor = require("../models/Doctor");
const Faq = require("../models/Faq");
const Testimonial = require("../models/Testimonial");
const Diagnosis = require("../models/Diagnosis");
const Gallery = require("../models/Gallery");

const getPublicBanners = async (_req, res) => {
  try {
    const banners = await Banner.find({ status: "active" }).sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPublicServices = async (_req, res) => {
  try {
    const services = await Service.find({ status: "active" }).sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPublicDoctors = async (_req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: 1 });
    res.status(200).json({ success: true, doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPublicFaqs = async (_req, res) => {
  try {
    const faqs = await Faq.find().sort({ createdAt: 1 });
    res.status(200).json({ success: true, faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPublicTestimonials = async (_req, res) => {
  try {
    const testimonials = await Testimonial.find({ status: "active" }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPublicDiagnoses = async (_req, res) => {
  try {
    const diagnoses = await Diagnosis.find().sort({ createdAt: 1 });
    res.status(200).json({ success: true, diagnoses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPublicGallery = async (_req, res) => {
  try {
    const gallery = await Gallery.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, gallery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPublicCmsPage = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = await Cms.findOne({ name: slug, status: "active" });
    if (!page) {
      return res.status(404).json({ success: false, message: "CMS page not found" });
    }
    res.status(200).json({ success: true, page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPublicBanners,
  getPublicServices,
  getPublicDoctors,
  getPublicFaqs,
  getPublicTestimonials,
  getPublicDiagnoses,
  getPublicGallery,
  getPublicCmsPage,
};
