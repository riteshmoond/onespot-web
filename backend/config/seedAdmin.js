const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const Cms = require("../models/Cms");

const seedAdmin = async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log("Admin seed skipped: ADMIN_EMAIL or ADMIN_PASSWORD missing");
    return;
  }

  const email = ADMIN_EMAIL.trim().toLowerCase();
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await Admin.findOneAndUpdate(
    { email },
    { email, password: hashedPassword },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
  );

  console.log(`Admin ready: ${admin.email}`);

  // Seed default CMS templates
  const cmsTemplates = [
    {
      name: "services",
      key: "services_cms",
      content: `<div class="section-title">
  <span>OUR SERVICES</span>
  <h2>Services We Offer</h2>
  <p>Expert medical services with modern treatment and compassionate care.</p>
</div>
{{services}}`
    },
    {
      name: "doctors",
      key: "doctors_cms",
      content: `<div class="section-title doctor-title">
  <span>MEET OUR EXPERTS</span>
  <h2>Our Doctors</h2>
  <p>Qualified, experienced and dedicated specialists for your healthcare.</p>
</div>
{{doctors}}`
    },
    {
      name: "why-choose-us",
      key: "why_choose_us_cms",
      content: `<div class="section-title">
  <span>WHY CHOOSE US</span>
  <h2>Why Choose Our Care?</h2>
  <p>Expert kidney care and women's healthcare with trust, compassion and modern treatment approach.</p>
</div>
{{faqs}}`
    },
    {
      name: "testimonials",
      key: "testimonials_cms",
      content: `<div class="section-title">
  <span>TESTIMONIALS</span>
  <h2>What Our Patients Say</h2>
  <p>Trusted by thousands of patients across Jaipur and Rajasthan</p>
</div>
{{testimonials}}`
    },
    {
      name: "diagnoses",
      key: "diagnoses_cms",
      content: `{{diagnoses}}`
    },
    {
      name: "gallery",
      key: "gallery_cms",
      content: `<div class="section-title">
  <span>OUR GALLERY</span>
  <h2>Moments of Care & Healing</h2>
  <p>A glimpse into our hospital, facilities and patient care.</p>
</div>
{{gallery}}`
    }
  ];

  for (const template of cmsTemplates) {
    try {
      const exists = await Cms.findOne({ key: template.key });
      if (!exists) {
        await Cms.create({
          name: template.name,
          key: template.key,
          content: template.content,
          status: "active"
        });
        console.log(`Seeded CMS template: ${template.name} (${template.key})`);
      }
    } catch (error) {
      console.error(`Failed to seed CMS template ${template.name}:`, error.message);
    }
  }

};

module.exports = seedAdmin;
