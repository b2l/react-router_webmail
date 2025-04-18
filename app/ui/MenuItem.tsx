import { NavLink, type NavLinkProps } from "react-router";

export default function MenuItem(props: NavLinkProps) {
  const cname =  "flex items-center gap-2 px-3 py-0.5 text-white no-underline hover:bg-emerald-300 capitalize"
  return (
    <NavLink {...props} className={({isActive}) => `${cname} ${isActive ? 'bg-emerald-600' : ''}`}/>
  )
}