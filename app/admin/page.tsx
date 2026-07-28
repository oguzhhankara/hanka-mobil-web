"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [blockDate, setBlockDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [blockTime, setBlockTime] = useState("09:00");

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", 
    "17:00", "18:00", "19:00", "20:00"
  ];

  useEffect(() => {
    const auth = sessionStorage.getItem("hanka_admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
      fetchAppointments();
    }

    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission !== "granted") {
        Notification.requestPermission();
      }
    }
  }, []);

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (passwordInput === "hanka123") {
      sessionStorage.setItem("hanka_admin_auth", "true");
      setIsAuthenticated(true);
      fetchAppointments();
    } else {
      alert("Hatalı yönetici şifresi!");
      setPasswordInput("");
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: true });

      if (!error && data) {
        setAppointments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockSlot = async (e: any) => {
    e.preventDefault();
    try {
      const formattedDate = new Date(`${blockDate}T${blockTime}`).toISOString();
      const { error } = await supabase
        .from('appointments')
        .insert([
          {
            guest_info: { name: "🚫 Yönetici Kapattı", phone: "-", plate: "-" },
            location: "Bursa - Engellenen Saat",
            appointment_date: formattedDate,
            service_type: "Kapalı / Meşgul",
            status: 'kapali'
          }
        ]);

      if (error) {
        alert("Hata: " + error.message);
      } else {
        alert("Seçilen saat başarıyla kapatıldı!");
        fetchAppointments();
      }
    } catch (err) {
      alert("Bir hata oluştu.");
    }
  };

  const handleOpenSlot = async (id: number) => {
    if (!confirm("Bu saati tekrar açmak istediğinize emin misiniz?")) return;
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Hata: " + error.message);
    } else {
      fetchAppointments();
    }
  };

  const updateStatus = async (id: number, status: string, customerPhone: string, customerName: string, serviceType: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (error) {
      alert("Hata: " + error.message);
    } else {
      fetchAppointments();

      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification("Hanka Mobil Yönetim", {
          body: `${customerName} için durum güncellendi: ${status.toUpperCase()}`,
        });
      }

      // Müşterinin toplam yıkama sayısını hesaplamak için veritabanından geçmişini çekelim
      let washCount = 1;
      if (customerPhone && customerPhone !== "-") {
        try {
          const { data: allAppts } = await supabase.from('appointments').select('*');
          if (allAppts) {
            const customerHistory = allAppts.filter((item: any) => {
              const p = item.guest_info?.phone || "";
              return p.includes(customerPhone.trim()) && item.status !== 'kapali';
            });
            washCount = customerHistory.length;
          }
        } catch (err) {
          console.error(err);
        }
      }

      let statusText = status;
      if (status === 'onaylandi') statusText = "Randevunuz Onaylandı ✅";
      if (status === 'yolda') statusText = "Ekibimiz Yola Çıktı 🚗";
      if (status === 'basladi') statusText = "Yıkama İşlemi Başladı 🧼";
      if (status === 'tamamlandi') statusText = "Yıkama Tamamlandı ✨ İyi Günlerde Kullanın!";

      // Sadakat / Hediye Hesaplama (Her 7. yıkama hediye)
      let loyaltyMessage = "";
      if (status === 'tamamlandi') {
        if (washCount % 7 === 0) {
          loyaltyMessage = `\n\n🎉 TEBRİKLER! Bu yıkamanız ile birlikte *7. yıkamanızı* tamamladınız! Bu yıkama SİZE HEDİYEMİZDİR 🎁 Bizi tercih ettiğiniz için teşekkür ederiz!`;
        } else {
          const remaining = 7 - (washCount % 7);
          loyaltyMessage = `\n\n✨ Toplam Yıkama Sayınız: *${washCount}*\n🎁 Ücretsiz hediye yıkamanıza son *${remaining}* yıkama kaldı!`;
        }
      }

      if (customerPhone && customerPhone !== "-") {
        let cleanPhone = customerPhone.replace(/\D/g, '');
        if (cleanPhone.startsWith('0')) {
          cleanPhone = '90' + cleanPhone.substring(1);
        } else if (!cleanPhone.startsWith('90')) {
          cleanPhone = '90' + cleanPhone;
        }

        const message = encodeURIComponent(`Merhaba ${customerName}, Hanka Mobil Oto Yıkama bilgilendirmesi:\n\nRandevu Durumu: *${statusText}*\nHizmet: ${serviceType}${loyaltyMessage}`);
        window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
      }
    }
  };

  const deleteAppointment = async (id: number) => {
    if (!confirm("Bu randevuyu silmek istediğinize emin misiniz?")) return;
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Hata: " + error.message);
    } else {
      fetchAppointments();
    }
  };

  if (!isAuthenticated) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "sans-serif" }}>
        <div style={{ backgroundColor: "#ffffff", padding: "35px", borderRadius: "16px", boxShadow: "0 4px 15px rgba(16, 185, 129, 0.15)", border: "1px solid #d1fae5", width: "100%", maxWidth: "400px", textAlign: "center" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "bold", color: "#065f46", marginBottom: "8px" }}>🔒 Hanka Mobil Yönetim</h1>
          <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "25px" }}>Bu alana sadece yetkili personel giriş yapabilir.</p>
          
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <input
              type="password"
              placeholder="Yönetici Şifresi"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              style={{ width: "100%", padding: "12px", border: "1px solid #a7f3d0", borderRadius: "8px", outline: "none", fontSize: "15px", textAlign: "center", backgroundColor: "#fff", color: "#111" }}
              required
            />
            <button
              type="submit"
              style={{ backgroundColor: "#047857", color: "white", padding: "12px", fontWeight: "bold", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "15px" }}
            >
              Giriş Yap
            </button>
          </form>
          <div style={{ marginTop: "20px" }}>
            <a href="/" style={{ color: "#047857", fontSize: "13px", textDecoration: "none", fontWeight: "bold" }}>← Ana Sayfaya Dön</a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#f0fdf4", padding: "40px 20px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        <div style={{ backgroundColor: "#ffffff", padding: "25px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)", border: "1px solid #d1fae5", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#065f46", marginBottom: "5px" }}>Hanka Mobil - Yönetim Paneli</h1>
            <p style={{ color: "#6b7280", fontSize: "14px" }}>Durum güncelleyin, otomatik sadakat hesaplamalı WhatsApp bildirimi gönderin.</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              onClick={() => { sessionStorage.removeItem("hanka_admin_auth"); setIsAuthenticated(false); }}
              style={{ backgroundColor: "#dc2626", color: "white", padding: "10px 14px", borderRadius: "8px", border: "none", fontWeight: "bold", fontSize: "13px", cursor: "pointer" }}
            >
              Çıkış Yap
            </button>
            <a href="/" style={{ backgroundColor: "#047857", color: "white", padding: "10px 14px", borderRadius: "8px", fontWeight: "bold", textDecoration: "none", fontSize: "13px", display: "flex", alignItems: "center" }}>Ana Sayfa</a>
          </div>
        </div>

        <div style={{ backgroundColor: "#ffffff", padding: "25px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)", border: "1px solid #d1fae5", marginBottom: "30px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#065f46", marginBottom: "15px" }}>📅 Müsait Saat Kapat / Meşgul Et</h2>
          <form onSubmit={handleBlockSlot} style={{ display: "flex", gap: "15px", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: "1", minWidth: "200px" }}>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px", color: "#065f46", fontSize: "13px" }}>Tarih Seç</label>
              <input
                type="date"
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
                style={{ width: "100%", padding: "10px", border: "1px solid #a7f3d0", borderRadius: "8px", outline: "none", fontSize: "14px", color: "#111827", backgroundColor: "#fff", fontWeight: "bold" }}
              />
            </div>
            <div style={{ flex: "1", minWidth: "150px" }}>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px", color: "#065f46", fontSize: "13px" }}>Saat Seç</label>
              <select
                value={blockTime}
                onChange={(e) => setBlockTime(e.target.value)}
                style={{ width: "100%", padding: "10px", border: "1px solid #a7f3d0", borderRadius: "8px", outline: "none", fontSize: "14px", color: "#111827", backgroundColor: "#fff", fontWeight: "bold" }}
              >
                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button
              type="submit"
              style={{ backgroundColor: "#dc2626", color: "white", padding: "11px 20px", borderRadius: "8px", border: "none", fontWeight: "bold", fontSize: "14px", cursor: "pointer" }}
            >
              Saati Kapat
            </button>
          </form>
        </div>

        <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#065f46", marginBottom: "15px" }}>Gelen Randevular ve Kapalı Saatler</h2>

        {loading ? (
          <p style={{ textAlign: "center", color: "#047857", fontWeight: "bold", fontSize: "16px" }}>Yükleniyor...</p>
        ) : appointments.length === 0 ? (
          <div style={{ backgroundColor: "#ffffff", padding: "40px", borderRadius: "16px", textAlign: "center", border: "1px solid #d1fae5" }}>
            <p style={{ color: "#6b7280", fontSize: "16px" }}>Henüz kayıt bulunmuyor.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {appointments.map((item) => {
              const guest = item.guest_info || {};
              const dateObj = new Date(item.appointment_date);
              const formattedDate = isNaN(dateObj.getTime()) ? item.appointment_date : dateObj.toLocaleString('tr-TR');
              const isClosedSlot = item.status === 'kapali';

              return (
                <div 
                  key={item.id} 
                  style={{ 
                    backgroundColor: "#ffffff", 
                    padding: "20px", 
                    borderRadius: "12px", 
                    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.1)", 
                    border: "1px solid",
                    borderColor: isClosedSlot ? "#fecaca" : "#a7f3d0",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <h3 style={{ fontSize: "18px", fontWeight: "bold", color: isClosedSlot ? "#dc2626" : "#065f46", marginBottom: "4px" }}>{guest.name || "Müşteri"}</h3>
                      <p style={{ color: "#374151", fontSize: "14px", fontWeight: "600" }}>📞 {guest.phone || "-"} | 🚘 Plaka: {guest.plate || "-"}</p>
                    </div>
                    <span style={{ 
                      backgroundColor: isClosedSlot ? "#fee2e2" : "#d1fae5",
                      color: isClosedSlot ? "#dc2626" : "#065f46",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "bold"
                    }}>
                      Durum: {item.status}
                    </span>
                  </div>

                  <div style={{ fontSize: "14px", color: "#4b5563", borderTop: "1px solid #f0fdf4", paddingTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span>🛠 Hizmet: {item.service_type || "-"}</span>
                    <span>📅 Tarih & Saat: {formattedDate}</span>
                    <span>📍 Konum: {item.location || "-"}</span>
                  </div>

                  <div style={{ display: "flex", gap: "8px", marginTop: "5px", flexWrap: "wrap" }}>
                    {isClosedSlot ? (
                      <button
                        onClick={() => handleOpenSlot(item.id)}
                        style={{ backgroundColor: "#16a34a", color: "white", padding: "8px 14px", borderRadius: "6px", border: "none", fontWeight: "bold", fontSize: "13px", cursor: "pointer" }}
                      >
                        🔓 Saati Tekrar Aç
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => updateStatus(item.id, 'onaylandi', guest.phone, guest.name, item.service_type)}
                          style={{ backgroundColor: item.status === 'onaylandi' ? "#065f46" : "#047857", color: "white", padding: "8px 12px", borderRadius: "6px", border: "none", fontWeight: "bold", fontSize: "12px", cursor: "pointer" }}
                        >
                          Onayla + WP
                        </button>
                        <button
                          onClick={() => updateStatus(item.id, 'yolda', guest.phone, guest.name, item.service_type)}
                          style={{ backgroundColor: item.status === 'yolda' ? "#d97706" : "#f59e0b", color: "white", padding: "8px 12px", borderRadius: "6px", border: "none", fontWeight: "bold", fontSize: "12px", cursor: "pointer" }}
                        >
                          🚗 Yolda + WP
                        </button>
                        <button
                          onClick={() => updateStatus(item.id, 'basladi', guest.phone, guest.name, item.service_type)}
                          style={{ backgroundColor: item.status === 'basladi' ? "#2563eb" : "#3b82f6", color: "white", padding: "8px 12px", borderRadius: "6px", border: "none", fontWeight: "bold", fontSize: "12px", cursor: "pointer" }}
                        >
                          🧼 Başladı + WP
                        </button>
                        <button
                          onClick={() => updateStatus(item.id, 'tamamlandi', guest.phone, guest.name, item.service_type)}
                          style={{ backgroundColor: item.status === 'tamamlandi' ? "#0369a1" : "#0284c7", color: "white", padding: "8px 12px", borderRadius: "6px", border: "none", fontWeight: "bold", fontSize: "12px", cursor: "pointer" }}
                        >
                          ✅ Bitti + WP
                        </button>
                        <button
                          onClick={() => deleteAppointment(item.id)}
                          style={{ backgroundColor: "#dc2626", color: "white", padding: "8px 12px", borderRadius: "6px", border: "none", fontWeight: "bold", fontSize: "12px", cursor: "pointer", marginLeft: "auto" }}
                        >
                          Sil
                        </button>
                      </>
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