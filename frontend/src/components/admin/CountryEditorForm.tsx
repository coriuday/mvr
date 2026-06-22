"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { CloudinaryImageUpload } from "./CloudinaryImageUpload";
import { AdminGalleryField } from "./AdminGalleryField";
import type {
  CountryData,
  CountryStats,
  TuitionFees,
  Scholarship,
  VisaRequirements,
  WorkPermit,
  LanguageRequirements,
  University,
  FAQ,
} from "@/types/country";

export interface CountryRow {
  id: string;
  slug: string;
  name: string;
  flag: string;
  tagline: string;
  image_url: string | null;
  hero_image_url: string | null;
  sort_order: number;
  is_active: boolean;
  content?: Record<string, unknown>;
}

type Tab = "basic" | "gallery" | "content" | "stats" | "fees" | "visa" | "more";

function emptyStats(): CountryStats {
  return { unis: "", workRights: "", intakes: "", avgTuition: "" };
}

function emptyTuition(): TuitionFees {
  return { currency: "", undergraduate: "", postgraduate: "", phd: "" };
}

function emptyVisa(): VisaRequirements {
  return { type: "", requirements: [], processingTime: "", fee: "" };
}

function emptyWorkPermit(): WorkPermit {
  return { duringStudy: "", postStudy: "", notes: "" };
}

function emptyLanguage(): LanguageRequirements {
  return { ielts: "", toefl: "", pte: "", notes: "" };
}

function parseContent(raw: Record<string, unknown> | undefined) {
  const c = raw ?? {};
  return {
    description: (c.description as string) ?? "",
    images: Array.isArray(c.images) ? (c.images as string[]) : [],
    stats: { ...emptyStats(), ...(c.stats as Partial<CountryStats> | undefined) },
    tuitionFees: { ...emptyTuition(), ...(c.tuitionFees as Partial<TuitionFees> | undefined) },
    scholarships: Array.isArray(c.scholarships) ? (c.scholarships as Scholarship[]) : [],
    visaRequirements: {
      ...emptyVisa(),
      ...(c.visaRequirements as Partial<VisaRequirements> | undefined),
      requirements: Array.isArray((c.visaRequirements as VisaRequirements | undefined)?.requirements)
        ? ((c.visaRequirements as VisaRequirements).requirements)
        : [],
    },
    workPermit: { ...emptyWorkPermit(), ...(c.workPermit as Partial<WorkPermit> | undefined) },
    popularPrograms: Array.isArray(c.popularPrograms) ? (c.popularPrograms as string[]) : [],
    languageRequirements: {
      ...emptyLanguage(),
      ...(c.languageRequirements as Partial<LanguageRequirements> | undefined),
    },
    topUniversities: Array.isArray(c.topUniversities) ? (c.topUniversities as University[]) : [],
    faqs: Array.isArray(c.faqs) ? (c.faqs as FAQ[]) : [],
  };
}

function buildContent(state: ReturnType<typeof parseContent>): Omit<CountryData, "slug" | "name" | "flag" | "tagline" | "heroImage"> {
  return {
    description: state.description,
    images: state.images,
    stats: state.stats,
    tuitionFees: state.tuitionFees,
    scholarships: state.scholarships,
    visaRequirements: state.visaRequirements,
    workPermit: state.workPermit,
    popularPrograms: state.popularPrograms,
    languageRequirements: state.languageRequirements,
    topUniversities: state.topUniversities,
    faqs: state.faqs,
  };
}

interface Props {
  draft: CountryRow | null;
  setDraft: React.Dispatch<React.SetStateAction<CountryRow | null>>;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  autoSlug: (name: string) => string;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "basic", label: "Basic" },
  { id: "gallery", label: "Hero & Gallery" },
  { id: "content", label: "Description" },
  { id: "stats", label: "Stats" },
  { id: "fees", label: "Tuition" },
  { id: "visa", label: "Visa" },
  { id: "more", label: "More" },
];

export function CountryEditorForm({ draft, setDraft, saving, onSubmit, onCancel, autoSlug }: Props) {
  const [tab, setTab] = useState<Tab>("basic");
  const content = parseContent(draft?.content);

  const setContent = (patch: Partial<ReturnType<typeof parseContent>>) => {
    const next = { ...content, ...patch };
    setDraft((d) => (d ? { ...d, content: buildContent(next) as unknown as Record<string, unknown> } : d));
  };

  if (!draft) return null;

  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-2">
      <div className="flex flex-wrap gap-1 border-b border-gray-100 pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              tab === t.id ? "bg-[#1a2f5e] text-white" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "basic" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5 col-span-2">
              <Label>Country Name *</Label>
              <Input
                value={draft.name || ""}
                onChange={(e) => {
                  const name = e.target.value;
                  setDraft((d) => ({ ...d!, name, slug: d?.slug || autoSlug(name) }));
                }}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Flag Emoji *</Label>
              <Input value={draft.flag || ""} onChange={(e) => setDraft({ ...draft, flag: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5 col-span-2">
              <Label>URL Slug *</Label>
              <Input value={draft.slug || ""} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={draft.sort_order ?? 0}
                onChange={(e) => setDraft({ ...draft, sort_order: parseInt(e.target.value) || 0 })}
                min={0}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Tagline</Label>
            <Input value={draft.tagline || ""} onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} />
          </div>
          {draft.id && (
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.is_active ?? true}
                onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
                className="rounded border-gray-300 text-[#c9a84c] focus:ring-[#c9a84c]"
              />
              <span className="text-sm font-medium text-gray-700">Show on public website</span>
            </label>
          )}
        </div>
      )}

      {tab === "gallery" && (
        <div className="space-y-5">
          <CloudinaryImageUpload
            label="Card image (listing grid)"
            folder="mvr/countries"
            value={draft.image_url || ""}
            onChange={(url) => setDraft({ ...draft, image_url: url || null })}
            aspectRatio="video"
          />
          <CloudinaryImageUpload
            label="Hero banner"
            folder="mvr/countries"
            value={draft.hero_image_url || ""}
            onChange={(url) => setDraft({ ...draft, hero_image_url: url || null })}
            aspectRatio="video"
          />
          <AdminGalleryField
            value={content.images}
            onChange={(images) => setContent({ images })}
            folder="mvr/countries"
          />
        </div>
      )}

      {tab === "content" && (
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea
            rows={8}
            value={content.description}
            onChange={(e) => setContent({ description: e.target.value })}
            placeholder="Overview shown on the country detail page…"
          />
        </div>
      )}

      {tab === "stats" && (
        <div className="grid grid-cols-2 gap-4">
          {(["unis", "workRights", "intakes", "avgTuition"] as const).map((key) => (
            <div key={key} className="space-y-1.5">
              <Label className="capitalize">{key === "unis" ? "Universities" : key === "workRights" ? "Work rights" : key === "avgTuition" ? "Avg tuition" : "Intakes"}</Label>
              <Input
                value={content.stats[key]}
                onChange={(e) => setContent({ stats: { ...content.stats, [key]: e.target.value } })}
              />
            </div>
          ))}
        </div>
      )}

      {tab === "fees" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Input
              value={content.tuitionFees.currency}
              onChange={(e) => setContent({ tuitionFees: { ...content.tuitionFees, currency: e.target.value } })}
            />
          </div>
          {(["undergraduate", "postgraduate", "phd"] as const).map((level) => (
            <div key={level} className="space-y-1.5">
              <Label className="capitalize">{level}</Label>
              <Textarea
                rows={2}
                value={content.tuitionFees[level]}
                onChange={(e) => setContent({ tuitionFees: { ...content.tuitionFees, [level]: e.target.value } })}
              />
            </div>
          ))}
        </div>
      )}

      {tab === "visa" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Visa type</Label>
              <Input
                value={content.visaRequirements.type}
                onChange={(e) => setContent({ visaRequirements: { ...content.visaRequirements, type: e.target.value } })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Processing time</Label>
              <Input
                value={content.visaRequirements.processingTime}
                onChange={(e) => setContent({ visaRequirements: { ...content.visaRequirements, processingTime: e.target.value } })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Visa fee</Label>
            <Input
              value={content.visaRequirements.fee}
              onChange={(e) => setContent({ visaRequirements: { ...content.visaRequirements, fee: e.target.value } })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Requirements (one per line)</Label>
            <Textarea
              rows={5}
              value={content.visaRequirements.requirements.join("\n")}
              onChange={(e) =>
                setContent({
                  visaRequirements: {
                    ...content.visaRequirements,
                    requirements: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                  },
                })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Work during study</Label>
              <Input value={content.workPermit.duringStudy} onChange={(e) => setContent({ workPermit: { ...content.workPermit, duringStudy: e.target.value } })} />
            </div>
            <div className="space-y-1.5">
              <Label>Post-study work</Label>
              <Input value={content.workPermit.postStudy} onChange={(e) => setContent({ workPermit: { ...content.workPermit, postStudy: e.target.value } })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Work permit notes</Label>
            <Textarea rows={2} value={content.workPermit.notes} onChange={(e) => setContent({ workPermit: { ...content.workPermit, notes: e.target.value } })} />
          </div>
        </div>
      )}

      {tab === "more" && (
        <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <Label>Popular programs (comma-separated)</Label>
            <Input
              value={content.popularPrograms.join(", ")}
              onChange={(e) =>
                setContent({
                  popularPrograms: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                })
              }
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Language requirements</Label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input placeholder="IELTS" value={content.languageRequirements.ielts} onChange={(e) => setContent({ languageRequirements: { ...content.languageRequirements, ielts: e.target.value } })} />
              <Input placeholder="TOEFL" value={content.languageRequirements.toefl} onChange={(e) => setContent({ languageRequirements: { ...content.languageRequirements, toefl: e.target.value } })} />
              <Input placeholder="PTE" value={content.languageRequirements.pte} onChange={(e) => setContent({ languageRequirements: { ...content.languageRequirements, pte: e.target.value } })} />
            </div>
            <Textarea rows={2} placeholder="Notes" value={content.languageRequirements.notes} onChange={(e) => setContent({ languageRequirements: { ...content.languageRequirements, notes: e.target.value } })} />
          </div>

          <ScholarshipEditor
            items={content.scholarships}
            onChange={(scholarships) => setContent({ scholarships })}
          />
          <UniversityEditor
            items={content.topUniversities}
            onChange={(topUniversities) => setContent({ topUniversities })}
          />
          <FaqEditor items={content.faqs} onChange={(faqs) => setContent({ faqs })} />
        </div>
      )}

      <DialogFooter className="pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" className="bg-[#1a2f5e] hover:bg-[#0f1c3d] text-white" disabled={saving}>
          {saving ? (
            <>
              <Loader2 size={14} className="mr-2 animate-spin" />
              Saving…
            </>
          ) : (
            "Save Country"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

function ScholarshipEditor({
  items,
  onChange,
}: {
  items: Scholarship[];
  onChange: (items: Scholarship[]) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Scholarships</Label>
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, { name: "", amount: "", eligibility: "", link: "" }])}>
          Add
        </Button>
      </div>
      {items.map((s, i) => (
        <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2">
          <Input placeholder="Name" value={s.name} onChange={(e) => { const n = [...items]; n[i] = { ...s, name: e.target.value }; onChange(n); }} />
          <Input placeholder="Amount" value={s.amount} onChange={(e) => { const n = [...items]; n[i] = { ...s, amount: e.target.value }; onChange(n); }} />
          <Textarea placeholder="Eligibility" rows={2} value={s.eligibility} onChange={(e) => { const n = [...items]; n[i] = { ...s, eligibility: e.target.value }; onChange(n); }} />
          <div className="flex gap-2">
            <Input placeholder="Link" value={s.link || ""} onChange={(e) => { const n = [...items]; n[i] = { ...s, link: e.target.value }; onChange(n); }} className="flex-1" />
            <Button type="button" variant="outline" size="sm" onClick={() => onChange(items.filter((_, j) => j !== i))}>
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function UniversityEditor({
  items,
  onChange,
}: {
  items: University[];
  onChange: (items: University[]) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Top universities</Label>
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, { name: "", ranking: "", programs: [] }])}>
          Add
        </Button>
      </div>
      {items.map((u, i) => (
        <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2">
          <Input placeholder="Name" value={u.name} onChange={(e) => { const n = [...items]; n[i] = { ...u, name: e.target.value }; onChange(n); }} />
          <Input placeholder="Ranking" value={u.ranking} onChange={(e) => { const n = [...items]; n[i] = { ...u, ranking: e.target.value }; onChange(n); }} />
          <Input
            placeholder="Programs (comma-separated)"
            value={u.programs.join(", ")}
            onChange={(e) => {
              const n = [...items];
              n[i] = { ...u, programs: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) };
              onChange(n);
            }}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => onChange(items.filter((_, j) => j !== i))}>
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
}

function FaqEditor({ items, onChange }: { items: FAQ[]; onChange: (items: FAQ[]) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>FAQs</Label>
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, { question: "", answer: "" }])}>
          Add
        </Button>
      </div>
      {items.map((f, i) => (
        <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2">
          <Input placeholder="Question" value={f.question} onChange={(e) => { const n = [...items]; n[i] = { ...f, question: e.target.value }; onChange(n); }} />
          <Textarea placeholder="Answer" rows={2} value={f.answer} onChange={(e) => { const n = [...items]; n[i] = { ...f, answer: e.target.value }; onChange(n); }} />
          <Button type="button" variant="outline" size="sm" onClick={() => onChange(items.filter((_, j) => j !== i))}>
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
}
