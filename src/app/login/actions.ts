'use server';

import { cookies } from 'next/headers';

import { generateAuthToken } from '@/lib/auth';

interface LoginState {
  ok: boolean;
  error: string | null;
}

/**
 * 通用密码校验逻辑，供 Server Action 与 /api/login 复用
 */
export async function verifyPassword(
  password: string | undefined | null
): Promise<LoginState> {
  try {
    const expected = process.env.PASSWORD;

    // 如果未设置密码，直接放行
    if (!expected) {
      return { ok: true, error: null };
    }

    if (!password || password.length === 0) {
      return { ok: false, error: '密码不能为空' };
    }

    if (password !== expected) {
      return { ok: false, error: '密码错误' };
    }

    return { ok: true, error: null };
  } catch (err) {
    return { ok: false, error: '服务器错误' };
  }
}

/**
 * Server Action: 登录
 */
export async function loginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = formData.get('password');
  const result = await verifyPassword(
    typeof password === 'string' ? password : null
  );

  // 登录成功时写入 HttpOnly Cookie，以供后续请求验证。
  if (result.ok && typeof password === 'string') {
    const token = await generateAuthToken(password);
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 天
    cookies().set('auth', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      expires,
    });
  }

  return result;
}
