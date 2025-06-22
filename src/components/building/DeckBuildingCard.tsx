"use client";
import Image from "next/image";

export default function DeckBuildingCard({
  onClick,
  url,
}: {
  onClick?: () => void;
  url: string;
}) {
  const cardUrl = url;

  return (
    <div
      className="w-[100px] sm:w-[125px] md:w-[150px] shrink-0 cursor-pointer transform transition-transform duration-200 hover:scale-105"
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
