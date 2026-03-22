import type { AttachmentRecord } from '../types/schema.js';

export type PlaywrightLikeAttachment = {
  name: string;
  contentType?: string;
  path?: string;
};

export function normalizeAttachments(
  attachments: PlaywrightLikeAttachment[] | undefined,
): AttachmentRecord[] {
  return (attachments ?? []).map((attachment) => ({
    name: attachment.name,
    contentType: attachment.contentType,
    path: attachment.path,
  }));
}

export function selectExampleAttachments(attachments: AttachmentRecord[], max = 3): AttachmentRecord[] {
  return attachments.filter((attachment) => Boolean(attachment.path)).slice(0, max);
}
