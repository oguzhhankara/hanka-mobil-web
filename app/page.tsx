"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function Home() {
  const router = useRouter();
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const allSlots = [
    "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("appointments")
      .select("appointment_date, status");

    if (!error && data) {
      const dayAppointments = data.filter(item => {
        if (!item.appointment_date) return false;
        const itemDate = item.appointment_date.split("T")[0];
        return itemDate === selectedDate;
      });
      setAppointments(dayAppointments);
    }
    setLoading(false);
  };

  const isSlotDisabled = (slot: string) => {
    const slotStart = timeToMinutes(slot);
    const slotEnd = slotStart + 120; // 2 saatlik çalışma süresi

    for (const item of appointments) {
      const timePart = item.appointment_date.split("T")[1]?.substring(0, 5);
      if (timePart) {
        const existingStart = timeToMinutes(timePart);
        const existingEnd = existingStart + 120;

        if (slotStart < existingEnd && slotEnd > existingStart) {
          return true;
        }
      }
    }
    return false;
  };

  const handleSelectSlot = (time: string) => {
    const fullDateTime = `${selectedDate}T${time}`;
    localStorage.setItem("selectedSlot", fullDateTime);
    router.push(`/randevu?date=${selectedDate}&time=${time}`);
  };

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#f0fdf4", padding: "30px 15px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        
        {/* Üst Bar */}
        <div style={{ backgroundColor: "#ffffff", padding: "15px 20px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)", border: "1px solid #d1fae5", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img 
              src="/logo.png" 
              alt="Hanka Logo" 
              style={{ width: "40px", height: "40px", objectFit: "contain", borderRadius: "6px" }} 
            />
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#065f46", margin: 0 }}>Hanka Mobil</h2>
              <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>Profesyonel Yerinde Oto Yıkama</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button 
              onClick={() => router.push("/uye")} 
              style={{ backgroundColor: "#047857", color: "white", padding: "8px 12px", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "12px" }}
            >
              🎁 Sadakat Kartım
            </button>
            <button 
              onClick={() => router.push("/admin")} 
              style={{ backgroundColor: "#374151", color: "white", padding: "8px 12px", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "12px" }}
            >
              🔒 Yönetici
            </button>
          </div>
        </div>

        {/* Ana İçerik Kutusu */}
        <div style={{ backgroundColor: "#ffffff", padding: "25px 20px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)", border: "1px solid #d1fae5", textAlign: "center" }}>
          
          <h1 style={{ fontSize: "22px", fontWeight: "bold", color: "#065f46", marginBottom: "8px" }}>
            Saatlik Müsaitlik Takvimi
          </h1>
          <p style={{ fontSize: "13px", color: "#4b5563", marginBottom: "20px" }}>
            Tarih seçerek saatlik müsait durumumuzu canlı görüntüleyin ve randevunuzu oluşturun.
          </p>

          {/* Tarih Seçici */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginBottom: "25px", background: "#f9fafb", padding: "12px", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
            <label style={{ fontSize: "13px", fontWeight: "bold", color: "#047857" }}>Tarih Seç:</label>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              style={{ padding: "8px 12px", border: "1px solid #a7f3d0", borderRadius: "8px", outline: "none", fontSize: "14px", fontWeight: "600", color: "#111827", backgroundColor: "#fff" }}
            />
          </div>

          {/* Saatlik Slot Listesi */}
          {loading ? (
            <p style={{ color: "#047857", fontWeight: "bold", padding: "20px" }}>Yükleniyor...</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {allSlots.map((slot) => {
                const disabled = isSlotDisabled(slot);
                return (
                  <div 
                    key={slot} 
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      padding: "14px 18px", 
                      borderRadius: "10px", 
                      backgroundColor: disabled ? "#fee2e2" : "#f0fdf4", 
                      border: `1px solid ${disabled ? "#fca5a5" : "#a7f3d0"}` 
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: disabled ? "#dc2626" : "#10b981", display: "inline-block" }}></span>
                      <span style={{ fontSize: "15px", fontWeight: "bold", color: "#111827" }}>{slot}</span>
                    </div>

                    {disabled ? (
                      <span style={{ fontSize: "13px", fontWeight: "bold", color: "#991b1b" }}>Dolu / Randevulu</span>
                    ) : (
                      <button 
                        onClick={() => handleSelectSlot(slot)}
                        style={{ backgroundColor: "#047857", color: "white", padding: "8px 14px", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "13px" }}
                      >
                        Müsait - Randevu Al
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>
    </main>
  );
}