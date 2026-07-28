"use client";
import { useState, useEffect, createElement as h } from "react";
import { supabase } from "../../lib/supabase"; 

export default function Randevu() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    plate: "",
    serviceType: "",
    date: "",
    district: "",
    address: ""
  });

  // Hafızadan seçilen tarih ve saati çekip inputa yazıyoruz
  useEffect(() => {
    const savedSlot = localStorage.getItem('selectedSlot');
    if (savedSlot) {
      setFormData(prev => ({ ...prev, date: savedSlot }));
      localStorage.removeItem('selectedSlot'); // Kullanıldıktan sonra temizle
    }
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault(); 
    setLoading(true);

    try {
      const guestInfo = {
        name: formData.name,
        phone: formData.phone,
        plate: formData.plate,
      };

      const fullLocation = formData.district + " - " + formData.address;
      const formattedDate = new Date(formData.date).toISOString();

      const { error } = await supabase
        .from('appointments')
        .insert([
          {
            guest_info: guestInfo,
            location: fullLocation,
            appointment_date: formattedDate,
            service_type: formData.serviceType,
            status: 'bekliyor'
          }
        ]);

      if (error) {
        alert("Hata: " + error.message);
        setLoading(false);
        return;
      }

      const adminWhatsAppNumber = "905000000000"; 
      
      const message = `🚗 *Yeni Randevu Talebi!* %0A%0A` +
                      `👤 *Ad Soyad:* ${formData.name}%0A` +
                      `📞 *Telefon:* ${formData.phone}%0A` +
                      `🚘 *Plaka:* ${formData.plate}%0A` +
                      `🛠 *Hizmet:* ${formData.serviceType}%0A` +
                      `📅 *Tarih:* ${formData.date}%0A` +
                      `📍 *Adres:* ${fullLocation}`;

      window.open(`https://wa.me/${+905367793561}?text=${message}`, '_blank');

      alert("Randevu basariyla olusturuldu ve WhatsApp'a aktarildi!");
      setFormData({ name: "", phone: "", plate: "", serviceType: "", date: "", district: "", address: "" });
      
    } catch (err: any) {
      alert("Bir hata olustu.");
    } finally {
      setLoading(false);
    }
  };

  return h('main', { style: { minHeight: "100vh", backgroundColor: "#f0fdf4", padding: "40px 20px", fontFamily: "sans-serif" } },
    h('div', { style: { maxWidth: "600px", margin: "0 auto", backgroundColor: "#ffffff", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)", border: "1px solid #d1fae5" } },
      
      h('div', { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" } },
        h('a', { href: "/", style: { color: "#047857", fontWeight: "bold", textDecoration: "underline", fontSize: "14px" } }, "Ana Sayfaya Don"),
        h('img', { src: "/logo.png", alt: "Hanka Logo", style: { width: "80px", height: "80px", objectFit: "contain" } })
      ),

      h('h1', { style: { fontSize: "26px", fontWeight: "bold", color: "#065f46", textAlign: "center", marginBottom: "5px" } }, "Hanka Mobil Randevu"),
      h('p', { style: { color: "#6b7280", textAlign: "center", fontSize: "14px", marginBottom: "25px" } }, "Kapinizda profesyonel oto yikama deneyimi"),
      
      h('form', { onSubmit: handleSubmit, style: { display: "flex", flexDirection: "column", gap: "15px" } },
        
        h('div', null,
          h('label', { style: { display: "block", fontWeight: "bold", marginBottom: "5px", color: "#065f46", fontSize: "14px" } }, "Ad Soyad *"),
          h('input', {
            required: true,
            type: "text",
            value: formData.name,
            onChange: (e: any) => setFormData({...formData, name: e.target.value}),
            style: { width: "100%", padding: "12px", border: "1px solid #a7f3d0", borderRadius: "8px", outline: "none", fontSize: "14px", color: "#111827", backgroundColor: "#fff" }
          })
        ),

        h('div', null,
          h('label', { style: { display: "block", fontWeight: "bold", marginBottom: "5px", color: "#065f46", fontSize: "14px" } }, "Telefon Numarasi *"),
          h('input', {
            required: true,
            type: "tel",
            value: formData.phone,
            onChange: (e: any) => setFormData({...formData, phone: e.target.value}),
            style: { width: "100%", padding: "12px", border: "1px solid #a7f3d0", borderRadius: "8px", outline: "none", fontSize: "14px", color: "#111827", backgroundColor: "#fff" }
          })
        ),

        h('div', null,
          h('label', { style: { display: "block", fontWeight: "bold", marginBottom: "5px", color: "#065f46", fontSize: "14px" } }, "Plaka *"),
          h('input', {
            required: true,
            type: "text",
            value: formData.plate,
            onChange: (e: any) => setFormData({...formData, plate: e.target.value}),
            style: { width: "100%", padding: "12px", border: "1px solid #a7f3d0", borderRadius: "8px", outline: "none", fontSize: "14px", color: "#111827", backgroundColor: "#fff" }
          })
        ),

        h('div', null,
          h('label', { style: { display: "block", fontWeight: "bold", marginBottom: "5px", color: "#065f46", fontSize: "14px" } }, "Hizmet Tipi *"),
          h('select', {
            required: true,
            value: formData.serviceType,
            onChange: (e: any) => setFormData({...formData, serviceType: e.target.value}),
            style: { width: "100%", padding: "12px", border: "1px solid #a7f3d0", borderRadius: "8px", outline: "none", fontSize: "14px", color: "#111827", backgroundColor: "#fff" }
          },
            h('option', { value: "", disabled: true }, "Lütfen bir hizmet seçin..."),
            h('option', { value: "Standart Iç-Dis Yikama" }, "Standart Iç-Dis Yikama"),
            h('option', { value: "Detayli Temizlik" }, "Detayli Temizlik"),
            h('option', { value: "Motor Yikama" }, "Motor Yikama")
          )
        ),

        h('div', null,
          h('label', { style: { display: "block", fontWeight: "bold", marginBottom: "5px", color: "#065f46", fontSize: "14px" } }, "Tarih ve Saat *"),
          h('input', {
            required: true,
            type: "datetime-local",
            value: formData.date,
            onChange: (e: any) => setFormData({...formData, date: e.target.value}),
            style: { width: "100%", padding: "12px", border: "1px solid #a7f3d0", borderRadius: "8px", outline: "none", fontSize: "14px", color: "#111827", backgroundColor: "#fff" }
          })
        ),

        h('div', null,
          h('label', { style: { display: "block", fontWeight: "bold", marginBottom: "5px", color: "#065f46", fontSize: "14px" } }, "Ilce *"),
          h('input', {
            required: true,
            type: "text",
            value: formData.district,
            onChange: (e: any) => setFormData({...formData, district: e.target.value}),
            placeholder: "Orn: Nilufer",
            style: { width: "100%", padding: "12px", border: "1px solid #a7f3d0", borderRadius: "8px", outline: "none", fontSize: "14px", color: "#111827", backgroundColor: "#fff" }
          })
        ),

        h('div', null,
          h('label', { style: { display: "block", fontWeight: "bold", marginBottom: "5px", color: "#065f46", fontSize: "14px" } }, "Adres / Tarif *"),
          h('textarea', {
            required: true,
            value: formData.address,
            onChange: (e: any) => setFormData({...formData, address: e.target.value}),
            style: { width: "100%", padding: "12px", border: "1px solid #a7f3d0", borderRadius: "8px", outline: "none", fontSize: "14px", color: "#111827", backgroundColor: "#fff", height: "80px" }
          })
        ),

        h('button', {
          type: "submit",
          disabled: loading,
          style: { backgroundColor: "#047857", color: "white", padding: "14px", fontWeight: "bold", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "16px", marginTop: "10px" }
        }, loading ? "Gonderiliyor..." : "Randevuyu Tamamla ve WhatsApp'a Gönder")
      )
    )
  );
}