"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

function RandevuFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialDate = searchParams.get("date") || "";
  const initialTime = searchParams.get("time") || "09:00";

  // Başlangıçta boş bırakıyoruz ki kullanıcı seçmek zorunda kalsın
  const [serviceType, setServiceType] = useState(""); 
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [disabledSlots, setDisabledSlots] = useState<string[]>([]);
  const [successDetails, setSuccessDetails] = useState<any>(null);

  const allSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  useEffect(() => {
    if (!date) return;
    async function checkOccupiedSlots() {
      const { data } = await supabase.from("appointments").select("appointment_date");
      if (data) {
        const blocked: string[] = [];
        data.forEach(item => {
          if (!item.appointment_date) return;
          const [itemDate, itemTimeFull] = item.appointment_date.split("T");
          if (itemDate === date) {
            const timePart = itemTimeFull ? itemTimeFull.substring(0, 5) : "";
            if (timePart) {
              const existingStart = timeToMinutes(timePart);
              const existingEnd = existingStart + 120;
              allSlots.forEach(slot => {
                const slotStart = timeToMinutes(slot);
                const slotEnd = slotStart + 120;
                if (slotStart < existingEnd && slotEnd > existingStart) {
                  if (!blocked.includes(slot)) blocked.push(slot);
                }
              });
            }
          }
        });
        setDisabledSlots(blocked);
      }
    }
    checkOccupiedSlots();
  }, [date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ZORUNLULUK KONTROLÜ (Hizmet türü de eklendi)
    if (!date || !serviceType || !name || !phone || !location || !vehicle) {
      alert("Lütfen Hizmet, Tarih, Ad Soyad, Telefon, Adres ve Araç alanlarını boş bırakmayın!");
      return;
    }

    setLoading(true);
    const appointmentDateTime = `${date}T${time}:00`;

    const newAppointment = {
      service_type: serviceType,
      appointment_date: appointmentDateTime,
      location: location,
      status: "onaylandi",
      guest_info: { name, phone, vehicle, note: note || "Belirtilmedi" },
    };

    const { error } = await supabase.from("appointments").insert([newAppointment]);

    if (!error) {
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name, phone, vehicle, date: appointmentDateTime, service: serviceType, location, note
          })
        });
      } catch (err) {
        console.error("Mail gönderilemedi.");
      }
      setSuccessDetails(newAppointment);
    } else {
      alert("Hata oluştu: " + error.message);
    }
    setLoading(false);
  };

  const inputStyle = { width: "100%", padding: "12px 14px", border: "1px solid #a7f3d0", borderRadius: "8px", outline: "none", fontSize: "14px", backgroundColor: "#ffffff", color: "#111827", fontWeight: "500", boxSizing: "border-box" as const };
  const labelStyle = { display: "block", fontSize: "13px", fontWeight: "bold", color: "#047857", marginBottom: "6px" };

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#f0fdf4", padding: "30px 15px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "550px", margin: "0 auto" }}>
        <div style={{ backgroundColor: "#ffffff", padding: "15px 20px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)", border: "1px solid #d1fae5", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/logo.png" alt="Logo" style={{ width: "36px", height: "36px", objectFit: "contain", borderRadius: "6px" }} />
            <h2 style={{ fontSize: "17px", fontWeight: "bold", color: "#065f46", margin: 0 }}>Hanka Mobil</h2>
          </div>
          <button onClick={() => router.push("/")} style={{ backgroundColor: "#047857", color: "white", padding: "8px 12px", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "12px" }}>Ana Sayfa</button>
        </div>

        {successDetails ? (
          <div style={{ backgroundColor: "#ffffff", padding: "35px 25px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)", border: "1px solid #d1fae5", textAlign: "center" }}>
            <div style={{ fontSize: "50px", marginBottom: "15px" }}>🎉</div>
            <h2 style={{ fontSize: "22px", fontWeight: "bold", color: "#065f46", marginBottom: "10px" }}>Randevunuz Başarıyla Alındı!</h2>
            <p style={{ color: "#374151", fontSize: "14px", marginBottom: "25px", lineHeight: "1.5", fontWeight: "500" }}>Randevunuz iletilmiştir. Daha hızlı ilerlemek için aşağıdaki butona tıklayarak WhatsApp üzerinden mesaj atabilirsiniz.</p>
            <a href={`https://wa.me/905367793561?text=${encodeURIComponent(`🚗 *Yeni Randevu!*\n👤 Ad Soyad: ${successDetails.guest_info.name}\n📞 Tel: ${successDetails.guest_info.phone}\n🚘 Araç: ${successDetails.guest_info.vehicle}\n🛠️ Hizmet: ${successDetails.service_type}\n📅 Tarih: ${successDetails.appointment_date.replace('T', ' ')}`)}`} target="_blank" style={{ display: "block", backgroundColor: "#25d366", color: "white", padding: "14px", fontWeight: "bold", borderRadius: "10px", textDecoration: "none", fontSize: "15px", marginBottom: "12px" }}>💬 WhatsApp ile Bildir</a>
            <button onClick={() => router.push("/")} style={{ width: "100%", backgroundColor: "#047857", color: "white", padding: "12px", fontWeight: "bold", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "14px" }}>Ana Sayfaya Dön</button>
          </div>
        ) : (
          <div style={{ backgroundColor: "#ffffff", padding: "25px 20px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)", border: "1px solid #d1fae5" }}>
            <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#065f46", marginBottom: "20px", textAlign: "center" }}>Randevu Oluştur</h1>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={labelStyle}>Ana Hizmet Türü (Zorunlu)</label>
                <select required value={serviceType} onChange={(e) => setServiceType(e.target.value)} style={inputStyle}>
                  <option value="" disabled>Lütfen bir hizmet seçin</option>
                  <option value="İç-Dış Yıkama">İç-Dış Yıkama</option>
                  <option value="Detaylı Temizlik">Detaylı Temizlik</option>
                  <option value="Kumaş Koltuk Yıkama">Kumaş Koltuk Yıkama</option>
                  <option value="Deri Koltuk Temizliği">Deri Koltuk Temizliği</option>
                  <option value="Far Parlatma">Far Parlatma</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "140px" }}><label style={labelStyle}>Tarih Seç</label><input type="date" required value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} /></div>
                <div style={{ flex: 1, minWidth: "120px" }}><label style={labelStyle}>Saat Seç</label><select value={time} onChange={(e) => setTime(e.target.value)} style={inputStyle}>{allSlots.map(slot => (<option key={slot} value={slot} disabled={disabledSlots.includes(slot)} style={{ color: disabledSlots.includes(slot) ? "#9ca3af" : "#111827", backgroundColor: disabledSlots.includes(slot) ? "#f3f4f6" : "#ffffff" }}>{slot} {disabledSlots.includes(slot) ? "❌ (Dolu)" : "✅ Müsait"}</option>))}</select></div>
              </div>
              <div><label style={labelStyle}>Ad Soyad (Zorunlu)</label><input type="text" required value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Telefon (Zorunlu - Sadece Rakam)</label><input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))} style={inputStyle} /></div>
              <div><label style={labelStyle}>Araç Marka – Model – Yıl (Zorunlu)</label><input type="text" required placeholder="Örn: BMW 3.20i – 2019" value={vehicle} onChange={(e) => setVehicle(e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Konum / Adres (Zorunlu)</label><input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Ek İstekler</label><textarea value={note} onChange={(e) => setNote(e.target.value)} style={{ ...inputStyle, minHeight: "80px" }} /></div>
              <button type="submit" disabled={loading} style={{ backgroundColor: "#047857", color: "white", padding: "14px", fontWeight: "bold", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "15px", marginTop: "10px", width: "100%" }}>{loading ? "Kaydediliyor..." : "Randevu Oluştur"}</button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}

export default function RandevuAl() {
  return (<Suspense fallback={<div>Yükleniyor...</div>}><RandevuFormContent /></Suspense>);
}