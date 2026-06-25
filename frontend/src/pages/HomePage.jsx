import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "../site.css";
import logoImg from "../assets/bbbbb.png";
import whyImg from "../assets/why1.jpg";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getImageUrl(img) {
  if (!img) return "";
  if (img.startsWith("http") || img.startsWith("/img") || img.startsWith("/assets") || img.startsWith("data:")) {
    return img;
  }
  return `${API_BASE}${img}`;
}

/* ─── Banner Slider ─────────────────────────────────────────── */
function BannerSlider({ banners }) {
  const trackRef = useRef(null);
  const currentRef = useRef(0);
  const isMovingRef = useRef(false);
  const intervalRef = useRef(null);

  const total = banners.length + 1; // duplicate first for infinite feel

  const goTo = (index, animated = true) => {
    if (!trackRef.current) return;
    if (animated) trackRef.current.style.transition = "transform 0.8s ease-in-out";
    else trackRef.current.style.transition = "none";
    trackRef.current.style.transform = `translateX(-${index * 100}%)`;
  };

  const nextSlide = () => {
    if (isMovingRef.current || banners.length === 0) return;
    isMovingRef.current = true;
    currentRef.current++;
    goTo(currentRef.current);

    if (currentRef.current === banners.length) {
      setTimeout(() => {
        goTo(0, false);
        currentRef.current = 0;
        isMovingRef.current = false;
      }, 800);
    } else {
      setTimeout(() => { isMovingRef.current = false; }, 800);
    }
  };

  const prevSlide = () => {
    if (isMovingRef.current || banners.length === 0) return;
    if (currentRef.current === 0) {
      goTo(banners.length, false);
      currentRef.current = banners.length;
      setTimeout(() => {
        isMovingRef.current = true;
        currentRef.current--;
        goTo(currentRef.current);
        setTimeout(() => { isMovingRef.current = false; }, 800);
      }, 20);
    } else {
      isMovingRef.current = true;
      currentRef.current--;
      goTo(currentRef.current);
      setTimeout(() => { isMovingRef.current = false; }, 800);
    }
  };

  useEffect(() => {
    if (banners.length === 0) return;
    intervalRef.current = setInterval(nextSlide, 4000);
    return () => clearInterval(intervalRef.current);
  }, [banners]);

  if (banners.length === 0) return null;

  return (
    <section className="hero-slider">
      <div className="slider-track" ref={trackRef}>
        {banners.map((b) => (
          <div className="slides" key={b._id}>
            <img src={getImageUrl(b.image)} alt={b.name} />
          </div>
        ))}
        {/* duplicate first for smooth loop */}
        <div className="slides">
          <img src={getImageUrl(banners[0].image)} alt={banners[0].name} />
        </div>
      </div>
      <button className="slider-arrow prev" onClick={prevSlide} type="button">
        <i className="fa-solid fa-chevron-left" />
      </button>
      <button className="slider-arrow next" onClick={nextSlide} type="button">
        <i className="fa-solid fa-chevron-right" />
      </button>
    </section>
  );
}

/* ─── Service Card ───────────────────────────────────────────── */
function ServiceCard({ service }) {
  return (
    <div className="service-card">
      <div className="service-img">
        <img src={getImageUrl(service.image)} alt={service.name} />
      </div>
      <h3>{service.name}</h3>
      <p>{service.shortDescription}</p>
    </div>
  );
}

/* ─── Services Section rendered from CMS + live service cards ── */
function ServicesSection({ cmsHtml, services }) {
  const [showAll, setShowAll] = useState(false);

  const staticServices = [
    {
      _id: "s1",
      name: "Pre-Conception Counseling",
      shortDescription: "Expert guidance before planning pregnancy.",
      image: "/img/ser11.jpg"
    },
    {
      _id: "s2",
      name: "Antenatal Care",
      shortDescription: "Complete care during pregnancy journey.",
      image: "/img/ser14.jpg"
    },
    {
      _id: "s3",
      name: "High-Risk Pregnancy Management",
      shortDescription: "Care for diabetes, hypertension, twins/triplets etc.",
      image: "/img/ser15.webp"
    },
    {
      _id: "s4",
      name: "Painless Normal Deliveries",
      shortDescription: "Safe and comfortable delivery support.",
      image: "/img/ser16.jpg"
    },
    {
      _id: "s5",
      name: "Cesarean Sections",
      shortDescription: "Advanced and safe C-section care.",
      image: "/img/ser11.jpg"
    },
    {
      _id: "s6",
      name: "Menstrual Disorder Management",
      shortDescription: "PCOS, heavy bleeding and irregular cycle care.",
      image: "/img/ser14.jpg"
    },
    {
      _id: "s7",
      name: "Pelvic Pain & Infection Treatment",
      shortDescription: "UTIs and pelvic inflammatory disease treatment.",
      image: "/img/ser15.webp"
    },
    {
      _id: "s8",
      name: "Fibroid & Ovarian Cyst Management",
      shortDescription: "Diagnosis and treatment for fibroids and cysts.",
      image: "/img/ser16.jpg"
    },
    {
      _id: "s9",
      name: "Contraceptive Counseling",
      shortDescription: "Personalized family planning guidance.",
      image: "/img/ser11.jpg"
    },
    {
      _id: "s10",
      name: "IUD & Implant Services",
      shortDescription: "Safe long-term birth control options.",
      image: "/img/ser14.jpg"
    },
    {
      _id: "s11",
      name: "Infertility Treatments",
      shortDescription: "Advanced fertility evaluation and care.",
      image: "/img/ser15.webp"
    },
    {
      _id: "s12",
      name: "Advanced Surgical Procedures",
      shortDescription: "Laparoscopy, hysteroscopy and hysterectomy.",
      image: "/img/ser16.jpg"
    },
    {
      _id: "s13",
      name: "Menopause Management",
      shortDescription: "Supportive care for healthy menopause.",
      image: "/img/ser11.jpg"
    },
    {
      _id: "s14",
      name: "Breast & Cervical Cancer Screening",
      shortDescription: "Screening and HPV vaccination support.",
      image: "/img/ser14.jpg"
    }
  ];

  const hasServices = services && services.length > 0;
  const items = hasServices ? services : staticServices;

  const visible = showAll ? items : items.slice(0, 4);
  const hasMore = items.length > 4;

  const parts = cmsHtml.split("{{services}}");

  return (
    <section className="services-section">
      {parts[0] && (
        <div dangerouslySetInnerHTML={{ __html: parts[0] }} />
      )}

      <div className="services-grid">
        {visible.map((s) => (
          <ServiceCard key={s._id} service={s} />
        ))}
      </div>

      {parts[1] && (
        <div dangerouslySetInnerHTML={{ __html: parts[1] }} />
      )}

      {hasMore && (
        <button className="show-btn" onClick={() => setShowAll((p) => !p)} type="button">
          {showAll ? "Show Less" : "Show All Services"}
        </button>
      )}
    </section>
  );
}

/* ─── Default CMS content for services (admin can override) ──── */
const DEFAULT_SERVICES_CMS = `
<div class="section-title">
  <span>OUR SERVICES</span>
  <h2>Services We Offer</h2>
  <p>Expert medical services with modern treatment and compassionate care.</p>
</div>
{{services}}
`;

/* ─── Doctor Card ───────────────────────────────────────────── */
function DoctorCard({ doctor, index }) {
  const isGynae = doctor.department.toLowerCase().includes("gyn") ||
    doctor.department.toLowerCase().includes("woman") ||
    doctor.department.toLowerCase().includes("obstetrics");

  const docSlug = doctor.name
    .toLowerCase()
    .replace(/^(dr\.\s*)/i, "")
    .split(" ")[0];

  const cardClass = `doctor-card ${isGynae ? "gynae-card" : "nephro-card"} ${index % 2 === 1 ? "reverse" : ""}`;
  const tagClass = `doctor-tag ${isGynae ? "pink" : "blue"}`;
  const metaClass = `doctor-meta ${isGynae ? "pink-meta" : "blue-meta"}`;
  const btnClass = `doctor-btn ${isGynae ? "pink-btn" : "blue-btn"}`;

  const isOpdExperience = doctor.opdDays.toLowerCase().includes("year");

  const photoDiv = (
    <div className="doctor-photo">
      <img src={getImageUrl(doctor.image)} alt={doctor.name} />
    </div>
  );

  const infoDiv = (
    <div className="doctor-info">
      <span className={tagClass}>{doctor.department.toUpperCase()}</span>
      <h3>{doctor.name}</h3>
      <p className="degree">{doctor.position}</p>
      <p className="doctor-about">{doctor.aboutDoctor}</p>
      {doctor.features && doctor.features.length > 0 && (
        <ul>
          {doctor.features.map((feature, idx) => (
            <li key={idx}>{feature}</li>
          ))}
        </ul>
      )}
      <div className={metaClass}>
        <span><strong>{isOpdExperience ? "Experience" : "OPD"}:</strong> {doctor.opdDays}</span>
        <span><strong>Timing:</strong> {doctor.dailyTime}</span>
        <span><strong>Sunday:</strong> {doctor.sundayTiming}</span>
      </div>
      <a href={`/appointment.html?doc=${docSlug}`} className={btnClass}>Book Appointment</a>
    </div>
  );

  return (
    <div className={cardClass}>
      {index % 2 === 0 ? (
        <>
          {photoDiv}
          {infoDiv}
        </>
      ) : (
        <>
          {infoDiv}
          {photoDiv}
        </>
      )}
    </div>
  );
}

/* ─── Doctors Section rendered from CMS + live doctor records ── */
function DoctorsSection({ cmsHtml, doctors }) {
  const parts = cmsHtml.split("{{doctors}}");

  return (
    <section className="doctors-section">
      {parts[0] && (
        <div dangerouslySetInnerHTML={{ __html: parts[0] }} />
      )}

      {doctors.map((d, i) => (
        <DoctorCard key={d._id} doctor={d} index={i} />
      ))}

      {parts[1] && (
        <div dangerouslySetInnerHTML={{ __html: parts[1] }} />
      )}
    </section>
  );
}

/* ─── Default CMS content for doctors (admin can override) ──── */
const DEFAULT_DOCTORS_CMS = `
<div class="section-title doctor-title">
  <span>MEET OUR EXPERTS</span>
  <h2>Our Doctors</h2>
  <p>Qualified, experienced and dedicated specialists for your healthcare.</p>
</div>
{{doctors}}
`;

/* ─── Default CMS content for why choose us (admin can override) ──── */
const DEFAULT_WHY_CMS = `
<div class="section-title">
  <span>WHY CHOOSE US</span>
  <h2>Why Choose Our Care?</h2>
  <p>Expert kidney care and women's healthcare with trust, compassion and modern treatment approach.</p>
</div>
{{faqs}}
`;

/* ─── Default CMS content for testimonials ──────────────────── */
const DEFAULT_TESTIMONIALS_CMS = `
<div class="section-title">
  <span>TESTIMONIALS</span>
  <h2>What Our Patients Say</h2>
  <p>Trusted by thousands of patients across Jaipur and Rajasthan</p>
</div>
{{testimonials}}
`;

/* ─── Testimonials Section rendered from CMS + live testimonials ── */
function TestimonialsSection({ cmsHtml, testimonials }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);

  const staticTestimonials = [
    {
      _id: "s1",
      customerName: "Ramesh Sharma",
      location: "Jaipur, Rajasthan",
      diagnose: "Kidney Care",
      message: "Dr. Priyash Tambi diagnosed my kidney disease at the right time and started the correct treatment immediately. His experience and patience gave me and my family complete confidence. The entire team took excellent care during dialysis.",
    },
    {
      _id: "s2",
      customerName: "Priya Meena",
      location: "Jaipur, Rajasthan",
      diagnose: "Gynaecology",
      message: "Dr. Priyanka took exceptional care throughout my entire pregnancy. It was a high-risk case, yet she handled everything with such confidence and composure. I had a normal delivery and I am extremely happy with the outcome.",
    },
    {
      _id: "s3",
      customerName: "Vikram Joshi",
      location: "Ajmer, Rajasthan",
      diagnose: "Transplant Care",
      message: "After my kidney transplant, Dr. Priyash Tambi's follow-up care was truly commendable. Every question was answered promptly, and guidance was always available whenever needed. His dedication to patient recovery is remarkable.",
    },
    {
      _id: "s4",
      customerName: "Sunita Kumari",
      location: "Sikar, Rajasthan",
      diagnose: "PCOS Care",
      message: "I had been struggling with PCOS for a long time. Dr. Priyanka listened carefully and provided both medication and diet guidance. Within 3 months there was a significant improvement and my periods became regular.",
    },
    {
      _id: "s5",
      customerName: "Mahesh Kumar",
      location: "Kota, Rajasthan",
      diagnose: "Kidney Care",
      message: "My father was suffering from chronic kidney disease. Dr. Priyash Tambi explained everything in simple language and started dialysis at exactly the right time. His condition has improved significantly now.",
    },
    {
      _id: "s6",
      customerName: "Anita Nagar",
      location: "Udaipur, Rajasthan",
      diagnose: "Laparoscopy",
      message: "Dr. Priyanka performed my laparoscopy surgery with great skill and precision. Recovery after the procedure was very quick. Her warm and friendly nature ensures that patients never feel anxious or stressed.",
    },
  ];

  const itemsList = testimonials && testimonials.length > 0 ? testimonials : staticTestimonials;
  const total = itemsList.length;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 576) setCardsPerView(1);
      else if (window.innerWidth <= 992) setCardsPerView(2);
      else setCardsPerView(3);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, total - cardsPerView);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Autoplay slider every 5s
  useEffect(() => {
    if (total <= cardsPerView) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [total, cardsPerView, maxIndex]);

  const getInitials = (name) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getDiagnoseTag = (diagnose) => {
    let emoji = "❤️";
    const lower = diagnose.toLowerCase();
    if (lower.includes("kidney") || lower.includes("transplant") || lower.includes("nephro")) {
      emoji = "🫘";
    } else if (lower.includes("pregnancy") || lower.includes("deliver") || lower.includes("gyn") || lower.includes("baby")) {
      emoji = "👶";
    } else if (lower.includes("pcos")) {
      emoji = "👩‍⚕️";
    } else if (lower.includes("laparoscop")) {
      emoji = "🔬";
    }
    return `${emoji} ${diagnose}`;
  };

  // Support different placeholder styles
  let parts = [];
  const activeCmsHtml = cmsHtml || DEFAULT_TESTIMONIALS_CMS;
  if (activeCmsHtml.includes("{{testimonials}}")) {
    parts = activeCmsHtml.split("{{testimonials}}");
  } else if (activeCmsHtml.includes("{{reviews}}")) {
    parts = activeCmsHtml.split("{{reviews}}");
  } else {
    parts = [activeCmsHtml];
  }

  const headerHtml = parts[0];
  const totalDots = maxIndex + 1;

  return (
    <section className="testimonials-section">
      {headerHtml && (
        <div dangerouslySetInnerHTML={{ __html: headerHtml }} />
      )}

      <div className="testi-slider-outer">
        <div
          className="testi-track"
          style={{
            transform: `translateX(calc(-${activeIndex} * (100% + 24px) / ${cardsPerView}))`
          }}
        >
          {itemsList.map((t, idx) => {
            const isGynae = t.diagnose.toLowerCase().includes("gyn") ||
              t.diagnose.toLowerCase().includes("pregnancy") ||
              t.diagnose.toLowerCase().includes("baby") ||
              t.diagnose.toLowerCase().includes("pcos") ||
              t.diagnose.toLowerCase().includes("laparoscop");
            return (
              <div key={t._id} className="testi-card">
                <div className="testi-top">
                  <div className="testi-stars">★★★★★</div>
                  <div className="testi-quote">❝</div>
                </div>
                <p className="testi-text">{t.message}</p>
                <div className="testi-footer">
                  <div className={`testi-avatar ${isGynae ? "pink-avatar" : "blue-avatar"}`}>
                    {getInitials(t.customerName)}
                  </div>
                  <div className="testi-name-box">
                    <strong>{t.customerName}</strong>
                    <span>{t.location}</span>
                  </div>
                  {t.diagnose && (
                    <div className={`testi-tag ${isGynae ? "pink-tag" : "blue-tag"}`}>
                      {getDiagnoseTag(t.diagnose)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {total > cardsPerView && (
        <div className="testi-nav">
          <button className="testi-arrow" onClick={prevSlide} type="button">
            <i className="fa-solid fa-chevron-left" />
          </button>
          <div className="testi-dots">
            {Array.from({ length: totalDots }).map((_, i) => (
              <button
                key={i}
                className={`testi-dot${activeIndex === i ? " active" : ""}`}
                onClick={() => setActiveIndex(i)}
                type="button"
              />
            ))}
          </div>
          <button className="testi-arrow" onClick={nextSlide} type="button">
            <i className="fa-solid fa-chevron-right" />
          </button>
        </div>
      )}

      {parts[1] && (
        <div dangerouslySetInnerHTML={{ __html: parts[1] }} />
      )}
    </section>
  );
}

/* ─── Default CMS content for diagnoses ─────────────────────── */
const DEFAULT_DIAGNOSIS_CMS = `
{{diagnoses}}
`;

/* ─── Diagnosis (Specialist) Section rendered from CMS + live records ── */
function DiagnosisSection({ cmsHtml, diagnoses }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const staticDiagnoses = [
    {
      _id: "sd1",
      name: "गुर्दा रोग (Kidney) के इलाज के लिए संपर्क करें",
      image: "/img/priyash.jpeg",
      doctorName: "डॉ. प्रियाश तांबी",
      doctorPosition: "कंसल्टेंट नेफ्रोलॉजिस्ट एवं ट्रांसप्लांट फिजिशियन",
      features: [
        "तीव्र और दीर्घकालिक गुर्दा रोग",
        "किडनी ट्रांसप्लांट देखभाल",
        "डायलिसिस व क्रिटिकल केयर",
        "उच्च रक्तचाप व मधुमेह से गुर्दा रोग",
        "गुर्दे की पथरी व ग्लोमेरुलर विकार",
        "इलेक्ट्रोलाइट असंतुलन उपचार",
        "उच्च रक्तचाप प्रबंधन",
        "क्रिटिकल केयर नेफ्रोलॉजी"
      ]
    },
    {
      _id: "sd2",
      name: "महिला स्वास्थ्य (Gynaecology) के इलाज के लिए संपर्क करें",
      image: "/img/priyanka.jpeg",
      doctorName: "डॉ. प्रियंका नासरे तांबी",
      doctorPosition: "कंसल्टेंट प्रसूति एवं स्त्री रोग विशेषज्ञ",
      features: [
        "उच्च जोखिम गर्भावस्था देखभाल",
        "पीसीओएस व हार्मोनल विकार उपचार",
        "बांझपन मूल्यांकन एवं उपचार",
        "सामान्य व सिजेरियन प्रसव",
        "लैप्रोस्कोपिक व हिस्टेरोस्कोपिक सर्जरी",
        "मासिक धर्म विकार प्रबंधन",
        "महिला स्वास्थ्य व रजोनिवृत्ति देखभाल",
        "फाइब्रॉइड व ओवेरियन सिस्ट उपचार"
      ]
    }
  ];

  const itemsList = diagnoses && diagnoses.length > 0 ? diagnoses : staticDiagnoses;
  const total = itemsList.length;

  const nextSlide = () => {
    setActiveIndex((prev) => (prev >= total - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev <= 0 ? total - 1 : prev - 1));
  };

  // Autoplay slider every 6s
  useEffect(() => {
    if (total <= 1) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [total]);

  // Support different placeholder styles
  let parts = [];
  const activeCmsHtml = cmsHtml || DEFAULT_DIAGNOSIS_CMS;
  if (activeCmsHtml.includes("{{diagnoses}}")) {
    parts = activeCmsHtml.split("{{diagnoses}}");
  } else if (activeCmsHtml.includes("{{diagnosis}}")) {
    parts = activeCmsHtml.split("{{diagnosis}}");
  } else if (activeCmsHtml.includes("{{specialists}}")) {
    parts = activeCmsHtml.split("{{specialists}}");
  } else {
    parts = [activeCmsHtml];
  }

  const headerHtml = parts[0];

  return (
    <section className="specialist-slider-section" style={{ position: "relative", overflow: "hidden" }}>
      {headerHtml && (
        <div dangerouslySetInnerHTML={{ __html: headerHtml }} />
      )}

      <div className="spec-slider-wrapper" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
        {itemsList.map((item, idx) => {
          const isPink = idx % 2 === 1; // Alternate styles: Nephrologist style is blue (even), Gynecologist style is pink (odd)

          // Split features in half
          const mid = Math.ceil(item.features.length / 2);
          const leftFeatures = item.features.slice(0, mid);
          const rightFeatures = item.features.slice(mid);

          const docSlug = item.doctorName
            .toLowerCase()
            .replace(/^(डॉ\.\s*|dr\.\s*)/i, "")
            .split(" ")[0];

          return (
            <div key={item._id} className={`spec-slide${isPink ? " spec-slide-pink" : ""}`}>
              <h2 className="spec-heading">{item.name}</h2>
              <div className="spec-content">
                <div className="spec-left">
                  <ul>
                    {leftFeatures.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
                <div className="spec-center">
                  <div className="spec-photo-circle">
                    <img src={getImageUrl(item.image)} alt={item.doctorName} />
                  </div>
                  <h3>{item.doctorName}</h3>
                  <p>{item.doctorPosition}</p>
                  <a href={`/appointment.html?doc=${docSlug}`} className={`spec-btn ${isPink ? "pink-spec-btn" : "blue-spec-btn"}`}>
                    अपॉइंटमेंट बुक करें
                  </a>
                </div>
                <div className="spec-right">
                  <ul>
                    {rightFeatures.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {total > 1 && (
        <>
          <button className="spec-arrow spec-prev" onClick={prevSlide} type="button">
            <i className="fa-solid fa-chevron-left" />
          </button>
          <button className="spec-arrow spec-next" onClick={nextSlide} type="button">
            <i className="fa-solid fa-chevron-right" />
          </button>

          <div className="spec-dots">
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                className={`spec-dot${activeIndex === i ? " active" : ""}`}
                onClick={() => setActiveIndex(i)}
              />
            ))}
          </div>
        </>
      )}

      {parts[1] && (
        <div dangerouslySetInnerHTML={{ __html: parts[1] }} />
      )}
    </section>
  );
}

/* ─── Default CMS content for gallery ───────────────────────── */
const DEFAULT_GALLERY_CMS = `
<div class="section-title">
  <span>OUR GALLERY</span>
  <h2>Moments of Care & Healing</h2>
  <p>A glimpse into our hospital, facilities and patient care.</p>
</div>
{{gallery}}
`;

/* ─── Gallery Section rendered from CMS + live records ──────── */
function GallerySection({ cmsHtml, gallery }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const staticImages = [
    { _id: "sg1", image: "/img/doc11.jpg" },
    { _id: "sg2", image: "/img/doc2.jpg" },
    { _id: "sg3", image: "/img/doc3.jpg" },
    { _id: "sg4", image: "/img/doc4.jpg" }
  ];

  const itemsList = gallery && gallery.length > 0 ? gallery : staticImages;

  // Support different placeholder styles
  let parts = [];
  const activeCmsHtml = cmsHtml || DEFAULT_GALLERY_CMS;
  if (activeCmsHtml.includes("{{gallery}}")) {
    parts = activeCmsHtml.split("{{gallery}}");
  } else if (activeCmsHtml.includes("{{gallery-list}}")) {
    parts = activeCmsHtml.split("{{gallery-list}}");
  } else if (activeCmsHtml.includes("{{images}}")) {
    parts = activeCmsHtml.split("{{images}}");
  } else {
    parts = [activeCmsHtml];
  }

  const headerHtml = parts[0];

  return (
    <section className="gallery-section">
      {headerHtml && (
        <div dangerouslySetInnerHTML={{ __html: headerHtml }} />
      )}

      <div className="gallery-grid">
        {itemsList.map((item) => (
          <div key={item._id} className="gallery-item" onClick={() => setSelectedImage(item.image)} style={{ cursor: "pointer" }}>
            <img src={getImageUrl(item.image)} alt="Gallery Item" />
            <div className="gallery-overlay">
              <i className="fa-solid fa-magnifying-glass-plus" />
            </div>
          </div>
        ))}
      </div>

      <div className="gallery-btn-wrap">
        <a href="/gallery.html" className="show-btn">View Full Gallery</a>
      </div>

      {parts[1] && (
        <div dangerouslySetInnerHTML={{ __html: parts[1] }} />
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            cursor: 'zoom-out',
            padding: '20px'
          }}
        >
          <button
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '25px',
              color: '#fff',
              fontSize: '40px',
              fontWeight: 'bold',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              zIndex: 100000
            }}
          >
            &times;
          </button>
          <img
            src={getImageUrl(selectedImage)}
            alt="Enlarged gallery view"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}

/* ─── OPD / Consultation Hours Section (CMS-driven) ─────────── */
function OpdSection({ cmsHtml }) {
  // If CMS content is available, render it directly as HTML
  if (cmsHtml) {
    return <div dangerouslySetInnerHTML={{ __html: cmsHtml }} />;
  }

  // Static fallback if CMS not yet configured
  return (
    <section className="opd-section">
      <div className="opd-header">
        <span className="opd-label">CONSULTATION HOURS</span>
        <h2 className="opd-title">Clinic Timing</h2>
        <p className="opd-sub">Monday to Saturday • Sunday Appointment Basis (9:00 AM – 11:00 AM)</p>
      </div>

      <div className="opd-grid">
        <div className="opd-card opd-card-blue">
          <div className="opd-card-top">
            <div className="opd-icon opd-icon-blue">
              <i className="fa-solid fa-user-doctor" />
            </div>
            <div>
              <span className="opd-tag opd-tag-blue">Nephrologist</span>
              <h3 className="opd-name">Dr. Priyash Tambi</h3>
            </div>
          </div>

          <div className="opd-timings">
            <div className="opd-time-row">
              <i className="fa-solid fa-sun opd-sun-blue" />
              <span className="opd-slot-label">Morning</span>
              <span className="opd-slot-time opd-slot-blue">8:00 AM – 9:00 AM</span>
            </div>
            <div className="opd-time-row">
              <i className="fa-solid fa-moon opd-sun-blue" />
              <span className="opd-slot-label">Evening — Clinic</span>
              <span className="opd-slot-time opd-slot-blue">6:00 PM – 7:30 PM</span>
            </div>
            <div className="opd-time-row">
              <i className="fa-solid fa-calendar-check opd-sun-blue" />
              <span className="opd-slot-label">Sunday Appointment Basis</span>
              <span className="opd-slot-time opd-slot-blue">9:00 AM – 11:00 AM</span>
            </div>
          </div>

          <a href="tel:+918779698693" className="opd-btn opd-btn-blue">
            <i className="fa-solid fa-phone" /> +91 87796 98693
          </a>
        </div>

        <div className="opd-card opd-card-pink">
          <div className="opd-card-top">
            <div className="opd-icon opd-icon-pink">
              <i className="fa-solid fa-user-doctor" />
            </div>
            <div>
              <span className="opd-tag opd-tag-pink">Gynaecologist</span>
              <h3 className="opd-name">Dr. Priyanka Nasare Tambi</h3>
            </div>
          </div>

          <div className="opd-timings">
            <div className="opd-time-row">
              <i className="fa-solid fa-sun opd-sun-pink" />
              <span className="opd-slot-label">Morning</span>
              <span className="opd-slot-time opd-slot-pink">9:00 AM – 1:00 PM</span>
            </div>
            <div className="opd-time-row">
              <i className="fa-solid fa-moon opd-sun-pink" />
              <span className="opd-slot-label">Evening</span>
              <span className="opd-slot-time opd-slot-pink">6:00 PM – 8:00 PM</span>
            </div>
            <div className="opd-time-row">
              <i className="fa-solid fa-calendar-check opd-sun-pink" />
              <span className="opd-slot-label">Sunday Appointment Basis</span>
              <span className="opd-slot-time opd-slot-pink">9:00 AM – 11:00 AM</span>
            </div>
          </div>

          <a href="tel:+919137095229" className="opd-btn opd-btn-pink">
            <i className="fa-solid fa-phone" /> +91 91370 95229
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── Header (static, exact as original) ────────────────────── */
function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header>
      <nav className="navbar">
        <div className="logo">
          <img src={logoImg} alt="Tambi Logo" />
        </div>
        <div className="hamburger" id="hamburger" onClick={() => setMenuOpen((p) => !p)}>
          <i className={menuOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"} />
        </div>
        <ul className={`nav-menu${menuOpen ? " active" : ""}`} id="navMenu">
          <li><a href="/" className="active" onClick={closeMenu}>Home</a></li>
          <li className="dropdown">
            <a href="#" className="dropdown-toggle">About <i className="fa-solid fa-chevron-down" style={{ fontSize: 11 }} /></a>
            <ul className="dropdown-menu">
              <li><a href="/about-priyash.html"><i className="fa-solid fa-user-doctor" /> Dr. Priyash Tambi</a></li>
              <li><a href="/about-priyanka.html"><i className="fa-solid fa-user-doctor" /> Dr. Priyanka Tambi</a></li>
            </ul>
          </li>
          <li className="dropdown">
            <a href="/nephrologist.html">Nephrologist ▾</a>
            <ul className="dropdown-menu">
              <li><a href="/acute-kidney-injury.html">Acute Kidney Injury</a></li>
              <li><a href="/chronic-kidney-disease.html">Chronic Kidney Disease</a></li>
              <li><a href="/kidney-transplant.html">Kidney Transplant Care</a></li>
              <li><a href="/dialysis-care.html">Dialysis Care</a></li>
              <li><a href="/hypertension-kidney.html">Hypertension &amp; Kidney Care</a></li>
              <li><a href="/diabetic-kidney.html">Diabetic Kidney Disease</a></li>
              <li><a href="/renal-stone.html">Renal Stone Disease</a></li>
              <li><a href="/glomerulonephritis.html">Glomerulonephritis</a></li>
              <li><a href="/electrolyte-imbalance.html">Electrolyte Imbalance</a></li>
            </ul>
          </li>
          <li className="dropdown">
            <a href="/gynecologist.html">Gynecologist ▾</a>
            <ul className="dropdown-menu">
              <li><a href="/pre-conception-counseling.html">Pre-Conception Counseling</a></li>
              <li><a href="/antenatal-care.html">Antenatal Care</a></li>
              <li><a href="/high-risk-pregnancy.html">High-Risk Pregnancy Management</a></li>
              <li><a href="/painless-delivery.html">Painless Normal Deliveries</a></li>
              <li><a href="/cesarean-section.html">Cesarean Sections</a></li>
              <li><a href="/menstrual-disorders.html">Menstrual Disorder Management</a></li>
              <li><a href="/pelvic-pain-infection.html">Pelvic Pain &amp; Infection Treatment</a></li>
              <li><a href="/fibroid-ovarian-cyst.html">Fibroid &amp; Ovarian Cyst Management</a></li>
              <li><a href="/contraceptive-counseling.html">Contraceptive Counseling</a></li>
              <li><a href="/iud-implant-services.html">IUD &amp; Implant Services</a></li>
              <li><a href="/infertility-treatment.html">Infertility Treatments</a></li>
              <li><a href="/advanced-gynae-surgery.html">Advanced Surgical Procedures</a></li>
              <li><a href="/menopause-management.html">Menopause Management</a></li>
              <li><a href="/cancer-screening.html">Breast &amp; Cervical Cancer Screening</a></li>
            </ul>
          </li>
          <li><a href="/treatments.html" onClick={closeMenu}>Treatments</a></li>
          <li><a href="/gallery.html" onClick={closeMenu}>Gallery</a></li>
          <li><a href="/contact.html" onClick={closeMenu}>Contact</a></li>
          <li><a href="/appointment.html" className="mobile-btn" onClick={closeMenu}>Book Appointment</a></li>
        </ul>
        <a href="/appointment.html" className="btn">Book Appointment</a>
      </nav>
    </header>
  );
}

/* ─── Main HomePage Component ────────────────────────────────── */
export default function HomePage() {
  const [banners, setBanners] = useState([]);
  const [services, setServices] = useState([]);
  const [servicesCmsHtml, setServicesCmsHtml] = useState(DEFAULT_SERVICES_CMS);
  const [doctors, setDoctors] = useState([]);
  const [doctorsCmsHtml, setDoctorsCmsHtml] = useState(DEFAULT_DOCTORS_CMS);
  const [faqs, setFaqs] = useState([]);
  const [whyCmsHtml, setWhyCmsHtml] = useState(DEFAULT_WHY_CMS);
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsCmsHtml, setTestimonialsCmsHtml] = useState(DEFAULT_TESTIMONIALS_CMS);
  const [diagnoses, setDiagnoses] = useState([]);
  const [diagnosesCmsHtml, setDiagnosesCmsHtml] = useState(DEFAULT_DIAGNOSIS_CMS);
  const [gallery, setGallery] = useState([]);
  const [galleryCmsHtml, setGalleryCmsHtml] = useState(DEFAULT_GALLERY_CMS);
  const [consultationHoursCmsHtml, setConsultationHoursCmsHtml] = useState("");
  const [loadingBanners, setLoadingBanners] = useState(true);

  useEffect(() => {
    // Fetch active banners
    fetch(`${API_BASE}/api/public/banners`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setBanners(d.banners || []); })
      .catch(() => { })
      .finally(() => setLoadingBanners(false));

    // Fetch active services
    fetch(`${API_BASE}/api/public/services`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setServices(d.services || []); })
      .catch(() => { });

    // Fetch CMS page for "services" — fallback to default if not found
    fetch(`${API_BASE}/api/public/cms/services_cms`)
      .then((r) => r.json())
      .then((d) => { if (d.success && d.page?.content) setServicesCmsHtml(d.page.content); })
      .catch(() => { });

    // Fetch active doctors
    fetch(`${API_BASE}/api/public/doctors`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setDoctors(d.doctors || []); })
      .catch(() => { });

    // Fetch CMS page for "doctors" — fallback to default if not found
    fetch(`${API_BASE}/api/public/cms/doctors_cms`)
      .then((r) => r.json())
      .then((d) => { if (d.success && d.page?.content) setDoctorsCmsHtml(d.page.content); })
      .catch(() => { });

    // Fetch active FAQs
    fetch(`${API_BASE}/api/public/faqs`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setFaqs(d.faqs || []); })
      .catch(() => { });

    // Fetch CMS page for "why-choose-us" — fallback to default if not found
    fetch(`${API_BASE}/api/public/cms/why_choose_us_cms`)
      .then((r) => r.json())
      .then((d) => { if (d.success && d.page?.content) setWhyCmsHtml(d.page.content); })
      .catch(() => { });

    // Fetch active Testimonials
    fetch(`${API_BASE}/api/public/testimonials`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setTestimonials(d.testimonials || []); })
      .catch(() => { });

    // Fetch CMS page for "testimonials" — fallback to default if not found
    fetch(`${API_BASE}/api/public/cms/testimonials_cms`)
      .then((r) => r.json())
      .then((d) => { if (d.success && d.page?.content) setTestimonialsCmsHtml(d.page.content); })
      .catch(() => { });

    // Fetch active Diagnoses
    fetch(`${API_BASE}/api/public/diagnoses`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setDiagnoses(d.diagnoses || []); })
      .catch(() => { });

    // Fetch CMS page for "diagnoses" — fallback to default if not found
    fetch(`${API_BASE}/api/public/cms/diagnoses_cms`)
      .then((r) => r.json())
      .then((d) => { if (d.success && d.page?.content) setDiagnosesCmsHtml(d.page.content); })
      .catch(() => { });

    // Fetch active Gallery items
    fetch(`${API_BASE}/api/public/gallery`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setGallery(d.gallery || []); })
      .catch(() => { });

    // Fetch CMS page for "gallery" — fallback to default if not found
    fetch(`${API_BASE}/api/public/cms/gallery_cms`)
      .then((r) => r.json())
      .then((d) => { if (d.success && d.page?.content) setGalleryCmsHtml(d.page.content); })
      .catch(() => { });

    // Fetch CMS page for consultation hours
    fetch(`${API_BASE}/api/public/cms/consultation_hours`)
      .then((r) => r.json())
      .then((d) => { if (d.success && d.page?.content) setConsultationHoursCmsHtml(d.page.content); })
      .catch(() => { });

  }, []);

  // Mobile dropdown toggle
  useEffect(() => {
    const handler = (e) => {
      const toggle = e.target.closest(".dropdown-toggle");
      if (toggle && window.innerWidth <= 768) {
        e.preventDefault();
        toggle.closest(".dropdown")?.classList.toggle("open");
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

      <Header />

      {/* Banner Slider */}
      {!loadingBanners && <BannerSlider banners={banners} />}

      {/* Services Section — CMS content + dynamic service cards */}
      <ServicesSection cmsHtml={servicesCmsHtml} services={services} />

      {/* Doctors Section — CMS content + dynamic doctor cards */}
      <DoctorsSection cmsHtml={doctorsCmsHtml} doctors={doctors} />

      {/* Why Choose Us */}
      <WhySection cmsHtml={whyCmsHtml} faqs={faqs} />

      {/* Diagnosis Control (Specialist Slider) */}
      <DiagnosisSection cmsHtml={diagnosesCmsHtml} diagnoses={diagnoses} />

      {/* Testimonials */}
      <TestimonialsSection cmsHtml={testimonialsCmsHtml} testimonials={testimonials} />

      {/* Stats */}
      <StatSection />

      {/* Gallery */}
      <GallerySection cmsHtml={galleryCmsHtml} gallery={gallery} />

      {/* Clinic Timings (OPD Hours) — CMS-driven */}
      <OpdSection cmsHtml={consultationHoursCmsHtml} />

      {/* Footer */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-col brand-col">
            <img src={logoImg} alt="Tambi Logo" className="footer-logo" />
            <p className="footer-about">Providing expert kidney care and women's healthcare with compassion, trust and modern treatment approach at RJC Hospital, Jaipur.</p>
            <div className="footer-social">
              <a href="#"><i className="fa-brands fa-facebook-f" /></a>
              <a href="#"><i className="fa-brands fa-instagram" /></a>
              <a href="#"><i className="fa-brands fa-youtube" /></a>
              <a href="#"><i className="fa-brands fa-whatsapp" /></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><a href="/">Home</a></li>
              <li><a href="/about-priyash.html">Dr. Priyash Tambi</a></li>
              <li><a href="/about-priyanka.html">Dr. Priyanka Tambi</a></li>
              <li><a href="/nephrologist.html">Nephrologist</a></li>
              <li><a href="/gynecologist.html">Gynecologist</a></li>
              <li><a href="/treatments.html">Treatments</a></li>
              <li><a href="/gallery.html">Gallery</a></li>
              <li><a href="/contact.html">Contact Us</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Our Services</h4>
            <ul className="footer-links">
              <li><a href="/nephrologist.html">Kidney Disease Management</a></li>
              <li><a href="/nephrologist.html">Dialysis Care</a></li>
              <li><a href="/nephrologist.html">Kidney Transplant</a></li>
              <li><a href="/gynecologist.html">High Risk Pregnancy</a></li>
              <li><a href="/gynecologist.html">PCOS Treatment</a></li>
              <li><a href="/gynecologist.html">Laparoscopic Surgery</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact Us</h4>
            <ul className="footer-contact">
              <li>
                <div className="contact-icon"><i className="fa-solid fa-location-dot" /></div>
                <span>RJC Hospital, Jaipur, Rajasthan</span>
              </li>
              <li>
                <div className="contact-icon"><i className="fa-solid fa-phone" /></div>
                <span>+91 87796 98693</span>
              </li>
              <li>
                <div className="contact-icon"><i className="fa-solid fa-phone" /></div>
                <span>+91 91370 95229</span>
              </li>
              <li>
                <div className="contact-icon"><i className="fa-regular fa-envelope" /></div>
                <span>drpriyashnephro@gmail.com</span>
              </li>
              <li>
                <div className="contact-icon"><i className="fa-regular fa-clock" /></div>
                <span>Hospital: 09:30 AM – 4:30 PM<br />Sunday Appointment Basis: 9:00 AM – 11:00 AM</span>
              </li>
            </ul>
            <a href="/appointment.html" className="footer-appt-btn">Book Appointment</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 Dr. Priyash &amp; Dr. Priyanka Tambi. All Rights Reserved.</p>
          <p>Designed with <i className="fa-solid fa-heart" style={{ color: "#d63384" }} /> for better healthcare</p>
        </div>
      </footer>
    </>
  );
}

/* ─── Why Choose Us ─────────────────────────────────────────── */
function WhySection({ cmsHtml, faqs }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const items =
    faqs && faqs.length > 0
      ? faqs.map((f) => ({ id: f._id, q: f.question, a: f.answer }))
      : [];

  if (!cmsHtml) return null;

  const PLACEHOLDER = "{{faqs}}";
  const hasPlaceholder = cmsHtml.includes(PLACEHOLDER);
  const parts = hasPlaceholder ? cmsHtml.split(PLACEHOLDER) : [cmsHtml];

  const titleHtml = (parts[0] || "")
    .replace(/<div class="why-wrapper">[\s\S]*/i, "")
    .trim();

  const tailHtml = (parts[1] || "")
    .replace(/^[\s]*<\/div>[\s]*/i, "")
    .trim();

  const accordionJSX =
    items.length > 0 ? (
      <div className="why-accordion">
        {items.map((item, i) => (
          <div
            key={item.id}
            className={`why-item${activeIndex === i ? " active" : ""}`}
          >
            <button
              className="why-question"
              type="button"
              onClick={() => setActiveIndex(activeIndex === i ? null : i)}
            >
              <span className="icon">{activeIndex === i ? "−" : "+"}</span>
              {item.q}
            </button>
            <div className="why-answer">
              <p>{item.a}</p>
            </div>
          </div>
        ))}
      </div>
    ) : null;

  return (
    <section className="why-section">
      {titleHtml && (
        <div dangerouslySetInnerHTML={{ __html: titleHtml }} />
      )}

      {(hasPlaceholder || accordionJSX) && (
        <div className="why-wrapper">
          <div className="why-image">
            <img src={whyImg} alt="Why Choose Us" />
          </div>
          {accordionJSX}
        </div>
      )}

      {tailHtml && (
        <div dangerouslySetInnerHTML={{ __html: tailHtml }} />
      )}
    </section>
  );
}


/* ─── Stats Section ─────────────────────────────────────────── */
function StatSection() {
  const stats = [
    { icon: "fa-users", target: 25000, label: "Patients Treated" },
    { icon: "fa-user-doctor", target: 10, label: "Years Experience" },
    { icon: "fa-microscope", target: 750, label: "Kidney Biopsies" },
    { icon: "fa-syringe", target: 1000, label: "Permcath Insertions" },
    { icon: "fa-droplet", target: 5000, label: "Dialysis Line Insertions" },
  ];
  const [counts, setCounts] = useState(stats.map(() => 0));
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    stats.forEach((s, i) => {
      const steps = 60;
      const increment = Math.ceil(s.target / steps);
      let count = 0;
      const timer = setInterval(() => {
        count += increment;
        if (count >= s.target) { count = s.target; clearInterval(timer); }
        setCounts((prev) => { const n = [...prev]; n[i] = count; return n; });
      }, Math.floor(1500 / steps));
    });
  }, []);

  return (
    <section className="stat-section">
      <div className="stat-header">
        <span className="stat-label">OUR ACHIEVEMENTS</span>
        <h2 className="stat-title">Numbers That Speak</h2>
        <p className="stat-sub">Years of dedication, expertise and patient trust</p>
      </div>
      <div className="stat-row">
        {stats.map((s, i) => (
          <div key={i} className={`stat-box stat-box-${i + 1}`}>
            <div className="stat-icon"><i className={`fa-solid ${s.icon}`} /></div>
            <div className="stat-num">{counts[i].toLocaleString()}<span>+</span></div>
            <div className="stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
