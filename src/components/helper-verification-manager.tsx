"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonStyles, Card, InputShell } from "@/components/ui";
import { getHelperVerificationStatusLabel } from "@/lib/helper-verification";

type HelperVerificationRecord = {
  status: "NONE" | "PENDING" | "VERIFIED" | "REJECTED";
  adminNote?: string | null;
  icFrontUrl?: string | null;
  icBackUrl?: string | null;
  updatedAt?: string | null;
};

export function HelperVerificationManager(props: {
  verification: HelperVerificationRecord;
}) {
  const router = useRouter();
  const [icFront, setIcFront] = useState<File | null>(null);
  const [icBack, setIcBack] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  const uploadsDisabled = props.verification.status === "VERIFIED";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    if (!icFront || !icBack) {
      setStatus({
        tone: "error",
        message: "Upload both IC Front and IC Back before submitting.",
      });
      return;
    }

    const formData = new FormData();
    formData.set("icFront", icFront);
    formData.set("icBack", icBack);

    setIsUploading(true);

    try {
      const response = await fetch("/api/helper/verification", {
        method: "POST",
        body: formData,
      });
      const json = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatus({
          tone: "error",
          message: json.error ?? "Verification upload failed.",
        });
        return;
      }

      const frontInput = document.getElementById("helper-verification-front") as HTMLInputElement | null;
      const backInput = document.getElementById("helper-verification-back") as HTMLInputElement | null;
      if (frontInput) {
        frontInput.value = "";
      }
      if (backInput) {
        backInput.value = "";
      }
      setIcFront(null);
      setIcBack(null);
      setStatus({
        tone: "success",
        message: "Verification files uploaded. Status reset to pending review.",
      });
      router.refresh();
    } catch (error) {
      setStatus({
        tone: "error",
        message: error instanceof Error ? error.message : "Verification upload failed.",
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card className="bg-white">
        <div className="display-font text-3xl font-black">Verification status</div>
        <div className="mt-4 inline-flex rounded-[18px] border-[3px] border-line bg-cream px-4 py-3 text-sm font-black uppercase tracking-[0.14em]">
          {getHelperVerificationStatusLabel(props.verification.status)}
        </div>
        {props.verification.adminNote ? (
          <p className="mt-4 text-sm leading-7 text-muted">{props.verification.adminNote}</p>
        ) : null}
        <p className="mt-4 text-sm leading-7 text-muted">
          To protect both users and helpers and to maintain a reliable platform, the information submitted here will be used strictly for internal verification purposes only and will not be shared externally.
        </p>

        <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
          <InputShell label="IC Front">
            <input
              id="helper-verification-front"
              type="file"
              accept=".png,.jpg,.jpeg"
              disabled={uploadsDisabled}
              onChange={(event) => setIcFront(event.target.files?.[0] ?? null)}
              className="w-full rounded-[18px] border-[3px] border-line bg-paper px-4 py-3 outline-none file:mr-4 file:rounded-[14px] file:border-0 file:bg-yellow file:px-4 file:py-2 file:font-black"
            />
          </InputShell>

          <InputShell label="IC Back">
            <input
              id="helper-verification-back"
              type="file"
              accept=".png,.jpg,.jpeg"
              disabled={uploadsDisabled}
              onChange={(event) => setIcBack(event.target.files?.[0] ?? null)}
              className="w-full rounded-[18px] border-[3px] border-line bg-paper px-4 py-3 outline-none file:mr-4 file:rounded-[14px] file:border-0 file:bg-yellow file:px-4 file:py-2 file:font-black"
            />
          </InputShell>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <button
              type="submit"
              disabled={uploadsDisabled || isUploading}
              className={buttonStyles({ tone: "purple", size: "md" })}
            >
              {uploadsDisabled ? "Already Verified" : isUploading ? "Uploading..." : "Submit Verification"}
            </button>
            {status ? (
              <p className={status.tone === "success" ? "text-sm font-semibold text-green" : "text-sm font-semibold text-[#E24B4A]"}>
                {status.message}
              </p>
            ) : null}
          </div>
        </form>
      </Card>

      <Card className="bg-white">
        <div className="display-font text-3xl font-black">Your uploaded files</div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-[20px] border-[3px] border-line bg-cream p-4">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-muted">IC Front</div>
            <div className="mt-3">
              {props.verification.icFrontUrl ? (
                <a href={props.verification.icFrontUrl} target="_blank" rel="noreferrer" className={buttonStyles({ tone: "yellow", size: "sm" })}>
                  Open IC Front
                </a>
              ) : (
                <p className="text-sm text-muted">Not uploaded yet.</p>
              )}
            </div>
          </div>
          <div className="rounded-[20px] border-[3px] border-line bg-cream p-4">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-muted">IC Back</div>
            <div className="mt-3">
              {props.verification.icBackUrl ? (
                <a href={props.verification.icBackUrl} target="_blank" rel="noreferrer" className={buttonStyles({ tone: "yellow", size: "sm" })}>
                  Open IC Back
                </a>
              ) : (
                <p className="text-sm text-muted">Not uploaded yet.</p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
