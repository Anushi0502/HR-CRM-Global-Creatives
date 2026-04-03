import type { FormEvent } from "react";
import { useCallback, useMemo, useState } from "react";
import { BriefcaseBusiness, CircleDot, Mail, Plus, Send, Sparkles, Star, UserPlus } from "lucide-react";
import { DataTable } from "../components/DataTable";
import type { TableColumn } from "../components/DataTable";
import { ModuleHero } from "../components/ModuleHero";
import { PageHeader } from "../components/PageHeader";
import { RecruitmentKanban } from "../components/RecruitmentKanban";
import { SectionCard } from "../components/SectionCard";
import { StatusBadge } from "../components/StatusBadge";
import { useApi } from "../hooks/useApi";
import { hrService } from "../services/hrService";
import type { Candidate, CandidateStage, CreateEmployeeResult, NewCandidatePayload, NewEmployeePayload } from "../types/hr";
import { formatDate } from "../utils/formatters";
import { DEFAULT_SHIFT_CODE } from "../utils/shifts";

const stageOptions: CandidateStage[] = ["sourced", "interview", "offer", "hired", "rejected"];
const candidateCreateStageOptions: CandidateStage[] = ["sourced", "interview", "offer", "rejected"];

const initialForm: NewCandidatePayload = {
  name: "",
  email: "",
  role: "",
  source: "",
  stage: "sourced",
  interviewDate: new Date().toISOString().slice(0, 10),
  rating: 3,
};

const initialHireForm: NewEmployeePayload = {
  name: "",
  email: "",
  role: "",
  department: "Operations",
  location: "Remote",
  joinDate: new Date().toISOString().slice(0, 10),
  manager: "HR Admin",
  status: "active",
  performanceScore: 82,
  shiftCode: DEFAULT_SHIFT_CODE,
};

function suggestDepartment(role: string): string {
  const normalized = role.toLowerCase();

  if (/(designer|creative|motion|brand|visual)/.test(normalized)) {
    return "Creative";
  }
  if (/(seo|marketing|content|growth)/.test(normalized)) {
    return "Marketing";
  }
  if (/(engineer|developer|frontend|backend|software|product)/.test(normalized)) {
    return "Technology";
  }
  if (/(finance|payroll|account)/.test(normalized)) {
    return "Finance";
  }
  if (/(recruit|talent|hr|human)/.test(normalized)) {
    return "Human Resources";
  }
  if (/(client|success|sales|customer)/.test(normalized)) {
    return "Client Success";
  }

  return "Operations";
}

function suggestManager(department: string): string {
  switch (department) {
    case "Creative":
      return "Creative Lead";
    case "Marketing":
      return "Marketing Head";
    case "Technology":
      return "Engineering Manager";
    case "Finance":
      return "CFO";
    case "Human Resources":
      return "HR Director";
    case "Client Success":
      return "Operations Director";
    default:
      return "HR Admin";
  }
}

function buildHireDraft(candidate: Candidate): NewEmployeePayload {
  const department = suggestDepartment(candidate.role);

  return {
    ...initialHireForm,
    name: candidate.name,
    email: candidate.email,
    role: candidate.role,
    department,
    manager: suggestManager(department),
    joinDate: new Date().toISOString().slice(0, 10),
  };
}

function formatInviteMessage(result: CreateEmployeeResult): string {
  if (result.invite.status === "sent") {
    return `Employee created and login invite sent to ${result.employee.email}.`;
  }

  if (result.invite.status === "existing_user") {
    return `Employee created. ${result.invite.message}`;
  }

  return `Employee created, but invite delivery needs attention: ${result.invite.message}`;
}

function formatDispatchMessage(base: string, status: "sent" | "skipped" | "failed", message: string): string {
  if (status === "sent") {
    return `${base} ${message}`;
  }

  if (status === "skipped") {
    return `${base} ${message}`;
  }

  return `${base} Dispatch failed: ${message}`;
}

export function RecruitmentPage() {
  const candidatesHook = useApi(useCallback(() => hrService.getCandidates(), []));
  const [formState, setFormState] = useState<NewCandidatePayload>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [updatingCandidateId, setUpdatingCandidateId] = useState<string | null>(null);
  const [dispatchingCandidateId, setDispatchingCandidateId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<CandidateStage | "">("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [sortMode, setSortMode] = useState<"interview_soon" | "interview_late" | "rating" | "name">("interview_soon");
  const [hireCandidate, setHireCandidate] = useState<Candidate | null>(null);
  const [hireFormState, setHireFormState] = useState<NewEmployeePayload>(initialHireForm);
  const [hireSubmitting, setHireSubmitting] = useState(false);

  const candidates = useMemo(() => candidatesHook.data ?? [], [candidatesHook.data]);

  const stageCount = useMemo(() => {
    return {
      sourced: candidates.filter((item) => item.stage === "sourced").length,
      interview: candidates.filter((item) => item.stage === "interview").length,
      offer: candidates.filter((item) => item.stage === "offer").length,
      hired: candidates.filter((item) => item.stage === "hired").length,
      rejected: candidates.filter((item) => item.stage === "rejected").length,
    };
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = candidates.filter((candidate) => {
      const matchesSearch = query
        ? [candidate.name, candidate.email, candidate.role, candidate.source].join(" ").toLowerCase().includes(query)
        : true;
      const matchesStage = stageFilter ? candidate.stage === stageFilter : true;
      const matchesSource = sourceFilter ? candidate.source === sourceFilter : true;
      return matchesSearch && matchesStage && matchesSource;
    });

    const safeDate = (value: string) => {
      const parsed = new Date(value);
      return Number.isNaN(parsed.valueOf()) ? null : parsed;
    };

    filtered.sort((left, right) => {
      if (sortMode === "rating") {
        return right.rating - left.rating;
      }

      if (sortMode === "name") {
        return left.name.localeCompare(right.name);
      }

      const leftDate = safeDate(left.interviewDate);
      const rightDate = safeDate(right.interviewDate);
      if (!leftDate || !rightDate) {
        return 0;
      }

      return sortMode === "interview_late"
        ? rightDate.valueOf() - leftDate.valueOf()
        : leftDate.valueOf() - rightDate.valueOf();
    });

    return filtered;
  }, [candidates, search, sortMode, sourceFilter, stageFilter]);

  const upcomingInterviews = useMemo(() => {
    const today = new Date();
    const windowEnd = new Date(today);
    windowEnd.setDate(windowEnd.getDate() + 14);

    return candidates
      .filter((candidate) => {
        if (candidate.stage === "rejected") {
          return false;
        }
        const interviewDate = new Date(candidate.interviewDate);
        if (Number.isNaN(interviewDate.valueOf())) {
          return false;
        }
        return interviewDate >= new Date(today.toDateString()) && interviewDate <= windowEnd;
      })
      .sort((left, right) => new Date(left.interviewDate).valueOf() - new Date(right.interviewDate).valueOf())
      .slice(0, 6);
  }, [candidates]);

  const sources = useMemo(() => {
    return Array.from(new Set(candidates.map((candidate) => candidate.source).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }, [candidates]);

  const hasActiveFilters = Boolean(search || stageFilter || sourceFilter || sortMode !== "interview_soon");

  const handleFormChange = (field: keyof NewCandidatePayload, value: string) => {
    setSubmitError(null);
    setActionMessage(null);
    setFormState((current) => ({
      ...current,
      [field]: field === "rating" ? Number(value) : value,
    }));
  };

  const handleHireFormChange = (field: keyof NewEmployeePayload, value: string) => {
    setUpdateError(null);
    setHireFormState((current) => ({
      ...current,
      [field]: field === "performanceScore" ? Number(value) : value,
    }));
  };

  const handleCreateCandidate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setActionMessage(null);

    try {
      const candidate = await hrService.createCandidate(formState);
      let nextMessage = `${candidate.name} added to the recruitment pipeline.`;

      if (candidate.stage === "offer") {
        const dispatch = await hrService.dispatchCandidateOfferLetter(candidate.id);
        nextMessage = formatDispatchMessage(nextMessage, dispatch.status, dispatch.message);
      }

      setFormState(initialForm);
      setActionMessage(nextMessage);
      await candidatesHook.refetch();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to add candidate.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOffer = async (candidate: Candidate) => {
    setDispatchingCandidateId(candidate.id);
    setUpdateError(null);
    setActionMessage(null);

    try {
      const dispatch = await hrService.dispatchCandidateOfferLetter(candidate.id);
      setActionMessage(formatDispatchMessage(`Offer letter update for ${candidate.name}.`, dispatch.status, dispatch.message));
      await candidatesHook.refetch();
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : "Unable to send offer letter.");
    } finally {
      setDispatchingCandidateId(null);
    }
  };

  const handleStageChange = async (candidateId: string, stage: CandidateStage) => {
    const candidate = candidates.find((item) => item.id === candidateId);
    if (!candidate) {
      return;
    }

    if (stage === "hired") {
      setUpdateError(null);
      setActionMessage(null);
      setHireCandidate(candidate);
      setHireFormState(buildHireDraft(candidate));
      return;
    }

    setUpdatingCandidateId(candidateId);
    setUpdateError(null);
    setActionMessage(null);

    try {
      const updatedCandidate = await hrService.updateCandidateStage(candidateId, stage);
      let nextMessage = `${updatedCandidate.name} moved to ${stage.replace(/\b\w/g, (char) => char.toUpperCase())}.`;

      if (stage === "offer") {
        const dispatch = await hrService.dispatchCandidateOfferLetter(candidateId);
        nextMessage = formatDispatchMessage(nextMessage, dispatch.status, dispatch.message);
      }

      setActionMessage(nextMessage);
      await candidatesHook.refetch();
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : "Unable to update candidate stage.");
    } finally {
      setUpdatingCandidateId(null);
    }
  };

  const handleConfirmHire = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hireCandidate) {
      return;
    }

    setHireSubmitting(true);
    setUpdateError(null);
    setActionMessage(null);

    try {
      const employeeResult = await hrService.createEmployee(hireFormState);
      await hrService.updateCandidateStage(hireCandidate.id, "hired");
      setHireCandidate(null);
      setHireFormState(initialHireForm);
      setActionMessage(`${hireCandidate.name} marked as hired. ${formatInviteMessage(employeeResult)}`);
      await candidatesHook.refetch();
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : "Unable to complete hire workflow.");
    } finally {
      setHireSubmitting(false);
    }
  };

  const columns: Array<TableColumn<Candidate>> = [
    { key: "name", header: "Candidate", render: (row) => row.name },
    {
      key: "email",
      header: "Email",
      render: (row) => (
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Mail className="h-4 w-4 text-slate-400" />
          {row.email}
        </span>
      ),
    },
    { key: "role", header: "Role", render: (row) => row.role },
    { key: "source", header: "Source", render: (row) => row.source },
    { key: "stage", header: "Stage", render: (row) => <StatusBadge value={row.stage} /> },
    { key: "interview", header: "Interview", render: (row) => formatDate(row.interviewDate) },
    {
      key: "rating",
      header: "Rating",
      render: (row) => (
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-1 text-xs font-semibold text-brand-700">
          <Star className="h-3.5 w-3.5 fill-current" />
          {row.rating}/5
        </span>
      ),
    },
    {
      key: "actions",
      header: "Selection Status",
      render: (row) => (
        <div className="flex min-w-[220px] flex-col gap-2">
          <select
            value={row.stage}
            onChange={(event) => void handleStageChange(row.id, event.target.value as CandidateStage)}
            disabled={updatingCandidateId === row.id || dispatchingCandidateId === row.id}
            className="input-surface min-w-[140px] py-2"
          >
            {stageOptions.map((stage) => (
              <option key={stage} value={stage}>
                {stage.charAt(0).toUpperCase() + stage.slice(1)}
              </option>
            ))}
          </select>
          {row.stage === "offer" ? (
            <button
              type="button"
              onClick={() => void handleResendOffer(row)}
              disabled={dispatchingCandidateId === row.id}
              className="btn-secondary w-full px-3 py-2"
            >
              <Send className="h-4 w-4" />
              {dispatchingCandidateId === row.id ? "Sending..." : "Resend offer"}
            </button>
          ) : null}
          <p className="text-xs text-slate-500">
            {row.offerLetterSentAt
              ? `Offer sent ${formatDate(row.offerLetterSentAt)}${row.offerLetterFileName ? ` · ${row.offerLetterFileName}` : ""}`
              : row.stage === "offer"
                ? "Offer letter not sent yet."
                : "No offer letter dispatched."}
          </p>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="animate-page-enter space-y-6">
        <PageHeader
          title="Recruitment"
          subtitle="Add candidates, send offers, and convert hires into employee records without breaking the onboarding flow."
          eyebrow="Talent Acquisition"
        />

        <ModuleHero
          icon={BriefcaseBusiness}
          title="Accelerate Hiring from Sourcing to Offer"
          subtitle="Capture candidate records fast, move them through the pipeline, dispatch offer letters, and convert final-stage hires into employee profiles from one screen."
          chips={["Candidate intake", "Offer dispatch", "Hire-to-employee flow"]}
          spotlight={`${stageCount.offer} Offers In Motion`}
        />

        {actionMessage ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{actionMessage}</p> : null}
        {updateError ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{updateError}</p> : null}

        <SectionCard
          title="Talent command bar"
          subtitle="Search and sort the pipeline without leaving the page"
          rightSlot={<span className="insight-pill">{filteredCandidates.length} visible</span>}
        >
          <div className="grid gap-3 xl:grid-cols-[1.1fr_0.7fr_0.7fr_0.7fr]">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search candidate, email, role, or source"
              className="input-surface"
            />
            <select
              value={stageFilter}
              onChange={(event) => setStageFilter(event.target.value as CandidateStage | "")}
              className="input-surface"
            >
              <option value="">All stages</option>
              {stageOptions.map((stage) => (
                <option key={stage} value={stage}>
                  {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </option>
              ))}
            </select>
            <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)} className="input-surface">
              <option value="">All sources</option>
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
            <select value={sortMode} onChange={(event) => setSortMode(event.target.value as typeof sortMode)} className="input-surface">
              <option value="interview_soon">Sort: interview soonest</option>
              <option value="interview_late">Sort: interview latest</option>
              <option value="rating">Sort: highest rating</option>
              <option value="name">Sort: name A-Z</option>
            </select>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setStageFilter("")}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                stageFilter === "" ? "bg-brand-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              All stages
            </button>
            {stageOptions.map((stage) => (
              <button
                key={stage}
                type="button"
                onClick={() => setStageFilter(stage)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  stageFilter === stage ? "bg-brand-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {stage.charAt(0).toUpperCase() + stage.slice(1)} · {stageCount[stage]}
              </button>
            ))}
          </div>
          {hasActiveFilters ? (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStageFilter("");
                  setSourceFilter("");
                  setSortMode("interview_soon");
                }}
                className="btn-secondary"
              >
                Reset filters
              </button>
            </div>
          ) : null}
        </SectionCard>

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard title="Pipeline Stages" subtitle="Current distribution by hiring stage">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {[
                { label: "Sourced", value: stageCount.sourced, tone: "bg-indigo-500/10 text-indigo-700" },
                { label: "Interview", value: stageCount.interview, tone: "bg-sky-500/10 text-sky-700" },
                { label: "Offer", value: stageCount.offer, tone: "bg-violet-500/10 text-violet-700" },
                { label: "Hired", value: stageCount.hired, tone: "bg-emerald-500/10 text-emerald-700" },
                { label: "Rejected", value: stageCount.rejected, tone: "bg-rose-500/10 text-rose-700" },
              ].map((stage) => (
                <div key={stage.label} className="rounded-xl border border-brand-200 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">{stage.label}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="font-display text-3xl font-bold text-brand-900">{stage.value}</p>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${stage.tone}`}>
                      <CircleDot className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Add Candidate" subtitle="Create a new recruitment record with offer-ready contact details">
            <form onSubmit={handleCreateCandidate} className="space-y-3">
              <input
                required
                value={formState.name}
                onChange={(event) => handleFormChange("name", event.target.value)}
                placeholder="Candidate name"
                className="input-surface w-full"
              />
              <input
                required
                type="email"
                value={formState.email}
                onChange={(event) => handleFormChange("email", event.target.value)}
                placeholder="Candidate email"
                className="input-surface w-full"
              />
              <input
                required
                value={formState.role}
                onChange={(event) => handleFormChange("role", event.target.value)}
                placeholder="Role"
                className="input-surface w-full"
              />
              <input
                required
                value={formState.source}
                onChange={(event) => handleFormChange("source", event.target.value)}
                placeholder="Source"
                className="input-surface w-full"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  value={formState.stage}
                  onChange={(event) => handleFormChange("stage", event.target.value)}
                  className="input-surface w-full"
                >
                  {candidateCreateStageOptions.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage.charAt(0).toUpperCase() + stage.slice(1)}
                    </option>
                  ))}
                </select>
                <input
                  required
                  type="date"
                  value={formState.interviewDate}
                  onChange={(event) => handleFormChange("interviewDate", event.target.value)}
                  className="input-surface w-full"
                />
              </div>
              <div>
                <label htmlFor="candidate-rating" className="mb-2 block text-[0.7rem] font-black uppercase tracking-[0.14em] text-slate-500">
                  Candidate rating
                </label>
                <input
                  id="candidate-rating"
                  min="1"
                  max="5"
                  type="range"
                  value={formState.rating}
                  onChange={(event) => handleFormChange("rating", event.target.value)}
                  className="w-full"
                />
                <p className="mt-1 text-sm font-medium text-slate-600">Current rating: {formState.rating}/5</p>
              </div>
              {submitError ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{submitError}</p> : null}
              <button type="submit" disabled={submitting} className="btn-primary w-full">
                <Plus className="h-4 w-4" />
                {submitting ? "Adding candidate..." : "Add candidate"}
              </button>
            </form>
          </SectionCard>
        </div>

        <SectionCard title="Kanban Pipeline View" subtitle="Visual status lanes for active candidate flow">
          <RecruitmentKanban
            candidates={filteredCandidates}
            stages={stageOptions}
            onStageChange={(id, stage) => void handleStageChange(id, stage)}
            updatingCandidateId={updatingCandidateId ?? dispatchingCandidateId}
          />
        </SectionCard>

        <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <SectionCard title="Candidate Pipeline" subtitle="Live hiring funnel with offer dispatch and hire conversion controls">
            {candidatesHook.loading ? <p className="text-sm font-semibold text-brand-700">Loading candidates...</p> : null}
            {candidatesHook.error ? <p className="text-sm font-semibold text-rose-700">{candidatesHook.error}</p> : null}
            <DataTable
              columns={columns}
              rows={filteredCandidates}
              rowKey={(row) => row.id}
              exportFileName="recruitment-pipeline"
              emptyText="No candidates match the current filter."
            />
          </SectionCard>

          <div className="space-y-4">
            <SectionCard
              title="Upcoming interviews"
              subtitle="Next 14 days of interview activity"
              rightSlot={<span className="insight-pill">{upcomingInterviews.length} scheduled</span>}
            >
              {upcomingInterviews.length > 0 ? (
                <div className="space-y-3">
                  {upcomingInterviews.map((candidate) => (
                    <div key={candidate.id} className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">{candidate.name}</p>
                          <p className="mt-1 text-xs text-slate-500">{candidate.role} · {candidate.source}</p>
                          <p className="mt-1 text-xs text-slate-500">{candidate.email}</p>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-brand-100 px-2 py-1 text-xs font-semibold text-brand-700">
                          {formatDate(candidate.interviewDate)}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <StatusBadge value={candidate.stage} />
                        <select
                          value={candidate.stage}
                          onChange={(event) => void handleStageChange(candidate.id, event.target.value as CandidateStage)}
                          disabled={updatingCandidateId === candidate.id || dispatchingCandidateId === candidate.id}
                          className="input-surface min-w-[140px] py-2"
                        >
                          {stageOptions.map((stage) => (
                            <option key={stage} value={stage}>
                              {stage.charAt(0).toUpperCase() + stage.slice(1)}
                            </option>
                          ))}
                        </select>
                        {candidate.stage === "offer" ? (
                          <button
                            type="button"
                            onClick={() => void handleResendOffer(candidate)}
                            disabled={dispatchingCandidateId === candidate.id}
                            className="btn-secondary px-3 py-2"
                          >
                            <Send className="h-4 w-4" />
                            {dispatchingCandidateId === candidate.id ? "Sending..." : "Resend offer"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-medium text-slate-600">No interviews scheduled in the next two weeks.</p>
              )}
            </SectionCard>

            <SectionCard title="Hiring Notes" subtitle="Fast checkpoints for this week">
              <div className="space-y-3 text-sm font-medium text-brand-700">
                <div className="rounded-lg border border-brand-200 bg-brand-50 p-3">
                  <p className="inline-flex items-center gap-2 font-semibold text-brand-900">
                    <BriefcaseBusiness className="h-4 w-4" />
                    Offer discipline
                  </p>
                  <p className="mt-1">Offer-stage candidates now receive a PDF offer letter from the recruitment workflow.</p>
                </div>
                <div className="rounded-lg border border-brand-200 bg-brand-50 p-3">
                  <p className="font-semibold text-brand-900">Hire conversion</p>
                  <p className="mt-1">Moving a candidate to hired opens an employee creation popup with editable, prefilled details.</p>
                </div>
                <div className="rounded-lg border border-brand-200 bg-brand-50 p-3">
                  <p className="font-semibold text-brand-900">Invite control</p>
                  <p className="mt-1">Login invites are only sent from employee creation, never from intermediate recruitment stages.</p>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>

      {hireCandidate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-[32px] border border-brand-200 bg-white p-6 shadow-[0_28px_80px_rgba(15,23,42,0.22)]">
            <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-4">
              <div>
                <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-brand-700">Hire Candidate</p>
                <h2 className="mt-2 font-display text-2xl font-extrabold text-brand-950">Create employee profile for {hireCandidate.name}</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Review the prefilled details, edit anything needed, then save. The employee profile will be created and a login invite will be sent.
                </p>
              </div>
              <button type="button" onClick={() => setHireCandidate(null)} className="btn-secondary px-3 py-2">
                Close
              </button>
            </div>

            <form onSubmit={handleConfirmHire} className="mt-5 space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  required
                  value={hireFormState.name}
                  onChange={(event) => handleHireFormChange("name", event.target.value)}
                  placeholder="Full name"
                  className="input-surface w-full"
                />
                <input
                  required
                  type="email"
                  value={hireFormState.email}
                  onChange={(event) => handleHireFormChange("email", event.target.value)}
                  placeholder="Email"
                  className="input-surface w-full"
                />
                <input
                  required
                  value={hireFormState.role}
                  onChange={(event) => handleHireFormChange("role", event.target.value)}
                  placeholder="Role"
                  className="input-surface w-full"
                />
                <input
                  required
                  value={hireFormState.department}
                  onChange={(event) => handleHireFormChange("department", event.target.value)}
                  placeholder="Department"
                  className="input-surface w-full"
                />
                <input
                  required
                  value={hireFormState.location}
                  onChange={(event) => handleHireFormChange("location", event.target.value)}
                  placeholder="Location"
                  className="input-surface w-full"
                />
                <input
                  required
                  value={hireFormState.manager}
                  onChange={(event) => handleHireFormChange("manager", event.target.value)}
                  placeholder="Manager"
                  className="input-surface w-full"
                />
                <input
                  required
                  type="date"
                  value={hireFormState.joinDate}
                  onChange={(event) => handleHireFormChange("joinDate", event.target.value)}
                  className="input-surface w-full"
                />
                <select
                  value={hireFormState.status}
                  onChange={(event) => handleHireFormChange("status", event.target.value)}
                  className="input-surface w-full"
                >
                  <option value="active">Active</option>
                  <option value="on_leave">On leave</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
                    <Sparkles className="h-4 w-4 text-brand-700" />
                    Prefill summary
                  </p>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Invite on save
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Candidate role mapped to <span className="font-semibold text-slate-900">{hireFormState.department}</span> with reporting manager <span className="font-semibold text-slate-900">{hireFormState.manager}</span>.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-[0.68rem] font-black uppercase tracking-[0.14em] text-slate-500">
                  Starting performance score
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={hireFormState.performanceScore}
                  onChange={(event) => handleHireFormChange("performanceScore", event.target.value)}
                  className="w-full"
                />
                <p className="mt-1 text-sm font-medium text-slate-600">Current score: {hireFormState.performanceScore}%</p>
              </div>

              {updateError ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{updateError}</p> : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => setHireCandidate(null)} className="btn-secondary w-full">
                  Cancel
                </button>
                <button type="submit" disabled={hireSubmitting} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70">
                  <UserPlus className="h-4 w-4" />
                  {hireSubmitting ? "Creating employee..." : "Create employee and send invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
