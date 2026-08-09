"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function UyePaneli() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: any) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setSearched(true);

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: false });

      if (!error && data) {
        const filtered = data.filter((item: any) => {
          const p = item.guest_info?.phone || "";
          return p.includes(phone.trim()) && item.status !== 'kapali';
        });
        setHistory(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (currentStatus: string, step: string) => {
    const steps = ['onaylandi', 'yolda', 'basladi', 'tamamlandi'];
    const currentIndex = steps.indexOf(currentStatus);
    const stepIndex = steps.indexOf(step);

    if (currentStatus === step) return 'active';
    if (currentIndex > stepIndex) return 'completed';
    return 'pending';
  };

  // Sadakat hesaplamaları
  const totalWashes = history.length;
  const currentCycle = totalWashes === 0 ? 0 : (totalWashes % 6 === 0 ? 6 : totalWashes % 6);
  const remainingForFree = totalWashes === 0 ? 6 : (6 - currentCycle);

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#f0fdf4", padding: "40px 20px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        
        {/* Üst Bilgi Kartı */}
        <div style={{ backgroundColor: "#ffffff", padding: "25px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)", border: "1px solid #d1fae5", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "bold", color: "#065f46", marginBottom: "4px" }}>Hanka Mobil - Üye Kartım</h1>
            <p style={{ color: "#6b7280", fontSize: "13px" }}>Araç yıkama durumunu canlı takip et ve sadakat puanını gör.</p>
          </div>
          <a href="/" style={{ backgroundColor: "#047857", color: "white", padding: "10px 16px", borderRadius: "8px", fontWeight: "bold", textDecoration: "none", fontSize: "14px" }}>Ana Sayfa</a>
        </div>

        {/* Arama Formu */}
        <div style={{ backgroundColor: "#ffffff", padding: "25px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)", border: "1px solid #d1fae5", marginBottom: "30px" }}>
          <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px", color: "#065f46", fontSize: "14px" }}>Telefon Numaranız</label>
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Örn: 0555..."
                style={{ width: "100%", padding: "12px", border: "1px solid #a7f3d0", borderRadius: "8px", outline: "none", fontSize: "14px", color: "#111827", backgroundColor: "#fff" }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: "#047857", color: "white", padding: "12px", fontWeight: "bold", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "15px" }}
            >
              {loading ? "Sorgulanıyor..." : "Araç Durumumu ve Kartımı Gör"}
            </button>
          </form>
        </div>

        {/* Sonuçlar Bölümü */}
        {searched && (
          loading ? (
            <p style={{ textAlign: "center", color: "#047857", fontWeight: "bold" }}>Yükleniyor...</p>
          ) : history.length === 0 ? (
            <div style={{ backgroundColor: "#ffffff", padding: "30px", borderRadius: "16px", textAlign: "center", border: "1px solid #d1fae5" }}>
              <p style={{ color: "#6b7280", fontSize: "15px" }}>Bu telefon numarasına ait aktif veya geçmiş yıkama kaydı bulunamadı.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              {/* Sadakat Kartı Özeti & 7. Yıkama Hediyesi Görsel Kutusu */}
              <div style={{ backgroundColor: "#065f46", color: "white", padding: "25px", borderRadius: "16px", textAlign: "center", boxShadow: "0 4px 12px rgba(6, 95, 70, 0.2)", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>✨ Hanka Mobil Sadakat Kartı</h3>
                  <span style={{ backgroundColor: "#047857", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>Toplam: {totalWashes} Yıkama</span>
                </div>

                <div style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", padding: "12px", borderRadius: "10px" }}>
                  <p style={{ fontSize: "15px", fontWeight: "bold", margin: "0 0 4px 0" }}>
                    {totalWashes > 0 && totalWashes % 6 === 0 
                      ? "🎉 Tebrikler! 6. Yıkamanız Bizden Hediye!" 
                      : `🎁 Ücretsiz Hediye Yıkamaya Son ${remainingForFree} Yıkama!`}
                  </p>
                  <p style={{ fontSize: "12px", opacity: 0.9, margin: 0 }}>Her 6. yıkamada bir sonraki yıkama Hanka Mobil'den hediye! 💧</p>
                </div>

                {/* 7'li Görsel İlerleme Kutuları */}
                <div style={{ display: "flex", justifyContent: "space-between", gap: "6px", marginTop: "5px" }}>
                  {[1, 2, 3, 4, 5, 6 ].map((stepNum) => {
                    const isCompleted = stepNum <= currentCycle;
                    return (
                      <div key={stepNum} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                        <div style={{ 
                          width: "100%", 
                          height: "32px", 
                          borderRadius: "6px", 
                          backgroundColor: isCompleted ? "#f59e0b" : "rgba(255, 255, 255, 0.2)", 
                          color: isCompleted ? "#fff" : "rgba(255, 255, 255, 0.5)", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center", 
                          fontSize: "13px", 
                          fontWeight: "bold",
                          border: isCompleted ? "1px solid #fbbf24" : "1px dashed rgba(255,255,255,0.3)"
                        }}>
                          {isCompleted ? "✓" : stepNum}
                        </div>
                        <span style={{ fontSize: "10px", opacity: 0.8 }}>{stepNum}. Yıkama</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#065f46", marginBottom: "5px" }}>Randevu ve Araç Durum Takibi</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {history.map((item) => {
                  const dateObj = new Date(item.appointment_date);
                  const formattedDate = isNaN(dateObj.getTime()) ? item.appointment_date : dateObj.toLocaleString('tr-TR');
                  const status = item.status || 'onaylandi';

                  return (
                    <div
                      key={item.id}
                      style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(16, 185, 129, 0.1)", border: "1px solid #a7f3d0", display: "flex", flexDirection: "column", gap: "14px" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: "bold", color: "#065f46", fontSize: "16px" }}>{item.service_type || "Oto Yıkama"}</span>
                        <span style={{ backgroundColor: "#d1fae5", color: "#065f46", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
                          {status === 'onaylandi' ? 'Randevu Onaylandı' : status === 'yolda' ? 'Ekip Yolda' : status === 'basladi' ? 'Yıkama Başladı' : status === 'tamamlandi' ? 'Yıkama Bitti' : status}
                        </span>
                      </div>

                      <div style={{ fontSize: "14px", color: "#4b5563", display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span>📅 Tarih & Saat: {formattedDate}</span>
                        <span>📍 Konum: {item.location || "-"}</span>
                      </div>

                      {/* Görsel İlerleme Çubuğu (Timeline) */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", position: "relative", padding: "0 10px" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, gap: "4px" }}>
                          <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: getStepStatus(status, 'onaylandi') !== 'pending' ? "#047857" : "#e5e7eb", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold" }}>✓</div>
                          <span style={{ fontSize: "11px", fontWeight: "600", color: "#065f46" }}>Onaylandı</span>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, gap: "4px" }}>
                          <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: getStepStatus(status, 'yolda') !== 'pending' ? "#f59e0b" : "#e5e7eb", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold" }}>🚗</div>
                          <span style={{ fontSize: "11px", fontWeight: "600", color: "#d97706" }}>Yolda</span>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, gap: "4px" }}>
                          <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: getStepStatus(status, 'basladi') !== 'pending' ? "#3b82f6" : "#e5e7eb", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold" }}>🧼</div>
                          <span style={{ fontSize: "11px", fontWeight: "600", color: "#2563eb" }}>Başladı</span>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, gap: "4px" }}>
                          <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: getStepStatus(status, 'tamamlandi') !== 'pending' ? "#0284c7" : "#e5e7eb", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold" }}>✨</div>
                          <span style={{ fontSize: "11px", fontWeight: "600", color: "#0369a1" }}>Bitti</span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}

      </div>
    </main>
  );
}