import { z } from "zod";

export const ProvideLinksToolSchema = z.object({
  links: z.array(
    z.object({
      title: z.string(),
      label: z.string().optional(),
      url: z.string().url()
    })
  )
});
