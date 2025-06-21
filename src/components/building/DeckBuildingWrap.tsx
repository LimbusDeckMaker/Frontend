"use client";
import { useRef, useState } from "react";
import { Button, Input, Tooltip } from "@material-tailwind/react";
import { LuSearch } from "react-icons/lu";
import styles from "./DeckBuildingWrap.module.css";
import DeckBuildingCard from "./DeckBuildingCard";
import DeckBuildingPassive from "./DeckBuildingPassive";
import DeckBuildingResource from "./DeckBuildingResource";

export default function DeckBuildingWrap() {
  const cards = Array.from({ length: 12 });

  // ── 드래그 스크롤용 refs/state ──
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [dragging, setDragging] = useState(false);

  // 마우스 누름
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    isDownRef.current = true;
    setDragging(true);
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
  };

  // 마우스 떼거나 떠나면
  const onMouseUpOrLeave = () => {
    isDownRef.current = false;
    setDragging(false);
  };

  // 마우스 이동
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!isDownRef.current || !el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = x - startXRef.current;
    el.scrollLeft = scrollLeftRef.current - walk;
  };
  return (
    <div>
      <div className="flex justify-between w-full">
        <span className="text-3xl lg:text-4xl whitespace-nowrap hidden lg:block pr-2">
          덱 빌딩
        </span>
        <div className="flex gap-2">
          <Tooltip
            className="bg-primary-500 text-primary-100 text-xs"
            content={<span>uuid 추출</span>}
          >
            <Button
              className="min-w-[80px] flex gap-2 items-center bg-primary-400 px-2 md:px-4 py-0 md:py-1 font-sansLight text-sm md:text-base text-white hover:bg-primary-300 rounded"
              placeholder={undefined}
            >
              <span className="pt-1 whitespace-nowrap">추출</span>
            </Button>
          </Tooltip>
          <div className="relative flex w-full gap-2 md:w-max">
            <Input
              type="search"
              placeholder="id 검색"
              className="!border-none pl-9 placeholder:text-primary-100 text-white focus:!border-primary-300 !focus:ring-0 !focus:outline-none !focus:ring-0 !focus:ring-offset-0 !focus:ring-offset-transparent !focus:border-transparent !focus:ring-transparent"
              containerProps={{
                className:
                  "min-w-[100px] md:min-w-[200px] !bg-primary-400 !rounded-full !pt-1 !h-8 md:!h-10",
              }}
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              crossOrigin={undefined}
            />
            <div className="!absolute left-3 top-[8px]">
              <LuSearch className="md:w-6 md:h-6" />
            </div>
          </div>
        </div>
      </div>
      <div
        ref={scrollRef}
        className={`${styles.scrollXTouch} ${dragging ? styles.dragging : ""}`}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseUpOrLeave}
        onMouseUp={onMouseUpOrLeave}
        onMouseMove={onMouseMove}
      >
        <div className="grid w-max grid-cols-6 grid-rows-2 gap-4 pt-2">
          {cards.map((_, idx) => (
            <DeckBuildingCard
              key={idx}
              onClick={() => console.log("선택된 카드 index:", idx)}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2">
          <DeckBuildingPassive />
        </div>
        <div className="w-full md:w-1/2">
          <DeckBuildingResource />
        </div>
      </div>
    </div>
  );
}
