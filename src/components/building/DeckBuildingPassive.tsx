"use client";
import passiveSchema from "./passiveSchema.json";
import Image from "next/image";
import useGetEngName from "@/hooks/useGetEngName";

type Passive = {
  name: string;
  prop: string;
  poss: number;
  posstype: string;
  passdescription?: string;
};

export default function DeckBuildingPassive() {
  const getEngName = useGetEngName();
  const passives: Passive[] = passiveSchema.pass2;

  return (
    <div className="flex flex-col gap-4">
      <div className="text-primary-100 text-3xl">패시브</div>
      <div className="flex flex-col gap-2 bg-primary-400 text-white p-2 rounded-lg">
        {passives.map((p, idx) => {
          const resourceEngName = getEngName(p.prop);

          return (
            <div
              key={idx}
              className="border border-primary-200 p-2 flex justify-between items-center gap-2"
            >
              <div className="text-lg font-sansLight">{p.name}</div>
              <div className="flex items-center justify-center gap-2 font-sansLight">
                <Image
                  src={`/assets/resource/${resourceEngName}.webp`}
                  alt={resourceEngName}
                  className="inline-block w-auto h-6"
                  width={1024}
                  height={1024}
                  quality={10}
                  loading="lazy"
                />
                <span className="m-0 leading-none">{p.poss}</span>
                <span className="m-0 leading-none">{p.posstype}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
