"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function RandevuAl() {
  const router = useRouter();
  const [serviceType, setServiceType] = useState("İç-Dış Yıkama");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !name || !phone) {
      alert("Lütfen tarih, isim ve telefon alanlarını doldurun!");
      return;
    }

    setLoading(true);
    const appointmentDateTime = `${date}T${time}:00`;

    const { error } = await supabase.from("appointments").insert([
      {
        service_type: serviceType,
        appointment_date: appointmentDateTime,
        location: location,
        status: "onaylandi",
        guest_info: {
          name: name,
          phone: phone,
          note: note || "Belirtilmedi",
        },
      },
    ]);

    setLoading(false);

    if (error) {
      alert("Randevu oluşturulurken bir hata oluştu: " + error.message);
    } else {
      alert("Randevunuz başarıyla oluşturuldu!");
      router.push("/");
    }
  };

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#f0fdf4", padding: "40px 20px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "#ffffff", padding: "30px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)", border: "1px solid #d1fae5" }}>
        
        <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#065f46", marginBottom: "20px", textAlign: "center" }}>
          Hanka Mobil - Randevu Al
        </h1>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", color: "#047857", marginBottom: "5px" }}>Ana Hizmet Türü</label>
            <select 
              value={serviceType} 
              onChange={(e) => setServiceType(e.target.value)} 
              style={{ width: "100%", padding: "12px", border: "1px solid #a7f3d0", borderRadius: "8px", outline: "none", fontSize: "14px", backgroundColor: "#fff" }}
            >
              <option value="İç-Dış Yıkama">İç-Dış Yıkama</option>
              <option value="Pasta Cila">Pasta Cila</option>
              <option value="Detaylı Temizlik">Detaylı Temizlik</option>
              <option value="Seramik Kaplama">Seramik Kaplama</option>
              <option value="Motor Yıkama">Motor Yıkama</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", color: "#047857", marginBottom: "5px" }}>Tarih Seç</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                style={{ width: "100%", padding: "12px", border: "1px solid #a7f3d0", borderRadius: "8px", outline: "none", fontSize: "14px", backgroundColor: "#fff" }} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", color: "#047857", marginBottom: "5px" }}>Saat Seç</label>
              <select 
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
                style={{ width: "100%", padding: "12px", border: "1px solid #a7f3d0", borderRadius: "8px", outline: "none", fontSize: "14px", backgroundColor: "#fff" }}
              >
                <option value="09:00">09:00</option>
                <option value="11:00">11:00</option>
                <option value="13:00">13:00</option>
                <option value="15:00">15:00</option>
                <option value="17:00">17:00</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", color: "#047857", marginBottom: "5px" }}>Ad Soyad</label>
            <input 
              type="text" 
              placeholder="Adınız Soyadınız" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              style={{ width: "100%", padding: "12px", border: "1px solid #a7f3d0", borderRadius: "8px", outline: "none", fontSize: "14px" }} 
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", color: "#047857", marginBottom: "5px" }}>Telefon Numarası</label>
            <input 
              type="tel" 
              placeholder="05XXXXXXXXX" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              style={{ width: "100%", padding: "12px", border: "1px solid #a7f3d0", borderRadius: "8px", outline: "none", fontSize: "14px" }} 
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", color: "#047857", marginBottom: "5px" }}>Konum / Adres</label>
            <input 
              type="text" 
              placeholder="Araç konumu (Nilüfer, Beşevler vb.)" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
              style={{ width: "100%", padding: "12px", border: "1px solid #a7f3d0", borderRadius: "8px", outline: "none", fontSize: "14px" }} 
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", color: "#047857", marginBottom: "5px" }}>
              Ek Hizmetler ve Özel İstekler (İsteğe bağlı)
            </label>
            <textarea 
              placeholder="Örn: Koltuk yıkama ve far temizliği de eklenecek, ek istekler..." 
              value={note} 
              onChange={(e) => setNote(e.target.value)} 
              style={{ width: "100%", padding: "12px", border: "1px solid #a7f3d0", borderRadius: "8px", outline: "none", fontSize: "14px", minHeight: "80px" }} 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={{ backgroundColor: "#047857", color: "white", padding: "14px", fontWeight: "bold", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "16px", marginTop: "10px" }}
          >
            {loading ? "Kaydediliyor..." : "Randevu Oluştur"}
          </button>

        </form>
      </div>
    </main>
  );
}