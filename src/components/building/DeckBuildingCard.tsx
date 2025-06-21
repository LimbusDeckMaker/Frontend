"use client";
import Image from "next/image";

export default function DeckBuildingCard({
  onClick,
}: {
  onClick?: () => void;
}) {
  const cardUrl =
    "https://limbus-image-bucket.s3.ap-northeast-2.amazonaws.com/뫼르소/Identity/동부 엄지 카포 IIII/10512_gacksung_info.webp";

  return (
    <div
      className="w-[100px]  sm:w-[125px]  md:w-[150px]  shrink-0 cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      role="button"
    >
      <div className="flex flex-col items-center">
        <Image
          src={cardUrl}
          alt="Deck Building Card"
          width={150}
          height={250}
          draggable={false}
          className="rounded-lg shadow-lg object-cover w-full h-full"
        />
      </div>
    </div>
  );
}
