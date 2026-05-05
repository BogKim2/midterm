import { NextResponse } from 'next/server'

export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; fieldErrors?: Record<string, string[]> } }

export function okResponse<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status })
}

export function errorResponse(
  code: string,
  message: string,
  status: number,
  fieldErrors?: Record<string, string[]>
) {
  return NextResponse.json(
    { ok: false, error: { code, message, ...(fieldErrors && { fieldErrors }) } },
    { status }
  )
}

export const UNAUTHORIZED = () => errorResponse('UNAUTHORIZED', '로그인이 필요합니다', 401)
export const NOT_FOUND = (msg = '리소스를 찾을 수 없습니다') => errorResponse('NOT_FOUND', msg, 404)
export const FORBIDDEN = (msg = '접근 권한이 없습니다') => errorResponse('FORBIDDEN', msg, 403)
export const VALIDATION_ERROR = (msg: string, fieldErrors?: Record<string, string[]>) =>
  errorResponse('VALIDATION', msg, 400, fieldErrors)
