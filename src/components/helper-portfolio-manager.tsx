"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonStyles, Card, EmptyState, InputShell } from "@/components/ui-primitives";

type PortfolioItemRecord = {
  id: string;
  title: string;
  imageUrl: string;
  description?: string | null;
  externalLink?: string | null;
  displayOrder: number;
  sourceApplicationFileId?: string | null;
};

export function HelperPortfolioManager(props: {
  items: PortfolioItemRecord[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    if (!file) {
      setStatus({
        tone: "error",
        message: "Choose a portfolio file before uploading.",
      });
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    formData.set("title", title);
    formData.set("description", description);

    setIsUploading(true);

    try {
      const response = await fetch("/api/helper/portfolio", {
        method: "POST",
        body: formData,
      });

      const json = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatus({
          tone: "error",
          message: json.error ?? "Portfolio upload failed.",
        });
        return;
      }

      setTitle("");
      setDescription("");
      setFile(null);
      const fileInput = document.getElementById("helper-portfolio-file") as HTMLInputElement | null;
      if (fileInput) {
        fileInput.value = "";
      }
      setStatus({
        tone: "success",
        message: "Portfolio item uploaded successfully.",
      });
      router.refresh();
    } catch (error) {
      setStatus({
        tone: "error",
        message: error instanceof Error ? error.message : "Portfolio upload failed.",
      });
    } finally {
      setIsUploading(false);
    }
  }

  async function deleteItem(itemId: string, itemTitle: string) {
    const confirmed = window.confirm(`Delete portfolio item "${itemTitle}"?`);
    if (!confirmed) {
      return;
    }

    setDeletingId(itemId);
    setStatus(null);

    try {
      const response = await fetch(`/api/helper/portfolio/${itemId}`, {
        method: "DELETE",
      });
      const json = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatus({
          tone: "error",
          message: json.error ?? "Portfolio delete failed.",
        });
        return;
      }

      setStatus({
        tone: "success",
        message: "Portfolio item deleted.",
      });
      router.refresh();
    } catch (error) {
      setStatus({
        tone: "error",
        message: error instanceof Error ? error.message : "Portfolio delete failed.",
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card className="bg-white">
        <div className="display-font text-3xl font-black">Upload portfolio work</div>
        <p className="mt-3 text-sm text-muted">
          Upload one portfolio file at a time. Supported formats: PNG, JPG, JPEG, PDF. Maximum 10MB per file.
        </p>

        <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
          <InputShell label="Portfolio Title" hint="Optional. If empty, the file name becomes the title.">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-[18px] border-[3px] border-line bg-paper px-4 py-3 outline-none"
            />
          </InputShell>

          <InputShell label="Description" hint="Optional short context for the public helper page.">
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              className="w-full rounded-[18px] border-[3px] border-line bg-paper px-4 py-3 outline-none"
            />
          </InputShell>

          <InputShell label="Portfolio File">
            <input
              id="helper-portfolio-file"
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="w-full rounded-[18px] border-[3px] border-line bg-paper px-4 py-3 outline-none file:mr-4 file:rounded-[14px] file:border-0 file:bg-yellow file:px-4 file:py-2 file:font-black"
            />
          </InputShell>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <button
              type="submit"
              disabled={isUploading}
              className={buttonStyles({ tone: "purple", size: "md" })}
            >
              {isUploading ? "Uploading..." : "Upload Portfolio Item"}
            </button>
            {status ? (
              <p className={status.tone === "success" ? "text-sm font-semibold text-green" : "text-sm font-semibold text-[#E24B4A]"}>
                {status.message}
              </p>
            ) : null}
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        {props.items.length === 0 ? (
          <EmptyState
            title="No portfolio items yet"
            description="Your uploads will appear here and on the public helper page automatically once your helper profile is visible."
          />
        ) : (
          props.items.map((item) => (
            <Card key={item.id} className="bg-white">
              <div className="grid gap-4 md:grid-cols-[120px_minmax(0,1fr)_auto] md:items-start">
                <div className="overflow-hidden rounded-[18px] border-[3px] border-line bg-cream">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={240}
                    height={240}
                    unoptimized
                    className="h-24 w-full object-cover"
                  />
                </div>
                <div>
                  <div className="display-font text-2xl font-black">{item.title}</div>
                  <p className="mt-2 text-sm text-muted">Display order {item.displayOrder}</p>
                  {item.description ? (
                    <p className="mt-2 text-sm leading-7 text-muted">{item.description}</p>
                  ) : null}
                  {item.externalLink ? (
                    <a
                      href={item.externalLink}
                      target="_blank"
                      rel="noreferrer"
                      className={`mt-3 ${buttonStyles({ tone: "yellow", size: "sm" })}`}
                    >
                      Open File
                    </a>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => deleteItem(item.id, item.title)}
                  disabled={deletingId === item.id}
                  className={buttonStyles({ tone: "ink", size: "sm" })}
                >
                  {deletingId === item.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
