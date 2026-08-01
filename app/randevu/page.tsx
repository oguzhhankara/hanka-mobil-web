"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

function RandevuFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL'den gelen tarih ve saati al (Yoksa boş / varsayılan bırak)
  const initialDate = searchParams.get("date") || "";
  const initialTime = searchParams.get("time") || "09:00";

  const [serviceType, setServiceType] = useState("İç-Dış Yıkama");
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [disabledSlots, setDisabledSlots] = useState<string[]>([]);
  const [successDetails, setSuccessDetails] = useState<any>(null);

  const allSlots = [
    "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  // Tarih seçildiğinde veya değiştiğinde dolu saatleri hesapla
  useEffect(() => {
    if (!date) {
      setDisabledSlots([]);
      return;
    }

    async function checkOccupiedSlots() {
      const { data, error } = await supabase
        .from("appointments")
        .select("appointment_date, status");

      if (!error && data) {
        const blocked: string[] = [];
        
        data.forEach(item => {
          if (!item.appointment_date) return;
          const [itemDate, itemTimeFull] = item.appointment_date.split("T");
          if (itemDate === date) {
            const timePart = itemTimeFull ? itemTimeFull.substring(0, 5) : "";
            if (timePart) {
              const existingStart = timeToMinutes(timePart);
              const existingEnd = existingStart + 120; // 2 saat sürer

              allSlots.forEach(slot => {
                const slotStart = timeToMinutes(slot);
                const slotEnd = slotStart + 120;

                if (slotStart < existingEnd && slotEnd > existingStart) {
                  if (!blocked.includes(slot)) {
                    blocked.push(slot);
                  }
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
    if (!date || !name || !phone) {
      alert("Lütfen tarih, isim ve telefon alanlarını doldurun!");
      return;
    }

    setLoading(true);
    const appointmentDateTime = `${date}T${time}:00`;

    // Son dakika çakışma kontrolü
    const { data: checkData } = await supabase
      .from("appointments")
      .select("appointment_date");

    if (checkData) {
      const newStart = timeToMinutes(time);
      const newEnd = newStart + 120;
      let hasConflict = false;

      checkData.forEach(item => {
        if (!item.appointment_date) return;
        const [itemDate, itemTimeFull] = item.appointment_date.split("T");
        if (itemDate === date) {
          const timePart = itemTimeFull ? itemTimeFull.substring(0, 5) : "";
          if (timePart) {
            const existingStart = timeToMinutes(timePart);
            const existingEnd = existingStart + 120;
            if (newStart < existingEnd && newEnd > existingStart) {
              hasConflict = true;
            }
          }
        }
      });

      if (hasConflict) {
        setLoading(false);
        alert("Seçtiğiniz saat aralığı az önce başka bir müşteri tarafından alındı! Lütfen başka bir saat seçin.");
        return;
      }
    }

    const newAppointment = {
      service_type: serviceType,
      appointment_date: appointmentDateTime,
      location: location || "Belirtilmedi",
      status: "onaylandi",
      guest_info: {
        name: name,
        phone: phone,
        note: note || "Belirtilmedi",
      },
    };

    const { error } = await supabase.from("appointments").insert([newAppointment]);

    setLoading(false);

    if (error) {
      alert("Randevu oluşturulurken bir hata oluştu: " + error.message);
    } else {
      setSuccessDetails(newAppointment);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #a7f3d0",
    borderRadius: "8px",
    outline: "none",
    fontSize: "14px",
    backgroundColor: "#ffffff",
    color: "#111827",
    fontWeight: "500",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: "bold",
    color: "#047857",
    marginBottom: "6px",
  };

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#f0fdf4", padding: "30px 15px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "550px", margin: "0 auto" }}>
        
        {/* Üst Bar */}
        <div style={{ backgroundColor: "#ffffff", padding: "15px 20px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)", border: "1px solid #d1fae5", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img 
              src="/logo.png" 
              alt="Hanka Logo" 
              style={{ width: "36px", height: "36px", objectFit: "contain", borderRadius: "6px" }} 
            />
            <h2 style={{ fontSize: "17px", fontWeight: "bold", color: "#065f46", margin: 0 }}>Hanka Mobil</h2>
          </div>
          <button 
            onClick={() => router.push("/")} 
            style={{ backgroundColor: "#047857", color: "white", padding: "8px 12px", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "12px" }}
          >
            Ana Sayfaya Dön
          </button>
        </div>

        {/* BAŞARILI ONAY EKRANI */}
        {successDetails ? (
          <div style={{ backgroundColor: "#ffffff", padding: "35px 25px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)", border: "1px solid #d1fae5", textAlign: "center" }}>
            <div style={{ fontSize: "50px", marginBottom: "15px" }}>🎉</div>
            <h2 style={{ fontSize: "22px", fontWeight: "bold", color: "#065f46", marginBottom: "10px" }}>Randevunuz Başarıyla Alındı!</h2>
            <p style={{ color: "#4b5563", fontSize: "14px", marginBottom: "25px", lineHeight: "1.5" }}>
              Randevu detaylarını yöneticiye (Hanka Mobil WhatsApp hattına) anında iletmek için aşağıdaki butona tıklayabilirsin.
            </p>

            <a 
              href={`https://wa.me/905367793561?text=${encodeURIComponent(
                `🚗 *Yeni Randevu Talebi!*\n\n👤 Ad Soyad: ${successDetails.guest_info.name}\n📞 Telefon: ${successDetails.guest_info.phone}\n🛠️ Hizmet: ${successDetails.service_type}\n📅 Tarih & Saat: ${successDetails.appointment_date.replace('T', ' ')}\n📍 Konum: ${successDetails.location}\n💬 Not: ${successDetails.guest_info.note}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "block", backgroundColor: "#25d366", color: "white", padding: "14px", fontWeight: "bold", borderRadius: "10px", textDecoration: "none", fontSize: "15px", marginBottom: "12px", boxShadow: "0 4px 10px rgba(37, 211, 102, 0.3)" }}
            >
              💬 Yöneticiye WhatsApp ile Bildir
            </a>

            <button 
              onClick={() => router.push("/")}
              style={{ width: "100%", backgroundColor: "#047857", color: "white", padding: "12px", fontWeight: "bold", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "14px" }}
            >
              Ana Sayfaya Dön
            </button>
          </div>
        ) : (
          /* RANDEVU FORMU */
          <div style={{ backgroundColor: "#ffffff", padding: "25px 20px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)", border: "1px solid #d1fae5" }}>
            
            <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#065f46", marginBottom: "20px", textAlign: "center" }}>
              Randevu Oluştur
            </h1>
            
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              
              <div>
                <label style={labelStyle}>Ana Hizmet Türü</label>
                <select 
                  value={serviceType} 
                  onChange={(e) => setServiceType(e.target.value)} 
                  style={inputStyle}
                >
                  <option value="İç-Dış Yıkama">İç-Dış Yıkama</option>
                  <option value="Pasta Cila">Pasta Cila</option>
                  <option value="Detaylı Temizlik">Detaylı Temizlik</option>
                  <option value="Seramik Kaplama">Seramik Kaplama</option>
                  <option value="Motor Yıkama">Motor Yıkama</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "140px" }}>
                  <label style={labelStyle}>Tarih Seç</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    style={inputStyle} 
                  />
                </div>
                <div style={{ flex: 1, minWidth: "120px" }}>
                  <label style={labelStyle}>Saat Seç (2 Saat Sürer)</label>
                  <select 
                    value={time} 
                    onChange={(e) => setTime(e.target.value)} 
                    style={inputStyle}
                  >
                    {allSlots.map((slot) => {
                      const isDisabled = disabledSlots.includes(slot);
                      return (
                        <option key={slot} value={slot} disabled={isDisabled} style={{ color: isDisabled ? "#9ca3af" : "#111827", backgroundColor: isDisabled ? "#f3f4f6" : "#ffffff" }}>
                          {slot} {isDisabled ? "❌ (Dolu / Meşgul)" : "✅ Müsait"}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Ad Soyad</label>
                <input 
                  type="text" 
                  placeholder="Adınız Soyadınız" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  style={inputStyle} 
                />
              </div>

              <div>
                <label style={labelStyle}>Telefon Numarası</label>
                <input 
                  type="tel" 
                  placeholder="05XXXXXXXXX" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  style={inputStyle} 
                />
              </div>

              <div>
                <label style={labelStyle}>Konum / Adres</label>
                <input 
                  type="text" 
                  placeholder="Araç konumu (Nilüfer, Beşevler vb.)" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  style={inputStyle} 
                />
              </div>

              <div>
                <label style={labelStyle}>Ek Hizmetler ve Özel İstekler (İsteğe bağlı)</label>
                <textarea 
                  placeholder="Örn: Koltuk yıkama ve far temizliği de eklenecek..." 
                  value={note} 
                  onChange={(e) => setNote(e.target.value)} 
                  style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                style={{ backgroundColor: "#047857", color: "white", padding: "14px", fontWeight: "bold", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "15px", marginTop: "10px", width: "100%" }}
              >
                {loading ? "Kaydediliyor..." : "Randevu Oluştur"}
              </button>

            </form>
          </div>
        )}

      </div>
    </main>
  );
}

export default function RandevuAl() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "50px", color: "#047857", fontWeight: "bold" }}>Yükleniyor...</div>}>
      <RandevuFormContent />
    </Suspense>
  );
}