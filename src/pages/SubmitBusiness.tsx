import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";

const CATEGORIES = [
  "Food & Beverage (Curated Brands Only)",
  "Outdoor Living & Patio Design",
  "Wellness, Beauty & Self-Care",
  "Other (Subject to Approval)",
];

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Nigeria",
  "Ghana", "South Africa", "Jamaica", "Trinidad and Tobago", "Barbados",
  "Bahamas", "Antigua and Barbuda", "Saint Lucia", "Grenada",
  "Saint Kitts and Nevis", "Dominica", "Saint Vincent and the Grenadines",
  "Guyana", "Suriname", "Belize", "Panama", "Brazil", "Colombia",
  "France", "Germany", "Netherlands", "Italy", "Spain", "Portugal",
  "New Zealand", "Ireland", "Scotland", "Wales", "Other",
];

const REDIRECT_URL = "http://bit.ly/thepatieauxbusinessguide";

const inputClass =
  "w-full border border-[#c8a882] rounded px-3 py-2 bg-white/90 text-[#3a2a1a] placeholder-[#b09070] text-sm focus:outline-none focus:ring-2 focus:ring-[#c8a882] focus:border-transparent";

const labelClass = "block text-sm font-semibold text-[#3a2a1a] mb-1";

interface FormState {
  fullName: string;
  phone: string;
  email: string;
  cityAndState: string;
  country: string;
  photo: File | null;
  shortBio: string;
  businessCategory: string;
  businessName: string;
  whatOffer: string;
  website: string;
  socialMedia: string;
  finalCategory: string;
  ack1: boolean;
  ack2: boolean;
}

const SubmitBusiness = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    fullName: "",
    phone: "",
    email: "",
    cityAndState: "",
    country: "",
    photo: null,
    shortBio: "",
    businessCategory: "",
    businessName: "",
    whatOffer: "",
    website: "",
    socialMedia: "",
    finalCategory: "",
    ack1: false,
    ack2: false,
  });

  function set(field: keyof FormState, value: string | boolean | File | null) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    set("photo", file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const category = form.finalCategory || form.businessCategory;

    if (!form.fullName || !form.email || !form.cityAndState || !form.country || !form.businessName || !category) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!form.shortBio) {
      setError("Please provide your short bio.");
      return;
    }
    if (!form.whatOffer) {
      setError("Please describe what you offer.");
      return;
    }
    if (!form.ack1 || !form.ack2) {
      setError("Please check both acknowledgement boxes to continue.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("fullName", form.fullName);
      formData.append("email", form.email);
      formData.append("cityAndState", form.cityAndState);
      formData.append("country", form.country);
      formData.append("businessName", form.businessName);
      formData.append("category", category);
      if (form.phone) formData.append("phone", form.phone);
      if (form.shortBio) formData.append("shortBio", form.shortBio);
      if (form.whatOffer) formData.append("whatOffer", form.whatOffer);
      if (form.website) formData.append("website", form.website);
      if (form.socialMedia) formData.append("socialMedia", form.socialMedia);
      if (form.photo) formData.append("photo", form.photo, form.photo.name);

      const res = await fetch("/api/submit-listing", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      window.location.href = REDIRECT_URL;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="relative py-14 px-6 text-center border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-luxury opacity-[0.04]" />
        <div className="relative">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-sans mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Directory
          </Link>
          <p className="font-editorial text-sm tracking-[0.35em] uppercase text-accent mb-3">
            The Patieaux Chick
          </p>
          <h1 className="font-display text-3xl md:text-5xl font-semibold text-foreground mb-3">
            Apply to Be Featured
          </h1>
          <p className="font-editorial text-lg text-muted-foreground italic max-w-2xl mx-auto">
            Because your Patieaux deserves more than just furniture. Share your business details below and let
            us spotlight what makes your brand beautiful.
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <form
          onSubmit={handleSubmit}
          noValidate
          style={{ backgroundColor: "#f5cba7" }}
          className="rounded-xl p-8 space-y-8"
        >
          {/* ── YOUR DETAILS ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-extrabold uppercase text-[#1a1008] tracking-wide border-b border-[#c8a882] pb-2">
              Your Details
            </h2>

            <div>
              <label className={labelClass}>
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                data-testid="input-fullName"
                type="text"
                placeholder="Full Name"
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Phone</label>
              <input
                data-testid="input-phone"
                type="tel"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Email <span className="text-red-600">*</span>
              </label>
              <input
                data-testid="input-email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>
                What City and State do you do business in?{" "}
                <span className="text-red-600">*</span>
              </label>
              <input
                data-testid="input-cityAndState"
                type="text"
                value={form.cityAndState}
                onChange={(e) => set("cityAndState", e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>
                Country <span className="text-red-600">*</span>
              </label>
              <select
                data-testid="select-country"
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
                className={inputClass}
                required
              >
                <option value="" disabled>
                  Country
                </option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* ── YOUR BUSINESS DETAILS ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-extrabold uppercase text-[#1a1008] tracking-wide border-b border-[#c8a882] pb-2">
              Your Business Details
            </h2>

            {/* Photo Upload */}
            <div>
              <label className={labelClass}>
                Upload Your Photo <span className="text-red-600">*</span>
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full border border-[#c8a882] rounded bg-white/80 flex items-center justify-center cursor-pointer hover:bg-white transition-colors"
                style={{ minHeight: "110px" }}
                data-testid="upload-photo"
              >
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="h-24 w-24 object-cover rounded"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 py-6 text-[#9a7558]">
                    <Upload className="h-8 w-8" />
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <p className="text-xs text-[#7a5a3a] mt-1">
                Please upload a clear, high-quality image that represents you.
              </p>
            </div>

            {/* Short Bio */}
            <div>
              <label className={labelClass}>
                Short Bio (For Directory Display){" "}
                <span className="text-red-600">*</span>
              </label>
              <textarea
                data-testid="textarea-shortBio"
                rows={4}
                placeholder="Tell us who you are. This will be displayed publicly in the directory. Example: What you do, what you're known for, or what you're building."
                value={form.shortBio}
                onChange={(e) => set("shortBio", e.target.value)}
                className={inputClass + " resize-y"}
                required
              />
            </div>

            {/* Category (first) */}
            <div>
              <label className={labelClass}>
                Select the category that best fits your business:{" "}
                <span className="text-red-600">*</span>
              </label>
              <select
                data-testid="select-businessCategory"
                value={form.businessCategory}
                onChange={(e) => set("businessCategory", e.target.value)}
                className={inputClass}
              >
                <option value="" disabled></option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* ── IMPORTANT NOTE ── */}
          <div
            className="rounded-lg p-5 space-y-2"
            style={{ backgroundColor: "#eedcc4", border: "1px solid #c8a882" }}
          >
            <h3 className="text-base font-bold text-[#1a1008]">Important Note</h3>
            <p className="text-sm text-[#3a2a1a] leading-relaxed">
              We are intentional about the businesses we feature. The Patieaux Business Guide is a curated
              directory, and all submissions are reviewed to ensure alignment with our brand, audience, and
              overall experience. If your business falls outside the listed categories, you may select{" "}
              <strong>"Other (Subject to Approval)."</strong>
            </p>
          </div>

          {/* ── Business Name, Offer, Links, Final Category ── */}
          <section className="space-y-4">
            <div>
              <label className={labelClass}>
                Business Name <span className="text-red-600">*</span>
              </label>
              <input
                data-testid="input-businessName"
                type="text"
                value={form.businessName}
                onChange={(e) => set("businessName", e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>
                What Do You Offer? <span className="text-red-600">*</span>
              </label>
              <textarea
                data-testid="textarea-whatOffer"
                rows={3}
                value={form.whatOffer}
                onChange={(e) => set("whatOffer", e.target.value)}
                className={inputClass + " resize-y"}
                required
              />
              <p className="text-xs text-[#7a5a3a] mt-1">
                Briefly describe your product, service, or offering.
              </p>
            </div>

            <div>
              <label className={labelClass}>Website or Booking Link</label>
              <input
                data-testid="input-website"
                type="url"
                placeholder="Web URL goes here"
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Social Media Link (Instagram preferred)
              </label>
              <input
                data-testid="input-socialMedia"
                type="text"
                value={form.socialMedia}
                onChange={(e) => set("socialMedia", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Select the category that best represents you:{" "}
                <span className="text-red-600">*</span>
              </label>
              <select
                data-testid="select-finalCategory"
                value={form.finalCategory}
                onChange={(e) => set("finalCategory", e.target.value)}
                className={inputClass}
              >
                <option value="" disabled></option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* ── ACKNOWLEDGEMENT ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-extrabold uppercase text-[#1a1008] tracking-wide border-b border-[#c8a882] pb-2">
              Acknowledgement
            </h2>

            {/* Ack 1 */}
            <label className="flex items-start gap-3 cursor-pointer" data-testid="ack-1">
              <input
                type="checkbox"
                checked={form.ack1}
                onChange={(e) => set("ack1", e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-[#8b5e3c] cursor-pointer"
              />
              <ul className="text-sm text-[#3a2a1a] list-disc list-outside ml-3 space-y-1">
                <li>
                  I confirm that my submission aligns with the categories provided or has been submitted under
                  "Other" for review.
                </li>
                <li>
                  I understand that all entries are reviewed and may be declined if they do not align with The
                  Patieaux Chick's brand or community standards.
                </li>
              </ul>
            </label>

            {/* Ack 2 */}
            <label className="flex items-start gap-3 cursor-pointer" data-testid="ack-2">
              <input
                type="checkbox"
                checked={form.ack2}
                onChange={(e) => set("ack2", e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-[#8b5e3c] cursor-pointer"
              />
              <ul className="text-sm text-[#3a2a1a] list-disc list-outside ml-3 space-y-1">
                <li>
                  To maintain the integrity of The Patieaux Business Guide, all submissions are reviewed before
                  approval. Listing fees are non-refundable once submitted.
                </li>
                <li>
                  I grant The Patieaux Chick permission to use my submitted information and images for the
                  directory, magazine features, and related promotional materials.
                </li>
              </ul>
            </label>
          </section>

          {/* Error */}
          {error && (
            <p
              className="text-sm text-red-700 bg-red-100 border border-red-300 rounded px-4 py-2"
              data-testid="form-error"
            >
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            data-testid="button-submit"
            className="w-full py-3 rounded-full font-semibold text-white text-sm tracking-wide transition-opacity disabled:opacity-60"
            style={{ backgroundColor: "#8b5e3c" }}
          >
            {submitting ? "Submitting…" : "Submit Application"}
          </button>
        </form>
      </main>

      <footer className="border-t border-border py-8 text-center bg-secondary">
        <p className="font-editorial text-sm text-secondary-foreground/70 italic">
          Curated with care by The Patieaux Chick · See you on the Patieaux.
        </p>
      </footer>
    </div>
  );
};

export default SubmitBusiness;
