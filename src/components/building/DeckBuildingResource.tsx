"use client";
import Image from "next/image";
import useGetEngName from "@/hooks/useGetEngName";

export default function DeckBuildingResource() {
  const getEngName = useGetEngName();
  const resourcesImg = ["분노", "색욕", "나태", "탐식", "오만", "우울", "질투"];
  const resistanceImg = [
    "/assets/attackType/infoAttackType/slash_small.webp",
    "/assets/attackType/infoAttackType/pierce_small.webp",
    "/assets/attackType/infoAttackType/blunt_small.webp",
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="text-primary-100 text-3xl">죄악 자원</div>
      <div className="flex flex-row gap-4 flex-wrap ">
        {resourcesImg.map((resource) => {
          const resourceEngName = getEngName(resource);
          return (
            <div key={resourceEngName} className="flex items-center gap-1">
              <Image
                src={`/assets/resource/${resourceEngName}.webp`}
                alt={resourceEngName}
                className="inline-block w-auto h-6"
                width={1024}
                height={1024}
                quality={10}
                loading="lazy"
                draggable={false}
              />
              <span>0</span>
            </div>
          );
        })}
      </div>
      <div className="text-primary-100 text-3xl">공격 유형</div>
      {/* 저항 타입 아이콘 + 숫자 */}
      <div className="flex flex-row gap-4 flex-wrap">
        {resistanceImg.map((src, idx) => (
          <div key={src} className="flex items-center gap-1">
            <Image
              src={src}
              alt={`resistance-${idx}`}
              className="inline-block w-auto h-6"
              width={1024}
              height={1024}
              quality={10}
              loading="lazy"
              draggable={false}
            />
            <span>0</span>
          </div>
        ))}
      </div>
    </div>
  );
}
