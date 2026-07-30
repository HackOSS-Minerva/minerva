import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import {
  PHOTO_MAX_SOURCE_BYTES,
  PHOTO_QUOTA_BYTES,
  createPhotoStoragePath,
} from "../lib/photos";
import type { Id } from "./_generated/dataModel";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";

const photoMimeType = v.union(
  v.literal("image/jpeg"),
  v.literal("image/png"),
  v.literal("image/webp"),
);

const photoIdentity = {
  tenant: v.string(),
  eventId: v.string(),
  uploadId: v.string(),
};

const findAlbum = async (
  ctx: QueryCtx | MutationCtx,
  tenant: string,
  eventId: string,
) =>
  await ctx.db
    .query("photoAlbums")
    .withIndex("by_tenant_event", (q) =>
      q.eq("tenant", tenant).eq("eventId", eventId),
    )
    .unique();

const findPhoto = async (
  ctx: QueryCtx | MutationCtx,
  albumId: Id<"photoAlbums">,
  uploadId: string,
) =>
  await ctx.db
    .query("photos")
    .withIndex("by_album_upload", (q) =>
      q.eq("albumId", albumId).eq("uploadId", uploadId),
    )
    .unique();

export const getUsage = query({
  args: {
    tenant: v.string(),
    eventId: v.string(),
  },
  handler: async (ctx, { tenant, eventId }) => {
    const album = await findAlbum(ctx, tenant, eventId);

    return {
      quotaBytes: album?.quotaBytes ?? PHOTO_QUOTA_BYTES,
      usedBytes: album?.usedBytes ?? 0,
    };
  },
});

export const list = query({
  args: {
    tenant: v.string(),
    eventId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { tenant, eventId, paginationOpts }) => {
    const album = await findAlbum(ctx, tenant, eventId);

    if (!album) {
      return {
        page: [],
        isDone: true,
        continueCursor: paginationOpts.cursor ?? "",
      };
    }

    return await ctx.db
      .query("photos")
      .withIndex("by_album_createdAt", (q) => q.eq("albumId", album._id))
      .order("desc")
      .filter((q) => q.eq(q.field("status"), "active"))
      .paginate(paginationOpts);
  },
});

export const finalize = mutation({
  args: {
    tenant: v.string(),
    eventId: v.string(),
    eventName: v.string(),
    uploadId: v.string(),
    storagePath: v.string(),
    downloadUrl: v.string(),
    filename: v.string(),
    mimeType: photoMimeType,
    byteSize: v.number(),
    width: v.number(),
    height: v.number(),
  },
  handler: async (ctx, args) => {
    const expectedPath = createPhotoStoragePath(
      args.tenant,
      args.eventId,
      args.uploadId,
    );
    if (args.storagePath !== expectedPath) {
      throw new ConvexError("PHOTO_PATH_INVALID");
    }

    if (
      !Number.isInteger(args.byteSize) ||
      args.byteSize <= 0 ||
      args.byteSize > PHOTO_MAX_SOURCE_BYTES ||
      !Number.isInteger(args.width) ||
      args.width <= 0 ||
      args.width > 1_920 ||
      !Number.isInteger(args.height) ||
      args.height <= 0 ||
      args.height > 1_920
    ) {
      throw new ConvexError("PHOTO_METADATA_INVALID");
    }

    let album = await findAlbum(ctx, args.tenant, args.eventId);
    if (!album) {
      const albumId = await ctx.db.insert("photoAlbums", {
        tenant: args.tenant,
        eventId: args.eventId,
        eventName: args.eventName,
        quotaBytes: PHOTO_QUOTA_BYTES,
        usedBytes: 0,
        createdAt: Date.now(),
      });
      album = await ctx.db.get(albumId);
    }

    if (!album) {
      throw new ConvexError("PHOTO_ALBUM_CREATE_FAILED");
    }

    const existing = await findPhoto(ctx, album._id, args.uploadId);
    if (existing) {
      return existing;
    }

    const pathOwner = await ctx.db
      .query("photos")
      .withIndex("by_storage_path", (q) =>
        q.eq("storagePath", args.storagePath),
      )
      .unique();
    if (pathOwner) {
      throw new ConvexError("PHOTO_PATH_CONFLICT");
    }

    if (album.usedBytes + args.byteSize > album.quotaBytes) {
      throw new ConvexError("PHOTO_QUOTA_EXCEEDED");
    }

    const createdAt = Date.now();
    const photoId = await ctx.db.insert("photos", {
      albumId: album._id,
      tenant: album.tenant,
      eventId: album.eventId,
      uploadId: args.uploadId,
      storagePath: expectedPath,
      downloadUrl: args.downloadUrl,
      filename: args.filename,
      mimeType: args.mimeType,
      byteSize: args.byteSize,
      width: args.width,
      height: args.height,
      status: "active",
      createdAt,
    });
    await ctx.db.patch(album._id, {
      usedBytes: album.usedBytes + args.byteSize,
    });

    const photo = await ctx.db.get(photoId);
    if (!photo) {
      throw new ConvexError("PHOTO_FINALIZE_FAILED");
    }
    return photo;
  },
});

export const beginDelete = mutation({
  args: photoIdentity,
  handler: async (ctx, { tenant, eventId, uploadId }) => {
    const album = await findAlbum(ctx, tenant, eventId);
    if (!album) return { status: "missing" as const };

    const photo = await findPhoto(ctx, album._id, uploadId);
    if (!photo) return { status: "missing" as const };
    if (photo.status === "deleting") return photo;

    await ctx.db.patch(photo._id, { status: "deleting" });
    return { ...photo, status: "deleting" as const };
  },
});

export const completeDelete = mutation({
  args: photoIdentity,
  handler: async (ctx, { tenant, eventId, uploadId }) => {
    const album = await findAlbum(ctx, tenant, eventId);
    if (!album) return { status: "missing" as const };

    const photo = await findPhoto(ctx, album._id, uploadId);
    if (!photo) return { status: "missing" as const };
    if (photo.status !== "deleting") {
      throw new ConvexError("PHOTO_NOT_DELETING");
    }

    await ctx.db.delete(photo._id);
    await ctx.db.patch(album._id, {
      usedBytes: Math.max(0, album.usedBytes - photo.byteSize),
    });
    return { status: "deleted" as const };
  },
});

export const rollbackDelete = mutation({
  args: photoIdentity,
  handler: async (ctx, { tenant, eventId, uploadId }) => {
    const album = await findAlbum(ctx, tenant, eventId);
    if (!album) return { status: "missing" as const };

    const photo = await findPhoto(ctx, album._id, uploadId);
    if (!photo) return { status: "missing" as const };
    if (photo.status === "active") return photo;

    await ctx.db.patch(photo._id, { status: "active" });
    return { ...photo, status: "active" as const };
  },
});
