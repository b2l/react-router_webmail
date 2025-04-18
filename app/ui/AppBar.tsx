import { Logo } from "./Logo";

export function AppBar() {
  return (
    <div className="grow h-16 flex">
      <Logo />
      <div className="flex grow items-center justify-between mr-3">
        <form action="search"><input className="border-white border-1 outline-transparent" type="text" name="" id="" /></form>
        <div className="right">
          User
        </div>
      </div>
    </div>
  );
}
