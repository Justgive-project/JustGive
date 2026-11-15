"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Camera, Heart, Pencil, Trash2, X } from "lucide-react";
import { inlineCopy } from "@/lib/inline-copy";
import type { Locale } from "@/lib/i18n";

export type PublicContributor = { id: string; rank: number; amountPaise: number; displayName: string | null; photoUrl: string | null; biography: string | null; consent: boolean };
export type EditableContributor = { displayName: string; biography: string; consent: boolean; photoUrl: string | null };

function ProfileAvatar({ src, initials, large = false }: { src?: string | null; initials: string; large?: boolean }) {
  const [failedSrc, setFailedSrc] = useState("");
  const safeSrc = src && (src.startsWith("blob:") || src.startsWith("/api/contributors/photo/")) ? src : "";
  return <div className={`profile-avatar${large ? " profile-avatar-large" : ""}`} aria-hidden="true">{safeSrc && failedSrc !== safeSrc ? <img src={safeSrc} alt="" width={large ? 84 : 39} height={large ? 84 : 39} onError={() => setFailedSrc(safeSrc)} /> : initials || <Heart/>}</div>;
}

export function ContributorProfileModal({ contributor, mode, profile, locale, onClose, onSaved }: { contributor?: PublicContributor; mode: "view" | "edit"; profile?: EditableContributor | null; locale: Locale; onClose: () => void; onSaved?: (value: EditableContributor) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(profile?.displayName ?? "");
  const [bio, setBio] = useState(profile?.biography ?? "");
  const [consent, setConsent] = useState(profile?.consent ?? true);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState(profile?.photoUrl ?? "");
  const [removePhoto, setRemovePhoto] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const isEdit = mode === "edit";
  const text = (en: string, hi: string) => inlineCopy(locale, hi, en);

  useEffect(() => { const element = dialog.current; if (element?.showModal) element.showModal(); else element?.setAttribute("open", ""); return () => { if (element?.close) element.close(); else element?.removeAttribute("open"); }; }, []);
  function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 5 * 1024 * 1024) { setError(text("Choose a JPEG, PNG, or WebP photo up to 5 MB.", "5 MB तक की JPEG, PNG या WebP फ़ोटो चुनें।")); return; }
    setError(""); setPhoto(file); setRemovePhoto(false); setPreview(URL.createObjectURL(file));
  }
  async function save(event: FormEvent) {
    event.preventDefault(); if (busy) return;
    setBusy(true); setError("");
    try {
      const data = new FormData(); data.set("displayName", name); data.set("biography", bio); data.set("consent", String(consent));
      const response = await fetch("/api/contributors/profile", { method: isEdit && profile ? "PATCH" : "POST", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? text("Profile could not be saved.", "प्रोफ़ाइल सहेजी नहीं जा सकी।"));
      let photoUrl = result.profile?.photoUrl ?? result.photoUrl ?? profile?.photoUrl ?? null;
      let photoWarning = "";
      if (removePhoto) {
        const photoResponse = await fetch("/api/contributors/profile/photo", { method: "DELETE" });
        const photoResult = await photoResponse.json();
        if (!photoResponse.ok) photoWarning = text("Your profile was saved, but the photo could not be removed.", "प्रोफ़ाइल सहेजी गई, लेकिन फ़ोटो हटाई नहीं जा सकी।");
        else photoUrl = photoResult.photoUrl ?? null;
      } else if (photo) {
        const photoData = new FormData(); photoData.set("photo", photo);
        const photoResponse = await fetch("/api/contributors/profile/photo", { method: "POST", body: photoData });
        const photoResult = await photoResponse.json();
        if (!photoResponse.ok) photoWarning = text("Your profile was saved, but the photo could not be uploaded. Your previous photo was kept.", "प्रोफ़ाइल सहेजी गई, लेकिन फ़ोटो अपलोड नहीं हुई। आपकी पिछली फ़ोटो सुरक्षित है।");
        else photoUrl = photoResult.photoUrl ?? null;
      }
      setSaved(true);
      onSaved?.({ displayName: name.trim(), biography: bio.trim(), consent, photoUrl });
      if (photoWarning) { setError(photoWarning); setPhoto(null); setPreview(photoUrl ?? ""); setRemovePhoto(false); }
      else onClose();
    } catch (cause) { setError(cause instanceof Error ? cause.message : text("Profile could not be saved.", "प्रोफ़ाइल सहेजी नहीं जा सकी।")); }
    finally { setBusy(false); }
  }
  const initials = (contributor?.displayName ?? profile?.displayName ?? name ?? "?").trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();
  return <dialog ref={dialog} className="contributor-dialog" aria-labelledby="contributor-dialog-title" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} onClick={event => { if (!busy && event.target === event.currentTarget) onClose(); }}>
    <div className="contributor-dialog-panel" aria-busy={busy}>
      <header className="contributor-dialog-header"><h2 id="contributor-dialog-title">{isEdit ? text("Your Garden profile", "आपकी गार्डन प्रोफ़ाइल") : contributor?.displayName ?? text("Contributor profile", "योगदानकर्ता प्रोफ़ाइल")}</h2><button type="button" disabled={busy} onClick={onClose} aria-label={text("Close profile", "प्रोफ़ाइल बंद करें")}><X size={19}/></button></header>
      {isEdit ? <form className="contributor-profile-form" onSubmit={save}>
        <div className="profile-photo-picker"><ProfileAvatar src={removePhoto ? null : preview} initials={initials} large/><label className="button-secondary" htmlFor="profile-photo"><Camera size={16}/>{text("Choose photo", "फ़ोटो चुनें")}</label><input id="profile-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={selectPhoto}/>{(profile?.photoUrl || photo) && !removePhoto && <button className="button-secondary" type="button" onClick={() => { setPhoto(null); setPreview(""); setRemovePhoto(true); }}> <Trash2 size={15}/>{text("Remove photo", "फ़ोटो हटाएँ")}</button>}</div>
        <label>{text("Display name", "प्रदर्शित नाम")} <input required maxLength={60} value={name} onChange={event => setName(event.target.value)} autoComplete="nickname"/></label>
        <label htmlFor="profile-biography">{text("About yourself", "अपने बारे में")}</label><textarea id="profile-biography" maxLength={500} rows={4} value={bio} onChange={event => setBio(event.target.value)} placeholder={text("A few words about what kindness means to you", "दयालुता आपके लिए क्या मायने रखती है, कुछ शब्दों में बताएँ")}/><span className="profile-bio-count" aria-live="polite">{bio.length}/500</span>
        <label className="profile-consent"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)}/>{text("Show my name and profile on the public leaderboard", "लीडरबोर्ड पर मेरा नाम और प्रोफ़ाइल दिखाएँ")}</label>
        {error && <p role="alert" className="form-error">{error}</p>}{saved && <p role="status">{text("Profile saved.", "प्रोफ़ाइल सहेजी गई।")}</p>}<button className="button" disabled={busy || !name.trim()}>{busy ? text("Saving…", "सहेजा जा रहा है…") : text("Done", "हो गया")}</button>
      </form> : <div className="contributor-profile-view"><ProfileAvatar src={contributor?.photoUrl} initials={initials} large/><p className="contributor-rank">{text("Rank", "स्थान")} {contributor?.rank}</p><p className="contributor-biography">{contributor?.biography || text("A kind heart growing the Garden of Kindness.", "दयालुता के बगीचे को सँवारता एक दयालु दिल।")}</p><p className="contributor-demo-note">{text("Demo contributions · simulated, unverified", "डेमो योगदान · सिम्युलेटेड, अप्रमाणित")}</p><button type="button" className="button-secondary" onClick={onClose}><Pencil size={15}/>{text("Close", "बंद करें")}</button></div>}
    </div>
  </dialog>;
}
