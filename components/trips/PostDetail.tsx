"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, MapPin, Camera, Video, Clock, Trash2, Loader2, Navigation, 
  ChevronRight, Save, Calendar, Fuel
} from "lucide-react";
import styles from "./PostDetail.module.css";
import Image from "next/image";

interface PostDetailProps {
  post: any;
  onClose: () => void;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
}

export const PostDetail: React.FC<PostDetailProps> = ({ 
  post, onClose, onUpdate, onDelete 
}) => {
  const [content, setContent] = useState(post.content || "");
  const [locationName, setLocationName] = useState(post.locationName || "");
  const [lat, setLat] = useState(post.lat || "");
  const [lng, setLng] = useState(post.lng || "");
  const [mileage, setMileage] = useState(post.mileage || "");
  const [amount, setAmount] = useState(post.amount || "");
  const [loggedAt, setLoggedAt] = useState(post.loggedAt ? new Date(post.loggedAt).toISOString().slice(0, 16) : "");
  const [mediaUrls, setMediaUrls] = useState<string[]>(post.mediaUrls || []);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Synchronize when post changes
  useEffect(() => {
    setContent(post.content || "");
    setLocationName(post.locationName || "");
    setLat(post.lat || "");
    setLng(post.lng || "");
    setMileage(post.mileage || "");
    setAmount(post.amount || "");
    setLoggedAt(post.loggedAt ? new Date(post.loggedAt).toISOString().slice(0, 16) : "");
    setMediaUrls(post.mediaUrls || []);
  }, [post]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    const newUrls = [...mediaUrls];

    for (const file of files) {
      try {
        let finalUrl = "";
        if (file.type.startsWith("image/")) {
          // Resize image like in Questea
          finalUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              const img = new (window as any).Image();
              img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 1600;
                const MAX_HEIGHT = 1600;
                let width = img.width;
                let height = img.height;
                if (width > height) {
                  if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                } else {
                  if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL("image/jpeg", 0.8));
              };
              img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
          });
        } else {
          // Direct base64 for others (videos max 20MB)
          if (file.size > 20 * 1024 * 1024) {
            alert("Soubor je příliš velký (max 20MB).");
            continue;
          }
          finalUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
        }
        newUrls.push(finalUrl);
      } catch (err) {
        console.error(err);
      }
    }

    setMediaUrls(newUrls);
    onUpdate(post.id, { mediaUrls: newUrls });
    setIsUploading(false);
    if (e.target) e.target.value = "";
  };

  const removeMedia = (index: number) => {
    const updated = mediaUrls.filter((_, i) => i !== index);
    setMediaUrls(updated);
    onUpdate(post.id, { mediaUrls: updated });
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdate(post.id, {
      content,
      locationName,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      mileage: mileage ? parseInt(mileage) : null,
      amount: amount ? parseFloat(amount) : null,
      loggedAt: new Date(loggedAt).toISOString(),
    });
    setIsSaving(false);
  };

  return (
    <motion.aside 
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className={styles.sidebar}
    >
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <div className={styles.typeBadge}>{post.type}</div>
          <input 
            className={styles.titleInput} 
            value={locationName} 
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="Název místa / Zastávka"
          />
        </div>
        <button onClick={onClose} className={styles.closeBtn}>
          <X size={20} />
        </button>
      </header>

      <div className={styles.content}>
        {/* Deníček */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Clock size={16} /> Deníček / Poznámky
          </div>
          <textarea 
            className={styles.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Co jsi tu zažila? Napiš pár slov pro svůj blog..."
          />
        </section>

        {/* Média */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Camera size={16} /> Fotky a Videa
          </div>
          <div className={styles.attachmentGrid}>
            {mediaUrls.map((url, i) => (
              <div key={i} className={styles.attachmentItem}>
                {url.startsWith("data:video") || url.includes("video") ? (
                  <video src={url} />
                ) : (
                  <img src={url} alt="Zážitek" />
                )}
                <button onClick={() => removeMedia(i)} className={styles.attDelete}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <label className={styles.uploadBtn}>
              {isUploading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <Camera size={24} />
                  <span className="text-[10px] font-bold">Přidat</span>
                </>
              )}
              <input 
                type="file" 
                multiple 
                accept="image/*,video/*" 
                className="hidden" 
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </div>
        </section>

        {/* Meta Data */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Navigation size={16} /> Detaily cesty
          </div>
          <div className={styles.metaGrid}>
            <div className={styles.metaItem}>
              <div className={styles.metaLabel}><Calendar size={12} /> Kdy</div>
              <input 
                type="datetime-local" 
                className={styles.metaInput}
                value={loggedAt}
                onChange={(e) => setLoggedAt(e.target.value)}
              />
            </div>
            <div className={styles.metaItem}>
              <div className={styles.metaLabel}><Fuel size={12} /> Tachometr (KM)</div>
              <input 
                type="number" 
                className={styles.metaInput}
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className={styles.metaItem}>
              <div className={styles.metaLabel}><MapPin size={12} /> Latitude</div>
              <input 
                type="number" 
                className={styles.metaInput}
                value={lat}
                onChange={(e) => setLat(e.target.value)}
              />
            </div>
            <div className={styles.metaItem}>
              <div className={styles.metaLabel}><MapPin size={12} /> Longitude</div>
              <input 
                type="number" 
                className={styles.metaInput}
                value={lng}
                onChange={(e) => setLng(e.target.value)}
              />
            </div>
          </div>
        </section>
      </div>

      <footer className={styles.footer}>
        <button 
          onClick={() => { if(confirm("Opravdu smazat?")) onDelete(post.id); }} 
          className={styles.deleteBtn}
        >
          Smazat
        </button>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-brand-950 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
        >
          {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Uložit změny
        </button>
      </footer>
    </motion.aside>
  );
};
