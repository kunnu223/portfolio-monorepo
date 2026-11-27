"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Component, useSyncExternalStore, type ReactNode } from "react";

const World = dynamic(() => import("./World"), { ssr: false });

function Fallback() {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-[#9fd3db] p-6 text-[#23232b]">
      <div className="max-w-sm text-center">
        <div className="font-display text-5xl font-bold tracking-tight">Kunal Kumawat</div>
        <p className="mt-4 text-[15px] leading-relaxed">
          This browser can&apos;t show the 3D island. All the same work is in read mode.
        </p>
        <Link
          href="/read"
          className="mt-6 inline-block rounded-full bg-[#23232b] px-5 py-2.5 text-[14px] font-medium text-[#f5efe4]"
        >
          Open read mode
        </Link>
      </div>
    </div>
  );
}

/** If WebGL crashes, show a way into read mode instead of a blank page. */
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <Fallback /> : this.props.children;
  }
}

let webgl: boolean | undefined;
function hasWebGL() {
  if (webgl === undefined) {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") ?? c.getContext("webgl");
      webgl = !!gl;
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      webgl = false;
    }
  }
  return webgl;
}
const subscribe = () => () => {};

export default function WorldLoader() {
  const supported = useSyncExternalStore(subscribe, hasWebGL, () => true);
  if (!supported) return <Fallback />;
  return (
    <div className="fixed inset-0 touch-none">
      <Boundary>
        <World />
      </Boundary>
    </div>
  );
}
