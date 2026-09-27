"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Copy, Printer, UserPlus } from "lucide-react";
import { Dialog } from "./Dialog";
import { adminFetch, useMutation } from "./client";
import { Field, Notice, inputClass, selectClass } from "../ui";
import { PHARM_YEARS } from "@/lib/battle-royale/constants";
import { deskRegistrationSchema, type DeskRegistrationInput } from "@/lib/battle-royale/schemas";

type Created = { participant: { id: string; name: string; code: string; gameCode: string | null }; email: string };

/**
 * The desk workflow from the event plan: record details → collect the fee →
 * hand over the Player ID and Game Code → send them to a station. Paid and
 * checked in by default, because that is what happens at the desk.
 */
export function DeskRegistration({ slots }: { slots: { id: string; label: string; status: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState<Created | null>(null);
  const { run, pending, error, setError } = useMutation();

  useEffect(() => {
    if (params.get("new") === "1") setOpen(true);
  }, [params]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeskRegistrationInput, unknown, z.output<typeof deskRegistrationSchema>>({
    resolver: zodResolver(deskRegistrationSchema),
    defaultValues: { name: "", email: "", phone: "", university: "", studentId: "", slotId: "", approve: true, paymentStatus: "paid", sendEmail: true },
  });

  const close = () => {
    setOpen(false);
    setCreated(null);
    setError(null);
    reset();
    if (params.get("new")) {
      const sp = new URLSearchParams(params.toString());
      sp.delete("new");
      router.replace(`${pathname}?${sp}`, { scroll: false });
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    const r = await run(() => adminFetch<Created>("/api/battle-royale/admin/participants", "POST", values));
    if (r) setCreated(r);
  });

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#1C7BD9] px-4 text-sm font-semibold text-white">
        <UserPlus className="h-4 w-4" /> Desk registration
      </button>
      <Dialog open={open} onClose={close} title={created ? "Registered" : "Desk registration"} wide>
        {created ? (
          <div className="space-y-5">
            <div className="br-print-card rounded-2xl border border-[#1C7BD9]/20 bg-[#1C7BD9]/[0.05] p-5">
              <p className="text-lg font-bold">{created.participant.name}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#16181d]/55">Player ID</p>
                  <p className="font-mono text-2xl font-bold text-[#1C7BD9]">{created.participant.code}</p>
                </div>
                <div>
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#16181d]/55">Game Code</p>
                  <p className="font-mono text-2xl font-bold tracking-[0.2em]">{created.participant.gameCode ?? "— (not approved)"}</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-[#16181d]/65">
              {created.email === "sent" ? "Confirmation email sent." : created.email === "failed" ? "The email failed — resend it from the participant's record." : "No email sent."}{" "}
              {created.participant.gameCode ? "Hand over the slip and direct them to a free station. The code works once." : "Approve their payment from the participant list when they pay."}
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#16181d]/15 px-4 text-sm font-semibold">
                <Printer className="h-4 w-4" /> Print slip
              </button>
              <button
                type="button"
                onClick={() => void navigator.clipboard?.writeText(`Player ID: ${created.participant.code}${created.participant.gameCode ? `\nGame Code: ${created.participant.gameCode}` : ""}`)}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#16181d]/15 px-4 text-sm font-semibold"
              >
                <Copy className="h-4 w-4" /> Copy
              </button>
              <button type="button" onClick={() => { setCreated(null); reset(); }} className="ml-auto h-10 rounded-xl bg-[#1C7BD9] px-4 text-sm font-semibold text-white">
                Register another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            {error && <Notice tone="red">{error}</Notice>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="d-name" label="Full name" error={errors.name?.message} className="sm:col-span-2">
                <input id="d-name" className={inputClass} {...register("name")} />
              </Field>
              <Field id="d-email" label="Email" optional error={errors.email?.message}>
                <input id="d-email" type="email" className={inputClass} {...register("email")} />
              </Field>
              <Field id="d-phone" label="Phone" optional error={errors.phone?.message}>
                <input id="d-phone" type="tel" className={inputClass} {...register("phone")} />
              </Field>
              <Field id="d-uni" label="University" error={errors.university?.message}>
                <input id="d-uni" className={inputClass} {...register("university")} />
              </Field>
              <Field id="d-year" label="Pharm-D year" error={errors.pharmYear?.message}>
                <select id="d-year" className={selectClass} defaultValue="" {...register("pharmYear")}>
                  <option value="" disabled>Choose…</option>
                  {PHARM_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </Field>
              <Field id="d-sid" label="Student ID" optional>
                <input id="d-sid" className={inputClass} {...register("studentId")} />
              </Field>
              <Field id="d-slot" label="Slot" optional>
                <select id="d-slot" className={selectClass} {...register("slotId")}>
                  <option value="">Walk-in</option>
                  {slots.filter((s) => !["completed", "cancelled"].includes(s.status)).map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </Field>
              <Field id="d-pay" label="Entry fee">
                <select id="d-pay" className={selectClass} {...register("paymentStatus")}>
                  <option value="paid">Paid</option>
                  <option value="waived">Waived</option>
                </select>
              </Field>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <label className="inline-flex items-center gap-2"><input type="checkbox" className="h-4 w-4" {...register("approve")} /> Paid now — approve and issue the Game Code</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" className="h-4 w-4" {...register("sendEmail")} /> Email the Player ID (never the code)</label>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={pending} className="h-11 rounded-xl bg-[#1C7BD9] px-6 font-semibold text-white disabled:opacity-60">
                {pending ? "Registering…" : "Register participant"}
              </button>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}
