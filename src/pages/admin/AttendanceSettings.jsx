import { useEffect, useState } from "react";
import { CalendarDays, CalendarPlus, Clock, Info, Plus, Trash2 } from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import TimePicker from "../../components/ui/TimePicker";
import Badge from "../../components/ui/Badge";
import Skeleton from "../../components/ui/Skeleton";
import { apiRequest } from "../../lib/api";
import { formatDate, formatTime } from "../../lib/format";
import { getDateError, todayISODate } from "../../lib/dateUtils";

const EMPTY_FORM = { date: "", deadline: "22:00", reason: "" };

function SettingsSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-[200px] w-full rounded-xl" />
      <Skeleton className="h-[280px] w-full rounded-xl" />
    </div>
  );
}

export default function AttendanceSettings() {
  const [recurringEnabled, setRecurringEnabled] = useState(false);
  const [recurringDeadline, setRecurringDeadline] = useState("22:00");
  const [overrides, setOverrides] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [btnError, setBtnError] = useState("");
  const [loading, setLoading] = useState(true);

  const today = todayISODate();
  const todayOverride = overrides.find((o) => o.date === today);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await apiRequest("/settings/attendance");
        if (cancelled) return;
        setRecurringEnabled(data.settings.recurringEnabled);
        setRecurringDeadline(data.settings.recurringDeadline);
        setOverrides([...(data.settings.specialDeadlines ?? [])]);
      } catch {
        /* settings load failure — leave defaults */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  function markDirty() {
    setBtnError("");
    setDirty(true);
  }

  async function saveRecurring() {
    setSaving(true);
    setBtnError("");
    try {
      const data = await apiRequest("/settings/attendance", {
        method: "PATCH",
        body: { recurringEnabled, recurringDeadline },
      });
      setRecurringEnabled(data.settings.recurringEnabled);
      setRecurringDeadline(data.settings.recurringDeadline);
      setDirty(false);
    } catch (err) {
      setBtnError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function openAdd() {
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  }

  async function handleSaveOverride() {
    const dateProblem = getDateError(form.date, { required: true });
    if (dateProblem) {
      setFormError(dateProblem);
      return;
    }
    try {
      const data = await apiRequest("/settings/attendance/special-deadlines", {
        method: "POST",
        body: { date: form.date, deadline: form.deadline, reason: form.reason.trim() || undefined },
      });
      setOverrides(data.settings.specialDeadlines);
      setModalOpen(false);
    } catch (err) {
      setFormError(err.message);
    }
  }

  async function removeOverride(id) {
    try {
      const data = await apiRequest(`/settings/attendance/special-deadlines/${id}`, { method: "DELETE" });
      setOverrides(data.settings.specialDeadlines);
    } catch (err) {
      setBtnError(err.message);
    }
  }

  if (loading) return <SettingsSkeleton />;

  const sortedOverrides = [...overrides].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* ── Active Deadline Banner ──────────────────────────────── */}
      <div className="flex items-center justify-between rounded-xl border border-brand-200/60 bg-gradient-to-r from-brand-50 to-white px-5 py-4 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs shadow-brand-600/20">
            <Clock className="h-5 w-5" strokeWidth={2} />
          </span>
          <div>
            <p className="text-[12px] font-medium text-brand-600/80">Currently active deadline</p>
            <p className="font-display text-[17px] font-bold text-steel-900">
              {todayOverride
                ? `${formatTime(todayOverride.deadline)} — special override today`
                : recurringEnabled
                  ? `${formatTime(recurringDeadline)} — daily deadline`
                  : "No automatic deadline"}
            </p>
          </div>
        </div>
        {todayOverride ? (
          <Badge status="info">Override</Badge>
        ) : recurringEnabled ? (
          <Badge status="active">Recurring</Badge>
        ) : (
          <Badge status="off">Disabled</Badge>
        )}
      </div>

      {btnError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] text-red-600">{btnError}</div>
      )}

      {/* ── Info banners ────────────────────────────────────────── */}
      <div className="flex items-start gap-2 rounded-lg border border-steel-200/60 bg-white px-4 py-3 text-[13px] text-steel-600 shadow-xs">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
        <p>
          These deadlines configure the schedule only. Attendance itself is determined by the server from each
          submission timestamp vs the applicable deadline.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-steel-200/60 bg-steel-50 px-4 py-3 text-[13px] text-steel-600">
        <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-steel-400" />
        <p>
          <span className="font-medium text-steel-700">Weekend policy:</span> Submissions are closed on Saturdays &amp;
          Sundays. All internees are automatically marked <Badge status="off" /> on weekends. No deadline override is
          needed.
        </p>
      </div>

      {/* ── Section 1: Daily Deadline ───────────────────────────── */}
      <Card>
        <CardHeader title="Daily deadline" subtitle="Standard submission time applied every working day" />

        <div className="flex items-start justify-between gap-4 rounded-lg border border-steel-100 bg-steel-50/50 px-4 py-3">
          <label htmlFor="same-time-everyday" className="flex cursor-pointer items-start gap-3">
            <input
              id="same-time-everyday"
              type="checkbox"
              checked={recurringEnabled}
              onChange={(e) => {
                setRecurringEnabled(e.target.checked);
                markDirty();
              }}
              className="mt-0.5 h-4 w-4 rounded border-steel-300 accent-brand-600"
            />
            <span>
              <span className="block text-[13px] font-medium text-steel-800">Use same submission time every day</span>
              <span className="mt-0.5 block text-[12px] text-steel-500">
                {recurringEnabled
                  ? "The deadline below applies automatically to every working day."
                  : "No automatic daily deadline — only special date overrides will apply."}
              </span>
            </span>
          </label>
          <div className="shrink-0 text-right">
            <p className="font-display text-2xl font-bold leading-none text-brand-700">{formatTime(recurringDeadline)}</p>
            <p className="mt-1 text-[12px] text-steel-400">Daily deadline</p>
          </div>
        </div>

        <div className="mt-4 max-w-sm">
          <p className="mb-1.5 block text-[13px] font-medium text-steel-700">Deadline time</p>
          <TimePicker
            value={recurringDeadline}
            disabled={!recurringEnabled}
            onChange={(deadline) => {
              setRecurringDeadline(deadline);
              markDirty();
            }}
          />
        </div>

        {!recurringEnabled && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200/60 bg-amber-50 px-3 py-2 text-[12px] text-amber-700">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            Internees will not receive an automatic daily deadline while this is off.
          </div>
        )}

        <div className="mt-4 flex items-center justify-end gap-2 border-t border-steel-100 pt-4">
          <span className="mr-auto text-[12px] text-steel-400">{dirty ? "Unsaved changes" : "All changes saved"}</span>
          <Button variant="secondary" disabled={!dirty || saving} onClick={() => setDirty(false)}>
            Discard
          </Button>
          <Button loading={saving} disabled={!dirty} onClick={saveRecurring}>
            Save deadline
          </Button>
        </div>
      </Card>

      {/* ── Section 2: Special Date Overrides ───────────────────── */}
      <Card padded={false}>
        <div className="px-5 pt-5 pb-0 sm:px-6">
          <CardHeader
            title="Special date overrides"
            subtitle="Different deadlines for specific dates — holidays, events, early closes"
            action={
              <Button size="sm" icon={Plus} onClick={openAdd}>
                Add override
              </Button>
            }
          />
        </div>
        <div className="p-5 pt-0 sm:p-6 sm:pt-0">
          {sortedOverrides.length > 0 ? (
            <ul className="space-y-2">
              {sortedOverrides.map((o) => {
                const isToday = o.date === today;
                return (
                  <li
                    key={o.id}
                    className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors ${
                      isToday
                        ? "border-brand-200/60 bg-brand-50/50 hover:bg-brand-50/80"
                        : "border-steel-100 bg-steel-50/40 hover:bg-steel-50/70"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ${
                          isToday
                            ? "bg-brand-100 text-brand-600 ring-brand-200/50"
                            : "bg-brand-50 text-brand-600 ring-brand-100/50"
                        }`}
                      >
                        <CalendarDays className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-steel-800">
                          {formatDate(o.date)}
                          {isToday && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700">
                              TODAY
                            </span>
                          )}
                          <span className="mx-1.5 text-steel-300">·</span>
                          <span className="text-brand-700">{formatTime(o.deadline)}</span>
                          {recurringEnabled && (
                            <span className="ml-1.5 text-[12px] font-normal text-steel-400">
                              (instead of {formatTime(recurringDeadline)})
                            </span>
                          )}
                        </p>
                        {o.reason && <p className="mt-0.5 truncate text-[12px] text-steel-500">{o.reason}</p>}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Button
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        onClick={() => removeOverride(o.id)}
                        aria-label={`Remove override for ${formatDate(o.date)}`}
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              icon={CalendarPlus}
              title="No special overrides"
              description="Add one for holidays, events, or one-off schedule changes."
              action={
                <Button size="sm" icon={Plus} onClick={openAdd}>
                  Add override
                </Button>
              }
            />
          )}
        </div>
      </Card>

      {/* ── Add Override Modal ──────────────────────────────────── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add special override">
        <div className="space-y-4">
          <Input
            label="Date"
            type="date"
            name="overrideDate"
            value={form.date}
            error={formError || undefined}
            onChange={(e) => {
              setForm({ ...form, date: e.target.value });
              if (formError) setFormError("");
            }}
          />
          <div>
            <p className="mb-1.5 block text-[13px] font-medium text-steel-700">Deadline time</p>
            <TimePicker value={form.deadline} onChange={(deadline) => setForm({ ...form, deadline })} />
          </div>
          <Input
            label="Reason (optional)"
            name="overrideReason"
            placeholder="e.g. Public holiday, demo night…"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />
          <div className="flex justify-end gap-2 border-t border-steel-100 pt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveOverride}>Add override</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
