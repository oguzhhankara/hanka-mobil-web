"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminPaneli() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Sekmeler ve Filtreler
  const [filterTab, setFilterTab] = useState("bugun"); // 'bugun', 'secilen', 'gecmis', 'tumu'
  const [selectedDate, setSelectedDate] = useState("");

  // Saat kapatma alanları
  const [blockDate, setBlockDate] = useState("");
  const [blockTime, setBlockTime] = useState("09:00");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "hanka123") {
      setIsLoggedIn(true);
      fetchAppointments();
    } else {
      alert("Hatalı Şifre!");
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: false });

      if (!error && data) {
        setAppointments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', id);

      if (!error) {
        setAppointments(appointments.map(item => item.id === id ? { ...item, status: newStatus } : item));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!confirm("Bu randevuyu silmek istediğine emin misin?")) return;
    try {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (!error) {
        setAppointments(appointments.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlockSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDate) {
      alert("Lütfen kapatılacak tarihi seçin!");
      return;
    }

    const dateTime = `${blockDate}T${blockTime}:00`;
    const { error } = await supabase.from("appointments").insert([
      {
        service_type: "Kapalı / Meşgul",
        appointment_date: dateTime,
        location: "Müsait Değil",
        status: "kapali",
        guest_info: { name: "Yönetici Kapattı", phone: "-", note: "Rezerve / Kapalı Saat" }
      }
    ]);

    if (error) {
      alert("Hata: " + error.message);
    } else {
      alert("Seçilen saat başarıyla kapatıldı!");
      fetchAppointments();
    }
  };

  // Duruma göre dinamik ve sadakat kartı destekli WhatsApp mesajı
  const getWaMessage = (status: string, name: string) => {
    switch (status) {
      case 'onaylandi':
        return `Merhaba ${name}, Hanka Mobil Oto Yıkama olarak randevunuz onaylanmıştır. Teşekkür ederiz.`;
      case 'yolda':
        return `Merhaba ${name}, Hanka Mobil Oto Yıkama ekibi olarak yola çıktık, belirttiğiniz konuma geliyoruz. 🚗`;
      case 'basladi':
        return `Merhaba ${name}, aracınızın temizlik ve bakım işlemlerine başlanmıştır. 🧼`;
      case 'tamamlandi':
        return `Merhaba ${name}, aracınızın işlemleri başarıyla tamamlanmıştır. 🚗✨ Sadakat kartınızı (7. yıkama hediye!) incelemek için tıklayabilirsiniz: https://hanka-mobil-web.vercel.app/uye  Bizi tercih ettiğiniz için teşekkür ederiz!`;
      case 'kapali':
        return `Merhaba ${name}, randevunuzla ilgili bilgilendirme yapmak istedik.`;
      default:
        return `Merhaba ${name}, Hanka Mobil Oto Yıkama randevunuz hakkında bilgi vermek istedik.`;
    }
  };

  if (!isLoggedIn) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "sans-serif" }}>
        <div style={{ backgroundColor: "#ffffff", padding: "30px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)", width: "100%", maxWidth: "400px", border: "1px solid #d1fae5" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#065f46", marginBottom: "20px", textAlign: "center" }}>Hanka Mobil - Yönetim Girişi</h1>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <input
              type="password"
              placeholder="Yönetici Şifresi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "12px", border: "1px solid #a7f3d0", borderRadius: "8px", outline: "none", fontSize: "14px" }}
            />
            <button type="submit" style={{ backgroundColor: "#047857", color: "white", padding: "12px", fontWeight: "bold", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "15px" }}>
              Giriş Yap
            </button>
          </form>
        </div>
      </main>
    );
  }

  // Tarih ve Filtreleme Mantığı
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredAppointments = appointments.filter(item => {
    const itemDateStr = item.appointment_date ? item.appointment_date.split('T')[0] : "";
    
    if (filterTab === "bugun") {
      return itemDateStr === todayStr;
    } else if (filterTab === "secilen") {
      return selectedDate ? itemDateStr === selectedDate : true;
    } else if (filterTab === "gecmis") {
      return itemDateStr < todayStr || item.status === 'tamamlandi' || item.status === 'kapali';
    }
    return true; // 'tumu'
  });

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#f0fdf4", padding: "30px 20px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        {/* Üst Bilgi */}
        <div style={{ backgroundColor: "#ffffff", padding: "20px 25px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)", border: "1px solid #d1fae5", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#065f46", marginBottom: "4px" }}>Yönetim Paneli</h1>
            <p style={{ color: "#6b7280", fontSize: "12px" }}>Randevuları yönet, durumu güncelle ve saat kapat.</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <a href="/" style={{ backgroundColor: "#047857", color: "white", padding: "8px 14px", borderRadius: "8px", fontWeight: "bold", textDecoration: "none", fontSize: "13px" }}>Ana Sayfa</a>
            <button onClick={() => setIsLoggedIn(false)} style={{ backgroundColor: "#dc2626", color: "white", padding: "8px 14px", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "13px" }}>Çıkış</button>
          </div>
        </div>

        {/* Saat Kapatma Paneli */}
        <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)", border: "1px solid #d1fae5", marginBottom: "25px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "bold", color: "#065f46", marginBottom: "12px" }}>🔒 Müsait Saat Kapat / Meşgul Et</h3>
          <form onSubmit={handleBlockSlot} style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <input 
              type="date" 
              value={blockDate} 
              onChange={(e) => setBlockDate(e.target.value)} 
              style={{ padding: "10px", border: "1px solid #a7f3d0", borderRadius: "8px", outline: "none", fontSize: "13px", flex: 1, minWidth: "140px" }}
            />
            <select 
              value={blockTime} 
              onChange={(e) => setBlockTime(e.target.value)} 
              style={{ padding: "10px", border: "1px solid #a7f3d0", borderRadius: "8px", outline: "none", fontSize: "13px", backgroundColor: "#fff", flex: 1, minWidth: "100px" }}
            >
              <option value="09:00">09:00</option>
              <option value="11:00">11:00</option>
              <option value="13:00">13:00</option>
              <option value="15:00">15:00</option>
              <option value="17:00">17:00</option>
            </select>
            <button type="submit" style={{ backgroundColor: "#dc2626", color: "white", padding: "10px 16px", fontWeight: "bold", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px" }}>
              Saati Kapat
            </button>
          </form>
        </div>

        {/* Sekme / Filtre Butonları */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px", marginBottom: "15px" }}>
          <button
            onClick={() => setFilterTab("bugun")}
            style={{ padding: "12px", borderRadius: "10px", fontWeight: "bold", border: "none", cursor: "pointer", backgroundColor: filterTab === "bugun" ? "#047857" : "#ffffff", color: filterTab === "bugun" ? "#ffffff" : "#065f46", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}
          >
            📅 Bugünkü Randevular
          </button>
          <button
            onClick={() => setFilterTab("secilen")}
            style={{ padding: "12px", borderRadius: "10px", fontWeight: "bold", border: "none", cursor: "pointer", backgroundColor: filterTab === "secilen" ? "#047857" : "#ffffff", color: filterTab === "secilen" ? "#ffffff" : "#065f46", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}
          >
            🔍 Tarih Seç
          </button>
          <button
            onClick={() => setFilterTab("gecmis")}
            style={{ padding: "12px", borderRadius: "10px", fontWeight: "bold", border: "none", cursor: "pointer", backgroundColor: filterTab === "gecmis" ? "#047857" : "#ffffff", color: filterTab === "gecmis" ? "#ffffff" : "#065f46", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}
          >
            📂 Geçmiş Randevular
          </button>
          <button
            onClick={() => setFilterTab("tumu")}
            style={{ padding: "12px", borderRadius: "10px", fontWeight: "bold", border: "none", cursor: "pointer", backgroundColor: filterTab === "tumu" ? "#047857" : "#ffffff", color: filterTab === "tumu" ? "#ffffff" : "#065f46", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}
          >
            ⚡ Tüm Randevular
          </button>
        </div>

        {/* Eğer 'Tarih Seç' aktifse takvim göster */}
        {filterTab === "secilen" && (
          <div style={{ backgroundColor: "#ffffff", padding: "15px", borderRadius: "12px", marginBottom: "20px", border: "1px solid #a7f3d0", display: "flex", alignItems: "center", gap: "10px" }}>
            <label style={{ fontWeight: "bold", color: "#065f46", fontSize: "13px" }}>Tarih Seç:</label>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              style={{ padding: "8px 12px", border: "1px solid #a7f3d0", borderRadius: "8px", outline: "none", fontSize: "13px" }}
            />
          </div>
        )}

        <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#065f46", marginBottom: "15px" }}>Randevu Listesi</h3>

        {/* Liste */}
        {loading ? (
          <p style={{ textAlign: "center", color: "#047857", fontWeight: "bold" }}>Yükleniyor...</p>
        ) : filteredAppointments.length === 0 ? (
          <div style={{ backgroundColor: "#ffffff", padding: "30px", borderRadius: "16px", textAlign: "center", border: "1px solid #d1fae5" }}>
            <p style={{ color: "#6b7280", fontSize: "14px" }}>Bu sekmede gösterilecek randevu bulunmuyor.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {filteredAppointments.map((item) => {
              const guest = item.guest_info || {};
              const phone = guest.phone || "";
              const name = guest.name || "İsimsiz Müşteri";
              const note = guest.note || "-";
              const dateObj = new Date(item.appointment_date);
              const formattedDate = isNaN(dateObj.getTime()) ? item.appointment_date : dateObj.toLocaleString('tr-TR');
              const status = item.status || 'onaylandi';

              // Telefon numarasını temizle ve WhatsApp linkini oluştur
              const cleanPhone = phone.replace(/\D/g, '').replace(/^0/, '');
              const waMessage = encodeURIComponent(getWaMessage(status, name));
              const waLink = cleanPhone ? `https://wa.me/90${cleanPhone}?text=${waMessage}` : "";

              return (
                <div key={item.id} style={{ backgroundColor: "#ffffff", padding: "18px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(16, 185, 129, 0.1)", border: "1px solid #a7f3d0", display: "flex", flexDirection: "column", gap: "10px" }}>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "bold", color: "#065f46", fontSize: "15px" }}>{name} {phone !== "-" ? `(${phone})` : ""}</span>
                    <span style={{ backgroundColor: status === 'kapali' ? "#fee2e2" : "#d1fae5", color: status === 'kapali' ? "#991b1b" : "#065f46", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "bold" }}>
                      Durum: {status}
                    </span>
                  </div>

                  <div style={{ fontSize: "13px", color: "#4b5563", display: "flex", flexDirection: "column", gap: "3px" }}>
                    <span>🛠️ Hizmet: {item.service_type || "-"}</span>
                    <span>📅 Tarih: {formattedDate}</span>
                    <span>📍 Konum: {item.location || "-"}</span>
                    <span>💬 Not: {note}</span>
                  </div>

                  {/* Durum Butonları ve WhatsApp Butonu */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "5px", paddingTop: "10px", borderTop: "1px solid #f3f4f6", alignItems: "center" }}>
                    <button onClick={() => updateStatus(item.id, 'onaylandi')} style={{ padding: "6px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", border: "none", cursor: "pointer", backgroundColor: status === 'onaylandi' ? "#047857" : "#e5e7eb", color: status === 'onaylandi' ? "#fff" : "#374151" }}>Onayla</button>
                    <button onClick={() => updateStatus(item.id, 'yolda')} style={{ padding: "6px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", border: "none", cursor: "pointer", backgroundColor: status === 'yolda' ? "#f59e0b" : "#e5e7eb", color: status === 'yolda' ? "#fff" : "#374151" }}>🚗 Yolda</button>
                    <button onClick={() => updateStatus(item.id, 'basladi')} style={{ padding: "6px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", border: "none", cursor: "pointer", backgroundColor: status === 'basladi' ? "#3b82f6" : "#e5e7eb", color: status === 'basladi' ? "#fff" : "#374151" }}>🧼 Başladı</button>
                    <button onClick={() => updateStatus(item.id, 'tamamlandi')} style={{ padding: "6px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", border: "none", cursor: "pointer", backgroundColor: status === 'tamamlandi' ? "#0284c7" : "#e5e7eb", color: status === 'tamamlandi' ? "#fff" : "#374151" }}>✨ Bitti</button>
                    
                    <button onClick={() => deleteAppointment(item.id)} style={{ padding: "6px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", border: "none", cursor: "pointer", backgroundColor: "#dc2626", color: "#fff" }}>Sil</button>
                    
                    {/* WhatsApp Gönder Butonu */}
                    {cleanPhone && (
                      <a 
                        href={waLink}
                        style={{ marginLeft: "auto", backgroundColor: "#25d366", color: "white", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        💬 WhatsApp Gönder
                      </a>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}