import { Link, useNavigate, type LinkProps } from "@tanstack/react-router";
import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<"a">, "href"> &
  Omit<LinkProps, "to"> & {
    to: string;
  };

/** Dinamik yo'llar (masalan `/debtors/${id}`) uchun Link o'rami. */
export function AppLink({ to, ...rest }: Props) {
  return <Link to={to as never} {...(rest as object)} />;
}

export function useGo() {
  const navigate = useNavigate();
  return (to: string) => navigate({ to: to as never });
}
