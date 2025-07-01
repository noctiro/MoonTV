'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
// @ts-expect-error Next.js 提供的实验性 API，在类型库中暂未收录
import { useFormState, useFormStatus } from 'react-dom';

import { useSite } from '@/components/SiteProvider';
import { ThemeToggle } from '@/components/ThemeToggle';

import { loginAction } from './actions';

function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const { siteName } = useSite();

  // 由 server action 返回的状态
  const initialState = { ok: false, error: null as string | null };
  const [state, formAction] = useFormState(loginAction, initialState);

  // 当 server action 返回 ok 时，进行客户端后续处理
  useEffect(() => {
    if (state.ok) {
      const redirect = searchParams.get('redirect') || '/';
      router.replace(redirect);
    }
  }, [state, router, searchParams]);

  // 提交按钮组件，使用 useFormStatus 感知 loading
  function SubmitButton() {
    const { pending } = useFormStatus();
    return (
      <button
        type='submit'
        disabled={!password || pending}
        className='inline-flex w-full justify-center rounded-lg bg-green-600 py-3 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:from-green-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-50'
      >
        {pending ? '登录中...' : '登录'}
      </button>
    );
  }

  return (
    <div className='relative min-h-screen flex items-center justify-center px-4 overflow-hidden'>
      <div className='absolute top-4 right-4'>
        <ThemeToggle />
      </div>
      <div className='relative z-10 w-full max-w-md rounded-3xl bg-gradient-to-b from-white/90 via-white/70 to-white/40 dark:from-zinc-900/90 dark:via-zinc-900/70 dark:to-zinc-900/40 backdrop-blur-xl shadow-2xl p-10 dark:border dark:border-zinc-800'>
        <h1 className='text-green-600 tracking-tight text-center text-3xl font-extrabold mb-8 bg-clip-text drop-shadow-sm'>
          {siteName}
        </h1>
        <form action={formAction} className='space-y-8'>
          <div>
            <label htmlFor='password' className='sr-only'>
              密码
            </label>
            <input
              id='password'
              name='password'
              type='password'
              autoComplete='current-password'
              className='block w-full rounded-lg border-0 py-3 px-4 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-white/60 dark:ring-white/20 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none sm:text-base bg-white/60 dark:bg-zinc-800/60 backdrop-blur'
              placeholder='输入访问密码'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {state.error && (
            <p className='text-sm text-red-600 dark:text-red-400'>
              {state.error}
            </p>
          )}

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageClient />
    </Suspense>
  );
}
