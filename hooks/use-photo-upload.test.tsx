import { afterEach, expect, mock, test } from "bun:test";
import { Window } from "happy-dom";
import { StrictMode } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

const browser = new Window({ url: "http://localhost" });

Object.assign(globalThis, {
  IS_REACT_ACT_ENVIRONMENT: true,
  window: browser,
  document: browser.document,
  navigator: browser.navigator,
  Node: browser.Node,
  HTMLElement: browser.HTMLElement,
  File: browser.File,
  Blob: browser.Blob,
  requestAnimationFrame: (callback: FrameRequestCallback) =>
    setTimeout(() => callback(performance.now()), 0),
  cancelAnimationFrame: (frameId: number) => clearTimeout(frameId),
  createImageBitmap: async () => ({
    width: 1_200,
    height: 800,
    close() {},
  }),
});

mock.module("convex/react", () => ({
  useMutation: () => async () => ({}),
}));

mock.module("@/lib/compress", () => ({
  DEFAULT_IMAGE_COMPRESSION: {
    quality: 0.8,
    maxWidth: 800,
    maxHeight: 800,
  },
  PHOTO_IMAGE_COMPRESSION: {
    quality: 0.82,
    maxWidth: 1_920,
    maxHeight: 1_920,
  },
  compress: async (file: File) => file,
}));

mock.module("@/lib/storage", () => ({
  deleteStorageFile: async () => undefined,
  uploadStorageFile: async (
    path: string,
    _file: File,
    onProgress?: (progress: number) => void,
  ) => {
    onProgress?.(0.5);
    return { path, url: "https://example.com/photo.jpeg" };
  },
}));

const { usePhotoUpload } = await import("@/hooks/use-photo-upload");

let root: Root | null = null;

afterEach(async () => {
  if (root) {
    await act(async () => root?.unmount());
    root = null;
  }
  document.body.replaceChildren();
});

test("completes an upload under StrictMode", async () => {
  function Harness() {
    const upload = usePhotoUpload({
      tenant: "designverse",
      eventId: "designverse-2026",
      eventName: "DesignVerse 2026",
      enabled: true,
    });

    return (
      <>
        <button
          type="button"
          onClick={() =>
            upload.addFiles([
              new File([new Uint8Array([1])], "photo.jpeg", {
                type: "image/jpeg",
              }),
            ])
          }
        >
          Upload
        </button>
        <output
          data-stage={upload.items[0]?.stage ?? "empty"}
          data-processing={String(upload.isProcessing)}
        />
      </>
    );
  }

  const container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);

  await act(async () => {
    root?.render(
      <StrictMode>
        <Harness />
      </StrictMode>,
    );
  });

  await act(async () => {
    container.querySelector("button")?.click();
    await new Promise((resolve) => setTimeout(resolve, 20));
  });

  const state = container.querySelector("output");
  expect(state?.dataset.stage).toBe("complete");
  expect(state?.dataset.processing).toBe("false");
});
