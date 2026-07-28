"use client";
import { useState, useEffect, createElement as h } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", 
    "17:00", "18:00", "19:00", "20:00"
  ];

  useEffect(() => {
    fetchDayAppointments();
  }, [selectedDate]);

  const fetchDayAppointments = async () => {
    setLoading(true);
    try {
      const startOfDay = selectedDate + "T00:00:00";
      const endOfDay = selectedDate + "T23:59:59";

      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_date, status')
        .gte('appointment_date', startOfDay)
        .lte('appointment_date', endOfDay);

      if (!error && data) {
        const times = data.map((item: any) => {
          const d = new Date(item.appointment_date);
          return String(d.getHours()).padStart(2, '0') + ":00";
        });
        setBookedTimes(times);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSlot = (time: string) => {
    const fullDateTime = `${selectedDate}T${time}`;
    localStorage.setItem('selectedSlot', fullDateTime);
    window.location.href = '/randevu';
  };

  return h('main', { style: { minHeight: "100vh", backgroundColor: "#f0fdf4", padding: "40px 20px", fontFamily: "sans-serif" } },
    h('div', { style: { maxWidth: "700px", margin: "0 auto" } },
      
      h('div', { style: { backgroundColor: "#ffffff", padding: "30px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)", border: "1px solid #d1fae5", textAlign: "center", marginBottom: "30px" } },
        h('div', { style: { display: "flex", justifyContent: "center", marginBottom: "15px" } },
          h('img', { src: "/logo.png", alt: "Hanka Logo", style: { width: "100px", height: "100px", objectFit: "contain" } })
        ),
        h('h1', { style: { fontSize: "30px", fontWeight: "extrabold", color: "#065f46", marginBottom: "5px" } }, "Hanka Mobil Oto Yikama"),
        h('p', { style: { color: "#047857", fontSize: "15px", fontWeight: "600", marginBottom: "20px" } }, "Bursa'nin Lider Mobil Oto Yikama ve Detayli Temizlik Hizmeti"),
        
        h('div', { style: { display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" } },
          h('a', { href: "/randevu", style: { backgroundColor: "#047857", color: "white", padding: "12px 20px", borderRadius: "8px", fontWeight: "bold", textDecoration: "none", fontSize: "14px" } }, "Randevu Al"),
          h('a', { href: "/uye", style: { backgroundColor: "#ffffff", color: "#047857", border: "2px solid #047857", padding: "12px 20px", borderRadius: "8px", fontWeight: "bold", textDecoration: "none", fontSize: "14px" } }, "Uye Girisi / Kartim"),
          h('a', { href: "/admin", style: { backgroundColor: "#1e3a8a", color: "white", padding: "12px 20px", borderRadius: "8px", fontWeight: "bold", textDecoration: "none", fontSize: "14px" } }, "Yonetim Paneli")
        )
      ),

      h('div', { style: { backgroundColor: "#ffffff", padding: "25px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)", border: "1px solid #d1fae5", marginBottom: "30px" } },
        h('h2', { style: { fontSize: "20px", fontWeight: "bold", color: "#065f46", marginBottom: "15px", textAlign: "center" } }, "Hizmetlerimiz"),
        h('div', { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" } },
          h('div', { style: { backgroundColor: "#f0fdf4", border: "1px solid #a7f3d0", padding: "15px", borderRadius: "10px", textAlign: "center", color: "#065f46", fontWeight: "bold", fontSize: "14px" } }, "Buhar Temizligi"),
          h('div', { style: { backgroundColor: "#f0fdf4", border: "1px solid #a7f3d0", padding: "15px", borderRadius: "10px", textAlign: "center", color: "#065f46", fontWeight: "bold", fontSize: "14px" } }, "Koltuk Yikama"),
          h('div', { style: { backgroundColor: "#f0fdf4", border: "1px solid #a7f3d0", padding: "15px", borderRadius: "10px", textAlign: "center", color: "#065f46", fontWeight: "bold", fontSize: "14px" } }, "Iç Dis Yikama"),
          h('div', { style: { backgroundColor: "#f0fdf4", border: "1px solid #a7f3d0", padding: "15px", borderRadius: "10px", textAlign: "center", color: "#065f46", fontWeight: "bold", fontSize: "14px" } }, "Parlatma")
        )
      ),

      h('div', { style: { backgroundColor: "#ffffff", padding: "25px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)", border: "1px solid #d1fae5" } },
        h('h2', { style: { fontSize: "20px", fontWeight: "bold", color: "#065f46", marginBottom: "10px", textAlign: "center" } }, "Saatlik Musaitlik Takvimi"),
        h('p', { style: { color: "#6b7280", textAlign: "center", fontSize: "13px", marginBottom: "20px" } }, "Tarih secerek saatlik musait durumumuzu canli görüntüleyin."),
        
        h('div', { style: { marginBottom: "20px", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" } },
          h('label', { style: { fontWeight: "bold", color: "#065f46", fontSize: "14px" } }, "Tarih Sec:"),
          h('input', {
            type: "date",
            value: selectedDate,
            onChange: (e: any) => setSelectedDate(e.target.value),
            style: { padding: "10px", border: "1px solid #a7f3d0", borderRadius: "8px", outline: "none", fontSize: "14px", color: "#111827", backgroundColor: "#fff", fontWeight: "bold" }
          })
        ),

        loading 
          ? h('p', { style: { textAlign: "center", color: "#6b7280" } }, "Musaitlikler yükleniyor...") 
          : h('div', { style: { display: "flex", flexDirection: "column", gap: "10px" } },
              timeSlots.map((time) => {
                const isBooked = bookedTimes.includes(time);
                return h('div', { 
                  key: time, 
                  style: { 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    padding: "15px 20px", 
                    borderRadius: "10px", 
                    border: "1px solid",
                    borderColor: isBooked ? "#fecaca" : "#a7f3d0",
                    backgroundColor: isBooked ? "#fef2f2" : "#f0fdf4"
                  } 
                },
                  h('div', { style: { display: "flex", alignItems: "center", gap: "10px" } },
                    h('span', { style: { fontSize: "18px" } }, isBooked ? "🔴" : "🟢"),
                    h('span', { style: { fontSize: "16px", fontWeight: "bold", color: "#111827" } }, time)
                  ),
                  h('div', null,
                    isBooked 
                      ? h('span', { style: { color: "#dc2626", fontWeight: "bold", fontSize: "14px" } }, "Dolu / Randevulu") 
                      : h('button', { 
                          onClick: () => handleSelectSlot(time),
                          style: { backgroundColor: "#047857", color: "white", padding: "8px 16px", borderRadius: "6px", fontWeight: "bold", fontSize: "13px", border: "none", cursor: "pointer" } 
                        }, "Musait - Randevu Al")
                  )
                );
              })
            )
      )

    )
  );
}