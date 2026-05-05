import { z } from 'zod'

export const PostInputSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(40, '제목은 40자 이하로 입력해주세요'),
  body: z.string().min(1, '본문을 입력해주세요').max(600, '본문은 600자 이하로 입력해주세요'),
  visibility: z.enum(['public', 'private']),
  tags: z.array(z.string().min(1).max(10)).max(5),
})

export const SaveToggleSchema = z.object({
  itemType: z.enum(['daily', 'user']),
  itemId: z.string().min(1),
})

export type PostInput = z.infer<typeof PostInputSchema>
