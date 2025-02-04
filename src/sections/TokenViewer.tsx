import { type RouterOutputs } from "~/utils/api";
import { Fragment, useState } from "react";
import { cn } from "~/utils/cn";

import BN from "bignumber.js";
import { Checkbox } from "~/components/Checkbox";

const COLORS = [
  "bg-sky-200",
  "bg-amber-200",
  "bg-blue-200",
  "bg-green-200",
  "bg-orange-200",
  "bg-cyan-200",
  "bg-gray-200",
  "bg-purple-200",
  "bg-indigo-200",
  "bg-lime-200",
  "bg-rose-200",
  "bg-violet-200",
  "bg-yellow-200",
  "bg-emerald-200",
  "bg-zinc-200",
  "bg-red-200",
  "bg-fuchsia-200",
  "bg-pink-200",
  "bg-teal-200",
];

const PRICING: Record<string, BN> = {
  "gpt-4": BN("0.03").div(1000),
  "gpt-4-32k": BN("0.03").div(1000),
  "gpt-3.5-turbo": BN("0.002").div(1000),
};

function encodeWhitespace(str: string) {
  let result = str;

  result = result.replaceAll(" ", "⋅");
  result = result.replaceAll("\t", "→");
  result = result.replaceAll("\f", "\\f\f");
  result = result.replaceAll("\b", "\\b\b");
  result = result.replaceAll("\v", "\\v\v");

  result = result.replaceAll("\r", "\\r\r");
  result = result.replaceAll("\n", "\\n\n");
  result = result.replaceAll("\\r\r\\n\n", "\\r\\n\r\n");

  return result;
}

export function TokenViewer(props: {
  isFetching: boolean;
  model: string | undefined;
  data: { encoding: Uint32Array; segments: string[] } | undefined;
}) {
  const [indexHover, setIndexHover] = useState<null | number>(null);

  const tokenCount = props.data?.encoding.length ?? 0;
  const pricing = props.model != null ? PRICING[props.model] : undefined;

  const [showWhitespace, setShowWhitespace] = useState(false);

  return (
    <>
      <div className="flex gap-4">
        <div className="flex-grow rounded-md border bg-slate-50 p-4 shadow-sm">
          <p className="text-sm ">Token count</p>
          <p className="text-lg">{tokenCount}</p>
        </div>

        {pricing != null && (
          <div className="flex-grow rounded-md border bg-slate-50 p-4 shadow-sm">
            <p className="text-sm ">Price per prompt</p>
            <p className="text-lg">
              ${pricing?.multipliedBy(tokenCount)?.toFixed()}
            </p>
          </div>
        )}
      </div>

      <pre className="min-h-[256px] max-w-[100vw] overflow-auto whitespace-pre-wrap break-all rounded-md border bg-slate-50 p-4 shadow-sm">
        {props.data?.segments.map((i, idx) => (
          <span
            key={idx}
            onMouseEnter={() => setIndexHover(idx)}
            onMouseLeave={() => setIndexHover(null)}
            className={cn(
              "transition-all",
              (indexHover == null || indexHover === idx) &&
                COLORS[idx % COLORS.length],
              props.isFetching && "opacity-50"
            )}
          >
            {showWhitespace || indexHover === idx ? encodeWhitespace(i) : i}
          </span>
        ))}
      </pre>

      <pre
        className={
          "min-h-[256px] max-w-[100vw] overflow-auto whitespace-pre-wrap break-all rounded-md border bg-slate-50 p-4 shadow-sm"
        }
      >
        {props.data && (props.data?.encoding.length ?? 0) > 0 && (
          <span
            className={cn(
              "transition-opacity",
              props.isFetching && "opacity-50"
            )}
          >
            [
            {[...props.data.encoding].map((id, idx) => (
              <Fragment key={idx}>
                <span
                  onMouseEnter={() => setIndexHover(idx)}
                  onMouseLeave={() => setIndexHover(null)}
                  className={cn(
                    "transition-colors",
                    indexHover === idx && COLORS[idx % COLORS.length]
                  )}
                >
                  {id}
                </span>
                {props.data && idx !== props.data.encoding.length - 1 && ", "}
              </Fragment>
            ))}
            ]
          </span>
        )}
      </pre>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="terms"
          checked={showWhitespace}
          onClick={() => setShowWhitespace((v) => !v)}
        />
        <label
          htmlFor="terms"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Show whitespace
        </label>
      </div>
    </>
  );
}
