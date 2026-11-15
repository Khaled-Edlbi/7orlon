"use client";

import * as React from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Brush, BrushButton, BrushSwatches } from "@/components/brush";
import { LanguageSwitch } from "@/components/site/language-switch";
import { Field, FieldError, FieldLabel, Input } from "@/components/ui/field";
import { Kicker } from "@/features/admin/components/ui";
import { useLogin } from "@/features/admin/queries";
import { useT } from "@/hooks/use-t";
import { HttpError } from "@/lib/api";

/** The door to the desk: one password, and the same paint as the front room. */
export function LoginForm({ configured }: { configured: boolean }) {
  const { t, a } = useT();
  const router = useRouter();
  const login = useLogin();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    if (!password) return;

    login.mutate(password, {
      onSuccess: () => {
        router.replace("/admin");
        router.refresh();
      },
    });
  };

  const status = login.error instanceof HttpError ? login.error.status : null;
  const error = !configured
    ? a.loginUnconfigured
    : login.isError
      ? status === 401
        ? a.loginWrong
        : status === 429
          ? a.loginLocked
          : status === 503
            ? a.loginUnconfigured
            : login.error.message
      : null;

  return (
    <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col px-[clamp(20px,5vw,72px)]">
      <header className="flex items-center gap-[var(--space-4)] py-[var(--space-3)]">
        <Link href="/" className="me-auto flex items-center gap-[var(--space-2)]">
          <BrushSwatches />
          <span className="font-scribble text-[21px] font-semibold tracking-[-0.01em]">
            {t.brand}
          </span>
        </Link>
        <LanguageSwitch />
      </header>

      <main className="grid flex-1 grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-center gap-[clamp(32px,6vw,96px)] pb-[clamp(48px,10vh,120px)]">
        <div className="domino relative z-10 flex max-w-[460px] flex-col gap-[var(--space-4)] [--domino-step:80ms]">
          <Kicker color="#3ED6D3">{a.deskName}</Kicker>

          <h1 className="m-0 text-[clamp(46px,7vw,104px)] leading-[0.98] font-semibold tracking-[-0.025em]">
            {a.loginTitleA}{" "}
            <em className="font-scribble relative isolate inline-block leading-none font-normal not-italic">
              <Brush
                shape="line2"
                color="#F7A3B8"
                className="absolute -z-10 h-[46%] rotate-[-1.5deg]"
                style={{
                  insetInlineStart: "-4%",
                  insetInlineEnd: "-8%",
                  bottom: "-4%",
                }}
              />
              {a.loginTitleB}
            </em>
          </h1>

          <p className="text-ink-soft m-0 text-[clamp(17px,1.4vw,21px)] leading-[1.55]">
            {a.loginSub}
          </p>

          <form
            onSubmit={onSubmit}
            noValidate
            className="mt-[var(--space-2)] flex flex-col gap-[var(--space-4)]"
          >
            <Field>
              <FieldLabel htmlFor="admin-password">{a.password}</FieldLabel>
              <Input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                autoFocus
                dir="ltr"
                disabled={!configured}
              />
              {error && <FieldError role="alert">{error}</FieldError>}
            </Field>

            <div>
              <BrushButton
                type="submit"
                shape="line2"
                color="var(--primary)"
                size="lg"
                className="text-primary-foreground"
                disabled={!configured || login.isPending || login.isSuccess}
              >
                {login.isPending || login.isSuccess ? a.signingIn : a.signIn}
              </BrushButton>
            </div>
          </form>
        </div>

        {/* Where the front page hangs a painting, the desk has only the paint. */}
        <div
          aria-hidden="true"
          className="domino relative mx-auto hidden aspect-[4/5] max-h-[62vh] w-full max-w-[420px] [--domino-base:200ms] [--domino-step:110ms] md:block"
        >
          <Brush
            shape="block"
            color="#3ED6D3"
            className="absolute inset-[30%_-14%_-6%_34%] opacity-80"
          />
          <Brush
            shape="splotch"
            color="#F5D95A"
            className="absolute inset-[-6%_40%_52%_-12%] opacity-85"
          />
          <Brush
            shape="blob"
            color="#F7A3B8"
            className="absolute inset-[52%_38%_-8%_-10%] opacity-85"
          />
          <Brush
            shape="streaks"
            color="#8FE06B"
            className="absolute inset-[2%_-10%_62%_48%] rotate-[8deg] opacity-80"
          />
          <Brush
            shape="tall"
            color="#3FD48A"
            className="absolute inset-[22%_30%_22%_30%] rotate-[-4deg] opacity-80"
          />
        </div>
      </main>
    </div>
  );
}
