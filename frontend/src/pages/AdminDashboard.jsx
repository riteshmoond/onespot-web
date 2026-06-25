import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";
import BannerManager from "./BannerManager";
import CmsManager from "./CmsManager";
import DoctorManager from "./DoctorManager";
import FaqManager from "./FaqManager";
import DiagnosisManager from "./DiagnosisManager";
import TestimonialManager from "./TestimonialManager";
import GalleryManager from "./GalleryManager";
import ServiceManager from "./ServiceManager";

const pageTitles = {
  dashboard: "Dashboard Overview",
  banners: "Banners",
  cms: "CMS",
  doctors: "Doctors",
  gallery: "Gallery Control",
  services: "Services Control",
  faqs: "FAQ Control",
  diagnoses: "Diagnosis Control",
  testimonials: "Testimonials Control",
};

export default function AdminDashboard({ onLogout = () => {} }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSelectPage = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    onLogout();
  };

  return (
    <div className="admin-shell">
      {sidebarOpen && (
        <button
          className="admin-sidebar-backdrop"
          type="button"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <AdminSidebar
        activePage={activePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        onSelectPage={handleSelectPage}
      />
      <section className="admin-workspace">
        <AdminTopbar
          title={pageTitles[activePage]}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />
        <main className="admin-content">
          {activePage === "dashboard" ? (
            <section className="admin-welcome-state">
              {/* <span>OS</span> */}
              <h2>Welcome to Onespot </h2>
              <p>Manage your website content, banners, gallery, FAQs, and testimonials from here.</p>
            </section>
          ) : activePage === "banners" ? (
            <BannerManager />
          ) : activePage === "cms" ? (
            <CmsManager />
          ) : activePage === "doctors" ? (
            <DoctorManager />
          ) : activePage === "faqs" ? (
            <FaqManager />
          ) : activePage === "diagnoses" ? (
            <DiagnosisManager />
          ) : activePage === "testimonials" ? (
            <TestimonialManager />
          ) : activePage === "gallery" ? (
            <GalleryManager />
          ) : activePage === "services" ? (
            <ServiceManager />
          ) : (
            <section className="admin-empty-state">
              <span>{pageTitles[activePage].slice(0, 2).toUpperCase()}</span>
              <h2>{pageTitles[activePage]}</h2>
              <p>This section is ready for the next admin controls.</p>
            </section>
          )}
        </main>
      </section>
    </div>
  );
}
